class GoombEnemy {
    constructor(x, y, direction = 1, platforms = []) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.width = 32;
        this.height = 32;
        this.velocityX = MOVE_SPEED * direction; // 1 = right, -1 = left
        this.velocityY = 0;
        this.direction = direction;
        this.isDead = false;
        this.platforms = platforms;
    }

    update(platforms) {
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

        // Collision with platforms
        let onGround = false;
        for (let platform of platforms) {
            if (this.isColliding(platform)) {
                // Landing on platform - check if enemy's previous bottom was above platform's middle
                if (this.velocityY > 0 && this.prevY + this.height <= platform.y + platform.height / 2) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    onGround = true;
                }
                // Side collision - reverse direction
                else if (this.velocityX > 0) {
                    this.velocityX = -MOVE_SPEED;
                    this.direction = -1;
                } else if (this.velocityX < 0) {
                    this.velocityX = MOVE_SPEED;
                    this.direction = 1;
                }
            }
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
        ctx.fillStyle = '#8B4513';
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
           ctx.drawImage(goombaWalkSprite, this.x, this.y, this.width, this.height);
           ctx.restore();
        */
    }
}
