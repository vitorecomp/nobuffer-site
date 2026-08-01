# Comic-style step 3/3: put the composed comic atlas into robot.glb, flatten
# the materials (no metallic — it's a drawing now), re-export, and render a
# preview. Also saves helper/blender/robot_comic.blend.
#   blender --background --python helper/scripts/comic_apply.py
import bpy
import math
import os
import re
from mathutils import Euler, Vector

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
GLB = os.path.join(ROOT, "website/src/assets/models/robot.glb")
ATLAS = os.path.join(ROOT, "helper/blender/robot_atlas_comic.png")

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
for coll in (bpy.data.objects, bpy.data.materials, bpy.data.meshes, bpy.data.images):
    for db in coll:
        db.name = re.sub(r"\.\d+$", "", db.name)

comic = bpy.data.images.load(ATLAS)
comic.name = "robot_atlas_comic"
comic.pack()

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
mats = {m for o in meshes for m in [o.active_material] if m}
for m in mats:
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tex = next(n for n in nt.nodes if n.type == "TEX_IMAGE")
    tex.image = comic
    if not any(l.to_node == bsdf and l.to_socket.name == "Base Color" for l in nt.links):
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.92
print("materials updated:", sorted(m.name for m in mats))

bpy.ops.export_scene.gltf(filepath=GLB, export_format="GLB")
print("EXPORTED", GLB, os.path.getsize(GLB), "bytes")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "helper/blender/robot_comic.blend"))

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
scene.render.filepath = os.path.join(ROOT, "helper/renders/robot_comic.png")
bpy.ops.render.render(write_still=True)
print("DONE apply")
