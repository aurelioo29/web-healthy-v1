export default function FooterAdmin({ owner = "Royal Klinik" }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 text-sm text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500/90 ring-2 ring-emerald-500/20" />
          <span className="font-medium text-slate-800">Admin Dashboard</span>
        </div>
        <p className="text-center sm:text-right">
          © {year} <span className="font-semibold">{owner}</span>. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
