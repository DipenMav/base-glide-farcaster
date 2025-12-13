import { useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GameButton } from '@/components/ui/game-button';
import { Heart, Coffee, Pizza, PartyPopper, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ThankYouModal } from './ThankYouModal';

interface TipDeveloperModalProps {
  open: boolean;
  onClose: () => void;
}

const DEVELOPER_ADDRESS = '0xEcAb7178c118Ee4A664420F510253511539F07A5';
const ETH_TOKEN = 'eip155:8453/slip44:60'; // Native ETH on Base

const TIP_OPTIONS = [
  { label: 'Coffee', emoji: <Coffee className="w-5 h-5" />, amount: '0.001', wei: '1000000000000000' },
  { label: 'Pizza', emoji: <Pizza className="w-5 h-5" />, amount: '0.005', wei: '5000000000000000' },
  { label: 'Party', emoji: <PartyPopper className="w-5 h-5" />, amount: '0.01', wei: '10000000000000000' },
];

export const TipDeveloperModal = ({ open, onClose }: TipDeveloperModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleTip = async (wei: string) => {
    setIsLoading(true);
    
    try {
      const result = await sdk.actions.sendToken({
        token: ETH_TOKEN,
        amount: wei,
        recipientAddress: DEVELOPER_ADDRESS,
      });

      if (result.success) {
        setTxHash(result.send.transaction);
        setShowThankYou(true);
        onClose();
      } else {
        // User cancelled or failed
        const failResult = result as { success: false; reason?: string };
        if (failResult.reason !== 'rejected_by_user') {
          toast.error('Tip failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Tip error:', err);
      toast.error('Unable to send tip. Are you in Warpcast?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-5 h-5 text-destructive" />
              Tip the Developer
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-sm text-muted-foreground">
            Support the development of Base Glide! Your tip goes directly to @dipenmav on Base.
          </p>

          <div className="flex flex-col gap-3 mt-4">
            {TIP_OPTIONS.map((option) => (
              <GameButton
                key={option.amount}
                variant="secondary"
                onClick={() => handleTip(option.wei)}
                disabled={isLoading}
                className="justify-between"
              >
                <span className="flex items-center gap-2">
                  {option.emoji}
                  {option.label}
                </span>
                <span className="text-primary font-mono">{option.amount} ETH</span>
              </GameButton>
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming in Warpcast...
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-2">
            ETH on Base chain
          </p>
        </DialogContent>
      </Dialog>

      <ThankYouModal 
        open={showThankYou} 
        onClose={() => setShowThankYou(false)} 
        txHash={txHash}
      />
    </>
  );
};
