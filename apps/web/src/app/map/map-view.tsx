"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { MAP_HEIGHT, MAP_WIDTH } from "@/places/europe";
import { placeLabels, type MapLight } from "@/places/labels";
import {
  FULL_VIEW,
  TILE,
  TILE_MARGIN,
  panBy,
  tilesInView,
  viewBox,
  viewQuery,
  zoomAt,
  type View,
} from "@/places/view";

export type { MapLight } from "@/places/labels";

export interface MapLabels {
  aria: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
  north: string;
  south: string;
  west: string;
  east: string;
  hint: string;
}

/** From this zoom the lights carry their names. */
const NAMES_ZOOM = 4;
/** A pointer that moves less than this many pixels makes a click, not a drag. */
const DRAG_PX = 5;

const href = (view: View) => (view.z <= 1.001 ? "/map" : `/map?${viewQuery(view)}`);

const control: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 44,
  height: 44,
  padding: "0 12px",
  boxSizing: "border-box",
  background: "rgba(20, 17, 15, 0.88)",
  border: "1px solid #3a342e",
  color: "#f3efe6",
  fontSize: 22,
  lineHeight: 1,
  textDecoration: "none",
};

interface Gesture {
  view: View;
  /** Pointer positions when the gesture started, by pointer id. */
  start: Map<number, { x: number; y: number }>;
}

/**
 * Europe with its lights, to drag, zoom and click. Without JavaScript the buttons are plain links
 * that move the view through the address.
 */
export function MapView({
  initial,
  lights,
  labels,
}: {
  initial: View;
  lights: MapLight[];
  labels: MapLabels;
}) {
  const [view, setView] = useState(initial);
  const [width, setWidth] = useState(MAP_WIDTH);
  const [dragging, setDragging] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | undefined>(undefined);
  const moved = useRef(false);

  const toMap = (clientX: number, clientY: number, from: View): [number, number] => {
    const rect = svg.current?.getBoundingClientRect();
    const [x, y, w, h] = viewBox(from);
    if (!rect || rect.width === 0) return [from.cx, from.cy];
    return [
      x + ((clientX - rect.left) / rect.width) * w,
      y + ((clientY - rect.top) / rect.height) * h,
    ];
  };

  // The size of the map on screen, for names and lights that keep their size while zooming.
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The wheel zooms around the cursor. React listens passively, so this one is added by hand.
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const step = event.deltaMode === 1 ? 0.05 : 0.0015;
      const factor = Math.exp(-event.deltaY * step);
      setView((current) =>
        zoomAt(current, factor, ...toMap(event.clientX, event.clientY, current)),
      );
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  // The address follows the view, so a reload or a shared link opens the same place.
  useEffect(() => {
    const timer = setTimeout(
      () => window.history.replaceState(window.history.state, "", href(view)),
      250,
    );
    return () => clearTimeout(timer);
  }, [view]);

  const begin = () => {
    gesture.current = { view, start: new Map(pointers.current) };
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) moved.current = false;
    begin();
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const rect = svg.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const { view: from, start } = gesture.current;
    const [, , w, h] = viewBox(from);
    const now = [...pointers.current.entries()];
    if (now.length === 1) {
      const [id, at] = now[0] as [number, { x: number; y: number }];
      const origin = start.get(id);
      if (!origin) return;
      const dx = at.x - origin.x;
      const dy = at.y - origin.y;
      if (!moved.current && Math.hypot(dx, dy) < DRAG_PX) return;
      if (!moved.current) {
        moved.current = true;
        setDragging(true);
        svg.current?.setPointerCapture(event.pointerId);
      }
      setView(panBy(from, (-dx * w) / rect.width, (-dy * h) / rect.height));
      return;
    }
    // Two fingers: the distance between them zooms, their middle moves the map.
    const [first, second] = now;
    if (!first || !second) return;
    const [idA, a] = first;
    const [idB, b] = second;
    const a0 = start.get(idA);
    const b0 = start.get(idB);
    if (!a0 || !b0) return;
    const before = Math.hypot(b0.x - a0.x, b0.y - a0.y);
    if (before < 1) return;
    moved.current = true;
    const factor = Math.hypot(b.x - a.x, b.y - a.y) / before;
    const mid0 = { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 };
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const zoomed = zoomAt(from, factor, ...toMap(mid0.x, mid0.y, from));
    const [, , w1, h1] = viewBox(zoomed);
    setView(
      panBy(zoomed, (-(mid.x - mid0.x) * w1) / rect.width, (-(mid.y - mid0.y) * h1) / rect.height),
    );
  };

  const onPointerEnd = (event: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    if (svg.current?.hasPointerCapture(event.pointerId))
      svg.current.releasePointerCapture(event.pointerId);
    if (pointers.current.size === 0) setDragging(false);
    begin();
  };

  // A drag that ends on a light must not open it.
  const onClickCapture = (event: MouseEvent) => {
    if (moved.current) {
      event.preventDefault();
      event.stopPropagation();
      moved.current = false;
    }
  };

  const onDoubleClick = (event: MouseEvent) => {
    event.preventDefault();
    setView((current) => zoomAt(current, 2, ...toMap(event.clientX, event.clientY, current)));
  };

  const [x, y, w, h] = viewBox(view);
  const unit = w / MAP_WIDTH; // keeps lights the size they have when all of Europe is shown
  const px = w / width; // map units per pixel on screen
  const step = { x: w / 3, y: h / 3 };
  const go = (next: View) => (event: MouseEvent) => {
    event.preventDefault();
    setView(next);
  };
  const moves: { next: View; label: string; glyph: string }[] = [
    { next: panBy(view, -step.x, 0), label: labels.west, glyph: "←" },
    { next: panBy(view, 0, -step.y), label: labels.north, glyph: "↑" },
    { next: panBy(view, 0, step.y), label: labels.south, glyph: "↓" },
    { next: panBy(view, step.x, 0), label: labels.east, glyph: "→" },
  ];
  const visible = lights.filter(
    (light) =>
      light.x >= x - 30 * unit &&
      light.x <= x + w + 30 * unit &&
      light.y >= y - 30 * unit &&
      light.y <= y + h + 30 * unit,
  );
  const names = new Map(
    (view.z >= NAMES_ZOOM ? placeLabels(visible, px) : []).map((label) => [label.id, label]),
  );

  return (
    <div
      tabIndex={0}
      aria-label={labels.aria}
      onKeyDown={(event) => {
        const keys: Record<string, View> = {
          "+": zoomAt(view, 2),
          "=": zoomAt(view, 2),
          "-": zoomAt(view, 0.5),
          "0": FULL_VIEW,
          ArrowLeft: panBy(view, -step.x / 2, 0),
          ArrowRight: panBy(view, step.x / 2, 0),
          ArrowUp: panBy(view, 0, -step.y / 2),
          ArrowDown: panBy(view, 0, step.y / 2),
        };
        const next = keys[event.key];
        if (next) {
          event.preventDefault();
          setView(next);
        }
      }}
      style={{ outlineOffset: 4 }}
    >
      <div style={{ position: "relative" }}>
        <svg
          ref={svg}
          viewBox={`${x} ${y} ${w} ${h}`}
          role="group"
          aria-label={labels.aria}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onClickCapture={onClickCapture}
          onDoubleClick={onDoubleClick}
          style={{
            width: "100%",
            height: "auto",
            aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
            display: "block",
            overflow: "hidden",
            background: "#0e0c0a",
            touchAction: "none",
            userSelect: "none",
            cursor: dragging ? "grabbing" : "grab",
          }}
        >
          <defs>
            <radialGradient id="glow">
              <stop offset="0" stopColor="#ff4a1c" stopOpacity="0.9" />
              <stop offset="1" stopColor="#ff4a1c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <image href="/map/outline.svg" width={MAP_WIDTH} height={MAP_HEIGHT} />
          {tilesInView(view).map(({ col, row }) => (
            <image
              key={`${col}/${row}`}
              href={`/map/tiles/${col}/${row}.svg`}
              x={col * TILE - TILE_MARGIN}
              y={row * TILE - TILE_MARGIN}
              width={TILE + 2 * TILE_MARGIN}
              height={TILE + 2 * TILE_MARGIN}
            />
          ))}
          {visible.map((light) => {
            const label = names.get(light.id);
            const halo = (10 + Math.min(18, Math.sqrt(light.spaces) * 4)) * unit;
            return (
              <a key={light.id} href={`/places/${light.id}`} draggable={false}>
                <title>{`${light.name}, ${light.country}`}</title>
                <circle
                  cx={light.x}
                  cy={light.y}
                  r={halo}
                  fill="url(#glow)"
                  style={{ pointerEvents: "none" }}
                />
                <circle cx={light.x} cy={light.y} r={2.6 * unit} fill="#ffd9cc" />
                {/* What the finger hits: the same on any zoom, bigger than the dot. */}
                <circle cx={light.x} cy={light.y} r={11 * px} fill="transparent" />
                {label ? (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor={label.anchor}
                    fontSize={15 * px}
                    fill="#f3efe6"
                    stroke="#0e0c0a"
                    strokeWidth={4 * px}
                    paintOrder="stroke"
                    style={{ pointerEvents: "none" }}
                  >
                    {light.name}
                  </text>
                ) : null}
              </a>
            );
          })}
        </svg>
        <div style={{ position: "absolute", top: 10, right: 10, display: "grid", gap: 6 }}>
          <a
            href={href(zoomAt(view, 2))}
            onClick={go(zoomAt(view, 2))}
            aria-label={labels.zoomIn}
            style={control}
          >
            +
          </a>
          <a
            href={href(zoomAt(view, 0.5))}
            onClick={go(zoomAt(view, 0.5))}
            aria-label={labels.zoomOut}
            style={control}
          >
            −
          </a>
        </div>
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 10 }}
      >
        {moves.map((move) => (
          <a
            key={move.glyph}
            href={href(move.next)}
            onClick={go(move.next)}
            aria-label={move.label}
            style={control}
          >
            {move.glyph}
          </a>
        ))}
        <a href="/map" onClick={go(FULL_VIEW)} style={{ ...control, fontSize: 16 }}>
          {labels.reset}
        </a>
        <span style={{ fontSize: 14, color: "#a39b8f", marginLeft: 6 }}>{labels.hint}</span>
      </div>
    </div>
  );
}
