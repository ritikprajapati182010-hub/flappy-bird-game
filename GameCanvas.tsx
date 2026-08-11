import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, GameSettings, Pipe, Particle } from '../types';
import { SKINS } from '../data/skins';
import {
  drawSky,
  drawCitySkyline,
  drawClouds,
  drawGround,
  drawPipe,
  drawBird,
  drawParticles,
} from '../utils/canvasRenderer';
import { sfx } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  settings: GameSettings;
  onGameOver: (finalScore: number, sessionCoins: number) => void;
  onUpdateScore: (score: number) => void;
  onHomeClick: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  settings,
  onGameOver,
  onUpdateScore,
  onHomeClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gameplay Refs for Loop
  const scoreRef = useRef<number>(0);
  const sessionCoinsRef = useRef<number>(0);
  const isFlappingRef = useRef<boolean>(false);
  const isStartedRef = useRef<boolean>(false);

  const [hasStartedFlapping, setHasStartedFlapping] = useState<boolean>(false);

  // Settings lookup
  const skin = SKINS.find((s) => s.id === settings.skinId) || SKINS[0];

  // Callback and Prop Refs to prevent canvas loop restart during play
  const onGameOverRef = useRef(onGameOver);
  const onUpdateScoreRef = useRef(onUpdateScore);
  const settingsRef = useRef(settings);
  const skinRef = useRef(skin);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
    onUpdateScoreRef.current = onUpdateScore;
    settingsRef.current = settings;
    skinRef.current = skin;
  });

  // Difficulty Physics Parameters
  const getPhysicsConfig = useCallback((diff: string) => {
    switch (diff) {
      case 'EASY':
        return {
          gravity: 0.22,
          jump: -5.5,
          pipeSpeed: 1.5,
          pipeGap: 170,
          pipeInterval: 250,
          pipeWidth: 50,
        };
      case 'HARD':
        return {
          gravity: 0.40,
          jump: -7.5,
          pipeSpeed: 2.8,
          pipeGap: 115,
          pipeInterval: 170,
          pipeWidth: 58,
        };
      case 'NORMAL':
      default:
        return {
          gravity: 0.30,
          jump: -6.5,
          pipeSpeed: 2.0,
          pipeGap: 140,
          pipeInterval: 210,
          pipeWidth: 54,
        };
    }
  }, []);

  // Handle Jump / Flap Trigger
  const handleFlap = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    if (!isStartedRef.current) {
      isStartedRef.current = true;
      setHasStartedFlapping(true);
    }

    isFlappingRef.current = true;
    sfx.playFlap();
  }, [gameState]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleFlap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlap]);

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Dimensions
    const width = canvas.width;
    const height = canvas.height;
    const groundY = height - 90;

    const physics = getPhysicsConfig(settingsRef.current.difficulty);

    // Bird Initial Physics State
    let birdX = width * 0.28;
    let birdY = height * 0.42;
    let birdVy = 0;
    let birdRotation = 0;
    let wingTime = 0;

    // Pipes and Environment
    let pipes: Pipe[] = [];
    let particles: Particle[] = [];
    let scrollX = 0;
    let pipeSpawnTimer = 0;

    // Reset Counters
    scoreRef.current = 0;
    sessionCoinsRef.current = 0;
    isStartedRef.current = false;
    setHasStartedFlapping(false);
    onUpdateScoreRef.current(0);

    const createPuffParticles = (x: number, y: number) => {
      for (let i = 0; i < 5; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 1.5 + 0.5,
          size: Math.random() * 4 + 2,
          color: 'rgba(255, 255, 255, 0.8)',
          alpha: 1,
          life: 0,
          maxLife: 20,
        });
      }
    };

    const createCoinParticles = (x: number, y: number) => {
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const speed = Math.random() * 3 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 2,
          color: '#fde047',
          alpha: 1,
          life: 0,
          maxLife: 30,
        });
      }
    };

    // Game loop tick
    const render = () => {
      time += 16;
      ctx.clearRect(0, 0, width, height);

      const currentTheme = settingsRef.current.theme;
      const currentDifficulty = settingsRef.current.difficulty;
      const currentSkin = skinRef.current;

      // Render Parallax Background
      drawSky(ctx, width, height, currentTheme, time);
      drawCitySkyline(ctx, width, height, groundY, currentTheme, scrollX);
      drawClouds(ctx, width, height, scrollX, currentTheme);

      // Handle Idle Flap hover vs Playing Physics
      if (!isStartedRef.current) {
        // Floating sine wave animation before first tap
        wingTime += 0.2;
        birdY = height * 0.42 + Math.sin(wingTime * 0.5) * 8;
        birdRotation = Math.sin(wingTime * 0.3) * 0.1;
      } else {
        // Active Gravity and Flap Physics
        if (isFlappingRef.current) {
          birdVy = physics.jump;
          isFlappingRef.current = false;
          createPuffParticles(birdX - 10, birdY + 5);
        } else {
          birdVy += physics.gravity;
        }

        birdY += birdVy;

        // Rotation interpolation
        const targetRot = Math.min(Math.PI / 3, Math.max(-Math.PI / 4, birdVy * 0.08));
        birdRotation += (targetRot - birdRotation) * 0.25;

        wingTime += Math.abs(birdVy) > 1 ? 0.3 : 0.15;

        // Ground scroll
        scrollX += physics.pipeSpeed;

        // Pipe Spawning
        pipeSpawnTimer += physics.pipeSpeed;
        if (pipeSpawnTimer >= physics.pipeInterval) {
          pipeSpawnTimer = 0;

          const minPipe = 60;
          const maxPipe = groundY - physics.pipeGap - minPipe;
          const topHeight = Math.floor(Math.random() * (maxPipe - minPipe + 1)) + minPipe;
          const bottomHeight = groundY - topHeight - physics.pipeGap;

          const hasCoin = Math.random() < 0.45; // 45% chance for star coin in gap
          const coinY = topHeight + physics.pipeGap / 2;

          pipes.push({
            x: width + 20,
            topHeight,
            bottomHeight,
            passed: false,
            hasCoin,
            coinY,
            coinCollected: false,
            speedY: currentDifficulty === 'HARD' ? (Math.random() > 0.5 ? 0.8 : -0.8) : 0,
            direction: 1,
          });
        }

        // Pipe Updates & Collision
        const birdRadius = 10;

        for (let i = pipes.length - 1; i >= 0; i--) {
          const pipe = pipes[i];
          pipe.x -= physics.pipeSpeed;

          // Hard mode vertical pipe movement
          if (pipe.speedY && pipe.speedY !== 0) {
            pipe.topHeight += pipe.speedY * pipe.direction!;
            if (pipe.topHeight < 50 || pipe.topHeight > groundY - physics.pipeGap - 50) {
              pipe.direction! *= -1;
            }
            pipe.bottomHeight = groundY - pipe.topHeight - physics.pipeGap;
          }

          // Check if passed for score
          if (!pipe.passed && pipe.x + physics.pipeWidth < birdX) {
            pipe.passed = true;
            scoreRef.current += 1;
            onUpdateScoreRef.current(scoreRef.current);
            sfx.playScore();
          }

          // Check Coin Pickup
          if (pipe.hasCoin && !pipe.coinCollected) {
            const coinX = pipe.x + physics.pipeWidth / 2;
            const distSq = (birdX - coinX) ** 2 + (birdY - pipe.coinY) ** 2;
            if (distSq < (birdRadius + 14) ** 2) {
              pipe.coinCollected = true;
              sessionCoinsRef.current += 1;
              createCoinParticles(coinX, pipe.coinY);
              sfx.playCoin();
            }
          }

          // Collision Check with Pipes
          const inPipeX = birdX + birdRadius > pipe.x && birdX - birdRadius < pipe.x + physics.pipeWidth;

          if (inPipeX) {
            const topPipeBottom = pipe.topHeight;
            const bottomPipeTop = groundY - pipe.bottomHeight;

            if (birdY - birdRadius < topPipeBottom || birdY + birdRadius > bottomPipeTop) {
              // Crash Collision!
              sfx.playHit();
              onGameOverRef.current(scoreRef.current, sessionCoinsRef.current);
              return;
            }
          }

          // Remove offscreen pipes
          if (pipe.x < -physics.pipeWidth - 20) {
            pipes.splice(i, 1);
          }
        }

        // Check Ceiling and Ground Collision
        if (birdY - birdRadius <= 0) {
          birdY = birdRadius;
          birdVy = 0;
        }

        if (birdY + birdRadius >= groundY) {
          sfx.playHit();
          onGameOverRef.current(scoreRef.current, sessionCoinsRef.current);
          return;
        }
      }

      // Draw Pipes
      pipes.forEach((p) => drawPipe(ctx, p, physics.pipeWidth, groundY, currentTheme));

      // Draw Ground
      drawGround(ctx, width, height, groundY, scrollX, currentTheme);

      // Draw Particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.alpha = 1 - p.life / p.maxLife;
        if (p.life >= p.maxLife) {
          particles.splice(idx, 1);
        }
      });
      drawParticles(ctx, particles);

      // Draw Bird
      const wingPos = Math.sin(wingTime);
      drawBird(ctx, birdX, birdY, birdRotation, currentSkin, wingPos, 1.1);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [getPhysicsConfig, gameState]);

  return (
    <div
      className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-center select-none cursor-pointer"
      onClick={handleFlap}
      onTouchStart={(e) => {
        e.preventDefault();
        handleFlap();
      }}
    >
      <canvas
        ref={canvasRef}
        width={420}
        height={620}
        className="w-full max-h-[82vh] aspect-[420/620] rounded-3xl shadow-2xl border-4 border-white/60 object-contain bg-sky-400"
      />

      {/* Tap to Start Prompt Overlay */}
      {!hasStartedFlapping && gameState === 'PLAYING' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
          <div className="bg-white/30 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/50 shadow-2xl animate-pulse">
            <div className="text-2xl font-black text-white uppercase italic tracking-wider drop-shadow-[0_2px_0_rgba(0,0,0,0.2)] mb-1">
              TAP OR SPACE TO FLAP
            </div>
            <div className="text-xs font-black text-sky-950 uppercase tracking-widest">
              Dodge pipes & collect stars!
            </div>
          </div>
        </div>
      )}

      {/* Back to menu small floating button during gameplay */}
      <button
        id="in-game-home-btn"
        onClick={(e) => {
          e.stopPropagation();
          sfx.playClick();
          onHomeClick();
        }}
        className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-white/40 backdrop-blur-md text-sky-950 font-black text-xs border border-white/60 hover:bg-white/60 transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
      >
        ← Menu
      </button>
    </div>
  );
};
