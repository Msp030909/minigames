import { GAME_CONFIG } from "./config.js";
import { Projectile } from "./projectiles.js";
import { distanceSquared } from "./utils.js";

function meleeHit(attacker, target) {
  if (!attacker.hasWeapon || attacker.weaponMode !== "melee") {
    return false;
  }
  const wp = attacker.weaponPosition();
  const r = attacker.meleeContactRadius + target.radius;
  return distanceSquared(wp.x, wp.y, target.x, target.y) <= r * r;
}

function bodyHit(attacker, target) {
  const r = attacker.radius + target.radius;
  return distanceSquared(attacker.x, attacker.y, target.x, target.y) <= r * r;
}

function weaponWeaponHit(a, b) {
  if (!a.hasWeapon || !b.hasWeapon) {
    return false;
  }
  const ap = a.weaponPosition();
  const bp = b.weaponPosition();
  const r = a.meleeContactRadius + b.meleeContactRadius;
  return distanceSquared(ap.x, ap.y, bp.x, bp.y) <= r * r;
}

function damageFromAttacker(attacker) {
  if (attacker.weaponType === "unarmed") {
    const speed = Math.hypot(attacker.vx, attacker.vy);
    return attacker.damage + speed * 0.045;
  }
  return attacker.damage;
}

function applyOnHit(attacker) {
  switch (attacker.weaponType) {
    case "sword":
      attacker.damage += 1;
      break;
    case "dagger":
      attacker.rpm += 1;
      break;
    case "bow":
      attacker.arrowCount += 1;
      break;
    case "unarmed":
      attacker.maxSpeed += 10;
      break;
    default:
      break;
  }
}

function trySpawnProjectile(attacker, projectiles) {
  if (!attacker.hasWeapon || attacker.weaponMode !== "projectile") {
    return;
  }
  if (attacker.projectileCooldown > 0) {
    return;
  }

  const shotCount = Math.max(1, Math.floor(attacker.arrowCount));
  const angleSpread = shotCount > 1 ? 0.08 : 0;
  const centerOffset = (shotCount - 1) / 2;
  const wp = attacker.weaponPosition();

  for (let i = 0; i < shotCount; i += 1) {
    const offset = (i - centerOffset) * angleSpread;
    const angle = attacker.weaponAngle + offset;
    const vx = Math.cos(angle) * GAME_CONFIG.projectileSpeed;
    const vy = Math.sin(angle) * GAME_CONFIG.projectileSpeed;
    const projectile = new Projectile(
      attacker.id,
      wp.x,
      wp.y,
      vx,
      vy,
      damageFromAttacker(attacker),
      attacker.color,
      4 + attacker.scale,
      GAME_CONFIG.projectileLife
    );
    projectiles.push(projectile);
  }

  const fireRate = Math.max(0.2, attacker.rpm);
  attacker.projectileCooldown = 60 / (fireRate * Math.max(1, shotCount));
}

export function handleCombat(state, dt, nowSeconds) {
  const { balls, projectiles, arena } = state;

  for (const ball of balls) {
    if (!ball.alive) {
      continue;
    }
    trySpawnProjectile(ball, projectiles);
  }

  for (let i = 0; i < balls.length; i += 1) {
    const a = balls[i];
    if (!a.alive || a.isFrozen(nowSeconds)) {
      continue;
    }

    for (let j = i + 1; j < balls.length; j += 1) {
      const b = balls[j];
      if (!b.alive || a.team === b.team) {
        continue;
      }

      if (b.isFrozen(nowSeconds)) {
        continue;
      }

      if (weaponWeaponHit(a, b) && a.canParry(nowSeconds) && b.canParry(nowSeconds)) {
        a.triggerParry(nowSeconds, GAME_CONFIG.parryDuration);
        b.triggerParry(nowSeconds, GAME_CONFIG.parryDuration);
        state.parryCount += 1;
        continue;
      }

      if (a.constructor.bodyOverlap(a, b)) {
        a.constructor.separate(a, b);
      }

      const aCanHit = a.canDamage(b.id, nowSeconds);
      const bCanHit = b.canDamage(a.id, nowSeconds);

      const aHitByWeapon = meleeHit(a, b);
      const bHitByWeapon = meleeHit(b, a);

      const aBodyOnly = !a.hasWeapon && bodyHit(a, b);
      const bBodyOnly = !b.hasWeapon && bodyHit(b, a);

      if (aCanHit && (aHitByWeapon || aBodyOnly)) {
        const damage = damageFromAttacker(a);
        const landed = b.applyDamage(damage, nowSeconds);
        if (landed) {
          a.lockDamage(b.id, nowSeconds);
          applyOnHit(a);
        }
      }

      if (bCanHit && (bHitByWeapon || bBodyOnly)) {
        const damage = damageFromAttacker(b);
        const landed = a.applyDamage(damage, nowSeconds);
        if (landed) {
          b.lockDamage(a.id, nowSeconds);
          applyOnHit(b);
        }
      }
    }
  }

  for (const projectile of projectiles) {
    projectile.update(dt);
    if (!projectile.active) {
      continue;
    }

    if (
      projectile.x < 0 ||
      projectile.x > arena.width ||
      projectile.y < 0 ||
      projectile.y > arena.height
    ) {
      projectile.active = false;
      continue;
    }

    if (arena.middleWall.enabled) {
      const wallLeft = arena.middleWall.x - arena.middleWall.thickness / 2;
      const wallRight = arena.middleWall.x + arena.middleWall.thickness / 2;
      if (
        projectile.x >= wallLeft &&
        projectile.x <= wallRight &&
        projectile.y >= arena.middleWall.top &&
        projectile.y <= arena.middleWall.bottom
      ) {
        projectile.active = false;
        continue;
      }
    }

    for (const ball of balls) {
      if (!ball.alive || projectile.ownerId === ball.id) {
        continue;
      }
      if (ball.isInvulnerable(nowSeconds)) {
        continue;
      }
      const owner = balls.find((candidate) => candidate.id === projectile.ownerId);
      if (!owner || owner.team === ball.team) {
        continue;
      }
      if (projectile.checkBallHit(ball)) {
        ball.applyDamage(projectile.damage, nowSeconds);
        projectile.active = false;
        if (owner.alive) {
          applyOnHit(owner);
        }
        break;
      }
    }
  }

  state.projectiles = state.projectiles.filter((projectile) => projectile.active);
  state.balls = state.balls.filter((ball) => ball.alive);
}
