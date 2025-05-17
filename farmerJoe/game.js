// Farmer Joe Game
// See productRequirementFile.md for requirements

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PLAYER_SIZE = 40;
const PLAYER_SPEED = 4;
const BERRY_SIZE = 24;
const BERRY_FIELD = { x: WIDTH * 0.75, y: 0, w: WIDTH * 0.25, h: HEIGHT * 0.25 };
const TABLE = { x: WIDTH / 2 - 50, y: HEIGHT - PLAYER_SIZE * 2 - 20, w: 100, h: 40 };
const REWARD_AREA = { x: 0, y: 0, w: WIDTH * 0.25, h: HEIGHT * 0.25 };
const BERRY_GROWTH_INTERVAL = 10000; // ms
const HARVEST_TIME = 2000; // ms
const NPC_Y = HEIGHT - PLAYER_SIZE;
function getRandomBerryNeed() {
    // Ensure berry need is always at least 1
    return Math.floor(Math.random() * 10) + 1;
}
const NPC_START_X = [WIDTH / 2 - 120, WIDTH / 2, WIDTH / 2 + 120];
let npcs = [
    { x: NPC_START_X[0], y: NPC_Y, carrying: false, berryNeed: getRandomBerryNeed(), berriesCarried: 0 },
    { x: NPC_START_X[1], y: NPC_Y, carrying: false, berryNeed: getRandomBerryNeed(), berriesCarried: 0 },
    { x: NPC_START_X[2], y: NPC_Y, carrying: false, berryNeed: getRandomBerryNeed(), berriesCarried: 0 }
];

// Shared state for points and berries
let shared = { berries: 0, points: 0 };

// Game state
let player = { x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0, harvesting: false, harvestBerry: null, harvestStart: 0, hasCrate: false };
let player2 = { x: WIDTH / 2 + 60, y: HEIGHT / 2, vx: 0, vy: 0, harvesting: false, harvestBerry: null, harvestStart: 0, hasCrate: false };
let berries = [];
// Spawn the first berry immediately
(function spawnInitialBerry() {
    let bx = BERRY_FIELD.x + 30 + Math.random() * (BERRY_FIELD.w - 60);
    let by = BERRY_FIELD.y + 30 + Math.random() * (BERRY_FIELD.h - 60);
    berries.push({ x: bx, y: by, harvested: false });
})();
let deliveredBerries = 0;
let lastBerryGrowth = Date.now();
let keys = {};

// Machine state
let machines = [
    { unlocked: false, x: WIDTH / 2 - 120, y: 30, w: 80, h: 60, active: false, timer: 0, progress: 0, hasCrate: false, owner: null },
    { unlocked: false, x: WIDTH / 2 - 40, y: 30, w: 80, h: 60, active: false, timer: 0, progress: 0, hasCrate: false, owner: null },
    { unlocked: false, x: WIDTH / 2 + 40, y: 30, w: 80, h: 60, active: false, timer: 0, progress: 0, hasCrate: false, owner: null }
];

// Reward message state
let rewardMessage = '';
let rewardMessageAlpha = 0;
let rewardMessageY = 80;
let rewardMessageShake = 0;
let rewardMessageFireworks = [];

function showRewardMessage(msg) {
    rewardMessage = msg;
    rewardMessageAlpha = 1;
    rewardMessageY = 80;
    rewardMessageShake = 0;
    rewardMessageFireworks = [];
    // Create fireworks particles
    for (let i = 0; i < 30; i++) {
        let angle = (i / 30) * 2 * Math.PI;
        let speed = 2 + Math.random() * 2;
        rewardMessageFireworks.push({
            x: WIDTH / 2,
            y: rewardMessageY + 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`
        });
    }
}

function drawRewardMessage() {
    if (rewardMessageAlpha > 0) {
        // Shaky effect
        rewardMessageShake = Math.sin(Date.now() / 60) * 8;
        ctx.save();
        ctx.globalAlpha = rewardMessageAlpha;
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.translate(WIDTH / 2 + rewardMessageShake, rewardMessageY);
        ctx.fillText(rewardMessage, 0, 0);
        ctx.restore();
        // Fireworks
        rewardMessageFireworks.forEach(fw => {
            ctx.save();
            ctx.globalAlpha = fw.alpha * rewardMessageAlpha;
            ctx.fillStyle = fw.color;
            ctx.beginPath();
            ctx.arc(fw.x, fw.y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        });
    }
}

function updateRewardMessage() {
    if (rewardMessageAlpha > 0) {
        rewardMessageAlpha -= 0.01;
        rewardMessageY -= 0.2;
        rewardMessageFireworks.forEach(fw => {
            fw.x += fw.vx;
            fw.y += fw.vy;
            fw.vx *= 0.98;
            fw.vy *= 0.98;
            fw.alpha *= 0.97;
        });
    }
}

function drawBerryField() {
    ctx.fillStyle = '#8d5524'; // brown
    ctx.fillRect(BERRY_FIELD.x, BERRY_FIELD.y, BERRY_FIELD.w, BERRY_FIELD.h);
    ctx.strokeStyle = '#222';
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(BERRY_FIELD.x, BERRY_FIELD.y + i * (BERRY_FIELD.h / 10));
        ctx.lineTo(BERRY_FIELD.x + BERRY_FIELD.w, BERRY_FIELD.y + i * (BERRY_FIELD.h / 10));
        ctx.stroke();
    }
}

function drawTable() {
    ctx.fillStyle = '#deb887';
    ctx.fillRect(TABLE.x, TABLE.y, TABLE.w, TABLE.h);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(TABLE.x, TABLE.y, TABLE.w, TABLE.h);
}

function drawRewardArea() {
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(REWARD_AREA.x, REWARD_AREA.y, REWARD_AREA.w, REWARD_AREA.h);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(REWARD_AREA.x, REWARD_AREA.y, REWARD_AREA.w, REWARD_AREA.h);
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText('Rewards', REWARD_AREA.x + 10, REWARD_AREA.y + 24);
}

function drawPlayer() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('Joe', player.x + 6, player.y + 26);
    // Draw harvest progress bar if harvesting
    if (player.harvesting && player.harvestBerry) {
        let elapsed = (Date.now() - player.harvestStart) / HARVEST_TIME;
        elapsed = Math.min(elapsed, 1);
        let barWidth = PLAYER_SIZE;
        let barHeight = 6;
        ctx.fillStyle = '#fff';
        ctx.fillRect(player.x, player.y - 12, barWidth, barHeight);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(player.x, player.y - 12, barWidth * elapsed, barHeight);
        ctx.strokeStyle = '#222';
        ctx.strokeRect(player.x, player.y - 12, barWidth, barHeight);
    }
}

function drawPlayer2() {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(player2.x, player2.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('Ann', player2.x + 6, player2.y + 26);
    if (player2.harvesting && player2.harvestBerry) {
        let elapsed = (Date.now() - player2.harvestStart) / HARVEST_TIME;
        elapsed = Math.min(elapsed, 1);
        let barWidth = PLAYER_SIZE;
        let barHeight = 6;
        ctx.fillStyle = '#fff';
        ctx.fillRect(player2.x, player2.y - 12, barWidth, barHeight);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(player2.x, player2.y - 12, barWidth * elapsed, barHeight);
        ctx.strokeStyle = '#222';
        ctx.strokeRect(player2.x, player2.y - 12, barWidth, barHeight);
    }
}

function drawNPCs() {
    npcs.forEach(npc => {
        ctx.fillStyle = npc.carrying ? '#fbc02d' : '#90caf9';
        ctx.fillRect(npc.x, npc.y, PLAYER_SIZE, PLAYER_SIZE);
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText('NPC', npc.x + 2, npc.y + 18);
        ctx.font = 'bold 18px Arial';
        ctx.fillText(npc.berryNeed - npc.berriesCarried, npc.x + 12, npc.y + 36);
    });
}

function drawBerries() {
    berries.forEach(berry => {
        ctx.beginPath();
        ctx.arc(berry.x, berry.y, BERRY_SIZE / 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#d32f2f';
        ctx.fill();
        ctx.strokeStyle = '#fbc02d';
        for (let i = 0; i < 6; i++) {
            let angle = (i / 6) * 2 * Math.PI;
            ctx.beginPath();
            ctx.arc(berry.x + Math.cos(angle) * 8, berry.y + Math.sin(angle) * 8, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#fbc02d';
            ctx.fill();
        }
    });
}

function drawMachine(machine) {
    if (!machine.unlocked) return;
    ctx.fillStyle = '#888';
    ctx.fillRect(machine.x, machine.y, machine.w, machine.h);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(machine.x, machine.y, machine.w, machine.h);
    ctx.fillStyle = '#222';
    ctx.font = '16px Arial';
    ctx.fillText('Machine', machine.x + 6, machine.y + 24);
    // Draw progress bar if active
    if (machine.active) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(machine.x + 10, machine.y + machine.h - 20, 60, 10);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(machine.x + 10, machine.y + machine.h - 20, 60 * machine.progress, 10);
        ctx.strokeStyle = '#222';
        ctx.strokeRect(machine.x + 10, machine.y + machine.h - 20, 60, 10);
    }
    // Draw crate if ready
    if (machine.hasCrate) {
        ctx.fillStyle = '#795548';
        ctx.fillRect(machine.x + machine.w / 2 - 12, machine.y + machine.h + 5, 24, 24);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(machine.x + machine.w / 2 - 12, machine.y + machine.h + 5, 24, 24);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('Crate', machine.x + machine.w / 2 - 14, machine.y + machine.h + 24);
    }
}

function drawAllMachines() {
    machines.forEach(drawMachine);
}

function drawUI() {
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Berries: ${shared.berries}`, 20, HEIGHT - 40);
    ctx.fillText(`Points: ${shared.points}`, 20, HEIGHT - 16);
    if (player.hasCrate) {
        ctx.fillStyle = '#795548';
        ctx.fillRect(150, HEIGHT - 56, 24, 24);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(150, HEIGHT - 56, 24, 24);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText('Crate', 150, HEIGHT - 36);
    }
    if (player2.hasCrate) {
        ctx.fillStyle = '#795548';
        ctx.fillRect(330, HEIGHT - 56, 24, 24);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(330, HEIGHT - 56, 24, 24);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText('Crate', 330, HEIGHT - 36);
    }
}

function growBerries() {
    if (Date.now() - lastBerryGrowth > BERRY_GROWTH_INTERVAL) {
        for (let i = 0; i < 3; i++) {
            let bx = BERRY_FIELD.x + 30 + Math.random() * (BERRY_FIELD.w - 60);
            let by = BERRY_FIELD.y + 30 + Math.random() * (BERRY_FIELD.h - 60);
            berries.push({ x: bx, y: by, harvested: false });
        }
        lastBerryGrowth = Date.now();
    }
}

function updatePlayer() {
    let speed = PLAYER_SPEED;
    if (keys['ArrowLeft']) player.x -= speed;
    if (keys['ArrowRight']) player.x += speed;
    if (keys['ArrowUp']) player.y -= speed;
    if (keys['ArrowDown']) player.y += speed;
    // Clamp to map
    player.x = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, player.x));
    player.y = Math.max(0, Math.min(HEIGHT - PLAYER_SIZE, player.y));
}

function updatePlayer2() {
    let speed = PLAYER_SPEED;
    if (keys['a'] || keys['A']) player2.x -= speed;
    if (keys['d'] || keys['D']) player2.x += speed;
    if (keys['w'] || keys['W']) player2.y -= speed;
    if (keys['s'] || keys['S']) player2.y += speed;
    player2.x = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, player2.x));
    player2.y = Math.max(0, Math.min(HEIGHT - PLAYER_SIZE, player2.y));
}

function checkBerryHarvest() {
    // Player 1
    if (player.harvesting) {
        if (Date.now() - player.harvestStart >= HARVEST_TIME) {
            berries = berries.filter(b => b !== player.harvestBerry);
            shared.berries++;
            player.harvesting = false;
            player.harvestBerry = null;
        }
        return;
    }
    for (let berry of berries) {
        let dx = player.x + PLAYER_SIZE / 2 - berry.x;
        let dy = player.y + PLAYER_SIZE / 2 - berry.y;
        if (Math.abs(dx) < (PLAYER_SIZE / 2 + BERRY_SIZE / 2) && Math.abs(dy) < (PLAYER_SIZE / 2 + BERRY_SIZE / 2)) {
            player.harvesting = true;
            player.harvestBerry = berry;
            player.harvestStart = Date.now();
            break;
        }
    }
    // Player 2
    if (player2.harvesting) {
        if (Date.now() - player2.harvestStart >= HARVEST_TIME) {
            berries = berries.filter(b => b !== player2.harvestBerry);
            shared.berries++;
            player2.harvesting = false;
            player2.harvestBerry = null;
        }
        return;
    }
    for (let berry of berries) {
        let dx = player2.x + PLAYER_SIZE / 2 - berry.x;
        let dy = player2.y + PLAYER_SIZE / 2 - berry.y;
        if (Math.abs(dx) < (PLAYER_SIZE / 2 + BERRY_SIZE / 2) && Math.abs(dy) < (PLAYER_SIZE / 2 + BERRY_SIZE / 2)) {
            player2.harvesting = true;
            player2.harvestBerry = berry;
            player2.harvestStart = Date.now();
            break;
        }
    }
}

function exchangePoints() {
    // Either player can unlock a machine for 100 points, up to 3
    if ((player.x + PLAYER_SIZE > REWARD_AREA.x && player.x < REWARD_AREA.x + REWARD_AREA.w && player.y + PLAYER_SIZE > REWARD_AREA.y && player.y < REWARD_AREA.y + REWARD_AREA.h) ||
        (player2.x + PLAYER_SIZE > REWARD_AREA.x && player2.x < REWARD_AREA.x + REWARD_AREA.w && player2.y + PLAYER_SIZE > REWARD_AREA.y && player2.y < REWARD_AREA.y + REWARD_AREA.h)) {
        if (shared.points >= 100) {
            let machineToUnlock = machines.find(m => !m.unlocked);
            if (machineToUnlock) {
                shared.points -= 100;
                machineToUnlock.unlocked = true;
                showRewardMessage('Machine unlocked!');
            }
        }
    }
}

function deliverBerries() {
    // Either player delivers
    if (
        (player.x + PLAYER_SIZE > TABLE.x && player.x < TABLE.x + TABLE.w && player.y + PLAYER_SIZE > TABLE.y && player.y < TABLE.y + TABLE.h) ||
        (player2.x + PLAYER_SIZE > TABLE.x && player2.x < TABLE.x + TABLE.w && player2.y + PLAYER_SIZE > TABLE.y && player2.y < TABLE.y + TABLE.h)
    ) {
        if (shared.berries > 0) {
            deliveredBerries += shared.berries;
            shared.points += shared.berries * 10;
            shared.berries = 0;
        }
        if (player.hasCrate) {
            deliveredBerries += 3;
            player.hasCrate = false;
        }
        if (player2.hasCrate) {
            deliveredBerries += 3;
            player2.hasCrate = false;
        }
    }
}

function updateMachines() {
    machines.forEach((machine, idx) => {
        if (!machine.unlocked) return;
        // Player 1
        let inMachine1 = player.x + PLAYER_SIZE > machine.x && player.x < machine.x + machine.w && player.y + PLAYER_SIZE > machine.y && player.y < machine.y + machine.h;
        // Player 2
        let inMachine2 = player2.x + PLAYER_SIZE > machine.x && player2.x < machine.x + machine.w && player2.y + PLAYER_SIZE > machine.y && player2.y < machine.y + machine.h;
        // Start crate production
        if (inMachine1 && shared.berries >= 2 && !machine.active && !machine.hasCrate && !player.hasCrate) {
            shared.berries -= 2;
            machine.active = true;
            machine.timer = Date.now();
            machine.progress = 0;
            machine.owner = 1;
        }
        if (inMachine2 && shared.berries >= 2 && !machine.active && !machine.hasCrate && !player2.hasCrate) {
            shared.berries -= 2;
            machine.active = true;
            machine.timer = Date.now();
            machine.progress = 0;
            machine.owner = 2;
        }
        // Progress bar
        if (machine.active) {
            let elapsed = (Date.now() - machine.timer) / 5000;
            machine.progress = Math.min(elapsed, 1);
            if (elapsed >= 1) {
                machine.active = false;
                machine.hasCrate = true;
                machine.progress = 1;
            }
        }
        // Player picks up crate
        if (machine.hasCrate && inMachine1 && !player.hasCrate && machine.owner === 1) {
            machine.hasCrate = false;
            player.hasCrate = true;
        }
        if (machine.hasCrate && inMachine2 && !player2.hasCrate && machine.owner === 2) {
            machine.hasCrate = false;
            player2.hasCrate = true;
        }
    });
}

function updateNPCs() {
    // Only the first NPC in line that is not finished can collect berries
    let activeNpcIndex = npcs.findIndex(npc => npc.berriesCarried < npc.berryNeed && npc.leaving !== true);
    npcs.forEach((npc, idx) => {
        // Prevent berryNeed from ever being 0
        if (npc.berryNeed <= 0) {
            npc.berryNeed = getRandomBerryNeed();
            npc.berriesCarried = 0;
            npc.x = NPC_START_X[idx];
            npc.carrying = false;
            npc.leaving = false;
            return;
        }
        // If NPC is finished, start leaving
        if (npc.berriesCarried >= npc.berryNeed && !npc.leaving) {
            npc.leaving = true;
        }
        if (npc.leaving) {
            npc.x += 2;
            if (npc.x > WIDTH) {
                // Respawn NPC with new need
                npc.x = NPC_START_X[idx];
                npc.berryNeed = getRandomBerryNeed();
                npc.berriesCarried = 0;
                npc.carrying = false;
                npc.leaving = false;
            }
            return;
        }
        if (idx === activeNpcIndex) {
            // This NPC is the first in line and can collect berries
            if (!npc.carrying && deliveredBerries > 0 && npc.berriesCarried < npc.berryNeed) {
                npc.carrying = true;
                npc.berriesCarried++;
                deliveredBerries--;
            }
            if (npc.carrying) {
                npc.carrying = false;
            }
        } else {
            // Other NPCs wait in line, do not collect berries
            npc.carrying = false;
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBerryField();
    drawTable();
    drawRewardArea();
    drawBerries();
    drawPlayer();
    drawPlayer2();
    drawNPCs();
    drawAllMachines();
    drawUI();
    drawRewardMessage();
    growBerries();
    updatePlayer();
    updatePlayer2();
    checkBerryHarvest();
    deliverBerries();
    exchangePoints();
    updateMachines();
    updateNPCs();
    updateRewardMessage();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });

gameLoop();
