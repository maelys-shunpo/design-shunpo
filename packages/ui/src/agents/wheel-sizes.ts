/* Each held wheel's watch on its copies and on the sheet it lies on (internal to `MethodWheel`): one at a time, let go
   when the wheel is let go or held again. */
const sizeWatchers = new WeakMap<HTMLElement, ResizeObserver>();

/* What the next paint must measure again: the copies (one outgrew the tallest: a late font, a longer line) or the
   paper (the sheet changed height, which moves the wheel on its grain). The paint clears what it measured. */
interface Staleness {
  copy: boolean;
  paper: boolean;
}

interface Watched {
  root: HTMLElement;
  steps: readonly HTMLElement[];
}

export function watchSizes({ root, steps }: Watched, copyBlock: () => number): Staleness {
  sizeWatchers.get(root)?.disconnect();
  const stale: Staleness = { copy: false, paper: false };
  const sheet = root.closest("[data-slot=cover-sheet]");
  const sizes = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === sheet) {
        stale.paper = true;
      } else {
        stale.copy ||= (entry.borderBoxSize[0]?.blockSize ?? 0) > copyBlock() + 0.5;
      }
    }
  });
  for (const step of steps) {
    const copy = step.querySelector("[data-wheel-copy]");
    if (copy !== null) {
      sizes.observe(copy);
    }
  }
  if (sheet !== null) {
    sizes.observe(sheet);
  }
  sizeWatchers.set(root, sizes);
  return stale;
}

export function releaseSizes(root: HTMLElement): void {
  sizeWatchers.get(root)?.disconnect();
  sizeWatchers.delete(root);
}
