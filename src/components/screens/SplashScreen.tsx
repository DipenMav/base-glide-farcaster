import { GameButton } from '@/components/ui/game-button';
import { Play } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen = ({ onStart }: SplashScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8 animate-slide-up">
      <div className="flex flex-col items-center gap-4 animate-float">
        <div className="w-24 h-24 rounded-full bg-gradient-primary shadow-glow-lg flex items-center justify-center">
          <span className="text-5xl font-bold">B</span>
        </div>
        <h1 className="text-6xl font-black tracking-tight">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            BASE
          </span>
          {' '}
          <span className="text-foreground">GLIDE</span>
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Flap through the crypto charts. Beat your friends on Base.
        </p>
      </div>

      <GameButton
        size="lg"
        onClick={onStart}
        className="animate-pulse-glow"
      >
        <Play className="w-5 h-5" />
        Start Game
      </GameButton>

      <div className="absolute bottom-8 text-xs text-muted-foreground">
        Built by <span className="text-primary">@dipenmav</span>
      </div>
    </div>
  );
};
