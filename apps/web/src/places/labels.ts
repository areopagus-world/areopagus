/** A light of the map: a settlement with spaces, in map units. */
export interface MapLight {
  id: string;
  name: string;
  country: string;
  x: number;
  y: number;
  spaces: number;
}

export interface Label {
  id: string;
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Where the names go: the biggest places first, to the right of the light, else to the left, above
 * or below. A name never covers another name or another light; one that cannot fit waits until
 * the map is closer.
 */
export function placeLabels(lights: MapLight[], px: number): Label[] {
  const dot = 6 * px;
  const taken: Box[] = lights.map((l) => ({
    x0: l.x - dot,
    y0: l.y - dot,
    x1: l.x + dot,
    y1: l.y + dot,
  }));
  const free = (box: Box, own: MapLight) =>
    taken.every(
      (t) =>
        (t.x0 === own.x - dot && t.y0 === own.y - dot) ||
        box.x1 < t.x0 ||
        box.x0 > t.x1 ||
        box.y1 < t.y0 ||
        box.y0 > t.y1,
    );
  const placed: Label[] = [];
  const height = 17 * px;
  for (const light of [...lights].sort((a, b) => b.spaces - a.spaces)) {
    const width = light.name.length * 8.4 * px;
    const gap = 7 * px;
    const baseline = 5 * px;
    const options: { box: Box; label: Label }[] = [
      {
        box: {
          x0: light.x + gap,
          y0: light.y - height / 2,
          x1: light.x + gap + width,
          y1: light.y + height / 2,
        },
        label: { id: light.id, x: light.x + gap, y: light.y + baseline, anchor: "start" },
      },
      {
        box: {
          x0: light.x - gap - width,
          y0: light.y - height / 2,
          x1: light.x - gap,
          y1: light.y + height / 2,
        },
        label: { id: light.id, x: light.x - gap, y: light.y + baseline, anchor: "end" },
      },
      {
        box: {
          x0: light.x - width / 2,
          y0: light.y - gap - height,
          x1: light.x + width / 2,
          y1: light.y - gap,
        },
        label: { id: light.id, x: light.x, y: light.y - gap - 4 * px, anchor: "middle" },
      },
      {
        box: {
          x0: light.x - width / 2,
          y0: light.y + gap,
          x1: light.x + width / 2,
          y1: light.y + gap + height,
        },
        label: { id: light.id, x: light.x, y: light.y + gap + 13 * px, anchor: "middle" },
      },
    ];
    const fit = options.find((option) => free(option.box, light));
    if (fit) {
      taken.push(fit.box);
      placed.push(fit.label);
    }
  }
  return placed;
}
