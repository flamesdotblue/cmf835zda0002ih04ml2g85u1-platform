import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/EFlEghJH3qCmzyRi/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6 md:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Jump Into a Pixel Mario-Inspired World
          </h1>
          <p className="mt-4 text-neutral-200 text-lg md:text-xl">
            A lightweight 2D platformer built with React, Canvas, and a playful retro vibe.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="#game"
              className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-3 text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600 active:scale-[0.98]"
            >
              Play Now
            </a>
            <a
              href="#controls"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-3 text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
            >
              Controls
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
