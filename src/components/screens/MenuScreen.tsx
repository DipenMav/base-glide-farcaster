import { GameButton } from '@/components/ui/game-button';
import { Play, Trophy, Settings, Share2 } from 'lucide-react';

interface MenuScreenProps {
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  onShowSettings: () => void;
  onShare: () => void;
  bestScore: number;
}

export const MenuScreen = ({
  onStartGame,
  onShowLeaderboard,
  onShowSettings,
  onShare,
  bestScore,
}: MenuScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="flex flex-col items-center gap-2 mb-4">
        <h1 className="text-5xl font-black tracking-tight">
          <span className="bg-gradient-primary bg-clip-text text-transparent">BASE</span>
          {' '}
          <span className="text-foreground">GLIDE</span>
        </h1>
        {bestScore > 0 && (
          <div className="text-sm text-muted-foreground">
            Best Score: <span className="text-primary font-bold">{bestScore}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <GameButton size="lg" onClick={onStartGame}>
          <Play className="w-5 h-5" />
          Play Game
        </GameButton>

        <GameButton variant="secondary" onClick={onShowLeaderboard}>
          <Trophy className="w-5 h-5" />
          Leaderboard
        </GameButton>

        <GameButton variant="secondary" onClick={onShowSettings}>
          <Settings className="w-5 h-5" />
          Settings
        </GameButton>

        <GameButton variant="outline" onClick={onShare}>
          <Share2 className="w-5 h-5" />
          Share Game
        </GameButton>
      </div>

      <div className="absolute bottom-8 text-xs text-muted-foreground">
        Built by <span className="text-primary">@dipenmav</span>
      </div>
    </div>
  );
};
