import { CONFIG }          from './config.js';
import { Ball }            from './ball.js';
import { Paddle }          from './paddle.js';
import { InputManager }    from './input.js';
import { CPU }             from './cpu.js';
import { ModifierManager } from './modifiers.js';
import { Renderer }        from './renderer.js';

/**
 * Game — owns the main loop, all game objects, physics, scoring,
 *        modifier timing, and rendering.
 */
export class Game {
    constructor(canvas, ui) {
        this.canvas   = canvas;
        this.ui       = ui;
        this.renderer = new Renderer(canvas);
        this.input    = new InputManager(canvas);

        this.running = false;
        this.paused  = false;

        // Game objects
        this.paddleLeft  = new Paddle(true);
        this.paddleRight = new Paddle(false);
        this.balls       = [];
        this.mainBall    = null;

        // Settings (filled by start())
        this.p1Control = 'wasd';
        this.p2Control = 'arrows';
        this.isCpu     = false;
        this.cpu       = null;
        this.chaosMode = false;

        // Score
        this.scoreLeft  = 0;
        this.scoreRight = 0;

        // State machine: idle | countdown | serving | playing | gameover
        this.state          = 'idle';
        this.countdownValue = 3;
        this.countdownTimer = 0;
        this.serveTimer     = 0;
        this.serveDirection = 0;

        // Progressive speed
        this.baseSpeed  = CONFIG.BALL_INITIAL_SPEED;
        this.speedTimer = 0;

        // Modifiers
        this.modManager = null;

        // Loop bookkeeping
        this.lastTimestamp = 0;
        this._boundLoop    = this._loop.bind(this);

        // Pause key (one listener for the lifetime of the game)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.paused || this.state === 'playing' || this.state === 'serving') {
                    this.togglePause();
                }
            }
        });
    }

    /* ============================================================
     *  PUBLIC API
     * ============================================================ */

    start(settings) {
        this.p1Control = settings.p1Control;
        this.p2Control = settings.p2Control;
        this.isCpu     = settings.p2Control === 'cpu';
        this.chaosMode = settings.chaosMode;
        this.cpu       = this.isCpu ? new CPU() : null;

        // Reset scores & speed
        this.scoreLeft  = 0;
        this.scoreRight = 0;
        this.baseSpeed  = CONFIG.BALL_INITIAL_SPEED;
        this.speedTimer = 0;

        // Reset paddles
        this.paddleLeft.reset();
        this.paddleRight.reset();

        // Create the main ball
        this.mainBall = new Ball();
        this.balls    = [this.mainBall];

        // Modifier system
        this.modManager = new ModifierManager(this.chaosMode);

        // Begin countdown
        this.state          = 'countdown';
        this.countdownValue = 3;
        this.countdownTimer = 0;
        this.paused         = false;

        if (!this.running) {
            this.running       = true;
            this.lastTimestamp = performance.now();
            requestAnimationFrame(this._boundLoop);
        }
    }

    togglePause() {
        if (this.state === 'gameover' || this.state === 'idle' || this.state === 'countdown') return;
        this.paused = !this.paused;
        if (this.paused) {
            this.ui.showPause();
        } else {
            this.ui.hidePause();
            this.lastTimestamp = performance.now();
        }
    }

    /* ============================================================
     *  MAIN LOOP
     * ============================================================ */

    _loop(timestamp) {
        if (!this.running) return;
        const dt = Math.min(timestamp - this.lastTimestamp, 50);
        this.lastTimestamp = timestamp;

        if (!this.paused) this._update(dt);
        this._render();

        requestAnimationFrame(this._boundLoop);
    }

    _update(dt) {
        switch (this.state) {
            case 'countdown': this._updateCountdown(dt); break;
            case 'serving':
                this._updateServe(dt);
                this._updatePaddles(dt);
                this.modManager.update(this, dt);
                break;
            case 'playing':   this._updatePlaying(dt);   break;
        }
    }

    /* ---- state handlers ---- */

    _updateCountdown(dt) {
        this.countdownTimer += dt;
        if (this.countdownTimer >= 1000) {
            this.countdownTimer -= 1000;
            this.countdownValue--;
            if (this.countdownValue <= 0) {
                this.mainBall.reset(this.baseSpeed);
                this.mainBall.launch(Math.random() > 0.5 ? 1 : -1);
                this.state = 'playing';
            }
        }
    }

    _updateServe(dt) {
        this.serveTimer -= dt;
        if (this.serveTimer <= 0) {
            this.mainBall.reset(this.baseSpeed);
            this.mainBall.launch(this.serveDirection);
            this.state = 'playing';
        }
    }

    _updatePlaying(dt) {
        this._updatePaddles(dt);

        // Balls
        for (const b of this.balls) b.update(dt);

        // Collisions
        this._checkCollisions();

        // Scoring
        this._checkScoring();

        // Progressive speed-up
        this.speedTimer += dt;
        if (this.speedTimer >= CONFIG.BALL_SPEED_INCREASE_INTERVAL) {
            this.speedTimer -= CONFIG.BALL_SPEED_INCREASE_INTERVAL;
            this.baseSpeed = Math.min(this.baseSpeed + CONFIG.BALL_SPEED_INCREASE_AMOUNT,
                                      CONFIG.BALL_MAX_SPEED);
            for (const b of this.balls) {
                if (b.getSpeed() > 0) b.increaseSpeed(CONFIG.BALL_SPEED_INCREASE_AMOUNT);
            }
        }

        // Modifiers
        this.modManager.update(this, dt);
    }

    /* ---- paddle input ---- */

    _updatePaddles(dt) {
        this.input.updatePaddle(this.paddleLeft, this.p1Control, dt);

        if (this.isCpu) {
            this.cpu.update(this.paddleRight, this.balls, dt);
        } else {
            this.input.updatePaddle(this.paddleRight, this.p2Control, dt);
        }

        this.paddleLeft.applyGravity(dt);
        this.paddleRight.applyGravity(dt);
    }

    /* ---- collision ---- */

    _checkCollisions() {
        for (const ball of this.balls) {
            if (this._hits(ball, this.paddleLeft))  this._bounce(ball, this.paddleLeft,  1);
            if (this._hits(ball, this.paddleRight)) this._bounce(ball, this.paddleRight, -1);
        }
    }

    _hits(ball, p) {
        return (
            ball.x - ball.radius <= p.x + p.width &&
            ball.x + ball.radius >= p.x &&
            ball.y + ball.radius >= p.y &&
            ball.y - ball.radius <= p.y + p.height
        );
    }

    _bounce(ball, paddle, dirX) {
        // Prevent double-triggering on the same paddle
        if ((dirX > 0 && ball.vx > 0) || (dirX < 0 && ball.vx < 0)) return;

        const rel   = (ball.y - paddle.getCenterY()) / (paddle.height / 2);
        const angle = rel * (Math.PI / 3.5);
        const speed = Math.max(ball.getSpeed(), CONFIG.BALL_MIN_SPEED);

        ball.vx = speed * Math.cos(angle) * dirX;
        ball.vy = speed * Math.sin(angle);

        // Push ball out of the paddle
        ball.x = dirX > 0
            ? paddle.x + paddle.width + ball.radius
            : paddle.x - ball.radius;
    }

    /* ---- scoring ---- */

    _checkScoring() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const b = this.balls[i];

            if (b.x + b.radius < 0) {
                // Past left edge → right player scores
                if (b.isExtra) { this.balls.splice(i, 1); continue; }
                this.scoreRight++;
                this._afterScore(Math.random() > 0.5 ? 1 : -1);
                return;                          // only one score per frame
            }
            if (b.x - b.radius > CONFIG.CANVAS_WIDTH) {
                // Past right edge → left player scores
                if (b.isExtra) { this.balls.splice(i, 1); continue; }
                this.scoreLeft++;
                this._afterScore(Math.random() > 0.5 ? 1 : -1);
                return;
            }
        }
    }

    _afterScore(dir) {
        if (this.scoreLeft >= CONFIG.WINNING_SCORE)  { this._gameOver(1); return; }
        if (this.scoreRight >= CONFIG.WINNING_SCORE) { this._gameOver(2); return; }

        this.state          = 'serving';
        this.serveTimer     = CONFIG.SERVE_DELAY;
        this.serveDirection = dir;
        this.mainBall.reset(this.baseSpeed);
    }

    _gameOver(winner) {
        this.state = 'gameover';
        // Deactivate all modifiers cleanly
        if (this.modManager) {
            for (const e of this.modManager.activeModifiers) e.modifier.deactivate(this);
            this.modManager.reset();
        }
        this.ui.showGameOver(winner, this.scoreLeft, this.scoreRight, this.isCpu);
    }

    /* ============================================================
     *  RENDERING
     * ============================================================ */

    _render() {
        const r = this.renderer;
        r.clear();
        r.drawCenterLine();

        // Paddles
        r.drawPaddle(this.paddleLeft,  '#00ff88');
        r.drawPaddle(this.paddleRight, '#00ccff');

        // Balls
        for (const b of this.balls) {
            r.drawBall(b, b.isExtra ? '#ffaa00' : '#ffffff');
        }

        // Scores
        r.drawScores(this.scoreLeft, this.scoreRight);

        // Speed
        if (this.mainBall && this.state === 'playing') {
            r.drawSpeedIndicator(this.mainBall.getSpeed());
        }

        // Chaos label
        if (this.chaosMode) r.drawChaosLabel();

        // State overlays
        if (this.state === 'countdown') r.drawCountdown(this.countdownValue);
        if (this.state === 'serving')   r.drawServeNotice();

        // Modifier HUD
        if (this.modManager && this.state !== 'countdown' && this.state !== 'gameover') {
            r.drawModifierHUD(this.modManager);
        }
    }
}
