# Re-bake the compositor masks at 4K in the current GLB's UV layout:
# AO (helper/renders/comic_ao_4k.png) + material-ID (comic_id_4k.png).
# The 2K masks starve the confetti islands of texels; a 4K atlas needs 4K
# masks so cel-shade bands and island boundaries stay crisp.
#   blender --background --python helper/scripts/ai_dump4k.py
import bmesh
import bpy
import os
import re

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
GLB = os.path.join(ROOT, "website/src/assets/models/robot.glb")
OUTDIR = os.path.join(ROOT, "helper/renders")
SIZE = 4096

ID_COLORS = {
    "pla_yellow": (1, 0, 0, 1),
    "aluminum": (0, 1, 0, 1),
    "steel": (0, 0, 1, 1),
    "hw_black": (1, 0, 1, 1),
    "motor_stack": (0, 1, 1, 1),
}

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
for coll in (bpy.data.objects, bpy.data.materials, bpy.data.meshes, bpy.data.images):
    for db in coll:
        db.name = re.sub(r"\.\d+$", "", db.name)

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
mats = {m for o in meshes for m in [o.active_material] if m}

for me in {o.data for o in meshes}:
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bm.to_mesh(me)
    bm.free()

scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.render.bake.margin = 12  # 2x the 2K margin: same UV-space bleed


def bake_to(name, colorspace):
    img = bpy.data.images.new(name, SIZE, SIZE)
    img.colorspace_settings.name = colorspace
    for m in mats:
        nt = m.node_tree
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = img
        nt.nodes.active = node
    return img


def save(img, fname):
    img.filepath_raw = os.path.join(OUTDIR, fname)
    img.file_format = "PNG"
    img.save()


bpy.ops.object.select_all(action="DESELECT")
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]

ao_img = bake_to("comic_ao_4k", "Non-Color")
scene.cycles.samples = 64
bpy.ops.object.bake(type="AO")
save(ao_img, "comic_ao_4k.png")
print("BAKED ao 4k")

id_img = bake_to("comic_id_4k", "Non-Color")
for m in mats:
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    for link in list(nt.links):
        if link.to_node == bsdf and link.to_socket.name == "Base Color":
            nt.links.remove(link)
    bsdf.inputs["Base Color"].default_value = ID_COLORS[m.name]
    bsdf.inputs["Metallic"].default_value = 0.0
scene.cycles.samples = 2
bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"})
save(id_img, "comic_id_4k.png")
print("BAKED id 4k")
print("DONE dump4k")
