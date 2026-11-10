"""Pick frames of a morph evenly by how much the picture changes, so every step of the scroll moves it as much.
usage: retime.py SRC_DIR FIRST LAST COUNT  -> prints the chosen 1-based frame numbers"""
import sys, glob
import numpy as np
from PIL import Image
src, first, last, count = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
files = sorted(glob.glob(src + "/*.png"))[first - 1:last]
frames = [np.asarray(Image.open(f).convert("L"), np.float32) for f in files]
change = [0.0] + [float(np.abs(b - a).mean()) for a, b in zip(frames, frames[1:])]
cumulative = np.cumsum(change)
targets = np.linspace(0, cumulative[-1], count)
picked = sorted({first + int(np.argmin(np.abs(cumulative - t))) for t in targets})
print(" ".join(map(str, picked)))
print(len(picked), file=sys.stderr)
