# AI-material step 2/2: put the nanobanana-composed atlas into robot.glb,
# restore per-material metallic (robot.js picks the metal matcap for
# metalness > 0.5), re-export, and render a preview.
#   blender --background --python helper/scripts/ai_apply.py
import bpy
import math
import os
import re
from mathutils import Euler, Vector

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
GLB = os.path.join(ROOT, "website/src/assets/models/robot.glb")
ATLAS = os.path.join(ROOT, "helper/blender/robot_atlas_ai.png")

# metallic drives the matcap split in robot.js; roughness only shapes the
# Blender preview render
SURFACE = {
    "pla_yellow": (0.0, 0.55),
    "hw_black": (0.0, 0.80),
    "motor_stack": (0.0, 0.80),
    "aluminum": (1.0, 0.35),
    "steel": (1.0, 0.40),
}

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
for coll in (bpy.data.objects, bpy.data.materials, bpy.data.meshes, bpy.data.images):
    for db in coll:
        db.name = re.sub(r"\.\d+$", "", db.name)

atlas = bpy.data.images.load(ATLAS)
atlas.name = "robot_atlas_ai"
atlas.pack()

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
mats = {m for o in meshes for m in [o.active_material] if m}
for m in mats:
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tex = next(n for n in nt.nodes if n.type == "TEX_IMAGE")
    tex.image = atlas
    if not any(l.to_node == bsdf and l.to_socket.name == "Base Color" for l in nt.links):
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    metallic, rough = SURFACE[m.name]
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
print("materials updated:", sorted(m.name for m in mats))

# the atlas is opaque noisy color data — JPEG inside the GLB keeps the web
# payload sane (a textured 2K PNG atlas roughly doubles the file)
bpy.ops.export_scene.gltf(
    filepath=GLB, export_format="GLB",
    export_image_format="JPEG", export_jpeg_quality=88,
)
print("EXPORTED", GLB, os.path.getsize(GLB), "bytes")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "helper/blender/robot_ai.blend"))

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
scene.render.filepath = os.path.join(ROOT, "helper/renders/robot_ai.png")
bpy.ops.render.render(write_still=True)
print("DONE ai apply")
