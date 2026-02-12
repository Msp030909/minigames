import { CONFIG } from './config.js';
import { Ball }   from './ball.js';

/* ======================================================
 *  MODIFIER REGISTRY
 * ======================================================
 *  To add a new modifier just call:
 *
 *    registerModifier({
 *        name:        'Cool Name',
 *        description: 'What it does',
 *        icon:        '🎉',
 *        activate   (game)     { ... },
 *        deactivate (game)     { ... },
 *        update     (game, dt) { ... },   // called every frame
 *    });
 *
 *  The game object exposes:
 *    game.balls, game.paddleLeft, game.paddleRight,
 *    game.baseSpeed, and anything else on the Game class.
 * ====================================================== */

const MODIFIER_REGISTRY = [];

export function registerModifier(mod) {
    MODIFIER_REGISTRY.push(mod);
}

export function getModifierRegistry() {
    return [...MODIFIER_REGISTRY];
}

// ─── Built‑in modifiers ──────────────────────────────────

registerModifier({
    name: 'Multi-Ball',
    description: 'Extra balls join the fray!',
    icon: '🔮',
    activate(game) {
        for (let i = 0; i < 2; i++) {
            const b   = new Ball();
            b.isExtra = true;
            b.speed   = game.baseSpeed;
            b.y       = CONFIG.CANVAS_HEIGHT * (0.25 + Math.random() * 0.5);
            b.launch(Math.random() > 0.5 ? 1 : -1);
            game.balls.push(b);
        }
    },
    deactivate(game) {
        game.balls = game.balls.filter(b => !b.isExtra);
    },
    update() { },
});

registerModifier({
    name: 'Giant Ball',
    description: 'The ball is enormous!',
    icon: '🟡',
    activate(game) {
        for (const b of game.balls) b.radius = CONFIG.BALL_RADIUS * 2.5;
    },
    deactivate(game) {
        for (const b of game.balls) b.radius = CONFIG.BALL_RADIUS;
    },
    update(game) {
        for (const b of game.balls) b.radius = CONFIG.BALL_RADIUS * 2.5;
    },
});

registerModifier({
    name: 'Tiny Ball',
    description: 'The ball is minuscule!',
    icon: '🔹',
    activate(game) {
        for (const b of game.balls) b.radius = Math.max(3, CONFIG.BALL_RADIUS * 0.4);
    },
    deactivate(game) {
        for (const b of game.balls) b.radius = CONFIG.BALL_RADIUS;
    },
    update(game) {
        for (const b of game.balls) b.radius = Math.max(3, CONFIG.BALL_RADIUS * 0.4);
    },
});

registerModifier({
    name: 'Small Paddles',
    description: 'Paddles shrink in half!',
    icon: '📏',
    activate(game) {
        game.paddleLeft.height  = CONFIG.PADDLE_HEIGHT * 0.5;
        game.paddleRight.height = CONFIG.PADDLE_HEIGHT * 0.5;
    },
    deactivate(game) {
        game.paddleLeft.height  = CONFIG.PADDLE_HEIGHT;
        game.paddleRight.height = CONFIG.PADDLE_HEIGHT;
        game.paddleLeft.constrain();
        game.paddleRight.constrain();
    },
    update() { },
});

registerModifier({
    name: 'Gravity',
    description: 'Paddles are pulled downward!',
    icon: '⬇️',
    activate(game) {
        game.paddleLeft.gravityAffected  = true;
        game.paddleRight.gravityAffected = true;
    },
    deactivate(game) {
        game.paddleLeft.gravityAffected  = false;
        game.paddleRight.gravityAffected = false;
        game.paddleLeft.vy  = 0;
        game.paddleRight.vy = 0;
    },
    update() { },
});

// ─── Modifier Manager ────────────────────────────────────

export class ModifierManager {
    /**
     * @param {boolean} chaosMode  — allow stacking & shorter cooldowns
     */
    constructor(chaosMode) {
        this.chaosMode = chaosMode;
        this.activeModifiers   = [];   // { modifier, remaining }
        this.timeSinceLastEnd  = 0;
        this.timeSinceLastStart = 0;
        this.hasFiredFirst     = false;
        this.inCooldown        = false;
    }

    reset() {
        this.activeModifiers    = [];
        this.timeSinceLastEnd   = 0;
        this.timeSinceLastStart = 0;
        this.hasFiredFirst      = false;
        this.inCooldown         = false;
    }

    update(game, dt) {
        // ── tick active modifiers ──
        for (let i = this.activeModifiers.length - 1; i >= 0; i--) {
            const entry = this.activeModifiers[i];
            entry.remaining -= dt;
            entry.modifier.update(game, dt);

            if (entry.remaining <= 0) {
                entry.modifier.deactivate(game);
                this.activeModifiers.splice(i, 1);

                // In normal mode start cooldown when one ends
                if (!this.chaosMode) {
                    this.inCooldown        = true;
                    this.timeSinceLastEnd  = 0;
                }
            }
        }

        // ── decide whether to activate a new modifier ──
        if (this.chaosMode) {
            this._tickChaos(game, dt);
        } else {
            this._tickNormal(game, dt);
        }
    }

    /* ---- Normal mode: one modifier at a time ---- */

    _tickNormal(game, dt) {
        if (this.activeModifiers.length > 0) return;       // one at a time

        if (this.inCooldown) {
            this.timeSinceLastEnd += dt;
            if (this.timeSinceLastEnd >= CONFIG.MODIFIER_COOLDOWN) {
                this.inCooldown = false;
                // Fire immediately after cooldown
                this._activateRandom(game);
            }
            return;
        }

        // Waiting for the first (or next‑after‑cooldown) modifier
        this.timeSinceLastStart += dt;
        if (this.timeSinceLastStart >= CONFIG.MODIFIER_INTERVAL) {
            this._activateRandom(game);
            this.timeSinceLastStart = 0;
        }
    }

    /* ---- Chaos mode: overlapping modifiers ---- */

    _tickChaos(game, dt) {
        this.timeSinceLastStart += dt;

        const interval = this.hasFiredFirst
            ? CONFIG.CHAOS_COOLDOWN             // subsequent: short gap
            : CONFIG.MODIFIER_INTERVAL;         // first: normal wait

        if (this.timeSinceLastStart >= interval) {
            this._activateRandom(game);
            this.timeSinceLastStart = 0;
            this.hasFiredFirst = true;
        }
    }

    /* ---- Shared helpers ---- */

    _activateRandom(game) {
        const activeNames = new Set(this.activeModifiers.map(a => a.modifier.name));
        const available   = MODIFIER_REGISTRY.filter(m => !activeNames.has(m.name));
        if (available.length === 0) return;

        const pick = available[Math.floor(Math.random() * available.length)];
        pick.activate(game);
        this.activeModifiers.push({
            modifier:  pick,
            remaining: CONFIG.MODIFIER_DURATION,
        });
    }

    /** Data for the HUD. */
    getActiveInfo() {
        return this.activeModifiers.map(a => ({
            name:      a.modifier.name,
            icon:      a.modifier.icon,
            remaining: a.remaining,
        }));
    }

    /** Approximate seconds until the next modifier fires. */
    getTimeUntilNext() {
        if (!this.chaosMode) {
            if (this.activeModifiers.length > 0) {
                // Currently active — time remaining + cooldown
                return this.activeModifiers[0].remaining + CONFIG.MODIFIER_COOLDOWN;
            }
            if (this.inCooldown) {
                return Math.max(0, CONFIG.MODIFIER_COOLDOWN - this.timeSinceLastEnd);
            }
            return Math.max(0, CONFIG.MODIFIER_INTERVAL - this.timeSinceLastStart);
        }

        // Chaos
        const interval = this.hasFiredFirst ? CONFIG.CHAOS_COOLDOWN : CONFIG.MODIFIER_INTERVAL;
        return Math.max(0, interval - this.timeSinceLastStart);
    }

    isActive() {
        return this.activeModifiers.length > 0;
    }
}
