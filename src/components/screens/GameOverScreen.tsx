import { useState } from 'react';
import { GameButton } from '@/components/ui/game-button';
import { RefreshCw, Share2, Home, Trophy, Heart } from 'lucide-react';
import { useFarcaster } from '@/providers/FarcasterProvider';
import { TipDeveloperModal } from '@/components/TipDeveloperModal';

interface GameOverScreenProps {
  score: number;
  bestScore: number;
  onRetry: () => void;
  onShare: () => void;
  onMenu: () => void;
  onLeaderboard: () => void;
}

export const GameOverScreen = ({
  score,
  bestScore,
  onRetry,
  onShare,
  onMenu,
  onLeaderboard,
}: GameOverScreenProps) => {
  const isNewBest = score === bestScore && score > 0;
  const { isInMiniApp } = useFarcaster();
  const [showTipModal, setShowTipModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 animate-slide-up">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-4xl font-black text-destructive">GAME OVER</h2>
        
        {isNewBest && (
          <div className="bg-gradient-primary rounded-lg px-4 py-2 shadow-glow animate-pulse-glow">
            <p className="text-sm font-bold">🎉 NEW BEST SCORE!</p>
          </div>
        )}

        <div className="bg-card rounded-xl p-6 shadow-card w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Score
              </div>
              <div className="text-4xl font-bold text-primary">{score}</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Best
              </div>
              <div className="text-4xl font-bold text-foreground">{bestScore}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <GameButton size="lg" onClick={onRetry}>
          <RefreshCw className="w-5 h-5" />
          Try Again
        </GameButton>

        <GameButton variant="success" onClick={onShare}>
          <Share2 className="w-5 h-5" />
          Share Score
        </GameButton>

        <div className="flex gap-3">
          <GameButton variant="secondary" onClick={onLeaderboard} className="flex-1">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </GameButton>
          <GameButton variant="secondary" onClick={onMenu} className="flex-1">
            <Home className="w-4 h-4" />
            Menu
          </GameButton>
        </div>

        {isInMiniApp && (
          <GameButton variant="outline" onClick={() => setShowTipModal(true)}>
            <Heart className="w-5 h-5 text-destructive" />
            Tip Developer
          </GameButton>
        )}
      </div>

      <div className="absolute bottom-8 text-xs text-muted-foreground text-center">
        Built by <span className="text-primary">@dipenmav</span> 💙 on Base
      </div>

      <TipDeveloperModal open={showTipModal} onClose={() => setShowTipModal(false)} />
    </div>
  );
};
