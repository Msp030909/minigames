/* Utility helpers */

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

export function formatSeconds(ms) {
    return Math.ceil(ms / 1000) + 's';
}
