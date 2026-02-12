class PatrolEnemy {
    constructor(x, y, platform, direction = 1) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.width = 32;
        this.height = 32;
        this.velocityX = MOVE_SPEED * direction;
        this.velocityY = 0;
        this.direction = direction;
        this.isDead = false;
        this.platform = platform;
    }

    update() {
        // Apply gravity
        this.velocityY += GRAVITY;
        if (this.velocityY > MAX_FALL_SPEED) {
            this.velocityY = MAX_FALL_SPEED;
        }

        // Store previous position before update
        this.prevX = this.x;
        this.prevY = this.y;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Keep on platform
        if (this.isColliding(this.platform)) {
            if (this.velocityY > 0) {
                this.y = this.platform.y - this.height;
                this.velocityY = 0;
            }
        }

        // Check if at edge and reverse direction
        const platformLeft = this.platform.x;
        const platformRight = this.platform.x + this.platform.width;
        const enemyCenter = this.x + this.width / 2;

        if ((this.direction === 1 && enemyCenter >= platformRight - 5) ||
            (this.direction === -1 && enemyCenter <= platformLeft + 5)) {
            this.velocityX *= -1;
            this.direction *= -1;
        }

        // Fall off screen
        if (this.y > 600) {
            this.isDead = true;
        }
    }

    isColliding(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    die() {
        this.isDead = true;
    }

    draw(ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw eyes
        ctx.fillStyle = '#000';
        if (this.direction === 1) {
            ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
        } else {
            ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
        }

        /* Sprite rendering (uncomment to use):
           ctx.save();
           if (this.direction === -1) ctx.scale(-1, 1);
           ctx.drawImage(patrolEnemyWalkSprite, this.x, this.y, this.width, this.height);
           ctx.restore();
        */
    }
}
