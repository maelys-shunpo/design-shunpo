import { useState } from "react";

/* The decisions the owner has approved, in the order they took them; approving twice changes nothing. */
export function useApprovals(): [readonly string[], (id: string) => void] {
  const [approved, setApproved] = useState<readonly string[]>([]);
  function approve(id: string): void {
    setApproved((previous) => (previous.includes(id) ? previous : [...previous, id]));
  }
  return [approved, approve];
}
