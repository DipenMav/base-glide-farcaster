import { Player, Obstacle } from '@/types/game';

// Base values for 60 FPS (normalized with delta time)
export const GRAVITY = 0.5;
export const JUMP_FORCE = -9;
export const BASE_OBSTACLE_SPEED = 2.5;
export const BASE_OBSTACLE_GAP = 190;
export const OBSTACLE_WIDTH = 60;
export const OBSTACLE_SPACING = 320;
export const PLAYER_RADIUS = 18; // Smaller for better mobile gameplay
export const DIFFICULTY_THRESHOLD = 25;

// Calculate difficulty multipliers based on score
export const getDifficultyMultiplier = (score: number): { 
  speedMultiplier: number; 
  gapMultiplier: number 
} => {
  if (score < DIFFICULTY_THRESHOLD) {
    return { speedMultiplier: 1, gapMultiplier: 1 };
  }
  
  // Progressive difficulty after threshold
  const extraScore = score - DIFFICULTY_THRESHOLD;
  const speedMultiplier = Math.min(1 + (extraScore * 0.015), 1.6); // Max 60% faster
  const gapMultiplier = Math.max(1 - (extraScore * 0.008), 0.75); // Gap shrinks to 75%
  
  return { speedMultiplier, gapMultiplier };
};

export const createPlayer = (canvasHeight: number): Player => ({
  x: 100,
  y: canvasHeight / 2,
  velocity: 0,
  radius: PLAYER_RADIUS,
  rotation: 0,
});

export const createObstacle = (canvasWidth: number, canvasHeight: number, id: number, score: number = 0): Obstacle => {
  const { gapMultiplier } = getDifficultyMultiplier(score);
  const currentGap = Math.floor(BASE_OBSTACLE_GAP * gapMultiplier);
  
  const minGapY = 100;
  const maxGapY = canvasHeight - currentGap - 100;
  const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
  
  return {
    id,
    x: canvasWidth,
    gapY,
    gapSize: currentGap,
    width: OBSTACLE_WIDTH,
    passed: false,
    isBullish: Math.random() > 0.5,
  };
};

export const updatePlayer = (player: Player, canvasHeight: number, deltaTime: number = 1): Player => {
  let newVelocity = player.velocity + (GRAVITY * deltaTime);
  let newY = player.y + (newVelocity * deltaTime);
  let newRotation = Math.min(Math.max(newVelocity * 3, -30), 90);

  // Ground collision
  if (newY + player.radius > canvasHeight) {
    newY = canvasHeight - player.radius;
    newVelocity = 0;
  }

  // Ceiling collision
  if (newY - player.radius < 0) {
    newY = player.radius;
    newVelocity = 0;
  }

  return {
    ...player,
    y: newY,
    velocity: newVelocity,
    rotation: newRotation,
  };
};

export const updateObstacles = (
  obstacles: Obstacle[],
  canvasWidth: number,
  canvasHeight: number,
  nextId: number,
  deltaTime: number = 1,
  currentScore: number = 0
): { obstacles: Obstacle[]; newScore: number; nextId: number } => {
  let newScore = 0;
  const { speedMultiplier } = getDifficultyMultiplier(currentScore);
  const currentSpeed = BASE_OBSTACLE_SPEED * speedMultiplier;
  
  const updatedObstacles = obstacles
    .map(obstacle => {
      const newX = obstacle.x - (currentSpeed * deltaTime);
      const newObstacle = { ...obstacle, x: newX };
      
      // Check if obstacle passed the player
      if (!obstacle.passed && newX + obstacle.width < 100) {
        newObstacle.passed = true;
        newScore = 1;
      }
      
      return newObstacle;
    })
    .filter(obstacle => obstacle.x + obstacle.width > 0);

  // Add new obstacle if needed
  const lastObstacle = updatedObstacles[updatedObstacles.length - 1];
  if (!lastObstacle || lastObstacle.x < canvasWidth - OBSTACLE_SPACING) {
    updatedObstacles.push(createObstacle(canvasWidth, canvasHeight, nextId, currentScore));
    nextId++;
  }

  return { obstacles: updatedObstacles, newScore, nextId };
};

export const checkCollision = (player: Player, obstacles: Obstacle[]): boolean => {
  for (const obstacle of obstacles) {
    // Check if player is in the x range of the obstacle
    if (
      player.x + player.radius > obstacle.x &&
      player.x - player.radius < obstacle.x + obstacle.width
    ) {
      // Check if player hits top or bottom obstacle
      if (
        player.y - player.radius < obstacle.gapY ||
        player.y + player.radius > obstacle.gapY + obstacle.gapSize
      ) {
        return true;
      }
    }
  }
  return false;
};

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: Player,
  baseLogoImg?: HTMLImageElement
) => {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate((player.rotation * Math.PI) / 180);

  // Draw blue square (Base logo style)
  const size = player.radius * 1.8; // Slightly smaller for better collision feel
  const borderRadius = 8;
  
  // Draw rounded square
  ctx.fillStyle = '#0052FF'; // Base blue color
  ctx.beginPath();
  ctx.roundRect(-size / 2, -size / 2, size, size, borderRadius);
  ctx.fill();
  
  // Add subtle shadow for depth
  ctx.shadowColor = 'rgba(0, 82, 255, 0.5)';
  ctx.shadowBlur = 10;
  ctx.fill();

  ctx.restore();
};

export const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle, canvasHeight: number) => {
  const color = obstacle.isBullish ? '#22c55e' : '#ef4444';
  const shadowColor = obstacle.isBullish ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';

  // Top obstacle (candlestick style)
  ctx.fillStyle = color;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 10;
  ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.gapY);

  // Draw wick (thin line in center)
  ctx.fillStyle = color;
  ctx.fillRect(obstacle.x + obstacle.width / 2 - 2, 0, 4, obstacle.gapY + 20);

  // Bottom obstacle
  ctx.fillRect(obstacle.x, obstacle.gapY + obstacle.gapSize, obstacle.width, canvasHeight - obstacle.gapY - obstacle.gapSize);
  
  // Draw wick
  ctx.fillRect(obstacle.x + obstacle.width / 2 - 2, obstacle.gapY + obstacle.gapSize - 20, 4, canvasHeight - obstacle.gapY - obstacle.gapSize + 20);

  ctx.shadowBlur = 0;
};

export const drawBackground = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, '#071622');
  gradient.addColorStop(1, '#0b1220');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw grid lines
  ctx.strokeStyle = 'rgba(14, 165, 164, 0.1)';
  ctx.lineWidth = 1;

  // Horizontal lines
  for (let y = 0; y < canvasHeight; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let x = 0; x < canvasWidth; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }
};
