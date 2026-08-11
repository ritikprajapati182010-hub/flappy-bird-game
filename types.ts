export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export type Theme = 'DAY' | 'NIGHT' | 'SUNSET';

export interface BirdSkin {
  id: string;
  name: string;
  color: string;
  wingColor: string;
  beakColor: string;
  eyeColor: string;
  price: number;
  unlocked: boolean;
  trailColor: string;
}

export interface GameSettings {
  difficulty: Difficulty;
  theme: Theme;
  skinId: string;
  soundEnabled: boolean;
}

export interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
  hasCoin: boolean;
  coinY: number;
  coinCollected: boolean;
  speedY?: number; // for moving pipes in Hard mode
  direction?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface HighScoreRecord {
  score: number;
  coins: number;
  date: string;
  difficulty: Difficulty;
}
