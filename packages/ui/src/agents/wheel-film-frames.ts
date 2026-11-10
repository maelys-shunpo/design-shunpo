/* The frames of the method wheel's paper film: the order they load in, and a store that keeps them compressed and
   decodes only those around the playhead. */

/* One film loads at most this many frames at a time: the page's own requests keep the rest of the connection. */
const LOAD_CONCURRENCY = 6;
/* Decoded frames kept at once: a 960 px frame weighs 3.7 MB decoded, about 42 KB compressed. */
const DECODED_FRAMES = 12;
/* Every 8th frame and each phase's first and rest frames load before the rest, so the whole scrub works early. */
const COARSE_STRIDE = 8;
/* Frames decoded ahead of the playhead, in the direction the scroll goes, and behind it: a fast scroll finds the
   next ones ready, and a turn back the last ones. */
const DECODE_AHEAD = 6;
const DECODE_BEHIND = 2;

interface Order {
  count: number;
  /* Frames that load with the coarse ones: where each phase lands and rests. */
  keys: readonly number[];
  playhead: number;
}

/* Coarse frames first, in film order; then every other frame by its distance to the playhead. */
export function loadOrder({ count, keys, playhead }: Order): number[] {
  const indices = Array.from({ length: count }, (_, index) => index);
  const coarse = indices.filter((index) => index % COARSE_STRIDE === 0 || keys.includes(index));
  const fine = indices
    .filter((index) => !coarse.includes(index))
    .toSorted(
      (first, second) => Math.abs(first - playhead) - Math.abs(second - playhead) || first - second,
    );
  return [...coarse, ...fine];
}

interface Closable {
  close: () => void;
}

interface FilmSource<Frame extends Closable> {
  urls: readonly string[];
  keys: readonly number[];
  fetchFrame: (url: string, signal: AbortSignal) => Promise<Blob>;
  decode: (blob: Blob) => Promise<Frame>;
  /* A frame was decoded: the picture may draw it now. */
  onChange: () => void;
}

interface FilmState<Frame extends Closable> {
  source: FilmSource<Frame>;
  playhead: number;
  /* 1 while the film runs forward, -1 backward. */
  heading: number;
  blobs: Map<number, Blob>;
  requested: Set<number>;
  decoded: Map<number, Frame>;
  decoding: Set<number>;
  loading: AbortController;
}

/* How far a frame lies from the playhead, counting the frames ahead as half as far: they are the next ones asked for. */
function remoteness<Frame extends Closable>(state: FilmState<Frame>, index: number): number {
  const offset = (index - state.playhead) * state.heading;
  return offset > 0 ? offset / 2 : -offset;
}

/* The decoded frames farthest from the playhead close first. */
function evict<Frame extends Closable>(state: FilmState<Frame>): void {
  const keep = [...state.decoded.keys()].toSorted(
    (first, second) => remoteness(state, first) - remoteness(state, second),
  );
  for (const index of keep.slice(DECODED_FRAMES)) {
    state.decoded.get(index)?.close();
    state.decoded.delete(index);
  }
}

async function decodeBlob<Frame extends Closable>(
  state: FilmState<Frame>,
  index: number,
  blob: Blob,
): Promise<void> {
  state.decoding.add(index);
  try {
    const frame = await state.source.decode(blob);
    if (state.loading.signal.aborted) {
      frame.close();
      return;
    }
    state.decoded.set(index, frame);
    evict(state);
    state.source.onChange();
  } catch {
    /* A frame that does not decode is dropped for good: its neighbours stand in. */
    state.blobs.delete(index);
  } finally {
    state.decoding.delete(index);
  }
}

function decodeFrame<Frame extends Closable>(state: FilmState<Frame>, index: number): void {
  const blob = state.blobs.get(index);
  if (blob === undefined || state.decoded.has(index) || state.decoding.has(index)) {
    return;
  }
  void decodeBlob(state, index, blob);
}

/* The frames to have decoded, nearest first: the two around the playhead, then those ahead, then those behind. */
function decodeWindow<Frame extends Closable>(state: FilmState<Frame>): number[] {
  const below = Math.floor(state.playhead);
  const ahead = Array.from(
    { length: DECODE_AHEAD },
    (_, step) => below + (step + 1) * state.heading,
  );
  const behind = Array.from(
    { length: DECODE_BEHIND },
    (_, step) => below - (step + 1) * state.heading,
  );
  return [below, below + 1, ...ahead, ...behind];
}

function decodeAround<Frame extends Closable>(state: FilmState<Frame>): void {
  for (const index of decodeWindow(state)) {
    decodeFrame(state, index);
  }
}

/* The decoded frames on either side of a position, nearest first: the one at or below it, then the one above. */
function bracket<Frame extends Closable>(state: FilmState<Frame>, position: number) {
  let below: number | undefined;
  let above: number | undefined;
  for (const index of state.decoded.keys()) {
    if (index <= position && (below === undefined || index > below)) {
      below = index;
    }
    if (index > position && (above === undefined || index < above)) {
      above = index;
    }
  }
  return { below, above };
}

function nextToLoad<Frame extends Closable>(state: FilmState<Frame>): number | undefined {
  const order = loadOrder({
    count: state.source.urls.length,
    keys: state.source.keys,
    playhead: state.playhead,
  });
  return order.find((index) => !state.requested.has(index));
}

/* One worker: takes the next frame the order asks for until none is left. A frame that fails is never asked again. */
async function work<Frame extends Closable>(state: FilmState<Frame>): Promise<void> {
  for (
    let index = nextToLoad(state);
    index !== undefined && !state.loading.signal.aborted;
    index = nextToLoad(state)
  ) {
    state.requested.add(index);
    try {
      // eslint-disable-next-line no-await-in-loop -- each worker loads one frame at a time; six run side by side.
      const blob = await state.source.fetchFrame(
        state.source.urls[index] ?? "",
        state.loading.signal,
      );
      state.blobs.set(index, blob);
      if (decodeWindow(state).includes(index)) {
        decodeFrame(state, index);
      }
    } catch {
      /* Dropped: the nearest loaded frame stands in. */
    }
  }
}

/* Keeps the film's frames compressed, loads them six at a time (coarse first, then nearest the playhead), and decodes
   the few around the playhead, more of them ahead. `around` answers the two decoded frames that frame a position. */
export function createFilmFrames<Frame extends Closable>(source: FilmSource<Frame>) {
  const state: FilmState<Frame> = {
    source,
    playhead: 0,
    heading: 1,
    blobs: new Map(),
    requested: new Set(),
    decoded: new Map(),
    decoding: new Set(),
    loading: new AbortController(),
  };
  for (let worker = 0; worker < LOAD_CONCURRENCY; worker += 1) {
    void work(state);
  }
  return {
    seek(playhead: number) {
      if (playhead !== state.playhead) {
        state.heading = Math.sign(playhead - state.playhead);
      }
      state.playhead = playhead;
      decodeAround(state);
    },
    /* The two decoded frames that frame a position, and how far it sits from the first to the second: drawn mixed by
       that share, the picture never snaps while a frame is still decoding. */
    around(position: number): { first: Frame; second: Frame; share: number } | undefined {
      const { below, above } = bracket(state, position);
      const low = below ?? above;
      const high = above ?? below;
      const first = low === undefined ? undefined : state.decoded.get(low);
      const second = high === undefined ? undefined : state.decoded.get(high);
      if (low === undefined || high === undefined || first === undefined || second === undefined) {
        return undefined;
      }
      const share = low === high ? 0 : (position - low) / (high - low);
      return { first, second, share: Math.min(1, Math.max(0, share)) };
    },
    dispose() {
      state.loading.abort();
      for (const frame of state.decoded.values()) {
        frame.close();
      }
      state.decoded.clear();
    },
  };
}

export type FilmFrames<Frame extends Closable> = ReturnType<typeof createFilmFrames<Frame>>;
