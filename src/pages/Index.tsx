import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/screens/SplashScreen';
import { MenuScreen } from '@/components/screens/MenuScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { GameOverScreen } from '@/components/screens/GameOverScreen';
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { storage } from '@/lib/storage';
import { soundManager } from '@/lib/sounds';
import { toast } from 'sonner';

type Screen = 'splash' | 'menu' | 'game' | 'gameover' | 'leaderboard' | 'settings';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const savedBestScore = storage.getBestScore();
    setBestScore(savedBestScore);
    
    const soundEnabled = storage.getSoundEnabled();
    soundManager.setEnabled(soundEnabled);
  }, []);

  const handleStartFromSplash = () => {
    soundManager.playClick();
    setCurrentScreen('menu');
  };

  const handleStartGame = () => {
    soundManager.playClick();
    setScore(0);
    setIsPlaying(true);
    setCurrentScreen('game');
  };

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    if (newScore > bestScore) {
      setBestScore(newScore);
      storage.setBestScore(newScore);
    }
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    setCurrentScreen('gameover');
  };

  const handlePause = () => {
    setIsPlaying(false);
    setCurrentScreen('menu');
  };

  const handleShare = async () => {
    soundManager.playClick();
    const shareText = `I scored ${score > 0 ? score : bestScore} on #BaseGlide! Beat me if you can 🪂 @dipenmav`;
    const shareUrl = `${window.location.origin}${score > 0 ? `?score=${score}` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Base Glide',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onStart={handleStartFromSplash} />;
      
      case 'menu':
        return (
          <MenuScreen
            onStartGame={handleStartGame}
            onShowLeaderboard={() => setCurrentScreen('leaderboard')}
            onShowSettings={() => setCurrentScreen('settings')}
            onShare={handleShare}
            bestScore={bestScore}
          />
        );
      
      case 'game':
        return (
          <GameScreen
            isPlaying={isPlaying}
            score={score}
            bestScore={bestScore}
            onScoreChange={handleScoreChange}
            onGameOver={handleGameOver}
            onPause={handlePause}
          />
        );
      
      case 'gameover':
        return (
          <GameOverScreen
            score={score}
            bestScore={bestScore}
            onRetry={handleStartGame}
            onShare={handleShare}
            onMenu={() => setCurrentScreen('menu')}
            onLeaderboard={() => setCurrentScreen('leaderboard')}
          />
        );
      
      case 'leaderboard':
        return <LeaderboardScreen onBack={() => setCurrentScreen('menu')} />;
      
      case 'settings':
        return <SettingsScreen onBack={() => setCurrentScreen('menu')} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="w-full h-full max-w-2xl mx-auto relative">
        {renderScreen()}
      </div>
    </div>
  );
};

export default Index;
