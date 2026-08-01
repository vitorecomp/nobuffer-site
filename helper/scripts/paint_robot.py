# Assemble the AR2/AR3 arm from the site's STLs, split every solid body out
# by triangle range, paint it to match the reference photo, and render it
# from all sides.
#
#   blender --background --python helper/scripts/paint_robot.py -- id      # component-ID colors + legend
#   blender --background --python helper/scripts/paint_robot.py -- beauty  # photo-matched materials
import bpy
import bmesh
import colorsys
import math
import os
import sys
from mathutils import Euler, Matrix, Vector

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
MODELS = os.path.join(ROOT, "website/src/assets/models")
OUTDIR = os.path.join(ROOT, "helper/renders")
MODE = (sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "beauty").strip()
os.makedirs(OUTDIR, exist_ok=True)

# --- URDF chain (ar3.urdf, same table as robot.js) --------------------------
CHAIN = [
    {"mesh": "base_link"},
    {"xyz": (0, 0, 0.003445), "rpy": (3.1416, 0, -0.0000167), "axis": (0, 0, 1), "mesh": "link_1"},
    {"xyz": (0, 0.064146, -0.16608), "rpy": (1.5708, 0.5236, -1.5708), "axis": (0, 0, -1), "mesh": "link_2"},
    {"xyz": (0.1525, -0.26414, 0), "rpy": (0, 0, -1.4953816339), "axis": (0, 0, -1), "mesh": "link_3"},
    {"xyz": (0, 0, 0.00675), "rpy": (1.5708, -1.2554, -1.5708), "axis": (0, 0, -1), "mesh": "link_4"},
    {"xyz": (0, 0, -0.22225), "rpy": (3.1416, 0, -2.8262), "axis": (-1, 0, 0), "mesh": "link_5"},
    {"xyz": (-0.000294, 0, 0.02117), "rpy": (0, 0, 3.1416), "axis": (0, 0, 1), "mesh": "link_6"},
]
# Joint angles (rad) to strike a pose; zeros = URDF home pose
THETAS = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

# --- Per-link component table (exact connected-component analysis) ----------
# runs: triangle-index runs of the body in original STL order.
# type: yellow | black | alu | steel | nema | (gearmotor, frac, end)
COMPONENTS = {
    "base_link": [
        (((0, 639), (1462, 3892)), "yellow", "base casting"),
        (((640, 695),), "nema", "J1 NEMA17 body (square block)"),
        (((696, 1119),), "alu", "shaft coupler"),
        (((1120, 1461),), "alu", "J1 planetary gearbox (round)"),
        (((3893, 4504),), "alu", "coupler housing"),
        (((4505, 5620),), "steel", "motor mount bracket"),
        (((5621, 6780),), "yellow", "J1 cylinder housing"),
    ],
    "link_1": [
        (((0, 1995),), "yellow", "turntable platform"),
        (((1996, 4693), (5720, 7009)), "yellow", "shoulder casting"),
        (((4694, 5719),), "nema", "motor in J1 housing"),
        (((7010, 8147),), "alu", "J2 motor mount plate"),
        (((8148, 8175),), "alu", "spacer plate A"),
        (((8176, 8491),), "alu", "spacer plate B"),
        (((8492, 9641),), "nema", "NEMA23 body"),
        (((9642, 10259),), ("gearmotor", 0.45, +1), "J2 NEMA23+gearbox"),
    ],
    "link_2": [
        (((0, 2503), (4512, 7717), (8834, 12665)), "yellow", "upper-arm casting"),
        (((2504, 3689),), "black", "elbow hub (J3 driven pulley)"),
        (((3690, 3745),), "nema", "J3 NEMA17 body (square block)"),
        (((3746, 4169),), "alu", "shaft coupler"),
        (((4170, 4511),), "alu", "J3 planetary gearbox (round)"),
        (((7718, 8833),), "steel", "motor mount bracket"),
    ],
    "link_3": [
        (((0, 1993),), "black", "elbow toothed pulley"),
        (((1994, 2803), (3400, 4929)), "yellow", "forearm-base casting"),
        (((2804, 3399),), "alu", "shaft coupler"),
        (((4930, 5509),), "black", "stepper mount plate"),
        (((5510, 5537),), "nema", "wrist stepper body (square block)"),
        (((5538, 5925),), "alu", "wrist planetary gearbox (round)"),
    ],
    "link_4": [
        (((0, 1343),), "black", "J4 toothed pulley"),
        (((1344, 1687),), "black", "forearm square tube"),
        (((1688, 2107),), "black", "J5 drive tube"),
        (((2108, 3387),), "black", "motor mount plate"),
        (((3388, 6885), (10350, 11700)), "yellow", "forearm casting"),
        (((6886, 9265),), "black", "motor inside forearm (only seams visible)"),
        (((9266, 10349),), "black", "side cover"),
    ],
    "link_5": [
        (((0, 27),), "nema", "J5 motor box"),
        (((28, 399),), "black", "J6 drive hub housing"),
        (((400, 697),), "alu", "coupler"),
        (((698, 1035),), "alu", "coupler"),
        (((1036, 1599),), "yellow", "wrist casting"),
        (((1600, 3503),), "alu", "GT2 pulley 46mm"),
        (((3504, 4115),), "nema", "J6 stepper"),
    ],
    "link_6": [
        (((0, 833),), "yellow", "tool flange"),
    ],
}

N_COMPS = sum(len(v) for v in COMPONENTS.values())
_id_counter = [0]


def id_color():
    i = _id_counter[0]
    _id_counter[0] += 1
    h = (i * 5) % N_COMPS / N_COMPS  # stride hues so neighbors differ strongly
    v = 1.0 if i % 2 == 0 else 0.62
    r, g, b = colorsys.hsv_to_rgb(h, 0.9, v)
    return (r, g, b), "#%02X%02X%02X" % (round(r * 255), round(g * 255), round(b * 255))


def srgb(r, g, b):
    def f(c):
        c /= 255.0
        return c / 12.92 if c <= 0.04045 * 12.92 else ((c + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), 1.0)


def make_mat(name, color, metallic=0.0, rough=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    return m


def build_materials():
    if MODE == "id":
        return None
    return {
        # warm PLA yellow like the photo, slightly glossy print
        "yellow": make_mat("pla_yellow", srgb(240, 178, 8), 0.0, 0.38),
        # matte near-black plastic / powder-coated steel
        "black": make_mat("hw_black", srgb(28, 29, 33), 0.0, 0.55),
        # laminated stepper center stack: near-black, faint sheen
        "stack": make_mat("motor_stack", srgb(22, 23, 27), 0.15, 0.45),
        # cast/machined aluminum (gearboxes, couplers)
        "alu": make_mat("aluminum", srgb(196, 201, 206), 1.0, 0.35),
        # bright galvanized steel (brackets, motor end caps)
        "steel": make_mat("steel", srgb(222, 226, 229), 1.0, 0.22),
    }


# --- geometry helpers --------------------------------------------------------
def load_stl(name):
    bpy.ops.wm.stl_import(filepath=os.path.join(MODELS, name + ".stl"))
    obj = bpy.context.selected_objects[0]
    me = obj.data
    tris = []
    for poly in me.polygons:
        tris.append(tuple(me.vertices[v].co.copy() for v in poly.vertices))
    bpy.data.objects.remove(obj, do_unlink=True)
    return tris


def mesh_from_tris(name, tris):
    verts, faces = [], []
    for t in tris:
        i = len(verts)
        verts.extend(t)
        faces.append((i, i + 1, i + 2))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bm.to_mesh(me)
    bm.free()
    me.validate()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    # Export stays FLAT-shaded like the source STLs: the site's matcap
    # materials expect crisp per-face normals; smooth normals over the
    # welded triangle soup shade as broken patchwork in three.js.
    if MODE != "export":
        with bpy.context.temp_override(object=ob, active_object=ob,
                                       selected_objects=[ob], selected_editable_objects=[ob]):
            bpy.ops.object.shade_auto_smooth(angle=0.58)
    return ob


def tris_in_runs(tris, runs):
    out = []
    for a, b in runs:
        out.extend(tris[a:b + 1])
    return out


def motor_axis(tris):
    lo = [1e9] * 3
    hi = [-1e9] * 3
    for t in tris:
        for v in t:
            for a in range(3):
                lo[a] = min(lo[a], v[a])
                hi[a] = max(hi[a], v[a])
    size = [hi[a] - lo[a] for a in range(3)]
    best, axis = -1, 0
    for i in range(3):
        d = abs(size[i] - size[(i + 1) % 3]) + abs(size[i] - size[(i + 2) % 3])
        if d > best:
            best, axis = d, i
    return axis, lo[axis], hi[axis], size[axis]


def split_motor(tris, cut_fracs, is_silver_at):
    # Bisect the body at the cap planes so low-poly side walls get real
    # silver bands (centroid-only splits leave caps invisible from the side)
    axis, lo, hi, ln = motor_axis(tris)
    cuts = [lo + ln * f if f >= 0 else hi + ln * f for f in cut_fracs]
    bm = bmesh.new()
    vmap = {}
    for t in tris:
        vs = []
        for co in t:
            key = (co[0], co[1], co[2])
            v = vmap.get(key)
            if v is None:
                v = bm.verts.new(co)
                vmap[key] = v
            vs.append(v)
        if len(set(vs)) == 3:
            try:
                bm.faces.new(vs)
            except ValueError:
                pass
    axvec = Vector([1 if i == axis else 0 for i in range(3)])
    for c in cuts:
        bmesh.ops.bisect_plane(
            bm,
            geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
            plane_co=axvec * c,
            plane_no=axvec,
        )
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    silver, black = [], []
    for f in bm.faces:
        c = f.calc_center_median()[axis]
        t = tuple(Vector(v.co) for v in f.verts)
        (silver if is_silver_at(c, lo, hi, ln) else black).append(t)
    bm.free()
    return silver, black


# --- scene -------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.resolution_x = 1280
scene.render.resolution_y = 960
scene.view_settings.view_transform = "Standard"
if MODE == "id":
    # unlit flat object colors: exact, readable component IDs
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "FLAT"
    scene.display.shading.color_type = "OBJECT"
    scene.display.render_aa = "8"
else:
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 48

mats = build_materials()

# --- GLB export: bake the paint job into ONE editable file -------------------
# robot.glb holds the whole arm as a node hierarchy (base_link > link_1 > ...)
# with the URDF home-pose transforms on the link nodes, so it opens in Blender
# as the assembled robot. Mesh data stays in link-local coordinates (one flat-
# shaded mesh per link+material) — robot.js re-parents the meshes under its
# own joint groups and ignores the node transforms.
if MODE == "export":
    NEMA_PRED = lambda c, lo, hi, ln: c < lo + 0.16 * ln or c > hi - 0.16 * ln
    parent_empty = None
    report = []
    for seg in CHAIN:
        name = seg["mesh"]
        empty = bpy.data.objects.new(name, None)
        bpy.context.collection.objects.link(empty)
        if parent_empty is not None:
            empty.parent = parent_empty
        if "xyz" in seg:
            empty.matrix_basis = (
                Matrix.Translation(Vector(seg["xyz"]))
                @ Euler(seg["rpy"], "XYZ").to_matrix().to_4x4()
            )
        parent_empty = empty

        tris = load_stl(name)
        buckets = {}  # material key -> triangle list
        for runs, typ, desc in COMPONENTS[name]:
            part = tris_in_runs(tris, runs)
            if typ == "nema":
                caps, stack = split_motor(part, (0.16, -0.16), NEMA_PRED)
                buckets.setdefault("steel", []).extend(caps)
                buckets.setdefault("stack", []).extend(stack)
            elif isinstance(typ, tuple) and typ[0] == "gearmotor":
                _, frac, end = typ
                if end > 0:
                    cuts = (0.12, -frac)
                    pred = lambda c, lo, hi, ln: c > hi - ln * frac or c < lo + ln * 0.12
                else:
                    cuts = (frac, -0.12)
                    pred = lambda c, lo, hi, ln: c < lo + ln * frac or c > hi - ln * 0.12
                silver, stack = split_motor(part, cuts, pred)
                buckets.setdefault("alu", []).extend(silver)
                buckets.setdefault("stack", []).extend(stack)
            else:
                buckets.setdefault(typ, []).extend(part)
        for mk, mtris in buckets.items():
            ob = mesh_from_tris(f"{name}__{mats[mk].name}", mtris)
            ob.data.materials.append(mats[mk])
            ob.parent = empty
        report.append(f"{name}:{'+'.join(sorted(buckets))}")

    out = os.path.join(MODELS, "robot.glb")
    # default +Y-up stays on: the exporter only rotates the ROOT node, so the
    # mesh data keeps its raw Z-up link-local coords for three.js, and Blender
    # re-imports the robot standing upright.
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB")
    print("EXPORTED", out, os.path.getsize(out), "bytes")
    print(" ".join(report))
    print("DONE export")
    os._exit(0)

legend = []
robot_objs = []

M = Matrix.Identity(4)
for ji, seg in enumerate(CHAIN):
    if "xyz" in seg:
        local = Matrix.Translation(Vector(seg["xyz"])) @ Euler(seg["rpy"], "XYZ").to_matrix().to_4x4()
        theta = THETAS[ji - 1] if ji >= 1 else 0.0
        spin = Matrix.Rotation(theta, 4, Vector(seg["axis"]).normalized())
        M = M @ local @ spin
    link_M = M.copy()
    name = seg["mesh"]
    tris = load_stl(name)
    for ci, (runs, typ, desc) in enumerate(COMPONENTS[name]):
        part = tris_in_runs(tris, runs)
        oname = f"{name}#{ci}"
        made = []
        if MODE == "id":
            ob = mesh_from_tris(oname, part)
            rgb, hexc = id_color()
            ob.color = (*rgb, 1.0)
            legend.append(f"{oname:<14} {hexc}  {desc}")
            made = [ob]
        elif typ == "nema":
            caps, stack = split_motor(part, (0.16, -0.16),
                                      lambda c, lo, hi, ln: c < lo + 0.16 * ln or c > hi - 0.16 * ln)
            for sub, mm in ((caps, "steel"), (stack, "stack")):
                if sub:
                    ob = mesh_from_tris(oname + ("_cap" if mm == "steel" else "_stk"), sub)
                    ob.data.materials.append(mats[mm])
                    made.append(ob)
        elif isinstance(typ, tuple) and typ[0] == "gearmotor":
            _, frac, end = typ
            if end > 0:
                cuts = (0.12, -frac)
                pred = lambda c, lo, hi, ln: c > hi - ln * frac or c < lo + ln * 0.12
            else:
                cuts = (frac, -0.12)
                pred = lambda c, lo, hi, ln: c < lo + ln * frac or c > hi - ln * 0.12
            silver, stack = split_motor(part, cuts, pred)
            for sub, mm in ((silver, "alu"), (stack, "stack")):
                if sub:
                    ob = mesh_from_tris(oname + ("_gbx" if mm == "alu" else "_stk"), sub)
                    ob.data.materials.append(mats[mm])
                    made.append(ob)
        else:
            ob = mesh_from_tris(oname, part)
            ob.data.materials.append(mats[typ])
            made = [ob]
        for ob in made:
            ob.matrix_world = link_M
            robot_objs.append(ob)

if legend:
    print("=== COMPONENT LEGEND ===")
    for line in legend:
        print("LEGEND", line)

# ground plane (light MDF-like table)
bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, 0))
ground = bpy.context.active_object
ground.color = (0.55, 0.52, 0.47, 1.0)
if mats:
    ground.data.materials.append(make_mat("ground", srgb(186, 172, 148), 0.0, 0.75))

if MODE != "id":
    # lights: key sun + soft fills
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 2.2
    sun.data.angle = 0.35
    sun.rotation_euler = Euler((math.radians(50), 0, math.radians(-35)), "XYZ")
    bpy.context.collection.objects.link(sun)

    def area(name, loc, energy, size):
        li = bpy.data.lights.new(name, "AREA")
        li.energy = energy
        li.size = size
        ob = bpy.data.objects.new(name, li)
        ob.location = loc
        d = -Vector(loc).normalized()
        ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        bpy.context.collection.objects.link(ob)
        return ob

    area("fill_front", (0.9, -1.6, 1.1), 70, 1.8)
    area("fill_left", (-1.6, 0.6, 1.0), 35, 1.5)
    area("top", (0, 0.2, 2.2), 55, 2.0)

world = bpy.data.worlds.new("world")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.80, 0.80, 0.82, 1.0)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.35

# --- cameras -----------------------------------------------------------------
def world_bbox(objs):
    lo = Vector((1e9,) * 3)
    hi = Vector((-1e9,) * 3)
    for ob in objs:
        for corner in ob.bound_box:
            w = ob.matrix_world @ Vector(corner)
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    return lo, hi

lo, hi = world_bbox(robot_objs)
center = (lo + hi) / 2
radius = (hi - lo).length / 2
print(f"ROBOT BBOX lo={tuple(round(v,3) for v in lo)} hi={tuple(round(v,3) for v in hi)}")

cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 50
cam = bpy.data.objects.new("cam", cam_data)
bpy.context.collection.objects.link(cam)
scene.camera = cam

def shoot(fname, loc, target):
    cam.location = loc
    d = Vector(target) - Vector(loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(OUTDIR, f"{MODE}_{fname}.png")
    bpy.ops.render.render(write_still=True)
    print("SHOT", scene.render.filepath)

fov = cam_data.angle
dist = radius / math.sin(fov / 2) * 1.12

views = [
    ("front", 270), ("front_right", 315), ("right", 0), ("back_right", 45),
    ("back", 90), ("back_left", 135), ("left", 180), ("front_left", 225),
]
elev = math.radians(18)
for vname, az in views:
    a = math.radians(az)
    loc = center + Vector((math.cos(a) * math.cos(elev), math.sin(a) * math.cos(elev), math.sin(elev))) * dist
    shoot(vname, loc, center)
shoot("top", center + Vector((0.001, 0.001, dist)), center)

# close-ups on hardware clusters
def obj_center(prefix):
    objs = [o for o in robot_objs if o.name.startswith(prefix)]
    if not objs:
        return None
    l, h = world_bbox(objs)
    return (l + h) / 2, max((h - l).length / 2, 0.03)

CLOSEUPS = [
    ("cu_base_motor", "base_link#3", 300, 30),
    ("cu_shoulder_motors", "link_1#6", 300, 25),
    ("cu_arm_motor", "link_2#4", 300, 30),
    ("cu_elbow", "link_2#1", 290, 25),
    ("cu_wrist_motor", "link_3#5", 300, 25),
    ("cu_forearm", "link_4#6", 160, 15),
    ("cu_wrist_pulley", "link_5#5", 300, 25),
    ("cu_tool", "link_6#0", 300, 25),
]
for fname, prefix, az, el in CLOSEUPS:
    got = obj_center(prefix)
    if not got:
        continue
    tgt, r = got
    d = r / math.sin(fov / 2) * 1.5
    a, e = math.radians(az), math.radians(el)
    loc = tgt + Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e))) * d
    shoot(fname, loc, tgt)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, f"helper/blender/robot_{MODE}.blend"))
print("DONE", MODE)
