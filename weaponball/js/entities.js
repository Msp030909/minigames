import { GAME_CONFIG } from "./config.js";
import { distanceSquared, randomDirection, randomRange } from "./utils.js";

let nextBallId = 1;

export class Ball {
  constructor(x, y, options = {}) {
    this.id = nextBallId++;
    this.name = options.name ?? `Ball ${this.id}`;
    this.team = options.team ?? "Alpha";
    this.x = x;
    this.y = y;
    this.scale = Number(options.scale ?? 1);
    this.radius = 16 * this.scale;
    this.health = Number(options.health ?? 500);
    this.maxHealth = this.health;
    this.color = options.color ?? "#6aa3ff";
    this.strokeColor = options.strokeColor ?? "#20365a";
    this.weaponType = options.weaponType ?? "sword";
    this.hasWeapon = options.hasWeapon ?? true;
    this.weaponMode = options.weaponMode ?? "melee";
    this.rpm = Number(options.rpm ?? 1);
    this.damage = Number(options.damage ?? 14);
    this.weaponSize = Number(options.weaponSize ?? 10);
    this.arrowCount = Number(options.arrowCount ?? 1);
    this.acceleration = Number(options.acceleration ?? 220);
    this.maxSpeed = Number(options.maxSpeed ?? 190);
    this.gravityAffected = options.gravityAffected ?? true;
    this.weaponAngle = randomRange(0, Math.PI * 2);
    this.weaponDirection = options.weaponDirection ?? 1;
    this.hitCooldown = new Map();
    this.projectileCooldown = 0;
    this.freezeUntil = 0;
    this.invulnerableUntil = 0;
    this.parryLockUntil = 0;
    this.alive = true;

    const direction = randomDirection();
    const startSpeed = randomRange(70, 140);
    this.vx = direction.x * startSpeed;
    this.vy = direction.y * startSpeed;
  }

  get healthRatio() {
    return this.maxHealth <= 0 ? 0 : this.health / this.maxHealth;
  }

  get weaponOrbitRadius() {
    return this.radius + this.weaponSize + 8;
  }

  get meleeContactRadius() {
    return Math.max(4, this.weaponSize * 0.72);
  }

  update(dt, arena, nowSeconds) {
    if (!this.alive) {
      return;
    }

    if (this.isFrozen(nowSeconds)) {
      this.updateWeapon(dt);
    } else {
      if (this.gravityAffected) {
        this.vy += GAME_CONFIG.gravity * dt;
      }

      if (this.acceleration > 0 && !this.gravityAffected) {
        const speed = Math.hypot(this.vx, this.vy) || 0.0001;
        const nx = this.vx / speed;
        const ny = this.vy / speed;
        this.vx += nx * this.acceleration * dt;
        this.vy += ny * this.acceleration * dt;
      }

      const speed = Math.hypot(this.vx, this.vy);
      const capped = Math.min(this.maxSpeed, GAME_CONFIG.maxBaseSpeed);
      if (speed > capped) {
        const scale = capped / speed;
        this.vx *= scale;
        this.vy *= scale;
      }

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.handleArenaCollisions(arena);
      this.updateWeapon(dt);
    }

    this.hitCooldown.forEach((value, key) => {
      if (value <= nowSeconds) {
        this.hitCooldown.delete(key);
      }
    });

    this.projectileCooldown = Math.max(0, this.projectileCooldown - dt);
  }

  updateWeapon(dt) {
    if (!this.hasWeapon) {
      return;
    }
    const radiansPerSecond = (Math.abs(this.rpm) * Math.PI * 2 * this.weaponDirection) / 60;
    this.weaponAngle = (this.weaponAngle + radiansPerSecond * dt) % (Math.PI * 2);
  }

  weaponPosition() {
    const orbit = this.weaponOrbitRadius;
    return {
      x: this.x + Math.cos(this.weaponAngle) * orbit,
      y: this.y + Math.sin(this.weaponAngle) * orbit
    };
  }

  handleArenaCollisions(arena) {
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.radius > arena.width) {
      this.x = arena.width - this.radius;
      this.vx = -Math.abs(this.vx);
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = Math.abs(this.vy);
    } else if (this.y + this.radius > arena.height) {
      this.y = arena.height - this.radius;
      this.vy = -Math.abs(this.vy);
    }

    if (arena.middleWall.enabled) {
      const wallLeft = arena.middleWall.x - arena.middleWall.thickness / 2;
      const wallRight = arena.middleWall.x + arena.middleWall.thickness / 2;
      const wallTop = arena.middleWall.top;
      const wallBottom = arena.middleWall.bottom;
      const overlapsX = this.x + this.radius >= wallLeft && this.x - this.radius <= wallRight;
      const overlapsY = this.y + this.radius >= wallTop && this.y - this.radius <= wallBottom;

      if (overlapsX && overlapsY) {
        if (this.x < arena.middleWall.x) {
          this.x = wallLeft - this.radius;
          this.vx = -Math.abs(this.vx);
        } else {
          this.x = wallRight + this.radius;
          this.vx = Math.abs(this.vx);
        }
      }
    }
  }

  isFrozen(nowSeconds) {
    return nowSeconds < this.freezeUntil;
  }

  isInvulnerable(nowSeconds) {
    return nowSeconds < this.invulnerableUntil;
  }

  canParry(nowSeconds) {
    return nowSeconds >= this.parryLockUntil;
  }

  triggerParry(nowSeconds, durationSeconds = GAME_CONFIG.parryDuration) {
    this.weaponDirection *= -1;
    this.freezeUntil = nowSeconds + durationSeconds;
    this.invulnerableUntil = nowSeconds + durationSeconds;
    this.parryLockUntil = nowSeconds + durationSeconds + 0.08;
  }

  canDamage(targetId, nowSeconds) {
    const key = `${targetId}`;
    const lockedUntil = this.hitCooldown.get(key) ?? 0;
    return lockedUntil <= nowSeconds;
  }

  lockDamage(targetId, nowSeconds, cooldown = 0.2) {
    this.hitCooldown.set(`${targetId}`, nowSeconds + cooldown);
  }

  applyDamage(amount, nowSeconds = Number.POSITIVE_INFINITY) {
    if (!this.alive) {
      return false;
    }
    if (this.isInvulnerable(nowSeconds)) {
      return false;
    }
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.alive = false;
    }
    return true;
  }

  draw(ctx, nowSeconds) {
    if (!this.alive) {
      return;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();

    if (this.hasWeapon) {
      const wp = this.weaponPosition();
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(wp.x, wp.y);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(wp.x, wp.y, this.meleeContactRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.weaponMode === "projectile" ? "#ffd39f" : "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#353535";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const hpText = `${Math.ceil(this.health)}/${Math.ceil(this.maxHealth)}`;
    ctx.font = "12px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#09101f";
    ctx.fillRect(this.x - 34, this.y - 8, 68, 16);
    ctx.fillStyle = this.healthRatio > 0.35 ? "#73ff9a" : "#ffc65d";
    ctx.fillText(hpText, this.x, this.y);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "10px Segoe UI";
    ctx.fillText(this.team, this.x, this.y - this.radius - 10);

    if (this.freezeUntil > nowSeconds) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  static bodyOverlap(a, b) {
    const r = a.radius + b.radius;
    return distanceSquared(a.x, a.y, b.x, b.y) <= r * r;
  }

  static separate(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy) || 0.0001;
    const minDist = a.radius + b.radius;

    if (distance >= minDist) {
      return;
    }

    const overlap = minDist - distance;
    const nx = dx / distance;
    const ny = dy / distance;

    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;

    const av = a.vx * nx + a.vy * ny;
    const bv = b.vx * nx + b.vy * ny;
    const impulse = bv - av;

    a.vx += impulse * nx;
    a.vy += impulse * ny;
    b.vx -= impulse * nx;
    b.vy -= impulse * ny;
  }
}
