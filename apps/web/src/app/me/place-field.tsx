"use client";

import { useEffect, useRef, useState } from "react";
import { field } from "../ui";

interface Option {
  id: string;
  label: string;
}

/**
 * Place input with suggestions from the list of settlements. Picking a suggestion ties the space
 * to that settlement, so it shows on the map; any other text is kept as plain text.
 * Without JavaScript it is an ordinary text field.
 */
export function PlaceField({
  initialLabel,
  initialId,
}: {
  initialLabel: string;
  initialId: string;
}) {
  const [text, setText] = useState(initialLabel);
  const [options, setOptions] = useState<Option[]>(
    initialId ? [{ id: initialId, label: initialLabel }] : [],
  );
  const latest = useRef(0);

  useEffect(() => {
    const query = text.trim();
    if (query.length < 2 || options.some((option) => option.label === text)) return;
    const turn = ++latest.current;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
        if (response.ok && turn === latest.current) setOptions(await response.json());
      } catch {
        // Suggestions are a convenience; typing still works without them.
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [text, options]);

  const picked = options.find((option) => option.label === text);
  return (
    <>
      <input
        style={field}
        name="place"
        value={text}
        onChange={(event) => setText(event.target.value)}
        list="place-options"
        maxLength={80}
        autoComplete="off"
      />
      <datalist id="place-options">
        {options.map((option) => (
          <option key={option.id} value={option.label} />
        ))}
      </datalist>
      <input type="hidden" name="place_id" value={picked?.id ?? ""} />
    </>
  );
}
