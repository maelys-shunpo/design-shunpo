import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { SilentBoundary } from "../src/lib/silent-boundary.tsx";
import { useSceneResource } from "../src/scene/use-scene-resource.ts";

interface Resource {
  label: string;
  disposed: boolean;
}

let made = 0;

function create(label: string): Resource {
  made += 1;
  return { label, disposed: false };
}

function dispose(resource: Resource): void {
  Object.assign(resource, { disposed: true });
}

function fail(): Resource {
  throw new Error("The resource could not be created.");
}

function Probe({
  make,
  seen,
}: {
  make: (label: string) => Resource;
  seen: (resource: Resource) => void;
}) {
  const resource = useSceneResource(make, dispose, "probe");
  if (resource !== null) {
    seen(resource);
  }
  return null;
}

describe("useSceneResource", () => {
  it("re-creates the resource on StrictMode's second mount and only ever shows a live one", async () => {
    made = 0;
    const seen = vi.fn<(resource: Resource) => void>();
    await render(
      <StrictMode>
        <Probe make={create} seen={seen} />
      </StrictMode>,
    );

    await expect.poll(() => seen.mock.calls.length).toBeGreaterThan(0);
    expect(made).toBe(2);
    expect(seen.mock.calls.every(([resource]) => !resource.disposed)).toBe(true);
  });

  it("sends a failed creation to the error boundary, so the poster stays", async () => {
    const fallBack = vi.fn<() => void>();
    await render(
      <SilentBoundary onError={fallBack}>
        <Probe make={fail} seen={vi.fn<(resource: Resource) => void>()} />
      </SilentBoundary>,
    );

    await expect.poll(() => fallBack.mock.calls.length).toBe(1);
  });
});
