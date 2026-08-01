# Round-trip check: import the exported GLBs (as the site will), assemble the
# chain, render one view using ONLY the materials baked into the files.
import bpy
import math
import os
from mathutils import Euler, Matrix, Vector

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
MODELS = os.path.join(ROOT, "website/src/assets/models")
CHAIN = [
    {"mesh": "base_link"},
    {"xyz": (0, 0, 0.003445), "rpy": (3.1416, 0, -0.0000167), "mesh": "link_1"},
    {"xyz": (0, 0.064146, -0.16608), "rpy": (1.5708, 0.5236, -1.5708), "mesh": "link_2"},
    {"xyz": (0.1525, -0.26414, 0), "rpy": (0, 0, -1.4953816339), "mesh": "link_3"},
    {"xyz": (0, 0, 0.00675), "rpy": (1.5708, -1.2554, -1.5708), "mesh": "link_4"},
    {"xyz": (0, 0, -0.22225), "rpy": (3.1416, 0, -2.8262), "mesh": "link_5"},
    {"xyz": (-0.000294, 0, 0.02117), "rpy": (0, 0, 3.1416), "mesh": "link_6"},
]

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1280
scene.render.resolution_y = 960
scene.view_settings.view_transform = "Standard"

M = Matrix.Identity(4)
allobjs = []
for seg in CHAIN:
    if "xyz" in seg:
        M = M @ Matrix.Translation(Vector(seg["xyz"])) @ Euler(seg["rpy"], "XYZ").to_matrix().to_4x4()
    before = set(bpy.data.objects)
    # Blender's glTF importer always converts assumed-Y-up files to Z-up
    # (Rx+90). Our files carry raw Z-up data (three.js reads them verbatim),
    # so counter-rotate to recover the original link-local coordinates.
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS, seg["mesh"] + ".glb"))
    unrot = Matrix.Rotation(-math.pi / 2, 4, "X")
    for ob in set(bpy.data.objects) - before:
        if ob.type == "MESH":
            ob.matrix_world = M @ unrot @ ob.matrix_world
            allobjs.append(ob)

lo = Vector((1e9,) * 3)
hi = Vector((-1e9,) * 3)
for ob in allobjs:
    for c in ob.bound_box:
        w = ob.matrix_world @ Vector(c)
        lo = Vector(map(min, lo, w))
        hi = Vector(map(max, hi, w))
center = (lo + hi) / 2
radius = (hi - lo).length / 2
print("GLB BBOX", tuple(round(v, 3) for v in lo), tuple(round(v, 3) for v in hi))

sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
sun.data.energy = 2.2
sun.rotation_euler = Euler((math.radians(50), 0, math.radians(-35)), "XYZ")
bpy.context.collection.objects.link(sun)
li = bpy.data.lights.new("fill", "AREA")
li.energy = 70
li.size = 1.8
fill = bpy.data.objects.new("fill", li)
fill.location = (0.9, -1.6, 1.1)
fill.rotation_euler = (-Vector(fill.location)).normalized().to_track_quat("-Z", "Y").to_euler()
bpy.context.collection.objects.link(fill)
world = bpy.data.worlds.new("w")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[1].default_value = 0.4

cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
bpy.context.collection.objects.link(cam)
scene.camera = cam
dist = radius / math.sin(cam.data.angle / 2) * 1.12
a = math.radians(315)
e = math.radians(18)
cam.location = center + Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e))) * dist
cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.render.filepath = os.path.join(ROOT, "helper/renders/glb_roundtrip.png")
bpy.ops.render.render(write_still=True)
print("SHOT", scene.render.filepath)
