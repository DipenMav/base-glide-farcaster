export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover';
  score: number;
  bestScore: number;
}

export interface Player {
  x: number;
  y: number;
  velocity: number;
  radius: number;
  rotation: number;
}

export interface Obstacle {
  id: number;
  x: number;
  gapY: number;
  gapSize: number;
  width: number;
  passed: boolean;
  isBullish: boolean;
}

export interface LeaderboardEntry {
  id?: string;
  playerName: string;
  walletAddress?: string;
  farcasterHandle?: string;
  score: number;
  createdAt?: string;
}
