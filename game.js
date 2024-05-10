// Define canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let score = 0;
let round = 1;
let playerLives = 3;
let enemySpeed = 1;
let enemySpawnRate = 1000; // milliseconds
let gamePaused = false;
let isTwoPlayerMode = false;
let currentPlayerIndex = 0;

// Player object
const players = [
    {
        x: canvas.width / 2,
        y: canvas.height - 50,
        width: 30,
        height: 30,
        speed: 5,
        color: "#00FF00",
        image: new Image(),
        lives: 3
    }
];
players[0].image.src = "player.png"; // Path to player image

// Enemies array
const enemies = [];
const enemyTypes = [
    {
        type: "enemy1",
        image: new Image(),
        width: 20,
        height: 20,
        speed: 1,
        score: 10,
        fireRate: 0.01 // Probability of shooting per frame
    },
    {
        type: "enemy2",
        image: new Image(),
        width: 20,
        height: 20,
        speed: 1.5,
        score: 20,
        fireRate: 0.02
    }
];
enemyTypes[0].image.src = "enemy1.png"; // Path to enemy 1 image
enemyTypes[1].image.src = "enemy2.png"; // Path to enemy 2 image

// Bullets array
const bullets = [];

// Keyboard controls
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " ") {
        shoot();
    } else if (e.key === "p" || e.key === "P") {
        gamePaused = !gamePaused;
        if (!gamePaused) {
            requestAnimationFrame(draw);
        }
    }
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Function to draw player
function drawPlayer(player) {
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
}

// Function to move player
function movePlayer(player) {
    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

// Function to draw enemies
function drawEnemies() {
    for (let enemy of enemies) {
        ctx.drawImage(enemy.type.image, enemy.x, enemy.y, enemy.type.width, enemy.type.height);
    }
}

// Function to move enemies
function moveEnemies() {
    for (let enemy of enemies) {
        enemy.y += enemy.type.speed;
    }
}

// Function to spawn enemies
function spawnEnemies() {
    if (Math.random() < enemySpawnRate / 10000) {
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemy = {
            x: Math.random() * (canvas.width - enemyType.width),
            y: -enemyType.height,
            type: enemyType,
            dx: Math.random() > 0.5 ? 1 : -1, // Randomize initial movement direction
            dy: 1 // Initial movement downwards
        };
        enemies.push(enemy);
    }
}

// Function to draw bullets
function drawBullets() {
    for (let bullet of bullets) {
        ctx.beginPath();
        ctx.rect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.fillStyle = bullet.color;
        ctx.fill();
        ctx.closePath();
    }
}

// Function to move bullets
function moveBullets() {
    for (let bullet of bullets) {
        bullet.y -= bullet.speed;
    }
}

// Function to shoot bullets
function shoot() {
    const currentPlayer = players[currentPlayerIndex];
    const bullet = {
        x: currentPlayer.x + currentPlayer.width / 2 - 2,
        y: currentPlayer.y - 10,
        width: 4,
        height: 10,
        color: "#FFFF00",
        speed: 8
    };
    bullets.push(bullet);
}

// Function to handle collisions
function handleCollisions() {
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            if (
                bullets[i].x < enemies[j].x + enemies[j].type.width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].type.height &&
                bullets[i].y + bullets[i].height > enemies[j].y
            ) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += enemies[j].type.score;
                break;
            }
        }
    }
}

// Function to check if the game is over
function gameOver() {
    let gameOver = true;
    for (let player of players) {
        if (player.lives > 0) {
            gameOver = false;
            break;
        }
    }
    return gameOver;
}

// Function to update game state
// Function to handle collisions between player and enemies
function handlePlayerEnemyCollisions() {
    for (let player of players) {
        for (let enemy of enemies) {
            if (
                player.x < enemy.x + enemy.type.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.type.height &&
                player.y + player.height > enemy.y
            ) {
                player.lives--; // Decrease player lives
                enemies.splice(enemies.indexOf(enemy), 1); // Remove enemy
                if (player.lives <= 0) {
                    // If player has no lives left, check for game over
                    if (gameOver()) {
                        // Game over logic
                        alert("Game Over! Your score: " + score);
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// Update function - integrate collision detection with enemies
function update() {
    if (!gamePaused) {
        for (let player of players) {
            if (player.lives > 0) {
                movePlayer(player);
            }
        }
        moveEnemies();
        spawnEnemies();
        moveBullets();
        handleCollisions(); // Check bullet-enemy collisions
        handlePlayerEnemyCollisions(); // Check player-enemy collisions
        requestAnimationFrame(draw);
    }
}

// Function to draw game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let player of players) {
        if (player.lives > 0) {
            drawPlayer(player);
        }
    }
    drawEnemies();
    drawBullets();
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("Round: " + round, 10, 60);
    for (let i = 0; i < players.length; i++) {
        ctx.fillText("Player " + (i + 1) + " Lives: " + players[i].lives, canvas.width - 200, 30 + (30 * i));
    }
}

// Function to handle starting screen
function startScreen() {
    ctx.fillStyle = "#FFF";
    ctx.fillText("Press 'S' for Single Player", canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText("Press 'T' for Two Players", canvas.width / 2, canvas.height / 2 + 30);
}

// Function to start single player game
function startSinglePlayer() {
    isTwoPlayerMode = false;
    startGame();
}

// Function to start two player game
function startTwoPlayer() {
    isTwoPlayerMode = true;
    startGame();
}

// Function to start the game
function startGame() {
    // Hide overlay
    document.getElementById("overlay").style.display = "none";
    draw();
    setInterval(update, 1000 / 60); // Update game state 60 times per second
}

// Event listener for starting screen
document.addEventListener("keydown", (e) => {
    if (e.key === "s" || e.key === "S") {
        startSinglePlayer();
    } else if (e.key === "t" || e.key === "T") {
        startTwoPlayer();
    }
});

// Draw starting screen
startScreen();
