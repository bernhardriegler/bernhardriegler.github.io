// theNewGame/game.js

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const WALL_HEALTH_MAX = 100;
// Wall in first third of area
const WALL_X = Math.floor(canvas.width / 3) - 30;
const WALL_Y = 100;
const WALL_WIDTH = 40;
const WALL_HEIGHT = 300;

// Tower spots ON the wall (cats placed on wall)
const TOWER_SPOTS = [
    { x: WALL_X + 5, y: WALL_Y + 30 },
    { x: WALL_X + 5, y: WALL_Y + 120 },
    { x: WALL_X + 5, y: WALL_Y + 210 }
];

// Add new tower spots behind the wall
const BEHIND_WALL_TOWER_SPOTS = [
    { x: WALL_X - 60, y: WALL_Y + 30 },
    { x: WALL_X - 60, y: WALL_Y + 120 },
    { x: WALL_X - 60, y: WALL_Y + 210 }
];

const ENEMY_SPAWN_X = canvas.width - 60;
const ENEMY_SPEED = 0.7;
const ENEMY_SIZE = 40;
const TOWER_RANGE = 220;
const CHEWINGUM_SPEED = 4;
const CHEWINGUM_SIZE = 10;
const TOWER_FIRE_RATE = 60; // frames

// Area behind wall for placement (not used yet, but for future expansion)
const BEHIND_WALL_AREA = {
    x: 0,
    y: WALL_Y,
    width: WALL_X,
    height: WALL_HEIGHT
};

// Game state
let wallHealth = WALL_HEALTH_MAX;
let towers = [];
let behindTowers = [];
let enemies = [];
let chewingums = [];
let frameCount = 0;

function drawWall() {
    ctx.fillStyle = '#bca';
    ctx.fillRect(WALL_X, WALL_Y, WALL_WIDTH, WALL_HEIGHT);
    // Health bar
    ctx.fillStyle = '#222';
    ctx.fillRect(WALL_X, WALL_Y - 30, WALL_WIDTH, 20);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(WALL_X, WALL_Y - 30, WALL_WIDTH * (wallHealth / WALL_HEALTH_MAX), 20);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(WALL_X, WALL_Y - 30, WALL_WIDTH, 20);
}

function drawTower(tower) {
    ctx.save();
    ctx.translate(tower.x, tower.y);
    ctx.fillStyle = tower.upgraded ? '#ffd700' : '#ffb6c1';
    ctx.fillRect(0, 0, 30, 20);
    ctx.fillStyle = '#00f';
    ctx.fillRect(20, 5, 8, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(6, 7, 2, 2);
    ctx.fillRect(14, 7, 2, 2);
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(10, 14);
    ctx.lineTo(13, 14);
    ctx.stroke();
    // Draw upgrade star
    if (tower.upgraded) {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(15, 3, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#bfa600';
        ctx.stroke();
    }
    ctx.restore();
}

function drawEnemy(enemy) {
    ctx.save();
    ctx.fillStyle = '#3c3';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, ENEMY_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.stroke();
    // Eyes (with evil tilt)
    ctx.save();
    ctx.translate(enemy.x - 8, enemy.y - 5);
    ctx.rotate(enemy.evil.eyeTilt || 0.0);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(enemy.x + 8, enemy.y - 5);
    ctx.rotate(-(enemy.evil.eyeTilt || 0.0));
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Angry brows
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (enemy.evil.brow === 'left') {
        ctx.moveTo(enemy.x - 12, enemy.y - 12);
        ctx.lineTo(enemy.x - 4, enemy.y - 8);
        ctx.moveTo(enemy.x + 4, enemy.y - 8);
        ctx.lineTo(enemy.x + 12, enemy.y - 12);
    } else {
        ctx.moveTo(enemy.x - 12, enemy.y - 12);
        ctx.lineTo(enemy.x - 4, enemy.y - 8);
        ctx.moveTo(enemy.x + 4, enemy.y - 12);
        ctx.lineTo(enemy.x + 12, enemy.y - 8);
    }
    ctx.stroke();
    // Evil mouth
    ctx.strokeStyle = '#900';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (enemy.evil.mouthType === 'snarl') {
        ctx.moveTo(enemy.x - 8, enemy.y + 12);
        ctx.lineTo(enemy.x, enemy.y + 18);
        ctx.lineTo(enemy.x + 8, enemy.y + 12);
    } else {
        ctx.arc(enemy.x, enemy.y + 14, 10, Math.PI * 0.15, Math.PI * 0.85, false);
    }
    ctx.stroke();
    // Sometimes open mouth (teeth)
    if (enemy.evil.mouthOpen) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(enemy.x - 4, enemy.y + 14, 8, 5);
        ctx.strokeStyle = '#900';
        ctx.beginPath();
        ctx.moveTo(enemy.x - 4, enemy.y + 16.5);
        ctx.lineTo(enemy.x + 4, enemy.y + 16.5);
        ctx.stroke();
    }
    // Health bar (if recently hit or not full health)
    if (enemy.showHealth || enemy.health < enemy.maxHealth) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#222';
        ctx.fillRect(enemy.x - 18, enemy.y - 28, 36, 7);
        ctx.fillStyle = '#e33';
        ctx.fillRect(enemy.x - 18, enemy.y - 28, 36 * (enemy.health / enemy.maxHealth), 7);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(enemy.x - 18, enemy.y - 28, 36, 7);
        ctx.restore();
    }
    ctx.restore();
}

function drawChewingum(chewingum) {
    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.arc(chewingum.x, chewingum.y, CHEWINGUM_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
}

function spawnEnemy() {
    const y = WALL_Y + 30 + Math.random() * (WALL_HEIGHT - 60);
    // Give each enemy a random evil face: random eye angle, brow, and mouth shape
    const evil = {
        eyeTilt: (Math.random() - 0.5) * 0.6, // radians, for angry eyes
        brow: Math.random() > 0.5 ? 'left' : 'right', // which brow is lower
        mouthType: Math.random() > 0.5 ? 'snarl' : 'frown',
        mouthOpen: Math.random() > 0.7 // sometimes open mouth
    };
    // Random health 1-3
    const health = Math.floor(Math.random() * 3) + 1;
    // Add vertical movement state
    enemies.push({
        x: ENEMY_SPAWN_X,
        y,
        health,
        maxHealth: health,
        evil,
        showHealth: false,
        healthBarTimer: 0,
        wallBounceCooldown: 0,
        vy: 0,
        vTarget: y,
        vTimer: Math.floor(Math.random() * 60) + 30 // time to next vertical change
    });
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        // Only move horizontally if wall is not destroyed or zombie is not past wall
        if (wallHealth > 0) {
            if (enemy.x - ENEMY_SIZE / 2 > WALL_X + WALL_WIDTH) {
                enemy.x -= ENEMY_SPEED;
            }
        } else {
            // Wall destroyed: zombies can move freely
            enemy.x -= ENEMY_SPEED;
        }
        // Vertical movement: randomly pick a new target y every so often
        enemy.vTimer--;
        if (enemy.vTimer <= 0) {
            enemy.vTarget = WALL_Y + 30 + Math.random() * (WALL_HEIGHT - 60);
            enemy.vTimer = Math.floor(Math.random() * 60) + 30;
        }
        // Move toward vTarget slowly
        const vDiff = enemy.vTarget - enemy.y;
        if (Math.abs(vDiff) > 1) {
            enemy.y += Math.sign(vDiff) * Math.min(Math.abs(vDiff), ENEMY_SPEED * 0.4);
        }
        // Health bar timer
        if (enemy.showHealth) {
            enemy.healthBarTimer--;
            if (enemy.healthBarTimer <= 0) enemy.showHealth = false;
        }
        // Check collision with wall
        if (wallHealth > 0 && enemy.x - ENEMY_SIZE / 2 < WALL_X + WALL_WIDTH) {
            if (!enemy.wallBounceCooldown || enemy.wallBounceCooldown <= 0) {
                wallHealth -= 10;
                // Bounce back only a little (so they appear to stay at the wall)
                enemy.x = WALL_X + WALL_WIDTH + ENEMY_SIZE / 2 + 1;
                enemy.wallBounceCooldown = 30; // 0.5s cooldown
                if (wallHealth < 0) wallHealth = 0;
            }
            continue;
        }
        // Wall bounce cooldown
        if (enemy.wallBounceCooldown && enemy.wallBounceCooldown > 0) {
            enemy.wallBounceCooldown--;
        }
    }
    // Remove enemies with health <= 0
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].health <= 0) {
            enemies.splice(i, 1);
        }
    }
}

function updateTowers() {
    for (const tower of towers) {
        tower.cooldown--;
        if (tower.cooldown <= 0) {
            // Find enemy in range
            for (const enemy of enemies) {
                const dx = enemy.x - (tower.x + 40);
                const dy = enemy.y - (tower.y + 15);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < TOWER_RANGE) {
                    // Upgraded towers shoot faster and more bullets
                    if (tower.upgraded) {
                        chewingums.push({
                            x: tower.x + 40,
                            y: tower.y + 15,
                            dx: dx / dist * CHEWINGUM_SPEED,
                            dy: dy / dist * CHEWINGUM_SPEED
                        });
                        // Shoot a spread
                        chewingums.push({
                            x: tower.x + 40,
                            y: tower.y + 15,
                            dx: (dx / dist * CHEWINGUM_SPEED) + 1,
                            dy: (dy / dist * CHEWINGUM_SPEED) - 1
                        });
                        chewingums.push({
                            x: tower.x + 40,
                            y: tower.y + 15,
                            dx: (dx / dist * CHEWINGUM_SPEED) - 1,
                            dy: (dy / dist * CHEWINGUM_SPEED) + 1
                        });
                        tower.cooldown = Math.floor(TOWER_FIRE_RATE / 2.2);
                    } else {
                        chewingums.push({
                            x: tower.x + 40,
                            y: tower.y + 15,
                            dx: dx / dist * CHEWINGUM_SPEED,
                            dy: dy / dist * CHEWINGUM_SPEED
                        });
                        tower.cooldown = TOWER_FIRE_RATE;
                    }
                    break;
                }
            }
        }
    }
}

function updateChewingums() {
    for (let i = chewingums.length - 1; i >= 0; i--) {
        const gum = chewingums[i];
        gum.x += gum.dx;
        gum.y += gum.dy;
        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dx = gum.x - enemy.x;
            const dy = gum.y - enemy.y;
            if (Math.sqrt(dx * dx + dy * dy) < ENEMY_SIZE / 2 + CHEWINGUM_SIZE) {
                enemy.health--;
                enemy.showHealth = true;
                enemy.healthBarTimer = 60;
                // In updateChewingums, remove enemy only if health <= 0
                if (enemy.health <= 0) {
                    enemies.splice(j, 1);
                }
                chewingums.splice(i, 1);
                break;
            }
        }
        // Remove if out of bounds
        if (gum.x < 0 || gum.x > canvas.width || gum.y < 0 || gum.y > canvas.height) {
            chewingums.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw area behind wall (for future expansion)
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#00f';
    ctx.fillRect(BEHIND_WALL_AREA.x, BEHIND_WALL_AREA.y, BEHIND_WALL_AREA.width, BEHIND_WALL_AREA.height);
    ctx.restore();
    drawWall();
    // Draw tower spots highlight (front)
    for (let i = 0; i < TOWER_SPOTS.length; i++) {
        const spot = TOWER_SPOTS[i];
        if (!towers.some(t => t.x === spot.x && t.y === spot.y)) {
            ctx.save();
            ctx.strokeStyle = (selectedSpot === i) ? '#ff0' : '#fff';
            ctx.lineWidth = (selectedSpot === i) ? 4 : 2;
            ctx.strokeRect(spot.x, spot.y, 30, 20);
            ctx.restore();
        }
    }
    // Draw tower spots highlight (behind)
    for (let i = 0; i < BEHIND_WALL_TOWER_SPOTS.length; i++) {
        const spot = BEHIND_WALL_TOWER_SPOTS[i];
        if (!behindTowers.some(t => t.x === spot.x && t.y === spot.y)) {
            ctx.save();
            ctx.strokeStyle = (selectedBehindSpot === i) ? '#0ff' : '#fff';
            ctx.lineWidth = (selectedBehindSpot === i) ? 4 : 2;
            ctx.strokeRect(spot.x, spot.y, 30, 20);
            ctx.restore();
        }
    }
    // Draw towers (front)
    for (const tower of towers) drawTower(tower);
    // Draw towers (behind, faded)
    for (const tower of behindTowers) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        drawTower(tower);
        ctx.restore();
    }
    for (const enemy of enemies) drawEnemy(enemy);
    for (const gum of chewingums) drawChewingum(gum);
    // Draw drag preview
    if (draggingTower) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        drawTower({ x: dragX - 15, y: dragY - 10, upgraded: false });
        ctx.restore();
    }
}

function gameLoop() {
    frameCount++;
    if (frameCount % 90 === 0) spawnEnemy();
    updateEnemies();
    updateTowers();
    updateChewingums();
    draw();
    document.getElementById('health-value').textContent = wallHealth;
    if (wallHealth > 0) {
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = '#f00';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over!', 350, 250);
    }
}

// Tower placement: select spot interactively
let selectedSpot = null;

// Add drag & drop logic
let selectedBehindSpot = null;
let draggingTower = null;
let dragX = 0, dragY = 0;

canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    selectedSpot = null;
    selectedBehindSpot = null;
    // Front spots
    for (let i = 0; i < TOWER_SPOTS.length; i++) {
        const spot = TOWER_SPOTS[i];
        if (!towers.some(t => t.x === spot.x && t.y === spot.y)) {
            if (mx > spot.x && mx < spot.x + 30 && my > spot.y && my < spot.y + 20) {
                selectedSpot = i;
                break;
            }
        }
    }
    // Behind spots
    for (let i = 0; i < BEHIND_WALL_TOWER_SPOTS.length; i++) {
        const spot = BEHIND_WALL_TOWER_SPOTS[i];
        if (!behindTowers.some(t => t.x === spot.x && t.y === spot.y)) {
            if (mx > spot.x && mx < spot.x + 30 && my > spot.y && my < spot.y + 20) {
                selectedBehindSpot = i;
                break;
            }
        }
    }
    if (draggingTower) {
        dragX = mx;
        dragY = my;
    }
});

canvas.addEventListener('mousedown', function (e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Start dragging from behind tower
    for (let i = 0; i < behindTowers.length; i++) {
        const t = behindTowers[i];
        if (mx > t.x && mx < t.x + 30 && my > t.y && my < t.y + 20) {
            draggingTower = t;
            behindTowers.splice(i, 1);
            dragX = mx;
            dragY = my;
            return;
        }
    }
});

canvas.addEventListener('mouseup', function (e) {
    if (draggingTower) {
        // Check if dropped on a front tower
        for (let i = 0; i < towers.length; i++) {
            const t = towers[i];
            if (dragX > t.x && dragX < t.x + 30 && dragY > t.y && dragY < t.y + 20 && !t.upgraded) {
                t.upgraded = true;
                return draggingTower = null;
            }
        }
        // If not dropped on a valid tower, snap back to first free behind spot
        for (let i = 0; i < BEHIND_WALL_TOWER_SPOTS.length; i++) {
            const spot = BEHIND_WALL_TOWER_SPOTS[i];
            if (!behindTowers.some(t => t.x === spot.x && t.y === spot.y)) {
                draggingTower.x = spot.x;
                draggingTower.y = spot.y;
                behindTowers.push(draggingTower);
                break;
            }
        }
        draggingTower = null;
    }
});

canvas.addEventListener('click', function (e) {
    // Check if clicked on a zombie
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let hitZombie = false;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const dx = mx - enemy.x;
        const dy = my - enemy.y;
        if (Math.sqrt(dx * dx + dy * dy) < ENEMY_SIZE / 2) {
            enemy.health--;
            enemy.showHealth = true;
            enemy.healthBarTimer = 60; // show for 1s
            // In canvas click handler, remove enemy only if health <= 0
            if (enemy.health <= 0) {
                enemies.splice(i, 1);
            }
            hitZombie = true;
            break;
        }
    }
    if (!hitZombie && selectedSpot !== null) {
        const spot = TOWER_SPOTS[selectedSpot];
        towers.push({ x: spot.x, y: spot.y, cooldown: 0, upgraded: false });
        selectedSpot = null;
    }
    if (!hitZombie && selectedBehindSpot !== null) {
        const spot = BEHIND_WALL_TOWER_SPOTS[selectedBehindSpot];
        behindTowers.push({ x: spot.x, y: spot.y, upgraded: false });
        selectedBehindSpot = null;
    }
});

gameLoop();
