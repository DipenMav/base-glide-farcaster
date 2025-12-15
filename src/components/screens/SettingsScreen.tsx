import { useState, useEffect } from 'react';
import { GameButton } from '@/components/ui/game-button';
import { ArrowLeft, Volume2, VolumeX, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { storage } from '@/lib/storage';
import { soundManager } from '@/lib/sounds';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [playerName, setPlayerName] = useState(storage.getPlayerName());
  const [soundEnabled, setSoundEnabled] = useState(storage.getSoundEnabled());
  const [walletAddress] = useState('0x84b2c8cCC2AAdCc0Fb540B6440Dcd84bD8aEf37a');

  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    storage.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const handleSaveName = () => {
    storage.setPlayerName(playerName);
    soundManager.playClick();
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex items-center gap-4">
        <GameButton variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
        <h2 className="text-3xl font-black">Settings</h2>
      </div>

      <div className="flex-1 space-y-6">
        {/* Player Name */}
        <div className="bg-card rounded-xl p-6 shadow-card space-y-3">
          <Label htmlFor="playerName" className="text-sm font-medium">
            Player Name
          </Label>
          <div className="flex gap-2">
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1"
            />
            <GameButton variant="secondary" onClick={handleSaveName}>
              Save
            </GameButton>
          </div>
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
            <Label className="text-sm font-medium">Developer Wallet</Label>
          </div>
          <div className="text-xs text-muted-foreground break-all font-mono bg-muted/50 p-3 rounded-lg">
            {walletAddress}
          </div>
          <p className="text-xs text-muted-foreground">
            Support the developer by sending tips to this Base address
          </p>
        </div>

        {/* Farcaster Connection */}
        <div className="bg-gradient-primary rounded-xl p-6 shadow-glow">
          <h3 className="font-bold mb-2">Connect Farcaster</h3>
          <p className="text-sm text-primary-foreground/80 mb-4">
            Sign in with Neynar to save your scores and compete on the leaderboard
          </p>
          <GameButton variant="outline" className="w-full border-primary-foreground/20">
            Coming Soon
          </GameButton>
        </div>
      </div>
    </div>
  );
};
