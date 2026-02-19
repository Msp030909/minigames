import { clonePreset, GAME_CONFIG, getPresetList } from "./config.js";
import { Ball } from "./entities.js";
import { handleCombat } from "./combat.js";
import { clamp, randomRange } from "./utils.js";

const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");

const ui = {
  arenaWidth: document.getElementById("arena-width"),
  arenaHeight: document.getElementById("arena-height"),
  wallToggle: document.getElementById("middle-wall-toggle"),
  wallThickness: document.getElementById("middle-wall-thickness"),
  wallLength: document.getElementById("middle-wall-length"),
  arenaWidthValue: document.getElementById("arena-width-value"),
  arenaHeightValue: document.getElementById("arena-height-value"),
  wallToggleValue: document.getElementById("middle-wall-value"),
  wallThicknessValue: document.getElementById("middle-wall-thickness-value"),
  wallLengthValue: document.getElementById("middle-wall-length-value"),
  presetButtons: document.getElementById("preset-buttons"),

  presetSelect: document.getElementById("preset-select"),
  ballName: document.getElementById("ball-name"),
  ballTeam: document.getElementById("ball-team"),
  ballColor: document.getElementById("ball-color"),
  ballHealth: document.getElementById("ball-health"),
  ballScale: document.getElementById("ball-scale"),
  ballHasWeapon: document.getElementById("ball-has-weapon"),
  weaponMode: document.getElementById("weapon-mode"),
  weaponType: document.getElementById("weapon-type"),
  weaponRpm: document.getElementById("weapon-rpm"),
  weaponDamage: document.getElementById("weapon-damage"),
  weaponSize: document.getElementById("weapon-size"),
  arrowCount: document.getElementById("arrow-count"),
  gravityAffected: document.getElementById("gravity-affected"),
  acceleration: document.getElementById("acceleration"),
  addBallBtn: document.getElementById("add-ball-btn"),
  teamBallSelect: document.getElementById("team-ball-select"),
  teamChangeSelect: document.getElementById("team-change-select"),
  setTeamBtn: document.getElementById("set-team-btn"),
  clearBallsBtn: document.getElementById("clear-balls-btn"),

  ballCount: document.getElementById("ball-count"),
  projectileCount: document.getElementById("projectile-count"),
  fps: document.getElementById("fps"),
  parryCount: document.getElementById("parry-count")
};

const state = {
  balls: [],
  projectiles: [],
  arena: {
    width: GAME_CONFIG.arenaWidth,
    height: GAME_CONFIG.arenaHeight,
    middleWall: {
      enabled: GAME_CONFIG.middleWallEnabled,
      x: GAME_CONFIG.arenaWidth / 2,
      thickness: GAME_CONFIG.middleWallThickness,
      length: GAME_CONFIG.middleWallLength,
      top: 0,
      bottom: GAME_CONFIG.middleWallLength
    }
  },
  parryCount: 0,
  fpsCounter: {
    elapsed: 0,
    frames: 0,
    current: 0
  }
};

function refreshWallBounds() {
  const length = clamp(state.arena.middleWall.length, 20, state.arena.height);
  state.arena.middleWall.length = length;
  const top = (state.arena.height - length) / 2;
  state.arena.middleWall.top = top;
  state.arena.middleWall.bottom = top + length;
}

function resizeArena(width, height) {
  state.arena.width = Number(width);
  state.arena.height = Number(height);
  state.arena.middleWall.x = state.arena.width / 2;
  refreshWallBounds();
  canvas.width = state.arena.width;
  canvas.height = state.arena.height;

  for (const ball of state.balls) {
    ball.x = clamp(ball.x, ball.radius, state.arena.width - ball.radius);
    ball.y = clamp(ball.y, ball.radius, state.arena.height - ball.radius);
  }
}

function randomSpawn(radius) {
  const margin = radius + 10;
  return {
    x: randomRange(margin, state.arena.width - margin),
    y: randomRange(margin, state.arena.height - margin)
  };
}

function addBallFromConfig(config) {
  const radius = 16 * Number(config.scale ?? 1);
  let attempts = 0;
  let spawn = randomSpawn(radius);

  while (attempts < 35) {
    const overlapping = state.balls.some((ball) => {
      const dx = spawn.x - ball.x;
      const dy = spawn.y - ball.y;
      return dx * dx + dy * dy < (radius + ball.radius + 10) ** 2;
    });

    if (!overlapping) {
      break;
    }
    spawn = randomSpawn(radius);
    attempts += 1;
  }

  const ball = new Ball(spawn.x, spawn.y, config);
  state.balls.push(ball);
  refreshBallPicker();
}

function applyPresetToForm(key) {
  const preset = clonePreset(key);
  ui.ballName.value = preset.name;
  ui.ballTeam.value = preset.team;
  ui.ballColor.value = preset.color;
  ui.ballHealth.value = preset.health;
  ui.ballScale.value = preset.scale;
  ui.ballHasWeapon.value = String(preset.hasWeapon);
  ui.weaponMode.value = preset.weaponMode;
  ui.weaponType.value = preset.weaponType;
  ui.weaponRpm.value = preset.rpm;
  ui.weaponDamage.value = preset.damage;
  ui.weaponSize.value = preset.weaponSize;
  ui.arrowCount.value = preset.arrowCount;
  ui.gravityAffected.value = String(preset.gravityAffected);
  ui.acceleration.value = preset.acceleration;
}

function readBallConfigFromForm() {
  const hasWeapon = ui.ballHasWeapon.value === "true";
  const gravityAffected = ui.gravityAffected.value === "true";
  const base = {
    name: ui.ballName.value.trim() || "Custom",
    team: ui.ballTeam.value,
    color: ui.ballColor.value,
    health: Number(ui.ballHealth.value),
    scale: Number(ui.ballScale.value),
    hasWeapon,
    weaponMode: ui.weaponMode.value,
    weaponType: ui.weaponType.value,
    rpm: Number(ui.weaponRpm.value),
    damage: Number(ui.weaponDamage.value),
    weaponSize: Number(ui.weaponSize.value),
    arrowCount: Number(ui.arrowCount.value),
    gravityAffected,
    acceleration: Number(ui.acceleration.value),
    maxSpeed: 190,
    strokeColor: "#20365a"
  };

  if (base.weaponType === "unarmed") {
    base.hasWeapon = false;
  }

  if (base.color.toLowerCase() === "#ffffff") {
    base.strokeColor = "#9f9f9f";
  }

  return base;
}

function refreshBallPicker() {
  const signature = state.balls.map((ball) => `${ball.id}:${ball.team}:${ball.name}`).join("|");
  if (ui.teamBallSelect.dataset.signature === signature) {
    return;
  }
  ui.teamBallSelect.dataset.signature = signature;
  const current = ui.teamBallSelect.value;
  ui.teamBallSelect.innerHTML = "";
  for (const ball of state.balls) {
    const option = document.createElement("option");
    option.value = String(ball.id);
    option.textContent = `${ball.name} [${ball.team}] #${ball.id}`;
    ui.teamBallSelect.append(option);
  }
  if (state.balls.length === 0) {
    return;
  }
  const stillExists = state.balls.some((ball) => String(ball.id) === current);
  ui.teamBallSelect.value = stillExists ? current : String(state.balls[0].id);
}

function spawnPresetBall(key) {
  const config = clonePreset(key);
  config.team = ui.ballTeam.value;
  addBallFromConfig(config);
}

function initControls() {
  for (const preset of getPresetList()) {
    const option = document.createElement("option");
    option.value = preset.key;
    option.textContent = preset.name;
    ui.presetSelect.append(option);
  }

  ui.presetSelect.value = "custom";
  applyPresetToForm("custom");

  for (const preset of getPresetList().filter((preset) => preset.key !== "custom")) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = preset.name;
    button.addEventListener("click", () => spawnPresetBall(preset.key));
    ui.presetButtons.append(button);
  }

  ui.presetSelect.addEventListener("change", () => {
    applyPresetToForm(ui.presetSelect.value);
  });

  ui.addBallBtn.addEventListener("click", () => {
    addBallFromConfig(readBallConfigFromForm());
  });

  const updateArenaLabels = () => {
    ui.arenaWidthValue.textContent = String(ui.arenaWidth.value);
    ui.arenaHeightValue.textContent = String(ui.arenaHeight.value);
    ui.wallToggleValue.textContent = ui.wallToggle.value === "1" ? "On" : "Off";
    ui.wallThicknessValue.textContent = String(ui.wallThickness.value);
    ui.wallLengthValue.textContent = String(ui.wallLength.value);
  };

  const updateArena = () => {
    updateArenaLabels();
    resizeArena(ui.arenaWidth.value, ui.arenaHeight.value);
    state.arena.middleWall.enabled = ui.wallToggle.value === "1";
    state.arena.middleWall.thickness = Number(ui.wallThickness.value);
    const wallLengthCap = Number(ui.arenaHeight.value);
    ui.wallLength.max = String(wallLengthCap);
    state.arena.middleWall.length = Number(clamp(Number(ui.wallLength.value), 40, wallLengthCap));
    ui.wallLength.value = String(state.arena.middleWall.length);
    refreshWallBounds();
  };

  ui.setTeamBtn.addEventListener("click", () => {
    const selectedId = Number(ui.teamBallSelect.value);
    const ball = state.balls.find((candidate) => candidate.id === selectedId);
    if (!ball) {
      return;
    }
    ball.team = ui.teamChangeSelect.value;
    refreshBallPicker();
  });

  ui.clearBallsBtn.addEventListener("click", () => {
    state.balls = [];
    state.projectiles = [];
    refreshBallPicker();
  });

  ui.arenaWidth.addEventListener("input", updateArena);
  ui.arenaHeight.addEventListener("input", updateArena);
  ui.wallToggle.addEventListener("input", updateArena);
  ui.wallThickness.addEventListener("input", updateArena);
  ui.wallLength.addEventListener("input", updateArena);

  ui.ballTeam.value = "Alpha";

  updateArena();
}

function setupInitialBalls() {
  const seeds = [
    ["sword", "Alpha"],
    ["superSword", "Beta"],
    ["dagger", "Gamma"],
    ["superDagger", "Delta"],
    ["bow", "Alpha"],
    ["superBow", "Beta"],
    ["unarmed", "Gamma"],
    ["superUnarmed", "Delta"]
  ];

  for (const [key, team] of seeds) {
    const config = clonePreset(key);
    config.team = team;
    addBallFromConfig(config);
  }
}

function renderArena() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.arena.middleWall.enabled) {
    ctx.fillStyle = "#3f4f6d";
    const left = state.arena.middleWall.x - state.arena.middleWall.thickness / 2;
    const top = state.arena.middleWall.top;
    const height = state.arena.middleWall.bottom - state.arena.middleWall.top;
    ctx.fillRect(left, top, state.arena.middleWall.thickness, height);
  }

  for (const projectile of state.projectiles) {
    projectile.draw(ctx);
  }

  for (const ball of state.balls) {
    ball.draw(ctx, performance.now() / 1000);
  }
}

let previousTime = performance.now();

function frame(now) {
  const dt = Math.min((now - previousTime) / 1000, 0.04);
  previousTime = now;

  const seconds = now / 1000;

  for (const ball of state.balls) {
    ball.update(dt, state.arena, seconds);
  }

  handleCombat(state, dt, seconds);
  refreshBallPicker();
  renderArena();

  state.fpsCounter.elapsed += dt;
  state.fpsCounter.frames += 1;
  if (state.fpsCounter.elapsed >= 0.5) {
    state.fpsCounter.current = Math.round(state.fpsCounter.frames / state.fpsCounter.elapsed);
    state.fpsCounter.elapsed = 0;
    state.fpsCounter.frames = 0;
  }

  ui.ballCount.textContent = String(state.balls.length);
  ui.projectileCount.textContent = String(state.projectiles.length);
  ui.fps.textContent = String(state.fpsCounter.current);
  ui.parryCount.textContent = String(state.parryCount);

  requestAnimationFrame(frame);
}

initControls();
resizeArena(GAME_CONFIG.arenaWidth, GAME_CONFIG.arenaHeight);
setupInitialBalls();
requestAnimationFrame(frame);
