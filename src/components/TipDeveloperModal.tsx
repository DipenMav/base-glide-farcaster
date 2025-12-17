import { useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GameButton } from '@/components/ui/game-button';
import { Heart, Coffee, Pizza, PartyPopper, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ThankYouModal } from './ThankYouModal';
import { Input } from '@/components/ui/input';

interface TipDeveloperModalProps {
  open: boolean;
  onClose: () => void;
}

const DEVELOPER_ADDRESS = '0xEcAb7178c118Ee4A664420F510253511539F07A5';
const USDC_TOKEN = 'eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base

const TIP_OPTIONS = [
  { label: 'Coffee', emoji: <Coffee className="w-5 h-5" />, amount: '1', usdc: '1000000' },
  { label: 'Pizza', emoji: <Pizza className="w-5 h-5" />, amount: '5', usdc: '5000000' },
  { label: 'Party', emoji: <PartyPopper className="w-5 h-5" />, amount: '10', usdc: '10000000' },
];

export const TipDeveloperModal = ({ open, onClose }: TipDeveloperModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const handleTip = async (usdc: string) => {
    setIsLoading(true);
    
    try {
      const result = await sdk.actions.sendToken({
        token: USDC_TOKEN,
        amount: usdc,
        recipientAddress: DEVELOPER_ADDRESS,
      });

      if (result.success) {
        setTxHash(result.send.transaction);
        setShowThankYou(true);
        onClose();
      } else {
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

  const handleCustomTip = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    // Convert to USDC smallest units (6 decimals)
    const usdc = Math.floor(amount * 1000000).toString();
    handleTip(usdc);
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
                onClick={() => handleTip(option.usdc)}
                disabled={isLoading}
                className="justify-between"
              >
                <span className="flex items-center gap-2">
                  {option.emoji}
                  {option.label}
                </span>
                <span className="text-primary font-mono">${option.amount} USDC</span>
              </GameButton>
            ))}

            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                disabled={isLoading}
                className="flex-1"
                min="0.01"
                step="0.01"
              />
              <GameButton
                variant="secondary"
                onClick={handleCustomTip}
                disabled={isLoading || !customAmount}
                className="whitespace-nowrap"
              >
                Send USDC
              </GameButton>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming in Warpcast...
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-2">
            USDC on Base chain
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
