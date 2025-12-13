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
  id: string;
  fid: number;
  username: string | null;
  display_name: string | null;
  pfp_url: string | null;
  score: number;
  created_at: string;
  updated_at: string;
}
