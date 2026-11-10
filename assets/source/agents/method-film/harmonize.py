"""Put three studio keyframes on one ground line, one centre and one background plate."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, sys.argv[1])
from plate import fit_plate

TARGET = (1024.0, 1800.0)
# subject: (file, anchor x, anchor y = where it meets the ground, scale)
SUBJECTS = [("immersion.png", 1080, 1860, 1.0), ("pont-a.png", 1008, 1340, 1.2), ("bonsai-a.png", 1032, 1740, 1.0)]

def load(path):
    return np.asarray(Image.open(path).convert("RGB"), np.float32)

target_plate, _ = fit_plate(load("immersion.png"))
for name, ax, ay, scale in SUBJECTS:
    rgb = load(name)
    plate, _ = fit_plate(rgb)
    normal = rgb / np.maximum(plate, 1)
    # output pixel p maps to source (p - TARGET) / scale + anchor
    out = np.empty_like(normal)
    for c in range(3):
        out[..., c] = ndimage.affine_transform(
            normal[..., c], np.diag([1 / scale, 1 / scale]),
            offset=[ay - TARGET[1] / scale, ax - TARGET[0] / scale],
            order=3, mode="nearest")
    final = np.clip(out * target_plate, 0, 255).astype(np.uint8)
    Image.fromarray(final).save("key-" + name)
    print("key-" + name)
