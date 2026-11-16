import { fineTile, isTile } from "@/places/fine";
import { TILE_COLS, TILE_ROWS } from "@/places/view";

// The land does not change between releases: every tile is drawn once, when the site is built.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const params: { col: string; row: string }[] = [];
  for (let col = 0; col < TILE_COLS; col++) {
    for (let row = 0; row < TILE_ROWS; row++) params.push({ col: String(col), row: String(row) });
  }
  return params;
}

/** One tile of the detailed coast, for the map when it is zoomed in. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ col: string; row: string }> },
) {
  const { col, row } = await context.params;
  const c = /^\d{1,2}$/.test(col) ? Number(col) : -1;
  const r = /^\d{1,2}$/.test(row) ? Number(row) : -1;
  if (!isTile(c, r)) return new Response("Not found", { status: 404 });
  return new Response(fineTile(c, r), {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=604800" },
  });
}
