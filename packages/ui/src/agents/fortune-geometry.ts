/* Geometry of the fortune cookie scene, measured on the approved 690 px wide scene: the photographs are 1 380 × 793
   and the folded paper is laid out from the corners of the strip sticking out of the cookie. */

export type Point = readonly [number, number];

export interface CookieArtGeometry {
  /* How much closer the open halves start (px at 690 wide): they settle apart. */
  spread: number;
  /* The strip sticking out of the fold: top left, top right and bottom left corners. */
  paper: { topLeft: Point; topRight: Point; bottomLeft: Point };
  /* Top of the unfolded paper on wide scenes, and as a share of the cookie's height on compact ones. */
  paperTop: number;
  paperTopShare: number;
}

export interface CookieLayout {
  panelWidth: number;
  panelHeight: number;
  paperLeft: number;
  paperTop: number;
  linkTop: number;
  sceneHeight: number;
  button: { left: number; top: number; width: number; height: number };
  /* The photographs' box: the scene's width, or wider on phones and centred, its white margins past the edges. */
  art: { left: number; width: number };
  /* CSS matrix taking the paper from the strip in the fold to its own box. */
  paperStart: string;
  /* How much closer the open halves start: they settle apart. */
  spread: number;
  /* How far the closed scene rests below its place: half the room its hidden paper and link keep, so the cookie and
     its label, not the empty room, sit on the centre. It rises as the paper comes out. */
  restOffset: number;
}

const SCENE_WIDTH = 690;
const ART_WIDTH = 1380;
const ART_HEIGHT = 793;
/* On phones the cookie is drawn this much larger, as far as the open halves stay whole: the photographs' white margins run past the screen's edges. */
const COMPACT_ZOOM = 1.1;
/* The paper's panels on the 690 px scene, and their height as a share of their width. */
const PANEL_WIDTH = 270;
const PANEL_RATIO = 0.5;
const COMPACT_PANEL_WIDTH = 165;
const COMPACT_PANEL_RATIO = 0.62;
/* From the paper's foot to its link. */
const LINK_GAP = 24;
const COMPACT_LINK_GAP = 18;

function scaled([x, y]: Point, scale: number): Point {
  return [x * scale, y * scale];
}

/* The affine matrix mapping a `width` × `height` box placed at `origin` onto the strip's three corners. */
export function stripMatrix(
  corners: CookieArtGeometry["paper"],
  box: { width: number; height: number },
  origin: Point,
): string {
  const [originX, originY] = corners.topLeft;
  const [acrossX, acrossY] = corners.topRight;
  const [downX, downY] = corners.bottomLeft;
  const values = [
    (acrossX - originX) / box.width,
    (acrossY - originY) / box.width,
    (downX - originX) / box.height,
    (downY - originY) / box.height,
    originX - origin[0],
    originY - origin[1],
  ];
  return `matrix(${values.map((value) => value.toFixed(4)).join(",")})`;
}

/* Lays the scene out for a width: the cookie on top, the paper under it once unfolded, its link below. */
export function cookieLayout(
  width: number,
  compact: boolean,
  art: CookieArtGeometry,
): CookieLayout {
  const zoom = compact ? COMPACT_ZOOM : 1;
  const scale = width / SCENE_WIDTH;
  const artScale = scale * zoom;
  const artWidth = width * zoom;
  const artLeft = (width - artWidth) / 2;
  const objectHeight = (artWidth * ART_HEIGHT) / ART_WIDTH;
  const panelWidth = compact
    ? Math.min(COMPACT_PANEL_WIDTH, Math.floor((width - 16) / 2))
    : Math.round(PANEL_WIDTH * scale);
  const panelHeight = Math.round(panelWidth * (compact ? COMPACT_PANEL_RATIO : PANEL_RATIO));
  const paperLeft = Math.round((width - 2 * panelWidth) / 2);
  const paperTop = Math.round(compact ? objectHeight * art.paperTopShare : art.paperTop * scale);
  const labelTop = compact ? objectHeight + 4 : 392 * scale;
  const linkTop = paperTop + panelHeight + (compact ? COMPACT_LINK_GAP : LINK_GAP);
  const sceneHeight = linkTop + 48;
  const closedHeight = labelTop + 32;
  const buttonLeft = Math.max(0, Math.round(artLeft + 100 * artScale));
  const buttonTop = Math.round(16 * artScale);
  function placed(point: Point): Point {
    const [x, y] = scaled(point, artScale);
    return [x + artLeft, y];
  }
  return {
    panelWidth,
    panelHeight,
    paperLeft,
    paperTop,
    linkTop,
    sceneHeight,
    button: {
      left: buttonLeft,
      top: buttonTop,
      width: width - 2 * buttonLeft,
      height: Math.round(closedHeight - buttonTop),
    },
    art: { left: artLeft, width: artWidth },
    paperStart: stripMatrix(
      {
        topLeft: placed(art.paper.topLeft),
        topRight: placed(art.paper.topRight),
        bottomLeft: placed(art.paper.bottomLeft),
      },
      { width: panelWidth, height: panelHeight },
      [paperLeft, paperTop],
    ),
    spread: art.spread * artScale,
    restOffset: Math.round((sceneHeight - closedHeight) / 2),
  };
}
