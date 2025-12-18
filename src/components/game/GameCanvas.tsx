import { useEffect, useRef, useState } from 'react';
import { Player, Obstacle } from '@/types/game';
import {
  createPlayer,
  createObstacle,
  updatePlayer,
  updateObstacles,
  checkCollision,
  drawPlayer,
  drawObstacle,
  drawBackground,
  JUMP_FORCE,
} from '@/lib/gameEngine';
import { soundManager } from '@/lib/sounds';
// Logo now drawn directly on canvas

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  onScoreChange: (score: number) => void;
  onGameOver: () => void;
}

export const GameCanvas = ({ isPlaying, isPaused, onScoreChange, onGameOver }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [nextObstacleId, setNextObstacleId] = useState(1);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const scoreRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const nextObstacleIdRef = useRef(1);
  const playerRef = useRef<Player | null>(null);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const newPlayer = createPlayer(canvas.height);
    setPlayer(newPlayer);
    
    // Initialize with first obstacle
    const initialObstacles = [createObstacle(canvas.width, canvas.height, 0)];
    setObstacles(initialObstacles);
    obstaclesRef.current = initialObstacles;
    playerRef.current = newPlayer;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle jump
  const handleJump = () => {
    if (!isPlaying || !playerRef.current) return;
    
    soundManager.playFlap();
    const updatedPlayer = { ...playerRef.current, velocity: JUMP_FORCE };
    playerRef.current = updatedPlayer;
    setPlayer(updatedPlayer);
  };

  // Input handlers
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevents mousedown from also firing
      handleJump();
    };

    const handleMouseDown = () => {
      handleJump();
    };

    window.addEventListener('keydown', handleKeyPress);
    const canvas = canvasRef.current;
    
    // Use { passive: false } to allow preventDefault() on touch events
    canvas?.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas?.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      canvas?.removeEventListener('touchstart', handleTouchStart);
      canvas?.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isPlaying, player]);

  // Game loop - runs when playing and not paused
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !playerRef.current) return;

    lastFrameTimeRef.current = performance.now();

    const gameLoop = (currentTime: number) => {
      if (!playerRef.current) return;
      
      // Calculate delta time (normalized to 60 FPS = 1.0)
      const deltaTime = Math.min((currentTime - lastFrameTimeRef.current) / (1000 / 60), 2);
      lastFrameTimeRef.current = currentTime;

      // Update player with delta time using ref
      const updatedPlayer = updatePlayer(playerRef.current, canvas.height, deltaTime);
      playerRef.current = updatedPlayer;
      setPlayer(updatedPlayer);

      // Update obstacles with delta time and current score for difficulty using refs
      const { obstacles: updatedObstacles, newScore, nextId } = updateObstacles(
        obstaclesRef.current,
        canvas.width,
        canvas.height,
        nextObstacleIdRef.current,
        deltaTime,
        scoreRef.current
      );
      obstaclesRef.current = updatedObstacles;
      nextObstacleIdRef.current = nextId;
      setObstacles(updatedObstacles);
      setNextObstacleId(nextId);

      if (newScore > 0) {
        scoreRef.current += newScore;
        setScore(scoreRef.current);
        onScoreChange(scoreRef.current);
        soundManager.playScore();
      }

      // Check collision
      if (checkCollision(updatedPlayer, updatedObstacles)) {
        soundManager.playCrash();
        onGameOver();
        return;
      }

      // Draw
      drawBackground(ctx, canvas.width, canvas.height);
      
      updatedObstacles.forEach(obstacle => {
        drawObstacle(ctx, obstacle, canvas.height);
      });

      drawPlayer(ctx, updatedPlayer);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPaused, onScoreChange, onGameOver]);

  // Reset only when game ends (not when paused)
  useEffect(() => {
    if (!isPlaying && !isPaused) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const newPlayer = createPlayer(canvas.height);
      const initialObstacles = [createObstacle(canvas.width, canvas.height, 0)];
      
      // Reset all refs and state
      scoreRef.current = 0;
      playerRef.current = newPlayer;
      obstaclesRef.current = initialObstacles;
      nextObstacleIdRef.current = 1;
      
      setScore(0);
      setPlayer(newPlayer);
      setObstacles(initialObstacles);
      setNextObstacleId(1);
    }
  }, [isPlaying, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-pointer touch-none"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
};
