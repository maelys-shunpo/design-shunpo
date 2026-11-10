"""Fit a smooth clean plate (the seamless background) to a studio still and report the subject's box."""
import sys
import numpy as np
from PIL import Image

def basis(h, w, step):
    ys, xs = np.mgrid[0:h:step, 0:w:step]
    x = xs.ravel() / w * 2 - 1
    y = ys.ravel() / h * 2 - 1
    terms = [np.ones_like(x)]
    for degree in range(1, 4):
        for i in range(degree + 1):
            terms.append(x ** (degree - i) * y ** i)
    return np.stack(terms, 1), ys, xs

def full_basis(h, w):
    ys, xs = np.mgrid[0:h, 0:w]
    x = xs.ravel() / w * 2 - 1
    y = ys.ravel() / h * 2 - 1
    terms = [np.ones_like(x)]
    for degree in range(1, 4):
        for i in range(degree + 1):
            terms.append(x ** (degree - i) * y ** i)
    return np.stack(terms, 1)

def fit_plate(rgb, step=8, rounds=6):
    h, w, _ = rgb.shape
    A, ys, xs = basis(h, w, step)
    samples = rgb[ys, xs].reshape(-1, 3)
    keep = np.ones(len(samples), bool)
    for _ in range(rounds):
        coef, *_ = np.linalg.lstsq(A[keep], samples[keep], rcond=None)
        resid = np.abs(samples - A @ coef).max(1)
        keep = resid < max(4.0, np.percentile(resid[keep], 70) * 1.5)
    return (full_basis(h, w) @ coef).reshape(h, w, 3), coef

if __name__ == "__main__":
    for path in sys.argv[1:]:
        rgb = np.asarray(Image.open(path).convert("RGB"), np.float32)
        plate, _ = fit_plate(rgb)
        diff = np.abs(rgb - plate).max(2)
        mask = diff > 12
        ys, xs = np.nonzero(mask)
        h, w = mask.shape
        corners = [plate[0, 0], plate[0, -1], plate[-1, 0], plate[-1, -1], plate[h // 2, w // 2]]
        print(path, "box x", xs.min(), xs.max(), "y", ys.min(), ys.max(),
              "plate corners", [tuple(int(v) for v in c) for c in corners])
        Image.fromarray((mask * 255).astype(np.uint8)).resize((512, 512)).save(path.replace(".png", "-mask.png"))
