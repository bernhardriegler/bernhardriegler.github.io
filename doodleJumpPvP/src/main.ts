import './style.css';

// Initialize the canvas and game logic
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 600;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Canvas context not available');

// Ensure ctx is not null before using it
if (!ctx) {
  throw new Error('Canvas context not available');
}

// Wrap all ctx usages with a type guard
function safeCtxAction(action: (ctx: CanvasRenderingContext2D) => void) {
  if (ctx) {
    action(ctx);
  }
}

// Game variables
let playerY = 500;
let playerX = 200;
let velocityY = -12; // Increase jump height
let gravity = 0.5;
let platforms = [{ x: 150, y: 550 }, { x: 250, y: 450 }, { x: 100, y: 350 }]; // Reduce spacing
let score = 0;
let gameOver = false;

// Track platforms that have been scored
let scoredPlatforms = new Set();

// Power-up variables
let powerUps: { x: number; y: number; type: string }[] = [];
let jetpackActive = false;
let jetpackDuration = 0;

// Add keyboard controls
let keys: { [key: string]: boolean } = {};

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Add second player variables
let player2X = 100;
let player2Y = 500;
let player2VelocityY = -12;
let player2Keys: { [key: string]: boolean } = {};

// Add event listeners for player 2 controls
window.addEventListener('keydown', (e) => {
  player2Keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  player2Keys[e.key] = false;
});

// Update player position based on keyboard input
function handlePlayerMovement() {
  if (keys['ArrowLeft']) {
    playerX -= 5;
    if (playerX < 0) playerX = 0; // Prevent going off the left edge
  }
  if (keys['ArrowRight']) {
    playerX += 5;
    if (playerX + 30 > canvas.width) playerX = canvas.width - 30; // Prevent going off the right edge
  }
}

// Update player 2 position based on keyboard input
function handlePlayer2Movement() {
  if (player2Keys['a']) {
    player2X -= 5;
    if (player2X < 0) player2X = 0; // Prevent going off the left edge
  }
  if (player2Keys['d']) {
    player2X += 5;
    if (player2X + 30 > canvas.width) player2X = canvas.width - 30; // Prevent going off the right edge
  }
}

// Add logic to generate new platforms
function generatePlatform() {
  const x = Math.random() * (canvas.width - 100); // Random x position
  const y = Math.min(...platforms.map(p => p.y)) - 100; // Place above the highest platform
  platforms.push({ x, y });
}

// Modify the power-up generation logic to increase frequency
function generatePowerUp() {
  const x = Math.random() * (canvas.width - 20) + 10; // Random x position
  const y = Math.min(...platforms.map(p => p.y)) - 100; // Place closer to the highest platform
  powerUps.push({ x, y, type: 'jetpack' }); // Currently only jetpack is implemented
}

// Draw power-ups
function drawPowerUps() {
  safeCtxAction(ctx => {
    powerUps.forEach(powerUp => {
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'yellow';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'yellow';
      ctx.fill();
      ctx.closePath();
    });
    ctx.shadowBlur = 0; // Reset shadow blur
  });
}

// Check for power-up collection
function checkPowerUpCollection() {
  powerUps = powerUps.filter(powerUp => {
    if (
      playerX < powerUp.x + 10 &&
      playerX + 30 > powerUp.x - 10 &&
      playerY < powerUp.y + 10 &&
      playerY + 30 > powerUp.y - 10
    ) {
      activatePowerUp(powerUp.type);
      return false; // Remove collected power-up
    }
    return true;
  });
}

// Activate a power-up
function activatePowerUp(type: string) {
  if (type === 'jetpack') {
    jetpackActive = true;
    jetpackDuration = 100; // Jetpack lasts for 100 frames
  }
}

// Display game over screen
function showGameOverScreen() {
  safeCtxAction(ctx => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 60);
  });

  window.addEventListener('keydown', restartGame);
}

// Restart the game
function restartGame(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    window.removeEventListener('keydown', restartGame);
    playerY = 500;
    playerX = 200;
    velocityY = -12;
    platforms = [{ x: 150, y: 550 }, { x: 250, y: 450 }, { x: 100, y: 350 }];
    score = 0;
    gameOver = false;
    scoredPlatforms.clear(); // Clear scored platforms
    powerUps = []; // Clear power-ups
    jetpackActive = false; // Reset jetpack
    gameLoop();
  }
}

// Load player image
const playerImage = new Image();
playerImage.src = './player.png'; // Add a player.png image to the public folder

// Check for collision between players with reduced collision box
function checkPlayerCollision() {
  if (
    playerX < player2X + 20 && // Reduced collision box width
    playerX + 20 > player2X &&
    playerY < player2Y + 20 && // Reduced collision box height
    playerY + 20 > player2Y
  ) {
    // Simple collision response: push players apart
    if (playerX < player2X) {
      playerX -= 5;
      player2X += 5;
    } else {
      playerX += 5;
      player2X -= 5;
    }
  }
}

// Adjust spawn positions for both players above the first platform
playerY = platforms[0].y - 30;
playerX = platforms[0].x + 20;
player2Y = platforms[0].y - 30;
player2X = platforms[0].x + 80;

// Draw player 2 with inverted color filter
function drawPlayer2() {
  safeCtxAction(ctx => {
    ctx.save();
    ctx.filter = 'invert(1)'; // Apply inverted color filter
    ctx.drawImage(playerImage, player2X, player2Y, 30, 30);
    ctx.restore();
  });
}

// Game loop
function gameLoop() {
  if (gameOver) return;

  safeCtxAction(ctx => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    handlePlayerMovement();
    handlePlayer2Movement();

    // Draw player 1
    ctx.drawImage(playerImage, playerX, playerY, 30, 30);

    // Draw player 2
    drawPlayer2();

    // Draw platforms
    ctx.fillStyle = 'green';
    platforms.forEach(platform => {
      ctx.fillRect(platform.x, platform.y, 100, 10);
    });

    // Draw power-ups
    drawPowerUps();

    // Display score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
  });

  // Update player positions
  playerY += velocityY;
  velocityY += gravity;
  player2Y += player2VelocityY;
  player2VelocityY += gravity;

  // Fix collision detection for both players
  platforms.forEach(platform => {
    if (
      playerX < platform.x + 100 &&
      playerX + 30 > platform.x &&
      playerY + 30 >= platform.y &&
      playerY + 30 <= platform.y + 10 &&
      velocityY > 0
    ) {
      velocityY = jetpackActive ? -60 : -12;
      if (!scoredPlatforms.has(platform)) {
        score += 1;
        scoredPlatforms.add(platform);
        if (score % 3 === 0) {
          generatePowerUp();
        }
      }
    }

    if (
      player2X < platform.x + 100 &&
      player2X + 30 > platform.x &&
      player2Y + 30 >= platform.y &&
      player2Y + 30 <= platform.y + 10 &&
      player2VelocityY > 0
    ) {
      player2VelocityY = -12;
    }
  });

  // Check for power-up collection for both players
  checkPowerUpCollection();

  // Handle jetpack duration
  if (jetpackActive) {
    jetpackDuration--;
    if (jetpackDuration <= 0) {
      jetpackActive = false;
    }
  }

  // Check for player collision
  checkPlayerCollision();

  // Generate new platforms as the players move upward
  if (playerY < canvas.height / 2 || player2Y < canvas.height / 2) {
    const offset = canvas.height / 2 - Math.min(playerY, player2Y);
    playerY += offset;
    player2Y += offset;
    platforms.forEach(platform => {
      platform.y += offset;
    });
    powerUps.forEach(powerUp => {
      powerUp.y += offset;
    });

    // Remove platforms that move off the screen
    platforms = platforms.filter(platform => platform.y < canvas.height);

    // Generate a new platform
    generatePlatform();
  }

  // Reset players if they fall off the screen
  if (playerY > canvas.height || player2Y > canvas.height) {
    gameOver = true;
    showGameOverScreen();
    return;
  }

  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
