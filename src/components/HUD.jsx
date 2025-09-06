export default function HUD({ score = 0, coins = 0, lives = 3, time = 0, status = 'ready' }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      <HUDItem label="Score" value={score} color="text-yellow-300" />
      <HUDItem label="Coins" value={coins} color="text-amber-300" />
      <HUDItem label="Lives" value={lives} color="text-rose-300" />
      <HUDItem label="Time" value={`${time}s`} color="text-sky-300" />
      <div className="col-span-2 sm:col-span-4 text-sm text-neutral-400">
        Status: <span className="uppercase tracking-wide text-neutral-200">{status}</span>
      </div>
    </div>
  );
}

function HUDItem({ label, value, color }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-neutral-400">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
