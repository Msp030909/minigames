/**
 * UI — wires up the HTML menu overlays and reports user selections
 *       back to the game via the onStartGame callback.
 */
export class UI {
    constructor(onStartGame) {
        this.onStartGame = onStartGame;

        // DOM handles
        this.titleMenu      = document.getElementById('title-menu');
        this.controlsMenu   = document.getElementById('controls-menu');
        this.pauseOverlay   = document.getElementById('pause-overlay');
        this.gameoverMenu   = document.getElementById('gameover-menu');
        this.p2Section      = document.getElementById('p2-controls');
        this.btnStart       = document.getElementById('btn-start');

        // State
        this.playerCount = 0;
        this.chaosMode   = false;
        this.controls    = { 1: null, 2: null };

        this._bind();
    }

    /* ---- Event wiring ---- */

    _bind() {
        // Player‑count buttons
        document.getElementById('btn-1player').addEventListener('click', () => {
            this.playerCount  = 1;
            this.controls[2]  = 'cpu';
            this._openControls();
        });
        document.getElementById('btn-2player').addEventListener('click', () => {
            this.playerCount  = 2;
            this.controls[2]  = null;
            this._openControls();
        });

        // Chaos toggle
        document.getElementById('chaos-toggle').addEventListener('click', () => {
            this.chaosMode = !this.chaosMode;
            document.getElementById('chaos-switch')
                    .classList.toggle('active', this.chaosMode);
        });

        // Control‑selection buttons (delegated)
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const player  = parseInt(btn.dataset.player, 10);
                const control = btn.dataset.control;
                this.controls[player] = control;

                // Highlight this player's selection
                btn.closest('.control-options')
                   .querySelectorAll('.control-btn')
                   .forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                this._checkReady();
            });
        });

        // Start game
        this.btnStart.addEventListener('click', () => {
            if (!this.controls[1] || !this.controls[2]) return;
            this._hideAll();
            this.onStartGame({
                playerCount: this.playerCount,
                chaosMode:   this.chaosMode,
                p1Control:   this.controls[1],
                p2Control:   this.controls[2],
            });
        });

        // Back
        document.getElementById('btn-back').addEventListener('click', () => {
            this._showTitle();
        });

        // Play Again
        document.getElementById('btn-playagain').addEventListener('click', () => {
            this._hideAll();
            this.onStartGame({
                playerCount: this.playerCount,
                chaosMode:   this.chaosMode,
                p1Control:   this.controls[1],
                p2Control:   this.controls[2],
            });
        });

        // Main Menu
        document.getElementById('btn-mainmenu').addEventListener('click', () => {
            this._showTitle();
        });
    }

    /* ---- Menu transitions ---- */

    _openControls() {
        this.titleMenu.classList.add('hidden');
        this.controlsMenu.classList.remove('hidden');

        // Show P2 row only in 2‑player mode
        this.p2Section.classList.toggle('hidden', this.playerCount !== 2);

        // Reset button highlights
        document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('selected'));
        this.controls[1] = null;
        if (this.playerCount === 1) this.controls[2] = 'cpu';
        else this.controls[2] = null;

        this.btnStart.disabled = true;
        this._checkReady();
    }

    _showTitle() {
        this._hideAll();
        this.titleMenu.classList.remove('hidden');
    }

    _hideAll() {
        this.titleMenu.classList.add('hidden');
        this.controlsMenu.classList.add('hidden');
        this.pauseOverlay.classList.add('hidden');
        this.gameoverMenu.classList.add('hidden');
    }

    _checkReady() {
        this.btnStart.disabled = !(this.controls[1] && this.controls[2]);
    }

    /* ---- Called by Game ---- */

    showPause()  { this.pauseOverlay.classList.remove('hidden'); }
    hidePause()  { this.pauseOverlay.classList.add('hidden');    }

    showGameOver(winner, scoreLeft, scoreRight, isCpu) {
        const label = winner === 1
            ? 'Player 1 Wins!'
            : (isCpu ? 'CPU Wins!' : 'Player 2 Wins!');

        document.getElementById('winner-text').textContent = label;
        document.getElementById('final-score').textContent = `${scoreLeft}  —  ${scoreRight}`;
        this.gameoverMenu.classList.remove('hidden');
    }
}
