export async function GET() {
  const upstream = "http://192.168.0.103:8000/getDataDokter";
  try {
    const r = await fetch(upstream, { cache: "no-store" });
    if (!r.ok) {
      return new Response(`Upstream ${r.status}`, { status: r.status });
    }
    const raw = await r.json();

    // Normalisasi: ambil array di berbagai kemungkinan shape
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.result)
      ? raw.result
      : Array.isArray(raw.items)
      ? raw.items
      : // fallback: kalau server kasih {dokter:[...]} atau sejenis
      typeof raw === "object" && raw
      ? Object.values(raw).find(Array.isArray) || []
      : [];

    return Response.json(list, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return new Response("Proxy failed: " + String(e), { status: 500 });
  }
}
