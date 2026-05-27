export async function geocodeLocation(query) {
  if (!query || !query.trim()) return null;

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
    encodeURIComponent(query);

  const res = await fetch(url, {
    headers: {
      // Nominatim expects a User-Agent
      "User-Agent": "EchoesOfNepal/1.0 (student project)",
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    name: data[0].display_name,
  };
}
