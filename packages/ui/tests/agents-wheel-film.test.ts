import { describe, expect, it } from "vitest";

import { createFilmFrames, loadOrder } from "../src/agents/wheel-film-frames.ts";

describe("loadOrder", () => {
  it("loads every eighth frame and the phases' key frames first, then the frames nearest the playhead", () => {
    const order = loadOrder({ count: 20, keys: [0, 10, 19], playhead: 12 });

    expect(order.slice(0, 5)).toEqual([0, 8, 10, 16, 19]);
    expect(order.slice(5, 11)).toEqual([12, 11, 13, 14, 9, 15]);
    expect(new Set(order).size).toBe(20);
  });
});

interface TestFrame {
  index: number;
  close: () => void;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function film(count: number, failing: ReadonlySet<number> = new Set()) {
  const fetched: number[] = [];
  const counts = { inFlight: 0, mostInFlight: 0, open: 0 };
  const store = createFilmFrames<TestFrame>({
    urls: Array.from({ length: count }, (_, index) => String(index)),
    keys: [0, count - 1],
    fetchFrame: async (url) => {
      fetched.push(Number(url));
      counts.inFlight += 1;
      counts.mostInFlight = Math.max(counts.mostInFlight, counts.inFlight);
      await wait(1);
      counts.inFlight -= 1;
      if (failing.has(Number(url))) {
        throw new Error("network");
      }
      return new Blob([url]);
    },
    decode: async (blob) => {
      counts.open += 1;
      return {
        index: Number(await blob.text()),
        close: () => {
          counts.open -= 1;
        },
      };
    },
    onChange: () => {},
  });
  return { store, fetched, counts };
}

const SETTLE_MS = 200;

describe("createFilmFrames", () => {
  it("loads every frame, never more than six at once", async () => {
    const { store, fetched, counts } = film(40);
    await wait(SETTLE_MS);

    expect(new Set(fetched).size).toBe(40);
    expect(counts.mostInFlight).toBeLessThanOrEqual(6);
    store.dispose();
  });

  it("decodes the frames around the playhead and keeps no more than twelve", async () => {
    const { store, counts } = film(40);
    await wait(SETTLE_MS);
    store.seek(12);
    await wait(SETTLE_MS);

    expect(store.around(12)).toMatchObject({ first: { index: 12 }, share: 0 });
    expect(counts.open).toBeLessThanOrEqual(12);

    store.seek(39);
    await wait(SETTLE_MS);

    expect(store.around(39)?.first.index).toBe(39);
    expect(counts.open).toBeLessThanOrEqual(12);
    store.dispose();

    expect(counts.open).toBe(0);
  });

  it("decodes six frames ahead in the direction of the scroll and two behind", async () => {
    const { store } = film(40);
    await wait(SETTLE_MS);
    store.seek(20);
    await wait(SETTLE_MS);

    expect(store.around(26)?.first.index).toBe(26);
    expect(store.around(15)?.second.index).toBe(18);
    store.dispose();
  });

  it("mixes the two decoded frames that frame a position", async () => {
    const { store } = film(40);
    await wait(SETTLE_MS);
    store.seek(20.25);
    await wait(SETTLE_MS);

    expect(store.around(20.25)).toMatchObject({
      first: { index: 20 },
      second: { index: 21 },
      share: 0.25,
    });
    store.dispose();
  });

  it("asks a failed frame once and bridges it with its decoded neighbours", async () => {
    const { store, fetched } = film(20, new Set([5, 6]));
    await wait(SETTLE_MS);
    store.seek(5);
    await wait(SETTLE_MS);

    expect(fetched.filter((index) => index === 5)).toHaveLength(1);
    expect(store.around(5)).toMatchObject({ first: { index: 4 }, second: { index: 7 } });
    store.dispose();
  });
});
