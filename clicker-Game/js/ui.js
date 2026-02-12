import { getUpgradeCost, clickUpgrades, autoUpgrades, transformations } from './upgrades.js';
import { getState } from './state.js';

export function updateDisplay() {
    const state = getState();
    
    // Update Currency
    document.getElementById('zeni-count').textContent = Math.floor(state.zeni).toLocaleString();
    document.getElementById('zeni-per-second').textContent = Math.floor(state.autoPower * state.rebirthMultiplier).toLocaleString();
    document.getElementById('zeni-per-click').textContent = Math.floor(state.clickPower * state.rebirthMultiplier).toLocaleString();
    
    // Update Rebirth Info
    const rebirthPotential = Math.floor(state.totalZeniEarned / 1000000);
    document.getElementById('rebirth-points').textContent = state.rebirthPoints;
    document.getElementById('rebirth-multiplier').textContent = (state.rebirthMultiplier).toFixed(1);
    document.getElementById('potential-rebirth').textContent = rebirthPotential;

    // Update Transformation
    const currentTransform = transformations[state.transformationIndex];
    const character = document.getElementById('main-character');
    character.style.backgroundColor = currentTransform.color;
    character.style.boxShadow = currentTransform.aura;
    document.getElementById('transformation-name').textContent = currentTransform.name;
    
    updateUpgradeButtons();
}

function updateUpgradeButtons() {
    const state = getState();
    
    // Efficiency: only update costs/disabled states
    [...clickUpgrades, ...autoUpgrades].forEach(upgrade => {
        const btn = document.getElementById(`btn-${upgrade.id}`);
        if (!btn) return;
        
        const level = state.upgrades[upgrade.id] || 0;
        const cost = getUpgradeCost(upgrade, level);
        
        btn.querySelector('.cost').textContent = cost.toLocaleString();
        btn.querySelector('.level').textContent = level;
        btn.disabled = state.zeni < cost;
    });
}

export function createUpgradeUI(onUpgradeClick) {
    const clickContainer = document.getElementById('click-upgrades');
    const autoContainer = document.getElementById('auto-upgrades');
    
    clickContainer.innerHTML = '<h3>Training (Click)</h3>';
    autoContainer.innerHTML = '<h3>Auto Training</h3>';

    clickUpgrades.forEach(upgrade => {
        const btn = createButton(upgrade, 'click');
        btn.onclick = () => onUpgradeClick(upgrade, 'click');
        clickContainer.appendChild(btn);
    });

    autoUpgrades.forEach(upgrade => {
        const btn = createButton(upgrade, 'auto');
        btn.onclick = () => onUpgradeClick(upgrade, 'auto');
        autoContainer.appendChild(btn);
    });
}

function createButton(upgrade, type) {
    const btn = document.createElement('button');
    btn.id = `btn-${upgrade.id}`;
    btn.className = 'upgrade-btn';
    btn.innerHTML = `
        <div class="upgrade-info">
            <span class="name">${upgrade.name}</span>
            <span class="desc">${upgrade.description}</span>
        </div>
        <div class="upgrade-stats">
            <span>Cost: <span class="cost">0</span> Zeni</span>
             <span>Lvl: <span class="level">0</span></span>
        </div>
    `;
    return btn;
}

export function showFloatingText(x, y, text) {
    const float = document.createElement('div');
    float.className = 'floating-text';
    float.textContent = `+${text}`;
    float.style.left = `${x}px`;
    float.style.top = `${y}px`;
    document.body.appendChild(float);
    
    setTimeout(() => float.remove(), 1000);
}
