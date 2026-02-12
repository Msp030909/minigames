class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.width = 32;
        this.height = 32;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.graceTimer = 0;
        this.isFacingRight = true;
        this.isDead = false;
    }

    update(input, platforms, enemies) {
        // Horizontal movement
        this.velocityX = 0;
        if (input.left && input.sprint) {
            this.velocityX = -MOVE_SPEED * 2; // Sprinting left
            this.isFacingRight = false;
        }
            else if (input.left) {
            this.velocityX = -MOVE_SPEED * 1.25;
            this.isFacingRight = false;
        }

        if (input.right && input.sprint) {
            this.velocityX = MOVE_SPEED * 2; // Sprinting
            this.isFacingRight = true;
        }
            else if (input.right) {
            this.velocityX = MOVE_SPEED * 1.25;
            this.isFacingRight = true;
        }
    
        // Apply gravity
        this.velocityY += GRAVITY;
        if (this.velocityY > MAX_FALL_SPEED) {
            this.velocityY = MAX_FALL_SPEED;
        }

        // Jumping with grace period
        this.graceTimer -= 1 / 60; // Assuming 60 FPS
        if (input.jump && this.graceTimer > 0) {
            this.velocityY = JUMP_STRENGTH;
            this.graceTimer = 0;
            input.jump = false; // Consume jump input
        }

        // Store previous position before update
        this.prevX = this.x;
        this.prevY = this.y;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Collision with platforms
        this.isGrounded = false;
        for (let platform of platforms) {
            if (this.isColliding(platform)) {
                // Landing on top of platform
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y + platform.height / 2) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.isGrounded = true;
                    this.graceTimer = JUMP_GRACE_PERIOD;
                }
                // Hitting bottom of platform
                else if (this.velocityY < 0 && this.y + this.height - this.velocityY >= platform.y + platform.height / 2) {
                    this.velocityY = 0;
                    this.y = platform.y + platform.height;
                }
                // Side collision
                else {
                    if (this.velocityX > 0) {
                        this.x = platform.x - this.width;
                    } else if (this.velocityX < 0) {
                        this.x = platform.x + platform.width;
                    }
                    this.velocityX = 0;
                }
            }
        }

        // Check collision with enemies
        for (let enemy of enemies) {
            if (this.isColliding(enemy)) {
                // Hit enemy from above - check if player's previous bottom was above enemy's middle
                if (this.velocityY > 0 && this.prevY + this.height <= enemy.y + enemy.height / 2) {
                    enemy.die();
                    this.velocityY = JUMP_STRENGTH; // Bounce
                } else {
                    this.die();
                }
            }
        }

        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > 800) this.x = 800 - this.width;

        // Fall off screen
        if (this.y > 600) {
            this.die();
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
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Optional: Draw eyes to show direction
        ctx.fillStyle = '#000';
        if (this.isFacingRight) {
            ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
        } else {
            ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
        }

        /* Sprite rendering (uncomment to use):
           const spriteState = this.velocityY < 0 ? 'jump' : 
                              this.velocityX !== 0 ? 'move' : 'idle';
           ctx.save();
           if (!this.isFacingRight) ctx.scale(-1, 1);
           ctx.drawImage(playerSprites[spriteState], this.x, this.y, this.width, this.height);
           ctx.restore();
        */
    }
}
