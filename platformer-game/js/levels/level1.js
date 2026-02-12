function createLevel1() {
    const platforms = [
        // x position, y position, width, height
        new Platform(0, 550, 800, 50),      // Ground
        new Platform(150, 450, 150, 30),    // Platform 1
        new Platform(450, 400, 150, 30),    // Platform 2
        new Platform(320, 270, 100, 30),    // Platform 3
        new Platform(550, 250, 150, 30),    // Platform 4
        new Platform(700, 181, 100, 10),    // Platform 5
    ];

    const enemies = [
        new GoombEnemy(200, 410, 1, platforms),  // Walking right
        new PatrolEnemy(500, 360, platforms[2], -1), // Patrolling on platform 3
    ];

    const flagpole = new Flagpole(720, 100);

    return new Level(1, platforms, enemies, flagpole, 2);
}
