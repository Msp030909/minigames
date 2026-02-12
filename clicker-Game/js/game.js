import { getState, addZeni, spendZeni, saveGame, loadGame, updateState, resetGame } from './state.js';
import { updateDisplay, createUpgradeUI, showFloatingText } from './ui.js';
import { getUpgradeCost, transformations } from './upgrades.js';

function init() {
    loadGame();
    createUpgradeUI(handleUpgradePurchase);
    
    const character = document.getElementById('main-character');
    character.addEventListener('click', (e) => {
        const state = getState();
        const amount = state.clickPower * state.rebirthMultiplier;
        addZeni(state.clickPower);
        showFloatingText(e.clientX, e.clientY, amount.toFixed(0));
        checkTransformations();
        updateDisplay();
    });

    document.getElementById('rebirth-btn').addEventListener('click', () => {
        const state = getState();
        if (state.totalZeniEarned >= 1000000) {
            if (confirm("Reset everything for Rebirth Points? Each point gives a 10% bonus boost!")) {
                resetGame(true);
                updateDisplay();
                // Re-create UI to reset levels in display
                createUpgradeUI(handleUpgradePurchase);
            }
        } else {
            alert("You need at least 1,000,000 total Zeni to rebirth!");
        }
    });

    // Game Loop (Auto-zeni every second)
    setInterval(() => {
        const state = getState();
        if (state.autoPower > 0) {
            addZeni(state.autoPower / 10); // Run 10 times a second for smoothness
            checkTransformations();
            updateDisplay();
        }
    }, 100);

    // Save interval
    setInterval(saveGame, 30000);

    updateDisplay();
}

function handleUpgradePurchase(upgrade, type) {
    const state = getState();
    const currentLevel = state.upgrades[upgrade.id] || 0;
    const cost = getUpgradeCost(upgrade, currentLevel);

    if (spendZeni(cost)) {
        const newUpgrades = { ...state.upgrades };
        newUpgrades[upgrade.id] = currentLevel + 1;
        
        let newClickPower = state.clickPower;
        let newAutoPower = state.autoPower;

        if (type === 'click') {
            newClickPower += upgrade.powerIncrease;
        } else {
            newAutoPower += upgrade.autoIncrease;
        }

        updateState({
            upgrades: newUpgrades,
            clickPower: newClickPower,
            autoPower: newAutoPower
        });
        
        updateDisplay();
    }
}

function checkTransformations() {
    const state = getState();
    let highestPossible = 0;
    
    transformations.forEach((t, index) => {
        if (state.totalZeniEarned >= t.requiredTotalZeni) {
            highestPossible = index;
        }
    });

    if (highestPossible !== state.transformationIndex) {
        updateState({ transformationIndex: highestPossible });
    }
}

document.addEventListener('DOMContentLoaded', init);
