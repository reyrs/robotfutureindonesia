# Photo-shoot frames for the home hero: the official X2 Ultra CAD (media/x2-urdf) rendered in Cycles
# on a royal-blue seamless sweep, lit like a flash product shoot. Per pose it writes the full frame
# and a cutout (same pixels, robot alpha) so type can sit between backdrop and robot; for the idle
# pose the head is left out and rendered as a grid of crops that follow the cursor.
# Eyes, chest light and wordmark are placed the same way src/three/x2Rig.js places them; the black
# shoulder rings, elbow blocks and waist cover follow AgiBot's product photos (the CAD lacks them).
# Usage: "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P scripts/render-studio.py -- [--preview DIR] [--heads]
import importlib
import json
import math
import os
import re
import sys

import bmesh
import bpy
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree
from mathutils.interpolate import poly_3d_calc

sys.path.insert(0, 'scripts')
bake = importlib.import_module('bake-x2')

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
PREVIEW = ARGS[ARGS.index('--preview') + 1] if '--preview' in ARGS else None
OUT = 'public/assets/studio'
TMP = 'media/studio/tmp'
SIZE = (960, 540) if PREVIEW else (2560, 1440)

ROYAL = (0.028, 0.115, 0.686)  # #2F5FD8, linear
JOINT = ((0.012, 0.013, 0.015, 1), 0.5)  # black finish: base colour, roughness
YAW = math.radians(-15)  # body turned toward the headline side (screen left)
HEAD_YAW = 0.26  # turns the head back to the lens
EYE = {'y': 0.47, 'gap': 0.2, 'width': 0.15, 'height': 0.28}  # x2Rig.js EYE
# Cursor-follow grid for the idle head (head_yaw limit is ±0.489 rad).
HEAD_YAWS = [-0.48 + 0.096 * i for i in range(11)]
HEAD_PITCHES = [-0.18, 0.0, 0.15]

# x2Rig.js NEUTRAL; every pose starts from it.
NEUTRAL = {'left_shoulder_roll_joint': 0.1, 'right_shoulder_roll_joint': -0.1, 'left_elbow_joint': -0.2, 'right_elbow_joint': -0.2}


def legs(side, knee):
    return {f'{side}_hip_pitch_joint': -knee * 0.5, f'{side}_knee_joint': knee, f'{side}_ankle_pitch_joint': -knee * 0.5}


# Peak frames of the x2Rig.js EMOTES, in flash order. base_pitch tilts the pelvis.
POSES = {
    'idle': {},
    'wave': dict(right_shoulder_pitch_joint=-2.5, right_shoulder_roll_joint=-0.45, right_elbow_joint=-0.6, head_yaw_joint=-0.18, head_pitch_joint=-0.15),
    'point': dict(right_shoulder_pitch_joint=-1.45, right_shoulder_roll_joint=-0.4, right_elbow_joint=-0.06, waist_yaw_joint=-0.15, head_yaw_joint=-0.3, head_pitch_joint=0.05),
    'handshake': dict(right_shoulder_pitch_joint=-0.95, right_shoulder_roll_joint=-0.12, right_elbow_joint=-0.55, base_pitch=0.06, head_pitch_joint=0.12, head_yaw_joint=-0.08),
    'cheer': dict(left_shoulder_pitch_joint=-2.8, right_shoulder_pitch_joint=-2.8, left_shoulder_roll_joint=0.5, right_shoulder_roll_joint=-0.5,
                  left_elbow_joint=-0.3, right_elbow_joint=-0.3, head_pitch_joint=-0.3, **legs('left', 0.4), **legs('right', 0.4)),
    'dance-a': dict(waist_yaw_joint=0.35, head_yaw_joint=0.2, left_shoulder_pitch_joint=-1.3, left_elbow_joint=-1.5,
                    right_shoulder_pitch_joint=-0.3, right_elbow_joint=-1.2, **legs('left', 0.5), **legs('right', 0.1)),
    'dance-b': dict(waist_yaw_joint=-0.35, head_yaw_joint=-0.2, right_shoulder_pitch_joint=-1.3, right_elbow_joint=-1.5,
                    left_shoulder_pitch_joint=-0.3, left_elbow_joint=-1.2, **legs('right', 0.5), **legs('left', 0.1)),
    'bow': dict(base_pitch=0.5, waist_pitch_joint=0.25, head_pitch_joint=0.35, left_shoulder_pitch_joint=-0.3, right_shoulder_pitch_joint=-0.3,
                left_elbow_joint=-0.55, right_elbow_joint=-0.55),
}

def material_by_link():
    # Single source: the web build's link → material table.
    src = open('scripts/build-robot-model.mjs', encoding='utf-8').read()
    return dict(re.findall(r"(\w+): '(\w+)'", re.search(r'MATERIAL_BY_LINK = \{([\s\S]*?)\};', src).group(1)))


def surface(name, color, rough, coat=0.0, grain=0.0, spec=0.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Specular IOR Level'].default_value = spec
    bsdf.inputs['Coat Weight'].default_value = coat
    bsdf.inputs['Coat Roughness'].default_value = 0.03
    # CAD edges are knife-sharp; real casings are rounded and catch a thin line of light.
    bevel = nt.nodes.new('ShaderNodeBevel')
    bevel.inputs['Radius'].default_value = 0.002
    normal = bevel.outputs['Normal']
    if grain:  # sand-blasted shell, object space in metres (the CAD has no UVs)
        coord = nt.nodes.new('ShaderNodeTexCoord')
        noise = nt.nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 1 / grain
        bump = nt.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = 0.5
        bump.inputs['Distance'].default_value = grain * 0.25
        nt.links.new(coord.outputs['Object'], noise.inputs['Vector'])
        nt.links.new(noise.outputs['Fac'], bump.inputs['Height'])
        nt.links.new(normal, bump.inputs['Normal'])
        normal = bump.outputs['Normal']
    nt.links.new(normal, bsdf.inputs['Normal'])
    return mat


def emission(name, color, strength):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*color, 1)
    em.inputs['Strength'].default_value = strength
    nt.links.new(em.outputs[0], nt.nodes.new('ShaderNodeOutputMaterial').inputs['Surface'])
    return mat


def link_obj(obj, parent=None):
    bpy.context.collection.objects.link(obj)
    if parent:
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()
    return obj


def bounds(obj):
    pts = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    return Vector([min(p[i] for p in pts) for i in range(3)]), Vector([max(p[i] for p in pts) for i in range(3)])


def caster(obj):
    # Rays from in front of the robot (+X) straight back, in world space, like x2Rig.js hitAt.
    m = obj.matrix_world
    tree = BVHTree.FromPolygons([m @ v.co for v in obj.data.vertices], [tuple(p.vertices) for p in obj.data.polygons])
    front = bounds(obj)[1].x + 0.2

    def hit_at(y, z):
        loc, normal, index, _ = tree.ray_cast(Vector((front, y, z)), Vector((-1, 0, 0)))
        return (loc, normal.normalized(), index) if loc else None
    return hit_at


def add_eyes(head, mat):
    hit_at = caster(head)
    lo, hi = bounds(head)
    facing = lambda h: h and h[1].x > 0.8
    probe = (lo.y + hi.y) / 2 - (hi.y - lo.y) * 0.15
    face = [z for z in (lo.z + k / 90 * (hi.z - lo.z) for k in range(91)) if facing(hit_at(probe, z))]
    top, bottom = max(face), min(face)
    eye_z = top - (top - bottom) * EYE['y']
    row = [y for y in (lo.y + k / 90 * (hi.y - lo.y) for k in range(91)) if facing(hit_at(y, eye_z))]
    left, right = min(row), max(row)
    w, h, mid = (right - left) * EYE['width'], (top - bottom) * EYE['height'], (left + right) / 2
    r = min(w, h) / 2
    outline = [(r * math.cos(a), h / 2 - r + r * math.sin(a)) for a in (math.pi * k / 12 for k in range(13))]
    outline += [(r * math.cos(a), -h / 2 + r + r * math.sin(a)) for a in (math.pi + math.pi * k / 12 for k in range(13))]
    for side in (-1, 1):
        loc, n, _ = hit_at(mid + side * (right - left) * EYE['gap'], eye_z)
        up = (Vector((0, 0, 1)) - n * n.z).normalized()
        across = up.cross(n)
        center = loc + n * 0.0012
        mesh = bpy.data.meshes.new('eye')
        mesh.from_pydata([center + across * u + up * v for u, v in outline], [], [list(range(len(outline)))])
        mesh.materials.append(mat)
        link_obj(bpy.data.objects.new('eye', mesh), head)


def add_chest(torso, lidar, led_mat, print_mat):
    # The light runs in the arched seam above the LiDAR window, found from the baked AO.
    hit_at = caster(torso)
    lo, hi = bounds(torso)
    width, mid = hi.y - lo.y, (lo.y + hi.y) / 2
    lidar_top = bounds(lidar)[1].z
    ao = torso.data.color_attributes['ao'].data
    verts, polys, m = torso.data.vertices, torso.data.polygons, torso.matrix_world

    def ao_at(loc, index):
        ids = polys[index].vertices
        return sum(w * ao[i].color[0] for w, i in zip(poly_3d_calc([m @ verts[i].co for i in ids], loc), ids))

    seam = []
    for k in range(24):
        y = mid - width * 0.2 + (k + 0.5) / 24 * width * 0.4
        best = None
        z = lidar_top + width * 0.03
        while z < lidar_top + width * 0.17:
            h = hit_at(y, z)
            if h and h[1].x >= 0.3:
                shade = ao_at(h[0], h[2])
                if shade < 0.3 and shade < (best[0] if best else 1):
                    best = (shade, h[0])
            z += 0.0015
        if best:
            seam.append(best[1])
    if len(seam) < 8:
        print('chest seam not found: no light strip', flush=True)
        return
    # Symmetric arch: least-squares z = z0 + bend·(y - mid)².
    n = len(seam)
    sq, zs = [(p.y - mid) ** 2 for p in seam], [p.z for p in seam]
    bend = (n * sum(s * z for s, z in zip(sq, zs)) - sum(sq) * sum(zs)) / (n * sum(s * s for s in sq) - sum(sq) ** 2)
    z0 = (sum(zs) - bend * sum(sq)) / n
    path = []
    for k in range(33):
        y = mid + (k / 16 - 1) * width * 0.17
        h = hit_at(y, z0 + bend * (y - mid) ** 2)
        if h:
            path.append(h[0] + h[1] * 0.0015)

    curve = bpy.data.curves.new('chest_led', 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = 0.002
    curve.use_fill_caps = True
    spline = curve.splines.new('NURBS')
    spline.points.add(len(path) - 1)
    for p, q in zip(spline.points, path):
        p.co = (*q, 1)
    spline.use_endpoint_u = True
    curve.materials.append(led_mat)
    link_obj(bpy.data.objects.new('chest_led', curve), torso)

    # AGIBOT wordmark, small and centred above the arch, wrapped onto the shell.
    print_z = max(p.z for p in path) + width * 0.075
    print(f'chest: {len(seam)} seam picks, light at z {min(p.z for p in path):.3f}-{max(p.z for p in path):.3f}, print at z {print_z:.3f}, lidar top {lidar_top:.3f}', flush=True)
    text = bpy.data.curves.new('wordmark', 'FONT')
    text.body = 'AGIBOT'
    text.align_x, text.align_y = 'CENTER', 'CENTER'
    text.space_character = 1.3
    word = link_obj(bpy.data.objects.new('wordmark', text))
    bpy.context.view_layer.update()
    scale = width * 0.26 * 0.75 / word.dimensions.x
    # Text faces local +Z; turn it to face the robot's front (+X), reading toward its left (+Y).
    face_front = Matrix(((0, 0, 1, 0), (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
    word.matrix_world = Matrix.Translation((hi.x, mid, print_z)) @ face_front @ Matrix.Scale(scale, 4)
    bpy.ops.object.select_all(action='DESELECT')
    word.select_set(True)
    bpy.context.view_layer.objects.active = word
    bpy.ops.object.convert(target='MESH')
    wrap = word.modifiers.new('wrap', 'SHRINKWRAP')
    wrap.target = torso
    wrap.offset = 0.0003
    word.data.materials.append(print_mat)
    word.parent = torso
    word.matrix_parent_inverse = torso.matrix_world.inverted()


def sweep(mat):
    # Seamless paper: floor under the camera, curving up into the wall behind the robot.
    radius, start = 1.4, -1.0
    profile = [(8.0, 0.0), (start, 0.0)]
    profile += [(start - radius * math.sin(a), radius - radius * math.cos(a)) for a in (math.pi / 2 * k / 16 for k in range(1, 17))]
    profile += [(start - radius, 5.0)]
    bm = bmesh.new()
    rows = [[bm.verts.new((x, y, z)) for x, z in profile] for y in (7.0, -7.0)]
    for i in range(len(profile) - 1):
        bm.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    mesh = bpy.data.meshes.new('sweep')
    bm.to_mesh(mesh)
    bm.free()
    mesh.polygons.foreach_set('use_smooth', [True] * len(mesh.polygons))
    mesh.materials.append(mat)
    link_obj(bpy.data.objects.new('sweep', mesh))


def area(name, loc, target, size, power, size_y=None, shape='RECTANGLE', spread=180):
    light = bpy.data.lights.new(name, 'AREA')
    light.shape = shape
    light.size = size
    light.size_y = size_y or size
    light.energy = power
    light.spread = math.radians(spread)
    obj = link_obj(bpy.data.objects.new(name, light))
    obj.location = loc
    obj.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    obj.visible_camera = False
    return obj




def node(nt, kind, inputs=(), **props):
    # One shader node; `inputs` are sockets to link or plain values, in socket order.
    n = nt.nodes.new(kind)
    for key, value in props.items():
        setattr(n, key, value)
    for i, value in enumerate(inputs):
        if isinstance(value, bpy.types.NodeSocket):
            nt.links.new(value, n.inputs[i])
        elif value is not None:
            n.inputs[i].default_value = value
    return n


def math_op(nt, op, a, b=None):
    return node(nt, 'ShaderNodeMath', (a, b), operation=op).outputs[0]


def painted(base, name, mask):
    # Copy of `base` in the black joint finish wherever mask(nt, object coords) is 1.
    mat = base.copy()
    mat.name = name
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    factor = mask(nt, node(nt, 'ShaderNodeTexCoord').outputs['Object'])
    for socket, black in zip(('Base Color', 'Roughness'), JOINT):
        mix = node(nt, 'ShaderNodeMix', data_type='RGBA' if socket == 'Base Color' else 'FLOAT')
        fac, a, b = [s for s in mix.inputs if s.enabled]
        nt.links.new(factor, fac)
        a.default_value = bsdf.inputs[socket].default_value
        b.default_value = black
        nt.links.new(next(s for s in mix.outputs if s.enabled), bsdf.inputs[socket])
    return mat


def ring_mask(center, inner, outer):
    # Front and back caps of the shoulder-roll actuator (axis X): a ring between two radii.
    def build(nt, local):
        p = node(nt, 'ShaderNodeSeparateXYZ', (node(nt, 'ShaderNodeVectorMath', (local, center), operation='SUBTRACT').outputs[0],)).outputs
        radius = math_op(nt, 'SQRT', math_op(nt, 'ADD', math_op(nt, 'MULTIPLY', p['Y'], p['Y']), math_op(nt, 'MULTIPLY', p['Z'], p['Z'])))
        normal = node(nt, 'ShaderNodeVectorTransform', (node(nt, 'ShaderNodeNewGeometry').outputs['Normal'],),
                      vector_type='NORMAL', convert_from='WORLD', convert_to='OBJECT').outputs[0]
        cap = math_op(nt, 'GREATER_THAN', math_op(nt, 'ABSOLUTE', node(nt, 'ShaderNodeSeparateXYZ', (normal,)).outputs['X']), 0.8)
        band = math_op(nt, 'MULTIPLY', math_op(nt, 'GREATER_THAN', radius, inner), math_op(nt, 'LESS_THAN', radius, outer))
        return math_op(nt, 'MULTIPLY', band, cap)
    return build


def below_mask(z):
    return lambda nt, local: math_op(nt, 'LESS_THAN', node(nt, 'ShaderNodeSeparateXYZ', (local,)).outputs['Z'], z)


def official_finish(objs, links, joints, mats):
    # Black parts on AgiBot's product photos that the CAD leaves in the white shell finish.
    for side in ('left', 'right'):
        objs[f'{side}_shoulder_pitch_link'].data.materials[0] = mats['joint']
        pod = objs[f'{side}_shoulder_roll_link']
        center = links[pod.name]['visual'].inverted() @ Vector()  # the roll axis runs through the link origin
        caps = [pod.data.vertices[i].co for p in pod.data.polygons if abs(p.normal.x) > 0.9 for i in p.vertices]
        radius = max(r for r in (math.hypot(c.y - center.y, c.z - center.z) for c in caps) if r < 0.055)  # skip flat faces on the upper arm
        pod.data.materials[0] = painted(mats['shell'], f'{side}_pod', ring_mask(center, radius * 0.58, radius * 0.76))
        arm = objs[f'{side}_shoulder_yaw_link']
        elbow = next(j for j in joints if j['name'] == f'{side}_elbow_joint')
        z = (links[arm.name]['visual'].inverted() @ elbow['origin'].to_translation()).z + 0.04
        arm.data.materials[0] = painted(mats['shell'], f'{side}_elbow', below_mask(z))
        print(f'{side}: pod radius {radius:.3f}, elbow block below local z {z:.3f}', flush=True)


def add_waist_cover(torso, waist, mat):
    # The black cover between chest shell and waist drum on the product photos, as a lathed shell.
    shell = [torso.matrix_world @ v.co for v in torso.data.vertices]
    bottom = min(p.z for p in shell if abs(p.y) > 0.07)  # lower down there are only brackets, narrower than this
    ring = [p for p in shell if bottom + 0.006 < p.z < bottom + 0.014]
    xs = [p.x for p in ring]
    cx, ax, ay = (max(xs) + min(xs)) / 2, (max(xs) - min(xs)) / 2 * 0.92, max(abs(p.y) for p in ring) * 0.92
    drum = [waist.matrix_world @ v.co for v in waist.data.vertices]
    base = max(p.z for p in drum if math.hypot(p.x, p.y) > 0.058) - 0.004
    top, r0 = bottom + 0.012, 0.068
    print(f'waist cover: z {base:.3f}-{top:.3f}, top radii {ax:.3f} x {ay:.3f}, centre x {cx:.3f}', flush=True)
    bm = bmesh.new()
    rings = []
    for k in range(13):
        t = k / 12
        ease = t ** 1.6  # straight out of the drum, then flaring into the chest
        rx, ry = r0 + (ax - r0) * ease, r0 + (ay - r0) * ease
        rings.append([bm.verts.new((cx * t + rx * math.cos(a), ry * math.sin(a), base + (top - base) * t))
                      for a in (2 * math.pi * i / 64 for i in range(64))])
    for lo, hi in zip(rings, rings[1:]):
        for i in range(64):
            bm.faces.new((lo[i], lo[(i + 1) % 64], hi[(i + 1) % 64], hi[i]))
    mesh = bpy.data.meshes.new('waist_cover')
    bm.to_mesh(mesh)
    bm.free()
    mesh.polygons.foreach_set('use_smooth', [True] * len(mesh.polygons))
    mesh.materials.append(mat)
    link_obj(bpy.data.objects.new('waist_cover', mesh), torso)


def set_pose(robot, objs, links, joints, pose, head=None):
    base = pose.get('base_pitch', 0.0)
    angles = {**NEUTRAL, **{k: v for k, v in pose.items() if k != 'base_pitch'}}
    angles['head_yaw_joint'] = max(-0.48, min(0.48, angles.get('head_yaw_joint', 0.0) + HEAD_YAW))
    if head:
        angles['head_yaw_joint'], angles['head_pitch_joint'] = head
    for side in ('left', 'right'):  # hips counter-rotate so the legs stay planted (x2Rig.js applyRigPose)
        angles[f'{side}_hip_pitch_joint'] = angles.get(f'{side}_hip_pitch_joint', 0.0) - base
    world, _ = bake.link_poses(links, joints, angles)
    tilt = Matrix.Rotation(base, 4, 'Y')
    for name, obj in objs.items():
        obj.matrix_basis = tilt @ world[name] @ links[name]['visual']
    robot.location.z = 0
    bpy.context.view_layer.update()
    robot.location.z = -min(bounds(objs[f'{s}_ankle_roll_link'])[0].z for s in ('left', 'right'))
    bpy.context.view_layer.update()


def camera_sees(objects):
    # Only `objects` reach the camera; the rest still light, shadow and reflect.
    for o in bpy.context.scene.objects:
        if o.type != 'LIGHT':
            o.visible_camera = o in objects


def shoot(path, samples, transparent=False, crop=None):
    sc = bpy.context.scene
    sc.cycles.samples = samples
    sc.cycles.use_denoising = samples > 16
    sc.render.film_transparent = transparent
    sc.render.use_border = sc.render.use_crop_to_border = crop is not None
    if crop:
        sc.render.border_min_x, sc.render.border_max_x, sc.render.border_min_y, sc.render.border_max_y = crop
    fmt = sc.render.image_settings
    fmt.file_format = 'WEBP' if path.endswith('.webp') else 'PNG'
    fmt.color_mode = 'RGBA' if transparent else 'RGB'
    fmt.quality = 84
    sc.render.filepath = os.path.abspath(path)
    os.makedirs(os.path.dirname(sc.render.filepath), exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print(f'shot {path}', flush=True)


def save_webp(path):
    # The last render again, as WebP.
    fmt = bpy.context.scene.render.image_settings
    fmt.file_format, fmt.quality = 'WEBP', 84
    bpy.data.images['Render Result'].save_render(filepath=os.path.abspath(path), scene=bpy.context.scene)


def cutout(plate, mask, path):
    # Plate pixels with the mask render's alpha: identical robot pixels, so the layers line up exactly.
    a, b = (bpy.data.images.load(os.path.abspath(p)) for p in (plate, mask))
    px, alpha = np.empty(len(a.pixels), np.float32), np.empty(len(b.pixels), np.float32)
    a.pixels.foreach_get(px)
    b.pixels.foreach_get(alpha)
    px[3::4] = alpha[3::4]
    out = bpy.data.images.new('cutout', *a.size, alpha=True)
    out.pixels.foreach_set(px)
    out.file_format = 'WEBP'
    out.save(filepath=os.path.abspath(path), quality=84)
    for img in (a, b, out):
        bpy.data.images.remove(img)


def main():
    links, joints = bake.parse_urdf(open(os.path.join(bake.SRC, 'X2-Ultra.urdf'), encoding='utf-8').read())
    rest, _ = bake.link_poses(links, joints)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bake.setup_cycles()
    scene = bpy.context.scene

    mats = {
        'shell': surface('shell', (0.8, 0.81, 0.82), 0.42, grain=0.0012),
        'joint': surface('joint', JOINT[0][:3], JOINT[1], spec=0.3),
        'head': surface('head', (0.012, 0.013, 0.016), 0.2, coat=1.0),
        'glass': surface('glass', (0.004, 0.005, 0.006), 0.05, coat=1.0),
        'foot': surface('foot', (0.9, 0.55, 0.01), 0.55),
    }
    by_link = material_by_link()
    objs = {}
    for name, link in links.items():
        if not link['mesh']:
            continue
        path, matrix = os.path.join(bake.SRC, link['mesh']), rest[name] @ link['visual']
        if name == 'torso_link':  # densified, with an 'ao' attribute for the seam search
            obj = bake.import_link(path, name, matrix)
        else:
            bpy.ops.wm.stl_import(filepath=path, forward_axis='Y', up_axis='Z')
            obj = bpy.context.selected_objects[0]
            obj.name = name
            obj.data.polygons.foreach_set('use_smooth', [True] * len(obj.data.polygons))
            obj.data.set_sharp_from_angle(angle=math.radians(60))
            obj.matrix_world = matrix
        obj.data.materials.append(mats[by_link.get(name, 'shell')])
        objs[name] = obj

    torso = objs['torso_link']
    for o in objs.values():
        o.hide_render = o is not torso
    bpy.ops.object.select_all(action='DESELECT')
    torso.select_set(True)
    bpy.context.view_layer.objects.active = torso
    bpy.ops.object.bake(type='AO')
    for o in objs.values():
        o.hide_render = False

    add_eyes(objs['head_pitch_link'], emission('eye', (0.9, 0.97, 1.0), 5))
    add_chest(torso, objs['lidar_chest_front_link'], emission('led', (0.275, 0.47, 0.89), 1.5),
              surface('print', (0.16, 0.17, 0.19), 0.5))
    official_finish(objs, links, joints, mats)
    add_waist_cover(torso, objs['waist_yaw_link'], mats['joint'])

    robot = link_obj(bpy.data.objects.new('robot', None))
    for obj in objs.values():
        obj.parent = robot
    robot.rotation_euler.z = YAW

    sweep(surface('paper', ROYAL, 0.85))
    key = area('key', (3.0, -2.2, 2.8), (0, 0, 0.9), 1.5, 36, shape='DISK', spread=50)  # gridded: keeps the floor under it dark (a narrow spread concentrates power)
    area('rim_l', (-1.4, -1.8, 1.0), (0, 0, 1.0), 0.25, 5, size_y=1.6, spread=30)  # level, so no streaks on the floor
    area('rim_r', (-1.4, 1.8, 1.0), (0, 0, 1.0), 0.25, 5, size_y=1.6, spread=30)
    fill = area('fill', (4.0, 2.5, 1.2), (0, 0, 0.8), 2.0, 30)
    world = scene.world
    world.use_nodes = True
    next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND').inputs['Color'].default_value = (0.01, 0.012, 0.02, 1)

    cam = bpy.data.cameras.new('cam')
    cam.lens, cam.shift_x = 66, -0.1  # full body with raised arms and ~8% floor; robot right of centre, headline room on the left
    camera = link_obj(bpy.data.objects.new('cam', cam))
    camera.location = (6.4, 0, 0.82)
    camera.rotation_euler = Vector((-1, 0, 0)).to_track_quat('-Z', 'Y').to_euler()  # level: verticals stay vertical
    scene.camera = camera
    scene.render.resolution_x, scene.render.resolution_y = SIZE
    scene.view_settings.view_transform = 'Standard'  # keeps the backdrop the exact brand blue; AgX bleaches saturated blue

    if PREVIEW:
        for pid, pose in POSES.items():
            set_pose(robot, objs, links, joints, pose)
            shoot(f'{PREVIEW}/{pid}.png', 32)
        return

    head_links = {'head_yaw_link'}
    for _ in joints:
        head_links |= {j['child'] for j in joints if j['parent'] in head_links}
    head = {o for n in head_links if n in objs for o in (objs[n], *objs[n].children_recursive)}
    everything = {o for o in scene.objects if o.type != 'LIGHT'}
    robot_only = {o for o in everything if o.name != 'sweep'}

    # Head crop: the union of the head's screen box over the grid's extremes.
    W, H = SIZE
    pts = []
    for yaw in (HEAD_YAWS[0], HEAD_YAWS[-1]):
        for pitch in (HEAD_PITCHES[0], HEAD_PITCHES[-1]):
            set_pose(robot, objs, links, joints, POSES['idle'], head=(yaw, pitch))
            pts += [world_to_camera_view(scene, camera, o.matrix_world @ Vector(c)) for o in head for c in o.bound_box]
    x0, x1 = max(0, int(min(p.x for p in pts) * W) - 16), min(W, int(max(p.x for p in pts) * W) + 16)
    y0, y1 = max(0, int(min(p.y for p in pts) * H) - 16), min(H, int(max(p.y for p in pts) * H) + 16)
    crop = (x0 / W, x1 / W, y0 / H, y1 / H)

    for pid, pose in ({} if '--heads' in ARGS else POSES).items():  # --heads: redo only the head grid
        set_pose(robot, objs, links, joints, pose)
        hidden = set()
        if pid == 'idle':
            key.hide_render = fill.hide_render = True  # intro: rim lights only, before the flash
            shoot(f'{OUT}/intro-rim.webp', 96)
            key.hide_render = fill.hide_render = False
            hidden = head  # the cursor-follow head is layered on top
        camera_sees(everything - hidden)
        shoot(f'{TMP}/{pid}.png', 160)
        save_webp(f'{OUT}/{pid}.webp')
        camera_sees(robot_only - hidden)
        shoot(f'{TMP}/{pid}-mask.png', 8, transparent=True)
        cutout(f'{TMP}/{pid}.png', f'{TMP}/{pid}-mask.png', f'{OUT}/{pid}-cut.webp')

    # The body renders as a holdout: where the collar is in front of the head the crop goes
    # transparent, so the head sits inside the neck opening instead of pasted over it.
    camera_sees(robot_only)
    for o in robot_only - head:
        o.is_holdout = True
    for i, yaw in enumerate(HEAD_YAWS):
        for j, pitch in enumerate(HEAD_PITCHES):
            set_pose(robot, objs, links, joints, POSES['idle'], head=(yaw, pitch))
            shoot(f'{OUT}/head/{i}-{j}.webp', 128, transparent=True, crop=crop)
    for o in robot_only:
        o.is_holdout = False
    camera_sees(everything)

    w, h = bpy.data.images.load(os.path.abspath(f'{OUT}/head/0-0.webp')).size
    with open('src/data/studio.json', 'w', encoding='utf-8') as f:  # read by src/components/Hero.jsx
        json.dump({'size': SIZE, 'poses': list(POSES), 'head': {'rect': [x0, H - y1, w, h], 'yaw': len(HEAD_YAWS), 'pitch': len(HEAD_PITCHES)}}, f)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('media/studio/x2-studio.blend'))


main()
