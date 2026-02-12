/* ── Turbo Pong — entry point ────────────────────────── */

import { CONFIG } from './config.js';
import { Game }   from './game.js';
import { UI }     from './ui.js';

// Canvas setup
const canvas  = document.getElementById('game-canvas');
canvas.width  = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

// Wire UI → Game
let game;
const ui = new UI((settings) => {
    if (!game) game = new Game(canvas, ui);
    game.start(settings);
});
