import { useState, useEffect } from 'react';
import { GameButton } from '@/components/ui/game-button';
import { ArrowLeft, Volume2, VolumeX, Wallet, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { storage } from '@/lib/storage';
import { soundManager } from '@/lib/sounds';
import { useFarcaster } from '@/providers/FarcasterProvider';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [soundEnabled, setSoundEnabled] = useState(storage.getSoundEnabled());
  const [walletAddress] = useState('0x84b2c8cCC2AAdCc0Fb540B6440Dcd84bD8aEf37a');
  const { user, isInMiniApp } = useFarcaster();

  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    storage.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex items-center gap-4">
        <GameButton variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
        <h2 className="text-3xl font-black">Settings</h2>
      </div>

      <div className="flex-1 space-y-6">
        {/* Farcaster Profile */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          {isInMiniApp && user ? (
            <div className="flex items-center gap-4">
              <img 
                src={user.pfpUrl} 
                alt={user.displayName} 
                className="w-14 h-14 rounded-full border-2 border-primary"
              />
              <div className="flex-1">
                <div className="font-bold text-lg">{user.displayName}</div>
                <div className="text-sm text-muted-foreground">@{user.username}</div>
                <div className="text-xs text-muted-foreground mt-1">FID: {user.fid}</div>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                Connected
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Not Connected</div>
                <p className="text-sm text-muted-foreground">
                  Open in Warpcast to connect your Farcaster account
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sound Toggle */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <div className="font-medium">Sound Effects</div>
                <div className="text-xs text-muted-foreground">
                  Enable game sounds
                </div>
              </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>
        </div>

        {/* Developer Wallet */}
        <div className="bg-card rounded-xl p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Developer Wallet</span>
          </div>
          <div className="text-xs text-muted-foreground break-all font-mono bg-muted/50 p-3 rounded-lg">
            {walletAddress}
          </div>
          <p className="text-xs text-muted-foreground">
            Support the developer by sending tips to this Base address
          </p>
        </div>
      </div>
    </div>
  );
};
