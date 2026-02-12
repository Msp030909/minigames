class Level {
    constructor(levelNumber, platforms = [], enemies = [], flagpole = null, nextLevel = null) {
        this.levelNumber = levelNumber;
        this.platforms = platforms;
        this.enemies = enemies;
        this.flagpole = flagpole;
        this.nextLevel = nextLevel;
    }

    draw(ctx) {
        for (let platform of this.platforms) {
            platform.draw(ctx);
        }
        for (let enemy of this.enemies) {
            if (!enemy.isDead) {
                enemy.draw(ctx);
            }
        }
        if (this.flagpole) {
            this.flagpole.draw(ctx);
        }
    }

    update(input, player) {
        for (let enemy of this.enemies) {
            if (!enemy.isDead) {
                enemy.update(this.platforms);
            }
        }
        this.enemies = this.enemies.filter(e => !e.isDead);
        player.update(input, this.platforms, this.enemies);
    }
}
