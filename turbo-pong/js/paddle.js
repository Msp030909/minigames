import { CONFIG } from './config.js';

export class Paddle {
    constructor(isLeft) {
        this.isLeft  = isLeft;
        this.width   = CONFIG.PADDLE_WIDTH;
        this.height  = CONFIG.PADDLE_HEIGHT;
        this.x       = isLeft
                         ? CONFIG.PADDLE_MARGIN
                         : CONFIG.CANVAS_WIDTH - CONFIG.PADDLE_MARGIN - CONFIG.PADDLE_WIDTH;
        this.y       = (CONFIG.CANVAS_HEIGHT - this.height) / 2;
        this.speed   = CONFIG.PADDLE_SPEED;
        this.vy      = 0;
        this.gravityAffected = false;
    }

    reset() {
        this.height = CONFIG.PADDLE_HEIGHT;
        this.y      = (CONFIG.CANVAS_HEIGHT - this.height) / 2;
        this.vy     = 0;
        this.gravityAffected = false;
        this.x = this.isLeft
                   ? CONFIG.PADDLE_MARGIN
                   : CONFIG.CANVAS_WIDTH - CONFIG.PADDLE_MARGIN - this.width;
    }

    moveUp(dt) {
        const f = dt / 16.667;
        this.y -= this.speed * f;
        if (this.gravityAffected) this.vy = -2;
        this.constrain();
    }

    moveDown(dt) {
        const f = dt / 16.667;
        this.y += this.speed * f;
        if (this.gravityAffected) this.vy = 2;
        this.constrain();
    }

    moveTo(targetY) {
        this.y = targetY - this.height / 2;
        this.constrain();
    }

    applyGravity(dt) {
        if (!this.gravityAffected) return;
        const f = dt / 16.667;
        this.vy += CONFIG.GRAVITY_STRENGTH * f;
        this.y  += this.vy * f;
        this.constrain();
    }

    constrain() {
        if (this.y < 0) {
            this.y  = 0;
            this.vy = 0;
        }
        if (this.y + this.height > CONFIG.CANVAS_HEIGHT) {
            this.y  = CONFIG.CANVAS_HEIGHT - this.height;
            this.vy = 0;
        }
    }

    getCenterY() { return this.y + this.height / 2; }
}
