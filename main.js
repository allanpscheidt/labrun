const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameCanvas',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let ground;
let enemies;
let bonuses;
let scoreText;
let score = 100;
let gameOver = false;
let nextEnemyTime = 0;
let nextBonusTime = 0;
let nextSpecialEnemyTime = 0;

function preload() {
    this.load.image('ground', 'assets/ground.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('playerJump', 'assets/playerJump.png');
    this.load.image('greenSquare', 'assets/greenSquare.png');
    this.load.image('blueSquare', 'assets/blueSquare.png');
    this.load.image('redSquare', 'assets/redSquare.png');
    this.load.image('yellowSquare', 'assets/yellowSquare.png');
    this.load.image('blackSquare', 'assets/blackSquare.png');
    this.load.image('redCircle', 'assets/redCircle.png');
    this.load.image('blueCircle', 'assets/blueCircle.png');
    this.load.image('blackCircle', 'assets/blackCircle.png');
}

function create() {
    ground = this.add.tileSprite(400, 570, 800, 60, 'ground');

    player = this.physics.add.sprite(100, 450, 'player');
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    enemies = this.physics.add.group();
    bonuses = this.physics.add.group();

    scoreText = this.add.text(400, 50, 'Score: 100', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    this.physics.add.collider(player, enemies, hitEnemy, null, this);
    this.physics.add.overlap(player, bonuses, collectBonus, null, this);
}

function update(time) {
    if (gameOver) {
        return;
    }

    ground.tilePositionX += 5;

    if (cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-600);
        player.setTexture('playerJump');
    }

    if (player.body.touching.down) {
        player.setTexture('player');
    }

    if (time > nextEnemyTime) {
        nextEnemyTime = time + 2000;
        spawnEnemy(this);
    }

    if (time > nextBonusTime) {
        nextBonusTime = time + 10000;
        spawnBonus(this);
    }

    if (time > nextSpecialEnemyTime) {
        nextSpecialEnemyTime = time + 60000;
        spawnSpecialEnemy(this);
    }

    enemies.children.iterate(function (enemy) {
        if (enemy.x < 0) {
            enemy.destroy();
        }
    });

    bonuses.children.iterate(function (bonus) {
        if (bonus.x < 0) {
            bonus.destroy();
        }
    });

    scoreText.setText('Score: ' + score);

    if (score >= 1000 || score <= 0) {
        endGame(this);
    }
}

function spawnEnemy(scene) {
    let enemyType = Phaser.Math.Between(1, 4);
    let enemy;
    switch (enemyType) {
        case 1:
            enemy = scene.physics.add.sprite(800, 520, 'greenSquare');
            enemy.points = -5;
            break;
        case 2:
            enemy = scene.physics.add.sprite(800, 520, 'blueSquare');
            enemy.points = -10;
            break;
        case 3:
            enemy = scene.physics.add.sprite(800, 520, 'redSquare');
            enemy.points = -10;
            break;
        case 4:
            enemy = scene.physics.add.sprite(800, 520, 'yellowSquare');
            enemy.points = -50;
            break;
    }
    enemy.setVelocityX(-200);
    enemies.add(enemy);
}

function spawnBonus(scene) {
    let bonusType = Phaser.Math.Between(1, 3);
    let bonus;
    switch (bonusType) {
        case 1:
            bonus = scene.physics.add.sprite(800, 520, 'redCircle');
            bonus.points = 10;
            break;
        case 2:
            bonus = scene.physics.add.sprite(800, 520, 'blueCircle');
            bonus.points = 30;
            break;
        case 3:
            bonus = scene.physics.add.sprite(800, 520, 'blackCircle');
            bonus.points = 50;
            break;
    }
    bonus.setVelocityX(-200);
    bonuses.add(bonus);
}

function spawnSpecialEnemy(scene) {
    let specialEnemy = scene.physics.add.sprite(800, 520, 'blackSquare');
    specialEnemy.setVelocityX(-200);
    specialEnemy.points = -score;
    enemies.add(specialEnemy);
}

function hitEnemy(player, enemy) {
    score += enemy.points;
    enemy.destroy();
    if (enemy.texture.key === 'blackSquare') {
        endGame(this);
    }
}

function collectBonus(player, bonus) {
    score += bonus.points;
    bonus.destroy();
}

function endGame(scene) {
    gameOver = true;
    scene.physics.pause();
    scoreText.setText('Game Over! Final Score: ' + score);
}
