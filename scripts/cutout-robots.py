# blender -b --factory-startup -P scripts/cutout-robots.py -- <in.webp> <out.webp>
# Used for public/assets/robots/*.webp (from the official AgiBot shots in public/assets/agibot/).
# Official store shots sit on pure white. Flood-fill the white that touches the border (the backdrop),
# keep everything else (the robot, including its own white shell), soften the edge, write RGBA.
import bpy, sys
import numpy as np

src, out = sys.argv[sys.argv.index('--') + 1:]
img = bpy.data.images.load(src)
img.colorspace_settings.name = 'Non-Color'
w, h = img.size
px = np.empty(w * h * 4, np.float32)
img.pixels.foreach_get(px)
px = px.reshape(h, w, 4)
rgb = px[..., :3]
# The backdrop is flat white (plus compression noise); lit shells are shaded. Judge on a 5x5 average.
m = rgb.min(axis=2)
mp = np.pad(m, 2, mode='edge')
avg = sum(mp[2 + dy:h + 2 + dy, 2 + dx:w + 2 + dx] for dy in range(-2, 3) for dx in range(-2, 3)) / 25
# Backdrop candidates: flat white on average, so a lit shell edge next to the backdrop isn't eaten.
near_white = (avg > 0.975) & (m > 0.94)

bg = np.zeros((h, w), bool)
bg[0, :] = near_white[0, :]; bg[-1, :] = near_white[-1, :]
bg[:, 0] |= near_white[:, 0]; bg[:, -1] |= near_white[:, -1]
while True:
    p = np.pad(bg, 1)
    grown = (p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]) & near_white
    if (grown == bg).all():
        break
    bg = grown

def dilate(m):
    p = np.pad(m, 1)
    return p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
def erode(m):
    return ~dilate(~m)

# Backdrop enclosed by the robot (e.g. between the legs): large white areas survive a 6px erosion,
# shell highlights don't. Grow those seeds back inside the near-white mask.
pure = avg > 0.985
core = pure & ~bg
for _ in range(6):
    core = erode(core)
hole = core
while True:
    grown = dilate(hole) & near_white & ~bg
    if (grown == hole).all():
        break
    hole = grown
bg |= hole

# Anti-aliased edge pixels are a blend with the white backdrop: peel up to 2px of pale grey off the outline.
edge_sat = rgb.max(axis=2) - rgb.min(axis=2)
for _ in range(2):
    bg |= dilate(bg) & (m > 0.86) & (edge_sat < 0.06)

# Floor shadow: light, neutral pixels in the bottom quarter of the robot that sit below the lowest
# dark or coloured pixel of their column (soles and feet are dark or yellow; shadows are pale grey).
# Note: Blender rows run bottom-up, so row 0 is the bottom of the photo.
sat = rgb.max(axis=2) - rgb.min(axis=2)
robotish = (~bg) & ((rgb.min(axis=2) < 0.6) | (sat > 0.18))
pale = (~bg) & (rgb.min(axis=2) > 0.7) & (sat < 0.08)
rows = np.nonzero((~bg).any(axis=1))[0]
lo, hi = rows.min(), rows.max()
band = lo + int((hi - lo) * 0.25)
ys = np.arange(h)[:, None]
has = robotish.any(axis=0)
lowest = np.where(has, np.argmax(robotish, axis=0), h)  # first robot-ish row from the bottom
below_feet = (ys < lowest[None, :]) & (ys <= band)
bg |= pale & below_feet
# Darker contact shadow right under the feet: grow the backdrop into grey that stays below the feet.
greyish = (~bg) & (rgb.min(axis=2) > 0.45) & (sat < 0.06) & below_feet
for _ in range(40):
    grown = dilate(bg) & greyish
    if not (grown & ~bg).any():
        break
    bg |= grown

# Pull the edge in by 1px so no white fringe glows against a dark page, then feather.
solid = erode(~bg)
alpha = solid.astype(np.float32)
p = np.pad(alpha, 1, mode='edge')
alpha = (p[1:-1, 1:-1] * 4 + p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]) / 8
# The studio floor shadow becomes a soft dark shadow instead of a white smear.
shade = rgb.mean(axis=2)
floor = bg & (shade < 0.985)
alpha = np.where(floor, np.clip((0.985 - shade) * 6, 0, 0.45), alpha)
px[..., :3] = np.where(floor[..., None], 0.0, rgb)
px[..., 3] = alpha
o = bpy.data.images.new('o', w, h, alpha=True)
o.colorspace_settings.name = 'Non-Color'
o.pixels.foreach_set(px.ravel())
o.filepath_raw = out
o.file_format = 'WEBP' if out.endswith('.webp') else 'PNG'
o.save(quality=90) if o.file_format == 'WEBP' else o.save()
print('CUT', out, 'backdrop %.0f%%' % (bg.mean() * 100))
