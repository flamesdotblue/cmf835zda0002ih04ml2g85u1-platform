export default function ControlsHelp({ className = '' }) {
  return (
    <section id="controls" className={`rounded-xl border border-white/10 bg-white/5 p-5 ${className}`}>
      <h3 className="text-xl font-semibold">Controls</h3>
      <ul className="mt-3 grid gap-2 text-neutral-300">
        <li>Move: Arrow Keys or A / D</li>
        <li>Jump: Space or W</li>
        <li>Reset: R</li>
        <li>Pause: P</li>
      </ul>
      <p className="mt-3 text-sm text-neutral-400">Tip: Collect all the coins to boost your score. Watch out for patrolling enemies!</p>
    </section>
  );
}
