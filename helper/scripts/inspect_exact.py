# Blender headless: inventory connected components (solid bodies) in each STL.
# Outputs helper/data/components_exact.json with per-component triangle ranges (original STL
# order), bbox size/center — used to classify castings vs hardware for painting.
import bpy
import json
import os
import sys

MODELS_DIR = "/home/vitor/workspace/personal/nobuffer-site/website/src/assets/models"
OUT = "/home/vitor/workspace/personal/nobuffer-site/helper/data/components_exact.json"
LINKS = ["base_link", "link_1", "link_2", "link_3", "link_4", "link_5", "link_6"]


class UnionFind:
    def __init__(self, n):
        self.p = list(range(n))

    def find(self, x):
        p = self.p
        root = x
        while p[root] != root:
            root = p[root]
        while p[x] != root:
            p[x], x = root, p[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[rb] = ra


def analyze(name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    path = os.path.join(MODELS_DIR, name + ".stl")
    bpy.ops.wm.stl_import(filepath=path)
    obj = bpy.context.selected_objects[0]
    me = obj.data
    ntris = len(me.polygons)

    # Map rounded vertex position -> canonical id (STL soup: weld by position)
    vkey = {}
    vid = [0] * len(me.vertices)
    for i, v in enumerate(me.vertices):
        k = (v.co.x, v.co.y, v.co.z)
        vid[i] = vkey.setdefault(k, len(vkey))

    uf = UnionFind(ntris)
    owner = {}  # canonical vertex id -> first triangle that used it
    for t, poly in enumerate(me.polygons):
        for li in poly.vertices:
            cv = vid[li]
            if cv in owner:
                uf.union(owner[cv], t)
            else:
                owner[cv] = t

    comps = {}
    for t, poly in enumerate(me.polygons):
        r = uf.find(t)
        c = comps.setdefault(r, {"tris": [], "min": [1e9] * 3, "max": [-1e9] * 3})
        c["tris"].append(t)
        for li in poly.vertices:
            co = me.vertices[li].co
            for a in range(3):
                c["min"][a] = min(c["min"][a], co[a])
                c["max"][a] = max(c["max"][a], co[a])

    out = []
    for c in comps.values():
        tris = c["tris"]
        tris.sort()
        # contiguous runs inside the component (should usually be 1 run)
        runs = []
        s = prev = tris[0]
        for t in tris[1:]:
            if t != prev + 1:
                runs.append([s, prev])
                s = t
            prev = t
        runs.append([s, prev])
        size = [round(c["max"][a] - c["min"][a], 4) for a in range(3)]
        center = [round((c["max"][a] + c["min"][a]) / 2, 4) for a in range(3)]
        out.append(
            {
                "range": [tris[0], tris[-1]],
                "runs": runs,
                "ntris": len(tris),
                "size": size,
                "center": center,
            }
        )
    out.sort(key=lambda c: c["range"][0])
    return {"ntris": ntris, "components": out}


result = {}
for name in LINKS:
    result[name] = analyze(name)
    print(name, "tris:", result[name]["ntris"], "components:", len(result[name]["components"]))

with open(OUT, "w") as f:
    json.dump(result, f, indent=1)
print("wrote", OUT)
