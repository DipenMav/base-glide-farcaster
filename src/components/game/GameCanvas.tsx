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

interface GameCanvasProps {
  isPlaying: boolean;
  onScoreChange: (score: number) => void;
  onGameOver: () => void;
}

export const GameCanvas = ({ isPlaying, onScoreChange, onGameOver }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [nextObstacleId, setNextObstacleId] = useState(1);
  const animationFrameRef = useRef<number>();
  const baseLogoRef = useRef<HTMLImageElement>();

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
    setObstacles([createObstacle(canvas.width, canvas.height, 0)]);

    // Load Base logo (placeholder for now, will generate later)
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzBlYTVhNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSI+QjwvdGV4dD48L3N2Zz4=';
    baseLogoRef.current = img;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle jump
  const handleJump = () => {
    if (!isPlaying || !player) return;
    
    setPlayer(prev => {
      if (!prev) return prev;
      soundManager.playFlap();
      return { ...prev, velocity: JUMP_FORCE };
    });
  };

  // Input handlers
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };

    const handleTouch = () => {
      handleJump();
    };

    window.addEventListener('keydown', handleKeyPress);
    const canvas = canvasRef.current;
    canvas?.addEventListener('touchstart', handleTouch);
    canvas?.addEventListener('mousedown', handleTouch);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      canvas?.removeEventListener('touchstart', handleTouch);
      canvas?.removeEventListener('mousedown', handleTouch);
    };
  }, [isPlaying, player]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || !player) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let localScore = score;

    const gameLoop = () => {
      // Update player
      const updatedPlayer = updatePlayer(player, canvas.height);
      setPlayer(updatedPlayer);

      // Update obstacles
      const { obstacles: updatedObstacles, newScore, nextId } = updateObstacles(
        obstacles,
        canvas.width,
        canvas.height,
        nextObstacleId
      );
      setObstacles(updatedObstacles);
      setNextObstacleId(nextId);

      if (newScore > 0) {
        localScore += newScore;
        setScore(localScore);
        onScoreChange(localScore);
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

      drawPlayer(ctx, updatedPlayer, baseLogoRef.current);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, player, obstacles, score, nextObstacleId]);

  // Reset when not playing
  useEffect(() => {
    if (!isPlaying) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      setScore(0);
      setPlayer(createPlayer(canvas.height));
      setObstacles([createObstacle(canvas.width, canvas.height, 0)]);
      setNextObstacleId(1);
    }
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-pointer touch-none"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
};
