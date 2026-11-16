import { useEffect, useState } from "react";

/* A GPU or network resource, created in the effect that disposes it. In development, StrictMode mounts, cleans up
   and mounts again (React Three Fiber applies it inside the canvas too): a resource made during render and disposed
   in a cleanup would stay disposed while still in use. Null until created; inputs that change re-create it. The
   resource is published like a subscription's value, unless the cleanup came first. An error thrown by create
   reaches the nearest error boundary, so a scene that fails falls back to its poster. */
export function useSceneResource<Resource, Inputs extends unknown[]>(
  create: (...inputs: Inputs) => Resource,
  dispose: (resource: Resource) => void,
  ...inputs: Inputs
): Resource | null {
  const [resource, setResource] = useState<Resource | null>(null);
  useEffect(
    () => {
      const created = create(...inputs);
      let current = true;
      queueMicrotask(() => {
        if (current) {
          setResource(created);
        }
      });
      return () => {
        current = false;
        dispose(created);
      };
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- every input is a dependency, compared one by one; a call site always passes the same number.
    [create, dispose, ...inputs],
  );
  return resource;
}
