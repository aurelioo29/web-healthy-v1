// app/api/testimonis/route.js
export const dynamic = "force-dynamic"; // jangan di-prerender
const UPSTREAM =
  process.env.TESTIMONI_UPSTREAM ||
  "http://192.168.0.103:8000/getDataTestimoni";

export async function GET() {
  try {
    const r = await fetch(UPSTREAM, { cache: "no-store" });
    if (!r.ok) {
      // teruskan status upstream biar jelas
      return new Response(`Upstream ${r.status}`, { status: r.status });
    }

    const raw = await r.json();

    // Normalisasi jadi array
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.result)
      ? raw.result
      : Array.isArray(raw?.items)
      ? raw.items
      : typeof raw === "object" && raw
      ? Object.values(raw).find(Array.isArray) || []
      : [];

    return Response.json(list, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response("Proxy failed: " + String(e?.message || e), {
      status: 500,
    });
  }
}
