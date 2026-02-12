/**
 * Upgrade definitions
 */

export const clickUpgrades = [
    {
        id: 'pushups',
        name: 'Push-ups',
        description: 'Basic training to increase strike power.',
        baseCost: 15,
        costMultiplier: 1.15,
        powerIncrease: 1
    },
    {
        id: 'gravity_training',
        name: 'Gravity Training',
        description: 'Train under 10x gravity.',
        baseCost: 150,
        costMultiplier: 1.2,
        powerIncrease: 5
    },
    {
        id: 'spirit_control',
        name: 'Spirit Control',
        description: 'Learn to better channel your Ki.',
        baseCost: 1000,
        costMultiplier: 1.25,
        powerIncrease: 25
    },
    {
        id: 'zenkai_boost',
        name: 'Zenkai Boost',
        description: 'Coming back stronger from the brink.',
        baseCost: 5000,
        costMultiplier: 1.3,
        powerIncrease: 100
    }
];

export const autoUpgrades = [
    {
        id: 'weighted_clothing',
        name: 'Weighted Clothing',
        description: 'Passive gains through resistance.',
        baseCost: 100,
        costMultiplier: 1.15,
        autoIncrease: 1
    },
    {
        id: 'training_partner',
        name: 'Training Partner',
        description: 'Spar with Krillin.',
        baseCost: 500,
        costMultiplier: 1.18,
        autoIncrease: 5
    },
    {
        id: 'hyperbolic_chamber',
        name: 'Hyperbolic Time Chamber',
        description: 'A years training in a day.',
        baseCost: 2500,
        costMultiplier: 1.22,
        autoIncrease: 20
    },
    {
        id: 'elder_kai_ritual',
        name: 'Elder Kai Ritual',
        description: 'Unlock your hidden potential.',
        baseCost: 15000,
        costMultiplier: 1.3,
        autoIncrease: 100
    },
    {
        id: 'training_with_whis',
        name: 'Training with Whis',
        description: 'Learn the ways of an Angel.',
        baseCost: 100000,
        costMultiplier: 1.4,
        autoIncrease: 500
    }
];

export const transformations = [
    {
        name: 'Base Form',
        requiredTotalZeni: 0,
        color: '#f1c40f',
        aura: 'none'
    },
    {
        name: 'Kaioken',
        requiredTotalZeni: 5000,
        color: '#e74c3c',
        aura: '0 0 20px #e74c3c'
    },
    {
        name: 'Super Saiyan',
        requiredTotalZeni: 50000,
        color: '#f1c40f',
        aura: '0 0 30px #f1c40f'
    },
    {
        name: 'Super Saiyan 2',
        requiredTotalZeni: 250000,
        color: '#f1c40f',
        aura: '0 0 40px #f1c40f, 0 0 10px #fff'
    },
    {
        name: 'Super Saiyan 3',
        requiredTotalZeni: 1000000,
        color: '#f1c40f',
        aura: '0 0 50px #f1c40f'
    },
    {
        name: 'Super Saiyan God',
        requiredTotalZeni: 5000000,
        color: '#e67e22',
        aura: '0 0 60px #e67e22'
    },
    {
        name: 'Super Saiyan Blue',
        requiredTotalZeni: 20000000,
        color: '#3498db',
        aura: '0 0 60px #3498db'
    }
];

export function getUpgradeCost(upgrade, level) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
}
