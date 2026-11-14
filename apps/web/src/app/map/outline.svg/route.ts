import { MAP_HEIGHT, MAP_WIDTH } from "@/places/europe";
import { europeOutline } from "@/places/outline";

/** The land of the map as one cacheable picture, so the page itself stays small. */
export function GET() {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}">` +
    `<rect width="100%" height="100%" fill="#0e0c0a"/>` +
    `<path d="${europeOutline()}" fill="#1e1a17" stroke="#3a342e" stroke-width="0.6" stroke-linejoin="round"/></svg>`;
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=604800" },
  });
}
