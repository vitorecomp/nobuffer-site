# Comic-style step 1/3: from robot.glb's existing UV atlas, bake the masks the
# compositor needs (AO + material-ID) and dump every sharp feature edge as a
# UV-space segment (these become the hand-inked panel lines).
#   blender --background --python helper/scripts/comic_dump.py
import bmesh
import bpy
import json
import math
import os
import re

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
GLB = os.path.join(ROOT, "website/src/assets/models/robot.glb")
OUTDIR = os.path.join(ROOT, "helper/renders")
SIZE = 2048
SHARP = math.radians(28)  # face angle that earns an ink line

ID_COLORS = {  # material -> flat ID color for the mask bake
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

# weld the flat-shading vertex splits back together (UVs live on loops and
# survive), so edge angles are measurable and islands stay intact
for me in {o.data for o in meshes}:
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = False

# --- ink edges: sharp or boundary, one segment per adjacent face's UV island --
segments = []  # [u1, v1, u2, v2, material]
for ob in meshes:
    mat_name = ob.active_material.name
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    uvl = bm.loops.layers.uv.active
    for e in bm.edges:
        nf = len(e.link_faces)
        if nf == 2:
            try:
                if e.calc_face_angle() < SHARP:
                    continue
            except ValueError:
                pass
        elif nf == 0:
            continue
        for f in e.link_faces:
            uv = {}
            for loop in f.loops:
                if loop.vert in e.verts:
                    uv[loop.vert.index] = loop[uvl].uv
            if len(uv) == 2:
                (u1, v1), (u2, v2) = [tuple(x) for x in uv.values()]
                segments.append([u1, v1, u2, v2, mat_name])
    bm.free()
print("EDGE SEGMENTS", len(segments))
with open(os.path.join(OUTDIR, "comic_edges.json"), "w") as f:
    json.dump(segments, f)

# --- bakes in the existing UV layout ------------------------------------------
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.render.bake.margin = 6

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

ao_img = bake_to("comic_ao", "Non-Color")
scene.cycles.samples = 96
bpy.ops.object.bake(type="AO")
save(ao_img, "comic_ao.png")
print("BAKED ao")

# ID mask: flat colors, no textures, no metallic
id_img = bake_to("comic_id", "Non-Color")
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
save(id_img, "comic_id.png")
print("BAKED id")
print("DONE dump")
