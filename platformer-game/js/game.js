class Game {
    constructor() {
        this.currentLevelNumber = 1;
        this.levels = this.createLevels();
        this.currentLevel = this.levels[this.currentLevelNumber];
        this.player = new Player(50, 450);
        this.gameOver = false;
        this.won = false;
        this.input = {
            left: false,
            right: false,
            jump: false
        };
        this.setupInputHandlers();
    }

    createLevels() {
        const levels = {};
        levels[1] = createLevel1();
        levels[2] = createLevel2();
        return levels;
    }

    setupInputHandlers() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'a' || e.key === 'A') this.input.left = true;
            if (e.key === 'd' || e.key === 'D') this.input.right = true;
            if (e.key === ' ') {
                this.input.jump = true;
                e.preventDefault();
            }
            if (e.key === 'Shift') {
                this.input.sprint = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'a' || e.key === 'A') this.input.left = false;
            if (e.key === 'd' || e.key === 'D') this.input.right = false;
            if (e.key === 'Shift') {
                this.input.sprint = false;
            }
        });
    }

    update() {
        if (this.gameOver || this.won) return;

        this.currentLevel.update(this.input, this.player);

        if (this.player.isDead) {
            this.gameOver = true;
            alert(`Game Over! You died on Level ${this.currentLevelNumber}\nRefresh to restart.`);
            return;
        }

        // Check for flagpole collision
        if (this.currentLevel.flagpole && this.currentLevel.flagpole.isColliding(this.player)) {
            if (this.currentLevel.nextLevel) {
                this.nextLevel();
            } else {
                this.won = true;
                alert(`You won! Congratulations!\nRefresh to restart.`);
            }
        }
    }

    nextLevel() {
        this.currentLevelNumber++;
        if (this.levels[this.currentLevelNumber]) {
            this.currentLevel = this.levels[this.currentLevelNumber];
            this.player = new Player(50, 450);
            document.getElementById('levelText').textContent = `Level ${this.currentLevelNumber}`;
        } else {
            this.won = true;
            alert('All levels completed!');
        }
    }

    draw(ctx) {
        // Clear canvas
        ctx.fillStyle = 'rgba(135, 206, 235, 1)';
        ctx.fillRect(0, 0, 800, 600);

        // Draw level
        this.currentLevel.draw(ctx);
        this.player.draw(ctx);
    }
}
