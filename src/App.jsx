import { useState, useCallback } from 'react';
import HeroCover from './components/HeroCover';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import ControlsHelp from './components/ControlsHelp';
import SpriteCredits from './components/SpriteCredits';

export default function App() {
  const [gameState, setGameState] = useState({
    score: 0,
    coins: 0,
    lives: 3,
    time: 0,
    status: 'ready',
  });

  const handleStateChange = useCallback((s) => {
    setGameState((prev) => ({ ...prev, ...s }));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-inter">
      <HeroCover />

      <main id="game" className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10">
        <section className="mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">2D Pixel Platformer</h2>
          <p className="text-neutral-300 mt-2 max-w-2xl">
            Run, jump, and collect coins. Avoid enemies and don’t fall! Built with React + Canvas with custom SVG sprites.
          </p>
        </section>

        <HUD {...gameState} />

        <section className="mt-4">
          <GameCanvas onStateChange={handleStateChange} />
        </section>

        <ControlsHelp className="mt-8" />
        <SpriteCredits />
      </main>

      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-neutral-400">
        <p>Made for fun. All product names, logos, and brands are property of their respective owners.</p>
      </footer>
    </div>
  );
}
