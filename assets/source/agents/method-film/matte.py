"""Cut studio frames out of their seamless background, keeping the shadow as a soft dark alpha.

Over the page, the backdrop disappears, a shadow darkens the page by as much as it darkened the backdrop, and the
paper subject keeps its own colour. One plate per shot (the camera is locked), so the matte never flickers.
usage: matte.py SCRIPTS_DIR PLATE_IMAGE OUT_DIR SIZE IMAGE...
"""
import sys
import os
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, sys.argv[1])
from plate import fit_plate

def smoothstep(lo, hi, x):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)

def border(size, share=0.06):
    ramp = np.clip(np.minimum(np.arange(size), np.arange(size)[::-1]) / (size * share), 0, 1)
    return np.minimum.outer(ramp, ramp)

def matte(rgb, plate):
    k = (rgb * plate).sum(2) / np.maximum((plate * plate).sum(2), 1)
    residual = np.linalg.norm(rgb - k[..., None] * plate, axis=2)
    subject = np.maximum(smoothstep(6, 18, residual), smoothstep(1.03, 1.10, k))
    darkening = np.clip(1 - k, 0, 0.85)
    # a shadow only lies against its subject: the backdrop's own vignette, farther out, is not one
    reach = ndimage.gaussian_filter((subject > 0.5).astype(np.float32), sigma=rgb.shape[0] * 0.035)
    near = smoothstep(0.02, 0.12, reach)
    shade = darkening * smoothstep(0.02, 0.06, darkening) * (1 - subject) * near
    alpha = lone_specks((subject + shade) * border(rgb.shape[0]) * 255) / 255
    colour = washi(rgb) * (subject / np.maximum(subject + shade, 1e-4))[..., None]
    return np.dstack([np.clip(colour, 0, 255), np.clip(alpha * 255, 0, 255)]).astype(np.uint8)

# the washi's own tone, measured on the first frame's paper (median of the opaque subject), and how warm it runs
CREAM = np.array([192.0, 161.0, 135.0])
CREAM_WARMTH = 0.35

def washi(rgb):
    """Brings paper warmer than the washi (an amber sheet) back to the washi's tone at its own lightness. The washi's
    warm shade and the red accent (far less green) are left alone."""
    red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    lightness = rgb.mean(2, keepdims=True)
    warmth = (red - blue) / np.maximum(lightness[..., 0], 1)
    amber = smoothstep(0.6, 0.85, warmth) * smoothstep(0.55, 0.65, green / np.maximum(red, 1))
    target = np.clip(CREAM / CREAM.mean() * lightness, 0, 255)
    return rgb + (target - rgb) * amber[..., None]

def lone_specks(alpha):
    """Drops what lies apart from the subject (a streak of backdrop far above it): every part kept is large or close."""
    parts, count = ndimage.label(alpha > 8)
    if count < 2:
        return alpha
    sizes = ndimage.sum(np.ones_like(alpha), parts, range(1, count + 1))
    main = parts == (int(np.argmax(sizes)) + 1)
    distance = ndimage.distance_transform_edt(~main)
    keep = np.zeros(count + 1, bool)
    for label in range(1, count + 1):
        near = distance[parts == label].min() < alpha.shape[0] * 0.06
        keep[label] = near or sizes[label - 1] > alpha.size * 0.02
    return alpha * keep[parts]

def load(path, size):
    return np.asarray(Image.open(path).convert("RGB").resize((size, size), Image.LANCZOS), np.float32)

plate_path, out_dir, size = sys.argv[2], sys.argv[3], int(sys.argv[4])
plate, _ = fit_plate(load(plate_path, size), step=8, rounds=6)
os.makedirs(out_dir, exist_ok=True)
for path in sys.argv[5:]:
    Image.fromarray(matte(load(path, size), plate)).save(os.path.join(out_dir, os.path.basename(path)))
