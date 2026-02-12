// Game initialization and main loop
const container = document.getElementById('gameContainer');
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.style.display = 'block';
container.appendChild(canvas);

const ctx = canvas.getContext('2d');
const game = new Game();

function gameLoop() {
    game.update();
    game.draw(ctx);
    requestAnimationFrame(gameLoop);
}

gameLoop();
