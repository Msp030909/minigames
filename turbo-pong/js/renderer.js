import { CONFIG } from './config.js';

/**
 * Renderer — draws every visual element on the <canvas>.
 */
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx    = canvas.getContext('2d');
    }

    /* ── background & court ── */

    clear() {
        const ctx = this.ctx;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }

    drawCenterLine() {
        const ctx = this.ctx;
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(CONFIG.CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /* ── game objects ── */

    drawPaddle(paddle, color = '#fff') {
        const ctx = this.ctx;
        ctx.shadowColor = color;
        ctx.shadowBlur  = 12;
        ctx.fillStyle   = color;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.shadowBlur = 0;
    }

    drawBall(ball, color = '#fff') {
        const ctx = this.ctx;
        ctx.shadowColor = color;
        ctx.shadowBlur  = 15;
        ctx.fillStyle   = color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    /* ── HUD ── */

    drawScores(left, right) {
        const ctx = this.ctx;
        ctx.fillStyle = '#fff';
        ctx.font      = 'bold 48px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(left,  CONFIG.CANVAS_WIDTH / 4,       60);
        ctx.fillText(right, CONFIG.CANVAS_WIDTH * 3 / 4,   60);
    }

    drawSpeedIndicator(speed) {
        const ctx = this.ctx;
        ctx.fillStyle = '#444';
        ctx.font      = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Speed: ' + speed.toFixed(1), CONFIG.CANVAS_WIDTH - 12, 20);
    }

    drawModifierHUD(modManager) {
        const ctx    = this.ctx;
        const active = modManager.getActiveInfo();

        if (active.length > 0) {
            let y = CONFIG.CANVAS_HEIGHT - 18;
            ctx.textAlign = 'center';
            for (const mod of active) {
                const secs = Math.ceil(mod.remaining / 1000);
                ctx.font      = 'bold 16px sans-serif';
                ctx.fillStyle = '#00ff88';
                ctx.fillText(`${mod.icon} ${mod.name}  — ${secs}s`, CONFIG.CANVAS_WIDTH / 2, y);
                y -= 26;
            }
        } else {
            const secs = Math.ceil(modManager.getTimeUntilNext() / 1000);
            ctx.textAlign = 'center';
            ctx.font      = '13px sans-serif';
            ctx.fillStyle = '#444';
            ctx.fillText(`Next modifier in ${secs}s`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 14);
        }
    }

    /* ── overlays rendered on canvas ── */

    drawCountdown(value) {
        const ctx  = this.ctx;
        const text = value > 0 ? String(value) : 'GO!';
        ctx.textAlign   = 'center';
        ctx.font        = 'bold 72px sans-serif';
        ctx.fillStyle   = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur  = 24;
        ctx.fillText(text, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 24);
        ctx.shadowBlur = 0;
    }

    drawServeNotice() {
        const ctx = this.ctx;
        ctx.textAlign = 'center';
        ctx.font      = '22px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText('Get ready…', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 10);
    }

    drawChaosLabel() {
        const ctx = this.ctx;
        ctx.textAlign = 'left';
        ctx.font      = 'bold 12px sans-serif';
        ctx.fillStyle = '#ff0066';
        ctx.fillText('CHAOS MODE', 12, 20);
    }
}
