# Give robot.glb a real texture map:
#   import robot.glb -> Smart-UV-unwrap every mesh into ONE shared 2K atlas ->
#   bake base color + ambient occlusion (Cycles) -> combine -> hook the atlas
#   into every material's Base Color -> re-export robot.glb (texture embedded).
# Also saves helper/blender/robot_atlas.png and helper/blender/robot_textured.blend for texture
# painting in Blender, plus a preview render.
import bmesh
import bpy
import math
import os
import re
import numpy as np
from mathutils import Euler, Vector

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
GLB = os.path.join(ROOT, "website/src/assets/models/robot.glb")
SIZE = 2048
AO_STRENGTH = 0.6  # 0 = no darkening, 1 = full AO multiply

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)

# tidy names from previous Blender round-trips (pla_yellow.002 -> pla_yellow)
for coll in (bpy.data.objects, bpy.data.materials, bpy.data.meshes):
    for db in coll:
        db.name = re.sub(r"\.\d+$", "", db.name)

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
mats = {m for o in meshes for m in [o.active_material] if m}
print("meshes:", len(meshes), "materials:", sorted(m.name for m in mats))

# The flat-shaded GLB duplicates vertices along every hard edge, which
# shatters connectivity and makes Smart UV emit confetti islands. Weld the
# vertices back (flat shading is a per-face flag, so the look is unchanged).
for me in {o.data for o in meshes}:
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = False

# --- one shared UV atlas across all meshes -----------------------------------
bpy.ops.object.select_all(action="DESELECT")
for o in meshes:
    o.select_set(True)
    if not o.data.uv_layers:
        o.data.uv_layers.new(name="UVMap")
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.003)
bpy.ops.object.mode_set(mode="OBJECT")

# --- bake targets -------------------------------------------------------------
atlas = bpy.data.images.new("robot_atlas", SIZE, SIZE)  # sRGB byte image
ao_img = bpy.data.images.new("robot_ao", SIZE, SIZE)
ao_img.colorspace_settings.name = "Non-Color"

tex_nodes = {}
metallic_backup = {}
for m in mats:
    nt = m.node_tree
    node = nt.nodes.new("ShaderNodeTexImage")
    node.image = atlas
    nt.nodes.active = node
    tex_nodes[m.name] = node
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    metallic_backup[m.name] = (bsdf, bsdf.inputs["Metallic"].default_value)

scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.render.bake.margin = 4

# --- bake 1: albedo (metals bake black unless metallic is zeroed) -------------
for bsdf, _ in metallic_backup.values():
    bsdf.inputs["Metallic"].default_value = 0.0
scene.cycles.samples = 4
bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"})
for bsdf, v in metallic_backup.values():
    bsdf.inputs["Metallic"].default_value = v
print("BAKED color")

# --- bake 2: ambient occlusion -------------------------------------------------
for node in tex_nodes.values():
    node.image = ao_img
scene.cycles.samples = 96
bpy.ops.object.bake(type="AO")
print("BAKED ao")

# --- combine: base color x (soft) AO ------------------------------------------
col = np.empty(SIZE * SIZE * 4, dtype=np.float32)
ao = np.empty(SIZE * SIZE * 4, dtype=np.float32)
atlas.pixels.foreach_get(col)
ao_img.pixels.foreach_get(ao)
factor = (1.0 - AO_STRENGTH) + AO_STRENGTH * ao.reshape(-1, 4)[:, 0]
out = col.reshape(-1, 4)
out[:, :3] *= factor[:, None]
atlas.pixels.foreach_set(out.reshape(-1))
atlas.update()
print("COMBINED")

atlas.filepath_raw = os.path.join(ROOT, "helper/blender/robot_atlas.png")
atlas.file_format = "PNG"
atlas.save()

# --- hook the atlas into every material and export ----------------------------
for m in mats:
    nt = m.node_tree
    node = tex_nodes[m.name]
    node.image = atlas
    bsdf = metallic_backup[m.name][0]
    nt.links.new(node.outputs["Color"], bsdf.inputs["Base Color"])

bpy.ops.export_scene.gltf(filepath=GLB, export_format="GLB")
print("EXPORTED", GLB, os.path.getsize(GLB), "bytes")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "helper/blender/robot_textured.blend"))

# --- preview render -------------------------------------------------------------
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
sun.data.energy = 2.5
sun.rotation_euler = Euler((math.radians(50), 0, math.radians(-35)), "XYZ")
bpy.context.collection.objects.link(sun)
world = bpy.data.worlds.new("w")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[1].default_value = 0.6
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("c"))
bpy.context.collection.objects.link(cam)
scene.camera = cam
d = radius / math.sin(cam.data.angle / 2) * 1.15
a, e = math.radians(315), math.radians(18)
cam.location = center + Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e))) * d
cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.render.filepath = os.path.join(ROOT, "helper/renders/robot_textured.png")
bpy.ops.render.render(write_still=True)
print("DONE bake")
