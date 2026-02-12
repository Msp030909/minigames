/* ==============================================
 *  TURBO PONG — Configuration
 * ==============================================
 *  Tweak any value below to customise gameplay.
 *  All times are in milliseconds unless noted.
 * ============================================== */

export const CONFIG = {

    // ── Canvas ────────────────────────────────
    CANVAS_WIDTH:  900,
    CANVAS_HEIGHT: 600,

    // ── Scoring ──────────────────────────────
    WINNING_SCORE: 11,

    // ── Ball ─────────────────────────────────
    BALL_RADIUS:        8,
    BALL_INITIAL_SPEED: 5,       // pixels / frame @ 60 fps
    BALL_MIN_SPEED:     3,
    BALL_MAX_SPEED:     14,

    // How often (ms) the ball speeds up and by how much
    BALL_SPEED_INCREASE_INTERVAL: 5000,
    BALL_SPEED_INCREASE_AMOUNT:   0.25,

    // ── Paddle ───────────────────────────────
    PADDLE_WIDTH:   14,
    PADDLE_HEIGHT: 100,
    PADDLE_SPEED:    7,          // pixels / frame @ 60 fps
    PADDLE_MARGIN:  30,          // gap from screen edge

    // ── Serve ────────────────────────────────
    SERVE_DELAY: 1000,           // pause after a point is scored

    // ── Modifiers (Normal Mode) ──────────────
    MODIFIER_INTERVAL: 30000,    // time before a modifier activates
    MODIFIER_DURATION: 20000,    // how long a modifier lasts
    MODIFIER_COOLDOWN: 40000,    // downtime after a modifier ends

    // ── Modifiers (Chaos Mode) ───────────────
    CHAOS_COOLDOWN:    10000,    // shorter gap between modifiers

    // ── Gravity Modifier ─────────────────────
    GRAVITY_STRENGTH:  0.15,     // downward accel per frame

    // ── CPU / AI ─────────────────────────────
    CPU_SPEED:              5.5,
    CPU_REACTION_INTERVAL: 150,  // ms between AI recalculations
    CPU_PREDICTION_ERROR:   30,  // random offset in pixels
    CPU_REACTION_DISTANCE: 450,  // px — starts predicting inside this range
};
