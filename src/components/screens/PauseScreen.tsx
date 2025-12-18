import { GameButton } from '@/components/ui/game-button';
import { Play, Home } from 'lucide-react';

interface PauseScreenProps {
  score: number;
  bestScore: number;
  onResume: () => void;
  onQuit: () => void;
}

export const PauseScreen = ({ score, bestScore, onResume, onQuit }: PauseScreenProps) => {
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card/90 rounded-2xl p-8 mx-4 max-w-sm w-full text-center border border-border/50 shadow-2xl">
        <h2 className="text-3xl font-bold text-foreground mb-6">Paused</h2>
        
        <div className="space-y-2 mb-8">
          <p className="text-muted-foreground">
            Score: <span className="text-foreground font-semibold">{score}</span>
          </p>
          <p className="text-muted-foreground">
            Best: <span className="text-primary font-semibold">{bestScore}</span>
          </p>
        </div>

        <div className="space-y-3">
          <GameButton onClick={onResume} variant="default" className="w-full">
            <Play className="w-5 h-5 mr-2" />
            Resume
          </GameButton>
          
          <GameButton onClick={onQuit} variant="secondary" className="w-full">
            <Home className="w-5 h-5 mr-2" />
            Quit to Menu
          </GameButton>
        </div>
      </div>
    </div>
  );
};
