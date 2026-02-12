import { CONFIG } from './config.js';

/**
 * Simple CPU opponent that tracks the most threatening ball
 * and moves the paddle toward a predicted intercept point.
 */
export class CPU {
    constructor() {
        this.targetY        = CONFIG.CANVAS_HEIGHT / 2;
        this.reactionTimer  = 0;
        this.error          = 0;
    }

    update(paddle, balls, dt) {
        this.reactionTimer += dt;

        // Recalculate target on a timer so the CPU isn't instant
        if (this.reactionTimer >= CONFIG.CPU_REACTION_INTERVAL) {
            this.reactionTimer = 0;
            this.error   = (Math.random() - 0.5) * 2 * CONFIG.CPU_PREDICTION_ERROR;
            this.targetY = this._findTarget(balls, paddle);
        }

        // Move toward target
        const center = paddle.getCenterY();
        const target = this.targetY + this.error;
        const diff   = target - center;
        const dead   = 8;
        const f      = dt / 16.667;

        if (Math.abs(diff) > dead) {
            const move = Math.min(CONFIG.CPU_SPEED * f, Math.abs(diff));
            paddle.y += diff > 0 ? move : -move;
            if (paddle.gravityAffected) paddle.vy = diff > 0 ? 1 : -1;
            paddle.constrain();
        }
    }

    /* ---- private helpers ---- */

    _findTarget(balls, paddle) {
        let best     = null;
        let bestDist = Infinity;

        for (const ball of balls) {
            if (!ball.active) continue;
            if (ball.vx > 0) {                       // approaching CPU side
                const dist = paddle.x - ball.x;
                if (dist > 0 && dist < bestDist) {
                    bestDist = dist;
                    best     = ball;
                }
            }
        }

        if (!best) return CONFIG.CANVAS_HEIGHT / 2;   // idle — aim centre

        if (bestDist > CONFIG.CPU_REACTION_DISTANCE) return best.y;

        return this._predictY(best, paddle.x);
    }

    _predictY(ball, targetX) {
        const vx = ball.vx;
        if (vx <= 0) return ball.y;

        let y  = ball.y;
        let vy = ball.vy;
        const steps = (targetX - ball.x) / vx;
        y += vy * steps;

        const h = CONFIG.CANVAS_HEIGHT;
        // Reflect off top / bottom to keep prediction in bounds
        while (y < 0 || y > h) {
            if (y < 0) y = -y;
            if (y > h) y = 2 * h - y;
        }
        return y;
    }
}
