const BEST_SCORE_KEY = 'baseglide_best_score';
const PLAYER_NAME_KEY = 'baseglide_player_name';
const SOUND_ENABLED_KEY = 'baseglide_sound_enabled';

export const storage = {
  getBestScore(): number {
    const stored = localStorage.getItem(BEST_SCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  },

  setBestScore(score: number): void {
    localStorage.setItem(BEST_SCORE_KEY, score.toString());
  },

  getPlayerName(): string {
    return localStorage.getItem(PLAYER_NAME_KEY) || '';
  },

  setPlayerName(name: string): void {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  },

  getSoundEnabled(): boolean {
    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    return stored === null ? true : stored === 'true';
  },

  setSoundEnabled(enabled: boolean): void {
    localStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
  },
};
