import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/screens/SplashScreen';
import { MenuScreen } from '@/components/screens/MenuScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { GameOverScreen } from '@/components/screens/GameOverScreen';
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { PauseScreen } from '@/components/screens/PauseScreen';
import { storage } from '@/lib/storage';
import { soundManager } from '@/lib/sounds';
import { submitScore } from '@/lib/leaderboard';
import { useFarcaster } from '@/providers/FarcasterProvider';
import { toast } from 'sonner';
import sdk from '@farcaster/miniapp-sdk';

type Screen = 'splash' | 'menu' | 'game' | 'gameover' | 'leaderboard' | 'settings' | 'paused';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const { user, isInMiniApp } = useFarcaster();

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

  const handleGameOver = async () => {
    setIsPlaying(false);
    setCurrentScreen('gameover');

    // Auto-submit score if user is logged in via Farcaster
    if (isInMiniApp && user && score > 0) {
      const submitted = await submitScore(
        user.fid,
        user.username,
        user.displayName,
        user.pfpUrl,
        score
      );
      if (submitted) {
        toast.success('Score submitted to leaderboard!');
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    setCurrentScreen('paused');
  };

  const handleResume = () => {
    setIsPlaying(true);
    setCurrentScreen('game');
  };

  const handleQuit = () => {
    setScore(0);
    setCurrentScreen('menu');
  };

  const handleShare = async () => {
    soundManager.playClick();
    const currentScore = score > 0 ? score : bestScore;
    const shareText = `I scored ${currentScore} on #BaseGlide! Beat me if you can 🪂`;
    const shareUrl = window.location.origin;

    // Use Farcaster composeCast if in mini app
    if (isInMiniApp) {
      try {
        await sdk.actions.composeCast({
          text: shareText,
          embeds: [shareUrl],
        });
        return;
      } catch (err) {
        console.warn('composeCast failed, using fallback:', err);
      }
    }

    // Fallback for non-Farcaster
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
      
      case 'paused':
        return (
          <PauseScreen
            score={score}
            bestScore={bestScore}
            onResume={handleResume}
            onQuit={handleQuit}
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
