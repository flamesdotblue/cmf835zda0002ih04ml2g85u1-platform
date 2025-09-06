import { useEffect, useRef } from 'react';
import playerURL from '../assets/player.svg?url';
import coinURL from '../assets/coin.svg?url';
import shroomURL from '../assets/enemy-shroom.svg?url';

export default function GameCanvas({ onStateChange }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({});
  const keydownRef = useRef(null);
  const keyupRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const logical = { w: 800, h: 450 };

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const targetW = Math.min(rect.width, 960);
      const ratio = logical.h / logical.w;
      const targetH = targetW * ratio;
      canvas.style.width = `${targetW}px`;
      canvas.style.height = `${targetH}px`;
      canvas.width = Math.floor(targetW * DPR);
      canvas.height = Math.floor(targetH * DPR);
    }

    resize();
    window.addEventListener('resize', resize);

    // Load sprites
    const sprites = { player: null, coin: null, shroom: null };
    function load(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    }

    let assetsReady = false;
    Promise.all([load(playerURL), load(coinURL), load(shroomURL)])
      .then(([p, c, s]) => {
        sprites.player = p;
        sprites.coin = c;
        sprites.shroom = s;
        assetsReady = true;
      })
      .catch(() => {
        assetsReady = false; // fallback to shapes
      });

    // Game world
    const scale = 2; // pixel scale for drawing
    const G = 0.5 * scale; // gravity
    const FRICTION = 0.8;
    const MAX_VX = 3.0 * scale;
    const JUMP_VY = -10 * scale;

    const world = {
      width: logical.w,
      height: logical.h,
      groundY: logical.h - 40,
      status: 'ready',
      startTime: performance.now(),
      paused: false,
    };

    const player = {
      x: 60,
      y: world.groundY - 32,
      w: 20,
      h: 28,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      invulUntil: 0,
      lives: 3,
      score: 0,
      coins: 0,
    };

    const platforms = [
      { x: 120, y: world.groundY - 80, w: 120, h: 12 },
      { x: 320, y: world.groundY - 140, w: 100, h: 12 },
      { x: 520, y: world.groundY - 200, w: 150, h: 12 },
      { x: 680, y: world.groundY - 90, w: 100, h: 12 },
    ];

    const coins = [
      { x: 150, y: world.groundY - 100, r: 6, taken: false },
      { x: 360, y: world.groundY - 160, r: 6, taken: false },
      { x: 560, y: world.groundY - 220, r: 6, taken: false },
      { x: 710, y: world.groundY - 110, r: 6, taken: false },
    ];

    const enemies = [
      { x: 520, y: world.groundY - 20, w: 20, h: 18, vx: 1.2 * scale, left: 480, right: 720 },
      { x: 260, y: world.groundY - 212, w: 20, h: 18, vx: 1.4 * scale, left: 240, right: 360 },
    ];

    const keys = { left: false, right: false, up: false, reset: false, pause: false };

    function reportState() {
      const now = performance.now();
      const time = Math.floor((now - world.startTime) / 1000);
      const s = {
        score: player.score,
        coins: player.coins,
        lives: player.lives,
        time,
        status: world.paused ? 'paused' : world.status,
      };
      const last = stateRef.current;
      const changed =
        !last ||
        last.score !== s.score ||
        last.coins !== s.coins ||
        last.lives !== s.lives ||
        last.time !== s.time ||
        last.status !== s.status;
      if (changed) {
        stateRef.current = s;
        onStateChange && onStateChange(s);
      }
    }

    function keyHandler(e, down) {
      const code = e.code;
      if (code === 'ArrowLeft' || code === 'KeyA') keys.left = down;
      if (code === 'ArrowRight' || code === 'KeyD') keys.right = down;
      if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') keys.up = down;
      if (!down && code === 'KeyR') keys.reset = true;
      if (!down && code === 'KeyP') keys.pause = true;
    }

    keydownRef.current = (e) => keyHandler(e, true);
    keyupRef.current = (e) => keyHandler(e, false);

    window.addEventListener('keydown', keydownRef.current);
    window.addEventListener('keyup', keyupRef.current);

    function reset(full = false) {
      player.x = 60;
      player.y = world.groundY - player.h;
      player.vx = 0;
      player.vy = 0;
      player.onGround = false;
      player.facing = 1;
      if (full) {
        player.lives = 3;
        player.score = 0;
        player.coins = 0;
        coins.forEach((c) => (c.taken = false));
        world.startTime = performance.now();
      }
      world.status = 'running';
      world.paused = false;
    }

    reset(true);

    function aabb(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function update() {
      if (world.paused) return;

      // Horizontal input
      const accel = 0.7 * scale;
      if (keys.left) {
        player.vx = Math.max(player.vx - accel, -MAX_VX);
        player.facing = -1;
      } else if (keys.right) {
        player.vx = Math.min(player.vx + accel, MAX_VX);
        player.facing = 1;
      } else {
        player.vx *= FRICTION;
        if (Math.abs(player.vx) < 0.05) player.vx = 0;
      }

      // Jump
      if (keys.up && player.onGround) {
        player.vy = JUMP_VY;
        player.onGround = false;
      }

      // Apply gravity
      player.vy += G;

      // Integrate position
      player.x += player.vx;
      player.y += player.vy;

      // World bounds
      if (player.x < 0) player.x = 0;
      if (player.x + player.w > world.width) player.x = world.width - player.w;

      // Ground collision
      if (player.y + player.h >= world.groundY) {
        player.y = world.groundY - player.h;
        player.vy = 0;
        player.onGround = true;
      } else {
        player.onGround = false;
      }

      // Platform collisions (simple resolution from top)
      for (const p of platforms) {
        const prevY = player.y - player.vy; // approximate previous position
        const onTopPreviously = prevY + player.h <= p.y;
        if (
          player.x + player.w > p.x &&
          player.x < p.x + p.w &&
          player.y + player.h > p.y &&
          player.y + player.h < p.y + p.h + 16 &&
          player.vy >= 0 &&
          onTopPreviously
        ) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;
        }
      }

      // Coins collection
      for (const c of coins) {
        if (c.taken) continue;
        const dx = player.x + player.w / 2 - c.x;
        const dy = player.y + player.h / 2 - c.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < (c.r + 8) * (c.r + 8)) {
          c.taken = true;
          player.coins += 1;
          player.score += 100;
        }
      }

      // Enemies update and collisions
      for (const e of enemies) {
        e.x += e.vx;
        if (e.x < e.left || e.x + e.w > e.right) e.vx *= -1;
        const enemyBox = { x: e.x, y: e.y - e.h, w: e.w, h: e.h }; // shroom positioned by feet
        const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };
        if (aabb(playerBox, enemyBox)) {
          const now = performance.now();
          if (now > player.invulUntil) {
            const fallingOn = player.vy > 0 && player.y + player.h - enemyBox.y < 12;
            if (fallingOn) {
              player.vy = JUMP_VY * 0.7;
              player.score += 200;
            } else {
              player.lives -= 1;
              player.invulUntil = now + 1500;
              player.x = Math.max(20, Math.min(world.width - player.w - 20, player.x - 40 * player.facing));
              if (player.lives <= 0) {
                world.status = 'game over';
                world.paused = true;
              }
            }
          }
        }
      }

      // Fell off the map
      if (player.y > world.height + 50 && !world.paused) {
        player.lives -= 1;
        if (player.lives <= 0) {
          world.status = 'game over';
          world.paused = true;
        } else {
          reset(false);
        }
      }
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      const sx = w / logical.w;
      const sy = h / logical.h;

      // Clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Scale to canvas
      ctx.scale(sx, sy);

      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, logical.h);
      grad.addColorStop(0, '#0b1020');
      grad.addColorStop(1, '#0e1a2f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, logical.w, logical.h);

      // Background ridge
      ctx.fillStyle = '#14213d';
      ctx.fillRect(0, world.groundY - 90, logical.w, 90);

      // Platforms
      for (const p of platforms) {
        ctx.fillStyle = '#8c4a12';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#6e380e';
        ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);
        ctx.fillStyle = '#3aa84b';
        ctx.fillRect(p.x, p.y - 4, p.w, 4);
      }

      // Ground
      ctx.fillStyle = '#2a7b3f';
      ctx.fillRect(0, world.groundY, logical.w, logical.h - world.groundY);
      ctx.fillStyle = '#1f5c2f';
      for (let x = 0; x < logical.w; x += 16) {
        ctx.fillRect(x, world.groundY - 4, 12, 4);
      }

      // Coins
      for (const c of coins) {
        if (c.taken) continue;
        if (assetsReady && sprites.coin) {
          const size = 16;
          ctx.drawImage(sprites.coin, Math.round(c.x - size / 2), Math.round(c.y - size / 2), size, size);
        } else {
          ctx.fillStyle = '#f6c945';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Enemies (shroom)
      for (const e of enemies) {
        const drawX = Math.round(e.x);
        const drawY = Math.round(e.y - e.h);
        if (assetsReady && sprites.shroom) {
          ctx.drawImage(sprites.shroom, drawX, drawY, e.w, e.h);
        } else {
          ctx.fillStyle = '#d64545';
          ctx.fillRect(drawX, drawY, e.w, e.h);
        }
      }

      // Player
      ctx.save();
      ctx.translate(Math.floor(player.x), Math.floor(player.y));
      const invul = performance.now() < player.invulUntil;
      ctx.globalAlpha = invul ? 0.6 : 1;
      if (assetsReady && sprites.player) {
        ctx.save();
        if (player.facing === -1) {
          ctx.translate(player.w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(sprites.player, 0, -2, player.w, player.h + 2);
        ctx.restore();
      } else {
        ctx.fillStyle = '#ff3b30';
        ctx.fillRect(0, 0, player.w, player.h);
        ctx.fillStyle = '#b21d18';
        ctx.fillRect(0, -6, player.w, 6);
        ctx.fillStyle = '#ffffff';
        if (player.facing === 1) ctx.fillRect(player.w - 6, 6, 4, 4);
        else ctx.fillRect(2, 6, 4, 4);
      }
      ctx.restore();

      // Overlay text when paused or game over
      if (world.paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, logical.w, logical.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px monospace';
        ctx.fillText(world.status === 'game over' ? 'Game Over' : 'Paused', logical.w / 2 - 70, logical.h / 2 - 10);
        ctx.font = '14px monospace';
        ctx.fillText('Press R to Restart', logical.w / 2 - 80, logical.h / 2 + 16);
      }
    }

    function loop() {
      // input edges
      if (keys.reset) {
        reset(true);
        keys.reset = false;
      }
      if (keys.pause) {
        world.paused = !world.paused;
        world.status = world.paused ? 'paused' : 'running';
        keys.pause = false;
      }

      update();
      draw();
      reportState();
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      if (keydownRef.current) window.removeEventListener('keydown', keydownRef.current);
      if (keyupRef.current) window.removeEventListener('keyup', keyupRef.current);
    };
  }, [onStateChange]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-3">
      <div className="w-full rounded-xl border border-white/10 bg-neutral-900/60 p-3 shadow-2xl shadow-black/30">
        <canvas
          ref={canvasRef}
          className="mx-auto block w-full rounded-lg bg-neutral-900"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="text-sm text-neutral-400">Press P to pause • Press R to restart</div>
    </div>
  );
}
