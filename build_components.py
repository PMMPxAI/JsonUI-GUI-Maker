"""
Scan pj/samples/*.json, walk every Bedrock UI control, and build a library
of components grouped by type, deduplicated by structural fingerprint.
Outputs pj/samples/components.json.
"""
import json, os, re, hashlib
from pathlib import Path

ROOT = Path(__file__).parent
SAMPLES = ROOT / "pj" / "samples"

SKIP_TYPES = {"root", None}
MAX_PER_TYPE = 80      # cap
MIN_DEPTH_LABELS = 0   # keep any


def walk(node, on_control, parent_name=None, depth=0):
    """
    Recursively walk a Bedrock UI structure. Calls on_control(name, data, depth).
    """
    if not isinstance(node, dict):
        return
    for key, value in node.items():
        if key == "namespace":
            continue
        if not isinstance(value, dict):
            continue
        # key is the control name (maybe with @inheritance)
        on_control(key, value, depth, parent_name)
        ctrls = value.get("controls")
        if isinstance(ctrls, list):
            for item in ctrls:
                if isinstance(item, dict):
                    for ck, cv in item.items():
                        if isinstance(cv, dict):
                            on_control(ck, cv, depth + 1, key)
                            inner = cv.get("controls")
                            if isinstance(inner, list):
                                # recurse via a pseudo dict
                                pseudo = {ck + "__inner_" + str(i): it
                                          for i, it in enumerate(inner)
                                          if isinstance(it, dict)}
                                # Flatten: iterate each inner control
                                for item2 in inner:
                                    if isinstance(item2, dict):
                                        for ck2, cv2 in item2.items():
                                            if isinstance(cv2, dict):
                                                on_control(ck2, cv2, depth + 2, ck)


def fingerprint(data):
    """Compact JSON for dedup."""
    try:
        s = json.dumps(data, sort_keys=True, ensure_ascii=False)
    except Exception:
        return None
    return hashlib.sha1(s.encode("utf-8", "replace")).hexdigest()[:12]


def infer_size(data):
    s = data.get("size")
    if isinstance(s, list) and len(s) == 2:
        return s
    return ["100%c", "100%c"]


def has_text_content(data):
    if "text" in data:
        return True
    ctrls = data.get("controls")
    if isinstance(ctrls, list):
        for c in ctrls:
            if isinstance(c, dict):
                for k, v in c.items():
                    if isinstance(v, dict) and v.get("type") == "label":
                        return True
    return False


def main():
    idx_path = SAMPLES / "index.json"
    if not idx_path.exists():
        print("Missing", idx_path)
        return

    idx = json.loads(idx_path.read_text(encoding="utf-8"))
    buckets = {}   # type -> list of (fp, item)
    seen_fps = set()

    for entry in idx:
        path = SAMPLES / entry["path"]
        if not path.exists():
            continue
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue

        def add(name, data, depth, parent):
            t = data.get("type")
            if t in SKIP_TYPES or not isinstance(t, str):
                return
            # skip purely inherited stubs (no type, pure name@...)
            fp = fingerprint(data)
            if not fp or fp in seen_fps:
                return
            # Skip micro-controls (tiny unnamed pieces) unless top-level
            if depth > 3:
                return
            # Skip controls that are just fields without any visible content
            has_size = isinstance(data.get("size"), list) or "size" in data
            if not has_size and depth > 1:
                return

            bucket = buckets.setdefault(t, [])
            if len(bucket) >= MAX_PER_TYPE:
                return

            # Sanitize data: don't keep massive children
            item = {
                "type": t,
                "name": name,
                "source": entry["path"],
                "pack": entry["pack"],
                "depth": depth,
                "size": infer_size(data),
                "has_text": has_text_content(data),
                "data": data
            }
            bucket.append((fp, item))
            seen_fps.add(fp)

        walk(raw, add)

    # Flatten
    out = []
    for t, lst in buckets.items():
        # prefer more complete items first (more keys / has children)
        lst.sort(key=lambda x: -(len(x[1]["data"]) + (5 if isinstance(x[1]["data"].get("controls"), list) else 0)))
        for fp, item in lst:
            item["id"] = f"{t}_{fp}"
            out.append(item)

    print("Extracted", len(out), "unique components across", len(buckets), "types")
    for t, lst in sorted(buckets.items(), key=lambda x: -len(x[1])):
        print(f"  {t:20s} {len(lst)}")

    target = SAMPLES / "components.json"
    target.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("Wrote", target, target.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
