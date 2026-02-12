function createLevel2() {
    const platforms = [
        new Platform(0, 550, 500, 50),      // Ground
        new Platform(200, 480, 300, 30),    // Platform 1
        new Platform(700, 430, 120, 30),    // Platform 2
        new Platform(450, 390, 190, 30),    // Platform 3
        // new Platform(500, 320, 120, 30),    // Platform 4
        // new Platform(350, 230, 120, 30),    // Platform 5
    ];

    const enemies = [
        new GoombEnemy(500, 300, -1, platforms),
        new GoombEnemy(400, 390, -1, platforms),
        new PatrolEnemy(400, 430, platforms[1], 1),
        new PatrolEnemy(450, 350, platforms[3], 1),
        new GoombEnemy(450, 358, -1, platforms)
    ];

    const flagpole = new Flagpole(720, 350);

    return new Level(2, platforms, enemies, flagpole, null);
}
