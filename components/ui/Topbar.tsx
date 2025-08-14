export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl flex items-center gap-4 p-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-link" />
          <span className="font-semibold">Zeropoint</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-md bg-muted text-sub">prod</span>
        <div className="ml-auto flex items-center gap-3">
          <input 
            className="w-72 rounded-md bg-muted px-3 py-2 text-sm outline-none focus:outline-2 focus:outline-[var(--ring)]" 
            placeholder="Search…" 
          />
          <button className="rounded-md bg-panel px-3 py-2 text-sm border border-border hover:bg-elev focus:outline-2 focus:outline-[var(--ring)]">
            Account
          </button>
        </div>
      </div>
    </header>
  );
}
