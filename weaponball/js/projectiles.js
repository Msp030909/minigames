import { distanceSquared } from "./utils.js";

export class Projectile {
  constructor(ownerId, x, y, vx, vy, damage, color, radius = 4, life = 3.2) {
    this.ownerId = ownerId;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.radius = radius;
    this.life = life;
    this.color = color;
    this.active = true;
  }

  update(dt) {
    if (!this.active) {
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
    }
  }

  checkBallHit(ball) {
    if (!this.active || !ball.alive || ball.id === this.ownerId) {
      return false;
    }
    const hitDist = this.radius + ball.radius;
    return distanceSquared(this.x, this.y, ball.x, ball.y) <= hitDist * hitDist;
  }

  draw(ctx) {
    if (!this.active) {
      return;
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
