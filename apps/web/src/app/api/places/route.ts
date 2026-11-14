import { NextResponse } from "next/server";
import { placeLabel, searchPlaces } from "@/places/store";

/** Suggestions for the place field: GET /api/places?q=beau */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const places = await searchPlaces(query.slice(0, 60));
  return NextResponse.json(
    places.map((place) => ({ id: place.id, label: placeLabel(place) })),
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
