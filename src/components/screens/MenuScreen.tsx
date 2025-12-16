import { useState } from 'react';
import { GameButton } from '@/components/ui/game-button';
import { Play, Trophy, Settings, Share2, PlusCircle, Heart } from 'lucide-react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useFarcaster } from '@/providers/FarcasterProvider';
import { TipDeveloperModal } from '@/components/TipDeveloperModal';
import { toast } from 'sonner';

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
  const { isInMiniApp, isAdded, user } = useFarcaster();
  const [showTipModal, setShowTipModal] = useState(false);

  const handleAddMiniApp = async () => {
    try {
      const result = await sdk.actions.addMiniApp();
      
      // If user enabled notifications, the result contains notificationDetails
      if (result?.notificationDetails) {
        console.log('User added mini app with notifications:', result.notificationDetails);
        // The webhook will handle storing the notification token
      }
      
      toast.success('Added to Warpcast!');
    } catch (err: unknown) {
      const error = err as { message?: string };
      if (error?.message?.includes('RejectedByUser')) {
        // User cancelled - no toast
      } else {
        toast.error('Failed to add. Try from Warpcast app.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="flex flex-col items-center gap-2 mb-4">
        <h1 className="text-5xl font-black tracking-tight">
          <span className="bg-gradient-primary bg-clip-text text-transparent">BASE</span>
          {' '}
          <span className="text-foreground">GLIDE</span>
        </h1>
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {user.pfpUrl && (
              <img 
                src={user.pfpUrl} 
                alt={user.displayName || user.username || 'User'} 
                className="w-6 h-6 rounded-full"
              />
            )}
            <span>Welcome, <span className="text-primary">@{user.username}</span></span>
          </div>
        )}
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

        {isInMiniApp && !isAdded && (
          <GameButton variant="success" onClick={handleAddMiniApp}>
            <PlusCircle className="w-5 h-5" />
            Add to Warpcast
          </GameButton>
        )}

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
