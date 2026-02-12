/**
 * InputManager — handles keyboard & mouse input and feeds it to paddles.
 */
export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys   = {};
        this.mouseY = canvas.height / 2;

        this._onKeyDown = (e) => {
            this.keys[e.code] = true;
            if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
        };
        this._onKeyUp = (e) => {
            this.keys[e.code] = false;
        };
        this._onMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        };

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup',   this._onKeyUp);
        canvas.addEventListener('mousemove', this._onMouseMove);
    }

    /** Move the given paddle according to the chosen control scheme. */
    updatePaddle(paddle, controlType, dt) {
        switch (controlType) {
            case 'wasd':
                if (this.keys['KeyW']) paddle.moveUp(dt);
                if (this.keys['KeyS']) paddle.moveDown(dt);
                break;
            case 'arrows':
                if (this.keys['ArrowUp'])   paddle.moveUp(dt);
                if (this.keys['ArrowDown']) paddle.moveDown(dt);
                break;
            case 'mouse':
                paddle.moveTo(this.mouseY);
                break;
        }
    }

    isPressed(code) { return !!this.keys[code]; }

    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup',   this._onKeyUp);
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
    }
}
