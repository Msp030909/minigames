class Flagpole {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 80;
    }

    isColliding(obj) {
        return obj.x < this.x + this.width &&
               obj.x + obj.width > this.x &&
               obj.y < this.y + this.height &&
               obj.y + obj.height > this.y;
    }

    draw(ctx) {
        // Pole
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Flag
        ctx.fillStyle = '#FF1493';
        ctx.fillRect(this.x + this.width, this.y, 32, 24);

        /* Sprite rendering (uncomment to use):
           ctx.drawImage(flagpoleSprite, this.x, this.y, this.width, this.height);
           ctx.drawImage(flagSprite, this.x + this.width, this.y, 32, 24);
        */
    }
}
