# Bakes ambient occlusion into vertex colours on the full-detail X2 Ultra CAD meshes (media/x2-urdf).
# CAD tessellation splits into tens of thousands of UV islands, so the AO rides on the vertices
# instead of a texture; long edges are split first so big flat panels still get enough samples.
# The export keeps Blender's smooth/sharp normals from the full-detail surface, so the simplified
# web meshes shade like the CAD instead of like their own coarse facets.
# build-robot-model.mjs simplifies these meshes with the AO and normals weighted in.
# Usage: "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P scripts/bake-x2.py
import math
import os
import re

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

SRC = 'media/x2-urdf'
OUT = 'media/x2-baked'
BAKE = re.compile(r'^(torso_link|imu_in_torso_link|lidar_chest_front_link|head_\w+_link|rgbd?_head_\w+_link'
                  r'|stereo_head_front_link|(left|right)_(shoulder_\w+|elbow)_link)$')
MAX_EDGE = 0.006     # metres between AO samples on flat panels
AO_DISTANCE = 0.04   # metres: crevices and seams, not whole-body shading
AO_SAMPLES = 512


def nums(s, fallback=(0.0, 0.0, 0.0)):
    return tuple(float(v) for v in s.split()) if s else fallback


def attr(tag, name):
    m = re.search(rf'{name}="([^"]*)"', tag)
    return m.group(1) if m else None


def origin_matrix(xyz, rpy):
    # URDF rpy: fixed-axis X, then Y, then Z, which is Blender's 'XYZ' Euler.
    return Matrix.Translation(Vector(xyz)) @ Euler(rpy, 'XYZ').to_matrix().to_4x4()


def parse_urdf(xml):
    links = {}
    for name, body in re.findall(r'<link name="([^"]+)"\s*>([\s\S]*?)</link>', xml):
        visual = re.search(r'<visual>([\s\S]*?)</visual>', body)
        if not visual:
            continue
        origin = re.search(r'<origin[^>]*/>', visual.group(1))
        mesh = re.search(r'<mesh filename="([^"]+)"', visual.group(1))
        links[name] = {
            'visual': origin_matrix(nums(origin and attr(origin.group(0), 'xyz')), nums(origin and attr(origin.group(0), 'rpy'))),
            'mesh': mesh.group(1).removeprefix('./') if mesh else None,
        }
    joints = []
    for head, body in re.findall(r'<joint ([^>]+)>([\s\S]*?)</joint>', xml):
        origin = re.search(r'<origin[^>]*/>', body)
        axis = re.search(r'<axis xyz="([^"]+)"', body)
        joints.append({
            'name': attr(head, 'name'),
            'type': attr(head, 'type'),
            'axis': nums(axis and axis.group(1), (1.0, 0.0, 0.0)),  # URDF default axis
            'parent': re.search(r'<parent link="([^"]+)"', body).group(1),
            'child': re.search(r'<child link="([^"]+)"', body).group(1),
            'origin': origin_matrix(nums(origin and attr(origin.group(0), 'xyz')), nums(origin and attr(origin.group(0), 'rpy'))),
        })
    return links, joints


def link_poses(links, joints, angles={}):
    # World matrix of every link (joints at `angles`, radians, zero when missing), plus rigid groups
    # (links welded by fixed joints).
    world, group = {}, {}
    children = {j['child'] for j in joints}
    root = next(n for n in links if n not in children)
    world[root], group[root] = Matrix.Identity(4), root
    pending = list(joints)
    while pending:
        for j in list(pending):
            if j['parent'] in world:
                world[j['child']] = world[j['parent']] @ j['origin'] @ Matrix.Rotation(angles.get(j['name'], 0.0), 4, Vector(j['axis']))
                group[j['child']] = group[j['parent']] if j['type'] == 'fixed' else j['child']
                pending.remove(j)
    return world, group


def import_link(path, name, matrix):
    bpy.ops.wm.stl_import(filepath=path, forward_axis='Y', up_axis='Z')  # merges duplicate vertices
    obj = bpy.context.selected_objects[0]
    obj.name = obj.data.name = name
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    for _ in range(10):
        long = [e for e in bm.edges if e.calc_length() > MAX_EDGE]
        if not long:
            break
        bmesh.ops.subdivide_edges(bm, edges=long, cuts=1)
        bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 3])
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.polygons.foreach_set('use_smooth', [True] * len(obj.data.polygons))
    # CAD fillets are tessellated in coarse steps (often >35°); real hard edges sit near 90°.
    obj.data.set_sharp_from_angle(angle=math.radians(60))
    obj.data.color_attributes.active_color = obj.data.color_attributes.new('ao', 'FLOAT_COLOR', 'POINT')
    obj.matrix_world = matrix
    return obj


def setup_cycles():
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'CUDA'  # OptiX kernels fail to compile on this GTX 1660 Ti driver
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == 'CUDA'
    scene.cycles.device = 'GPU' if any(d.use for d in prefs.devices) else 'CPU'
    scene.cycles.samples = AO_SAMPLES
    scene.world = scene.world or bpy.data.worlds.new('world')
    scene.world.light_settings.distance = AO_DISTANCE
    scene.render.bake.target = 'VERTEX_COLORS'
    scene.render.bake.use_selected_to_active = False


def main():
    links, joints = parse_urdf(open(os.path.join(SRC, 'X2-Ultra.urdf'), encoding='utf-8').read())
    world, group = link_poses(links, joints)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    setup_cycles()

    names = [n for n in links if BAKE.match(n) and links[n]['mesh']]
    objs = {n: import_link(os.path.join(SRC, links[n]['mesh']), n, world[n] @ links[n]['visual']) for n in names}
    for n, obj in objs.items():
        # Occluders: the link's own rigid body only, so the baked shading holds in any pose.
        for other, o in objs.items():
            o.hide_render = group[other] != group[n]
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.bake(type='AO')
        print(f'baked {n}: {len(obj.data.vertices)} verts', flush=True)

    os.makedirs(OUT, exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objs.values():
        obj.hide_render = False
        obj.select_set(True)
    # Raw link-local ROS coordinates (no Y-up swap): the Node build places each mesh itself.
    bpy.ops.export_scene.gltf(
        filepath=os.path.abspath(os.path.join(OUT, 'x2-bust.glb')),
        export_format='GLB', use_selection=True, export_yup=False, export_materials='NONE',
        export_vertex_color='ACTIVE', export_normals=True, export_texcoords=False, export_apply=False,
    )


if __name__ == '__main__':
    main()
