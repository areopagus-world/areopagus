export type Point = [number, number];

/** An axis-aligned rectangle in map units. */
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

type Edge = { inside: (p: Point) => boolean; cross: (a: Point, b: Point) => Point };

const edges = (box: Box): Edge[] => [
  {
    inside: ([x]) => x >= box.x0,
    cross: ([ax, ay], [bx, by]) => [box.x0, ay + ((by - ay) * (box.x0 - ax)) / (bx - ax)],
  },
  {
    inside: ([x]) => x <= box.x1,
    cross: ([ax, ay], [bx, by]) => [box.x1, ay + ((by - ay) * (box.x1 - ax)) / (bx - ax)],
  },
  {
    inside: ([, y]) => y >= box.y0,
    cross: ([ax, ay], [bx, by]) => [ax + ((bx - ax) * (box.y0 - ay)) / (by - ay), box.y0],
  },
  {
    inside: ([, y]) => y <= box.y1,
    cross: ([ax, ay], [bx, by]) => [ax + ((bx - ax) * (box.y1 - ay)) / (by - ay), box.y1],
  },
];

/**
 * The part of a closed ring inside the box (Sutherland and Hodgman). The result fills the same area
 * as the ring does inside the box; where the ring leaves the box it runs along the box edge, so it
 * is meant for filling, not for drawing the coast.
 */
export function clipRing(ring: Point[], box: Box): Point[] {
  let output = ring;
  for (const edge of edges(box)) {
    if (output.length === 0) break;
    const input = output;
    output = [];
    let previous = input[input.length - 1] as Point;
    for (const current of input) {
      if (edge.inside(current)) {
        if (!edge.inside(previous)) output.push(edge.cross(previous, current));
        output.push(current);
      } else if (edge.inside(previous)) {
        output.push(edge.cross(previous, current));
      }
      previous = current;
    }
  }
  return output;
}

/** The part of one segment inside the box (Liang and Barsky), or undefined. */
function clipSegment([ax, ay]: Point, [bx, by]: Point, box: Box): [Point, Point] | undefined {
  const dx = bx - ax;
  const dy = by - ay;
  let t0 = 0;
  let t1 = 1;
  const checks: [number, number][] = [
    [-dx, ax - box.x0],
    [dx, box.x1 - ax],
    [-dy, ay - box.y0],
    [dy, box.y1 - ay],
  ];
  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return undefined;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return undefined;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return undefined;
      if (r < t1) t1 = r;
    }
  }
  return [
    [ax + t0 * dx, ay + t0 * dy],
    [ax + t1 * dx, ay + t1 * dy],
  ];
}

/** The pieces of a closed ring's outline that lie inside the box, as open lines: the coast in a tile. */
export function clipOutline(ring: Point[], box: Box): Point[][] {
  const lines: Point[][] = [];
  let line: Point[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i] as Point;
    const b = ring[(i + 1) % ring.length] as Point;
    const piece = clipSegment(a, b, box);
    if (!piece) {
      if (line.length > 1) lines.push(line);
      line = [];
      continue;
    }
    const [start, end] = piece;
    const last = line[line.length - 1];
    if (!last || last[0] !== start[0] || last[1] !== start[1]) {
      if (line.length > 1) lines.push(line);
      line = [start];
    }
    line.push(end);
  }
  if (line.length > 1) lines.push(line);
  // The ring may start in the middle of a piece: join its end to its beginning.
  const first = lines[0];
  const last = lines[lines.length - 1];
  if (lines.length > 1 && first && last) {
    const [ex, ey] = last[last.length - 1] as Point;
    const [sx, sy] = first[0] as Point;
    if (ex === sx && ey === sy) {
      lines.pop();
      lines[0] = [...last, ...first.slice(1)];
    }
  }
  return lines;
}
