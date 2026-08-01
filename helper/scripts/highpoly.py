# Turn the low-poly CAD robot into a high-poly one:
#   weld flat-shading splits -> rebuild quads -> crease every sharp feature
#   edge -> Catmull-Clark subdivision (creases keep mechanical edges crisp,
#   facets round out) -> smooth shading with sharp-edge normal splits ->
#   re-export robot.glb (UVs/texture interpolate along).
#   blender --background --python helper/scripts/highpoly.py
import bmesh
import bpy
import math
import os
import re
from mathutils import Euler, Vector

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
GLB = os.path.join(ROOT, "website/src/assets/models/robot.glb")
SHARP = math.radians(32)  # feature edges: creased + sharp (crisp), rest rounds
LEVELS = 1

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
for coll in (bpy.data.objects, bpy.data.materials, bpy.data.meshes, bpy.data.images):
    for db in coll:
        db.name = re.sub(r"\.\d+$", "", db.name)

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
tris_before = sum(len(o.data.polygons) for o in meshes)

for ob in meshes:
    me = ob.data
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    # rebuild quads from the triangulation: Catmull-Clark behaves far better
    # on quads (no triangle ripple on cylinders)
    bmesh.ops.join_triangles(
        bm, faces=bm.faces,
        angle_face_threshold=0.70, angle_shape_threshold=0.70,
        cmp_uvs=True,
    )
    crease = bm.edges.layers.float.get("crease_edge") or bm.edges.layers.float.new("crease_edge")
    for e in bm.edges:
        nf = len(e.link_faces)
        hard = nf != 2
        if not hard:
            try:
                hard = e.calc_face_angle() > SHARP
            except ValueError:
                hard = True
        if hard:
            e[crease] = 1.0
            e.smooth = False  # split normals here after subdivision
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True

    mod = ob.modifiers.new("subsurf", "SUBSURF")
    mod.levels = LEVELS
    mod.render_levels = LEVELS
    mod.use_creases = True
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=mod.name)

    # reclaim the useless subdivision on flat regions (UV-seam aware, so the
    # comic atlas stays put); curved regions exceed the angle and are kept
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.dissolve_limit(
        bm, angle_limit=math.radians(1.5),
        verts=bm.verts[:], edges=bm.edges[:],
        delimit={"UV", "SHARP", "MATERIAL", "NORMAL"},
    )
    for e in bm.edges:
        nf = len(e.link_faces)
        if nf != 2:
            e.smooth = False
        else:
            try:
                e.smooth = e.calc_face_angle() <= SHARP
            except ValueError:
                e.smooth = False
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True

tris_after = sum(
    sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes
)
print(f"TRIS {tris_before} -> {tris_after}")

bpy.ops.export_scene.gltf(filepath=GLB, export_format="GLB")
print("EXPORTED", GLB, os.path.getsize(GLB), "bytes")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "helper/blender/robot_highpoly.blend"))

# preview render
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 960
scene.render.resolution_y = 960
scene.view_settings.view_transform = "Standard"
lo = Vector((1e9,) * 3)
hi = Vector((-1e9,) * 3)
bpy.context.view_layer.update()
for ob in meshes:
    for c in ob.bound_box:
        w = ob.matrix_world @ Vector(c)
        lo = Vector(map(min, lo, w))
        hi = Vector(map(max, hi, w))
center = (lo + hi) / 2
radius = (hi - lo).length / 2
sun = bpy.data.objects.new("sun", bpy.data.lights.new("s", "SUN"))
sun.data.energy = 3.0
sun.rotation_euler = Euler((math.radians(55), 0, math.radians(-30)), "XYZ")
bpy.context.collection.objects.link(sun)
world = bpy.data.worlds.new("w")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[1].default_value = 0.9
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("c"))
bpy.context.collection.objects.link(cam)
scene.camera = cam
d = radius / math.sin(cam.data.angle / 2) * 1.15
a, e = math.radians(315), math.radians(18)
cam.location = center + Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e))) * d
cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.render.filepath = os.path.join(ROOT, "helper/renders/robot_highpoly.png")
bpy.ops.render.render(write_still=True)
print("DONE highpoly")
