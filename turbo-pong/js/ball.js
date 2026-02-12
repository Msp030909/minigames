import { CONFIG } from './config.js';

export class Ball {
    constructor() {
        this.x      = CONFIG.CANVAS_WIDTH / 2;
        this.y      = CONFIG.CANVAS_HEIGHT / 2;
        this.radius = CONFIG.BALL_RADIUS;
        this.vx     = 0;
        this.vy     = 0;
        this.speed  = CONFIG.BALL_INITIAL_SPEED;
        this.isExtra = false;   // true for multi-ball modifier copies
        this.active  = true;
    }

    /** Set velocity in a random-ish direction. direction = 1 (right) or -1 (left). */
    launch(direction) {
        const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // ±30°
        const dir   = direction || (Math.random() > 0.5 ? 1 : -1);
        this.vx = this.speed * Math.cos(angle) * dir;
        this.vy = this.speed * Math.sin(angle);
    }

    /** Move ball back to centre and reset speed. */
    reset(baseSpeed) {
        this.x      = CONFIG.CANVAS_WIDTH / 2;
        this.y      = CONFIG.CANVAS_HEIGHT / 2;
        this.speed  = baseSpeed || CONFIG.BALL_INITIAL_SPEED;
        this.radius = CONFIG.BALL_RADIUS;
        this.vx     = 0;
        this.vy     = 0;
    }

    /** Advance position and bounce off top / bottom walls. */
    update(dt) {
        const f = dt / 16.667;          // normalise to 60 fps
        this.x += this.vx * f;
        this.y += this.vy * f;

        if (this.y - this.radius <= 0) {
            this.y  = this.radius;
            this.vy = Math.abs(this.vy);
        }
        if (this.y + this.radius >= CONFIG.CANVAS_HEIGHT) {
            this.y  = CONFIG.CANVAS_HEIGHT - this.radius;
            this.vy = -Math.abs(this.vy);
        }
    }

    getSpeed() {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }

    setSpeed(s) {
        const cur = this.getSpeed();
        if (cur > 0) {
            const r = s / cur;
            this.vx *= r;
            this.vy *= r;
        }
        this.speed = s;
    }

    increaseSpeed(amount) {
        const s = Math.min(this.getSpeed() + amount, CONFIG.BALL_MAX_SPEED);
        this.setSpeed(s);
    }
}
