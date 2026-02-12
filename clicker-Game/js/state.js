/**
 * Manages the game's persistent state
 */
export const initialState = {
    zeni: 0,
    totalZeniEarned: 0,
    rebirthPoints: 0,
    rebirthMultiplier: 1,
    clickPower: 1,
    autoPower: 0,
    upgrades: {}, // stores upgrade levels: { upgradeId: level }
    transformationIndex: 0, // 0: Base, 1: Kaioken, etc.
    lastSaveTime: Date.now()
};

let state = { ...initialState };

export function getState() {
    return state;
}

export function updateState(newState) {
    state = { ...state, ...newState };
}

export function addZeni(amount) {
    const gained = amount * (state.rebirthMultiplier || 1);
    state.zeni += gained;
    state.totalZeniEarned += gained;
}

export function spendZeni(amount) {
    if (state.zeni >= amount) {
        state.zeni -= amount;
        return true;
    }
    return false;
}

export function saveGame() {
    localStorage.setItem('dbz_clicker_save', JSON.stringify(state));
}

export function loadGame() {
    const saved = localStorage.getItem('dbz_clicker_save');
    if (saved) {
        try {
            state = { ...initialState, ...JSON.parse(saved) };
        } catch (e) {
            console.error("Failed to load save", e);
        }
    }
    return state;
}

export function resetGame(isRebirth = false) {
    const newRebirthPoints = isRebirth ? state.rebirthPoints + Math.floor(state.totalZeniEarned / 1000000) : 0;
    const newMultiplier = 1 + (newRebirthPoints * 0.1); // 10% bonus per rebirth point
    
    state = { 
        ...initialState, 
        rebirthPoints: newRebirthPoints,
        rebirthMultiplier: newMultiplier
    };
    saveGame();
}
