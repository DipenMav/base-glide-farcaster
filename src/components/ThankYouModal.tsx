import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GameButton } from '@/components/ui/game-button';
import { Heart, ExternalLink, Sparkles } from 'lucide-react';

interface ThankYouModalProps {
  open: boolean;
  onClose: () => void;
  txHash: string | null;
}

export const ThankYouModal = ({ open, onClose, txHash }: ThankYouModalProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (open) {
      // Generate confetti particles
      const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--destructive))', '#FFD700'][Math.floor(Math.random() * 4)],
      }));
      setConfetti(particles);

      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  const baseScanUrl = txHash ? `https://basescan.org/tx/${txHash}` : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm overflow-hidden">
        {/* Confetti animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${particle.x}%`,
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 py-6 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse">
              <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-bounce" />
          </div>

          <h2 className="text-2xl font-black text-center bg-gradient-primary bg-clip-text text-transparent">
            Thank You!
          </h2>

          <p className="text-center text-muted-foreground">
            Your support means the world! 💙<br />
            <span className="text-foreground font-medium">@dipenmav</span> appreciates you!
          </p>

          {baseScanUrl && (
            <GameButton
              variant="outline"
              size="sm"
              onClick={() => window.open(baseScanUrl, '_blank')}
              className="mt-2"
            >
              <ExternalLink className="w-4 h-4" />
              View on BaseScan
            </GameButton>
          )}

          <GameButton onClick={onClose} className="mt-2">
            Continue Playing
          </GameButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
