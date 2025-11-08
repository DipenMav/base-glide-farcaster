import { GameButton } from '@/components/ui/game-button';
import { Play, Trophy, Settings, Share2, Heart } from 'lucide-react';

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

        <button
          onClick={() => window.open('https://pay.coinbase.com/buy/select-asset?address=0xEcAb7178c118Ee4A664420F510253511539F07A5&network=base', '_blank')}
          className="relative mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white font-semibold shadow-glow transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Heart className="w-4 h-4 fill-current" />
          💙 Tip Developer
        </button>
        <p className="text-xs text-muted-foreground text-center -mt-2">
          Thanks for supporting indie devs 🩵
        </p>
      </div>

      <div className="absolute bottom-8 text-xs text-muted-foreground">
        Built by <span className="text-primary">@dipenmav</span>
      </div>
    </div>
  );
};
