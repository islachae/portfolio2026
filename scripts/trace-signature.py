#!/usr/bin/env python3
"""
Turn a screen recording of Chaewon writing “Curiously, Chaewon.” into lib/signature.ts: the pen's
strokes as SVG paths, plus when and how fast each one was drawn, so the loader can write it again
the way she did (lib/boot.ts). The video itself never ships, only these few KB of lines.

  python3 scripts/trace-signature.py recording.mov            # writes lib/signature.ts

Needs ffmpeg, and Python with numpy, scipy, scikit-image and Pillow. Record on a white page with
dark ink and a round pen of even width, without scrolling or zooming while writing; any app works.

How: every pixel of the finished ink gets the moment it first turned dark. Frame by frame, the
middle of the newly inked pixels is where the pen tip was, so those points, in order, are the pen's
path. A jump or a pause starts a new stroke (the pen was lifted, or went back over ink). Each path
is then nudged onto the middle of the ink line, trimmed where its round end would poke out, split
where it doubles back (so curves don't overshoot), and smoothed into Bézier curves. The last small
mark is the full stop: it becomes the violet dot, and its position is kept.
"""
import json, subprocess, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = sys.argv[1] if len(sys.argv) > 1 else None
OUT = ROOT / "lib" / "signature.ts"
PEN = 8.0  # pen width in the recording's pixels (measured: the ink line is 7-9 px wide)
# How fast the loader writes it (lib/boot.ts): strokes ×DRAW faster than recorded, pauses ×GAP
# faster, at least BREATH seconds after the comma, LEAD before the first stroke, STOP before the dot.
PACE = {"draw": 2.86, "gap": 5.72, "breath": 0.32, "lead": 0.15, "stop": 0.18}

if not SRC:
    sys.exit(__doc__)


def frames(path):
    ts = [float(x) for x in subprocess.check_output(
        ["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "frame=pts_time", "-of", "csv=p=0", path]
    ).decode().replace(",", "\n").split() if x.strip()]
    first = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"])
    w, h = Image.open(__import__("io").BytesIO(first)).size
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "gray", "-"])
    n = len(raw) // (w * h)
    return np.frombuffer(raw, np.uint8)[: n * w * h].reshape(n, h, w), np.array(ts[:n])


fr, ts = frames(SRC)
ink = fr < 140
final = ink[-15:].mean(0) > 0.8
lab, k = ndi.label(final)
sizes = ndi.sum(final, lab, range(1, k + 1))
final = np.isin(lab, np.where(sizes >= 6)[0] + 1)
stay = ink[:-2] & ink[1:-1] & ink[2:]  # dark for 3 frames running: real ink, not codec noise
arr = np.full(final.shape, -1)
first, has = np.argmax(stay, axis=0), stay.any(0)
arr[final & has] = first[final & has]

# The pen tip, frame by frame: (time, x, y, how many new pixels)
pts = []
for i in range(len(ts)):
    ys, xs = np.where(arr == i)
    if len(xs):
        pts.append((ts[i], xs.mean(), ys.mean(), len(xs)))
pts = np.array(pts)

# Strokes: a new one after a jump (allowing for a fast pen between close frames) or a pause
S = [[pts[0]]]
for p in pts[1:]:
    q = S[-1][-1]
    d, dt = np.hypot(p[1] - q[1], p[2] - q[2]), p[0] - q[0]
    lim = 18 if dt <= 0.021 else (11 if dt <= 0.05 else 7)
    (S.append([p]) if d > lim else S[-1].append(p))
S = [np.array(s) for s in S]


def smooth(s):
    if len(s) < 4:
        return s[:, 1:3].copy()
    xy, w, out = s[:, 1:3], s[:, 3], s[:, 1:3].copy()
    for i in range(1, len(xy) - 1):
        a, b = max(0, i - 2), min(len(xy), i + 3)
        kk = np.exp(-0.5 * (np.arange(a, b) - i) ** 2) * np.sqrt(w[a:b])
        out[i] = (xy[a:b] * kk[:, None]).sum(0) / kk.sum()
    return out


def render(lines, scale=3):
    h, w = final.shape
    im = Image.new("L", (w * scale, h * scale), 0)
    dr, r = ImageDraw.Draw(im), PEN * scale / 2
    for xy in lines:
        pl = [tuple(p * scale) for p in xy]
        if len(pl) > 1:
            dr.line(pl, fill=255, width=int(round(PEN * scale)), joint="curve")
        for p in (pl[0], pl[-1]):
            dr.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=255)
    return np.array(im.resize((w, h), Image.BILINEAR)) > 127


# The tip trails the ink slightly: find the shift that fits the finished ink best
sm = [smooth(s) for s in S]
best = min(
    ((dx, dy) for dx in np.arange(-1, 3.01, 0.5) for dy in np.arange(-1, 3.01, 0.5)),
    key=lambda o: (lambda R: (final & ~R).sum() + (R & ~final).sum())(render([x + o for x in sm])),
)

# Nudge each point across the line onto its middle (uphill on the smoothed distance to the edge)
dist = ndi.gaussian_filter(ndi.distance_transform_edt(final), 1.0)
gy, gx = np.gradient(dist)
at = lambda a, x, y: ndi.map_coordinates(a, [[y], [x]], order=1)[0]


def centre(s):
    xy, n = smooth(s) + best, len(s)
    for _ in range(12):
        for i in range(n):
            tan = xy[min(n - 1, i + 1)] - xy[max(0, i - 1)]
            L = np.hypot(*tan)
            if L < 1e-6:
                continue
            nor = np.array([-tan[1], tan[0]]) / L
            g = np.array([at(gx, *xy[i]), at(gy, *xy[i])])
            xy[i] += np.clip(nor * np.dot(g, nor) * 0.6, -0.5, 0.5)
    return np.c_[s[:, 0], xy]


C = [centre(s) for s in S if s[:, 3].sum() >= 10]  # a few stray pixels aren't a stroke

# Trim ends whose round cap would poke out of the ink
yy, xx = np.mgrid[-6:7, -6:7]
disc = xx**2 + yy**2 <= (PEN / 2) ** 2


def outside(p):
    x, y = int(round(p[1])), int(round(p[2]))
    return 1 - (final[y - 6 : y + 7, x - 6 : x + 7] & disc).sum() / disc.sum()


for i, s in enumerate(C):
    while len(s) > 3 and outside(s[0]) > 0.28:
        s = s[1:]
    while len(s) > 3 and outside(s[-1]) > 0.28:
        s = s[:-1]
    C[i] = s

# The full stop: the last strokes, if together they're a small mark
stop = []
while C and len(stop) < 3:
    cand = np.vstack(stop + [C[-1]])
    if np.ptp(cand[:, 1]) < 2.5 * PEN and np.ptp(cand[:, 2]) < 2.5 * PEN:
        stop.insert(0, C.pop())
    else:
        break
stop = np.vstack(stop) if stop else None


def rdp(p, eps):
    if len(p) < 3:
        return list(range(len(p)))
    a, b = p[0], p[-1]
    ab, L = b - a, np.hypot(*(p[-1] - p[0]))
    d = np.hypot(*(p - a).T) if L < 1e-9 else np.abs(ab[0] * (p[:, 1] - a[1]) - ab[1] * (p[:, 0] - a[0])) / L
    i = int(np.argmax(d))
    if d[i] > eps:
        return rdp(p[: i + 1], eps)[:-1] + [j + i for j in rdp(p[i:], eps)]
    return [0, len(p) - 1]


def split_back(s):
    """Where the pen doubles back (the stem of an h or n), start a new piece, so the curve
    through that turn doesn't overshoot."""
    xy, keep, cuts = s[:, 1:3], rdp(s[:, 1:3], 0.7), []
    for a, b, c in zip(keep, keep[1:], keep[2:]):
        u, v = xy[b] - xy[a], xy[c] - xy[b]
        if np.hypot(*u) >= 2 and np.hypot(*v) >= 2 and np.dot(u, v) / np.hypot(*u) / np.hypot(*v) < -0.6:
            cuts.append(b)
    out, st = [], 0
    for c in cuts:
        out.append(s[st : c + 1])
        st = c
    return out + [s[st:]]


C = [q for s in C for q in split_back(s)]

allxy = np.vstack([s[:, 1:3] for s in C] + ([stop[:, 1:3]] if stop is not None else []))
pad = PEN / 2 + 1.5
x0, y0 = np.floor(allxy.min(0) - pad)
w, h = np.ceil(allxy.max(0) + pad - [x0, y0])
num = lambda v: (lambda s: "0" if s == "-0" else s)(f"{v:.1f}".rstrip("0").rstrip("."))


def bezier(q):
    """Catmull-Rom through the points, as cubic Béziers; and the path's length."""
    if len(q) == 1:
        return f"M{num(q[0][0])} {num(q[0][1])}h0", 0.0
    Q, d, L = np.vstack([q[0], q, q[-1]]), [f"M{num(q[0][0])} {num(q[0][1])}"], 0.0
    for i in range(1, len(Q) - 2):
        p0, p1, p2, p3 = Q[i - 1], Q[i], Q[i + 1], Q[i + 2]
        c1, c2 = p1 + (p2 - p0) / 6, p2 - (p3 - p1) / 6
        d.append(f"C{num(c1[0])} {num(c1[1])} {num(c2[0])} {num(c2[1])} {num(p2[0])} {num(p2[1])}")
        t = np.linspace(0, 1, 41)[:, None]
        b = (1 - t) ** 3 * p1 + 3 * (1 - t) ** 2 * t * c1 + 3 * (1 - t) * t**2 * c2 + t**3 * p2
        L += np.hypot(*np.diff(b, axis=0).T).sum()
    return "".join(d), L


strokes = []
for s in C:
    xy, t = s[:, 1:3] - [x0, y0], s[:, 0]
    d, L = bezier(xy[rdp(xy, 0.7)])
    cum = np.r_[0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
    frac = cum / cum[-1] if cum[-1] > 0 else np.ones_like(cum)
    dur = max(float(t[-1] - t[0]), 0.016)
    curve = np.c_[(t - t[0]) / dur, frac]
    keys = [v for i in rdp(curve, 0.025)[1:-1] for v in (round(float(t[i] - t[0]), 3), round(float(frac[i]), 3))]
    strokes.append([d, round(L, 1), round(float(t[0]), 3), round(dur, 3), keys])

gaps = [strokes[i][2] - strokes[i - 1][2] - strokes[i - 1][3] for i in range(1, len(strokes))]
rest = int(np.argmax(gaps)) + 1  # the longest pause, after the comma

sig = {
    "w": int(w),
    "h": int(h),
    "pen": PEN,
    "stop": [round(float(stop[:, 1].mean() - x0), 1), round(float(stop[:, 2].mean() - y0), 1)] if stop is not None else None,
    "rest": rest,
    "strokes": strokes,
}

body = ",\n    ".join(json.dumps(s, separators=(",", ":"), ensure_ascii=False) for s in strokes)
OUT.write_text(f'''/**
 * “Curiously, Chaewon.” in Chaewon's own hand, for the monogram loader (lib/boot.ts), which writes
 * it again stroke by stroke, the way she wrote it.
 *
 * GENERATED by scripts/trace-signature.py from a screen recording of her writing it (the video
 * isn't shipped). To redo it, record yourself writing it again and run the script; to change only
 * the speed, edit PACE below.
 *
 * w, h: the drawing's size (the recording's pixels); pen: the pen's width; stop: where her full
 * stop was (the loader puts the violet dot there); rest: the stroke after the longest pause (the
 * comma), which keeps a breath before it. Each stroke, in the order she drew it:
 *   [SVG path, its length, when it started (s), how long it took (s), [t, share drawn by t]…]
 * all in the recording's own time.
 */
export const SIGNATURE = {{
  w: {sig["w"]},
  h: {sig["h"]},
  pen: {num(PEN)},
  stop: {json.dumps(sig["stop"])},
  rest: {rest},
  strokes: [
    {body},
  ] as [string, number, number, number, number[]][],
}};

/** How fast the loader writes it: strokes ×draw faster than she wrote them, pauses ×gap faster,
 *  at least `breath` s after the comma, `lead` s before the first stroke, `stop` s before the dot.
 *  Now about 3.5s of writing, the dot at about 3.7s (her recording took 13s). */
export const PACE = {{ {", ".join(f"{k}: {v}" for k, v in PACE.items())} }};
''')


def total(p):
    t = p["lead"]
    for i, s in enumerate(strokes):
        if i:
            g = gaps[i - 1] / p["gap"]
            t += max(g, p["breath"]) if i == rest else g
        t += s[3] / p["draw"]
    return t + p["stop"]


print(f"{OUT.relative_to(ROOT)}: {len(strokes)} strokes, {int(w)}×{int(h)}, full stop {'kept' if stop is not None else 'none'}, "
      f"dot at {total(PACE):.2f}s, {OUT.stat().st_size / 1024:.1f} KB")
