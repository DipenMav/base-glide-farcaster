import { GameCanvas } from '@/components/game/GameCanvas';
import { Pause } from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';

interface GameScreenProps {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  bestScore: number;
  onScoreChange: (score: number) => void;
  onGameOver: () => void;
  onPause: () => void;
}

export const GameScreen = ({
  isPlaying,
  isPaused,
  score,
  bestScore,
  onScoreChange,
  onGameOver,
  onPause,
}: GameScreenProps) => {
  return (
    <div className="relative w-full h-full">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-card">
          <div className="text-xs text-muted-foreground">Score</div>
          <div className="text-2xl font-bold text-primary">{score}</div>
        </div>

        <GameButton
          variant="secondary"
          size="icon"
          onClick={onPause}
          className="shadow-card"
        >
          <Pause className="w-5 h-5" />
        </GameButton>

        <div className="bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-card">
          <div className="text-xs text-muted-foreground">Best</div>
          <div className="text-2xl font-bold text-foreground">{bestScore}</div>
        </div>
      </div>

      {/* Game Canvas */}
      <GameCanvas
        isPlaying={isPlaying}
        isPaused={isPaused}
        onScoreChange={onScoreChange}
        onGameOver={onGameOver}
      />

      {/* Instructions */}
      {isPlaying && score === 0 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-card/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-glow animate-pulse">
            <p className="text-sm font-medium">
              Tap or press <span className="text-primary">SPACE</span> to flap
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
