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
let nextSpawnTime = 0;

function preload() {
    this.load.image('ground', 'assets/ground.png');
    this.load.image('player', 'assets/student.png');
    this.load.image('playerJump', 'assets/studentJump.png');
    this.load.image('playerDuck', 'assets/studentDuck.png');
    this.load.image('greenBacteria', 'assets/enemy_1.png'); // E. coli (verde)
    this.load.image('blueBacteria', 'assets/enemy_2.png'); // Salmonella (azul)
    this.load.image('redBacteria', 'assets/enemy_3.png'); // Staphylococcus aureus (vermelho)
    this.load.image('yellowBacteria', 'assets/enemy_4.png'); // Bacillus cereus (amarelo)
    this.load.image('blackVirus', 'assets/enemy_5.png'); // Vírus perigoso (preto)
    this.load.image('redCircle', 'assets/b_2.png'); // Lactobacillus (círculo vermelho)
    this.load.image('blueCircle', 'assets/b_3.png'); // Bifidobacterium (círculo azul)
    this.load.image('blackCircle', 'assets/b_4.png'); // Saccharomyces (círculo preto)
}

function create() {
    ground = this.add.tileSprite(400, 570, 800, 60, 'ground');

    player = this.physics.add.sprite(100, 500, 'player').setScale(0.5);
    player.setCollideWorldBounds(true);

    this.input.on('pointerdown', handleInput, this);
    cursors = this.input.keyboard.createCursorKeys();

    enemies = this.physics.add.group({
        allowGravity: false
    });
    bonuses = this.physics.add.group({
        allowGravity: false
    });

    scoreText = this.add.text(400, 50, 'Score: 100', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    this.physics.add.collider(player, enemies, hitEnemy, null, this);
    this.physics.add.overlap(player, bonuses, collectBonus, null, this);
}

function update(time) {
    if (gameOver) {
        return;
    }

    ground.tilePositionX += 2; // Velocidade do chão reduzida

    if (cursors.space.isDown && player.body.touching.down) {
        jump();
    } else if (cursors.down.isDown) {
        duck();
    } else if (player.body.touching.down) {
        player.setTexture('player');
    }

    if (time > nextSpawnTime) {
        nextSpawnTime = time + 2000; // Aumentar o intervalo para evitar sobreposição
        spawnEntity(this);
    }

    enemies.children.iterate(function (enemy) {
        if (enemy.x < 0) {
            enemy.destroy();
        } else {
            enemy.x -= 2; // Mover inimigos junto com o chão
        }
    });

    bonuses.children.iterate(function (bonus) {
        if (bonus.x < 0) {
            bonus.destroy();
        } else {
            bonus.x -= 2; // Mover bônus junto com o chão
        }
    });

    scoreText.setText('Score: ' + score);

    if (score >= 1000 || score <= 0) {
        endGame(this);
    }
}

function spawnEntity(scene) {
    if (Math.random() < 0.5) {
        spawnEnemy(scene);
    } else {
        spawnBonus(scene);
    }
}

function spawnEnemy(scene) {
    let enemyType = Phaser.Math.Between(1, 4);
    let enemy;
    switch (enemyType) {
        case 1:
            enemy = scene.physics.add.sprite(800, 500, 'greenBacteria'); // E. coli
            enemy.points = -5;
            break;
        case 2:
            enemy = scene.physics.add.sprite(800, 500, 'blueBacteria'); // Salmonella
            enemy.points = -10;
            break;
        case 3:
            enemy = scene.physics.add.sprite(800, 500, 'redBacteria'); // Staphylococcus aureus
            enemy.points = -20;
            break;
        case 4:
            enemy = scene.physics.add.sprite(800, 500, 'yellowBacteria'); // Bacillus cereus
            enemy.points = -50;
            break;
    }
    enemy.setVelocityX(-200);
    enemy.setScale(0.1); // Ajuste a escala para reduzir a altura
    enemies.add(enemy);
}

function spawnBonus(scene) {
    let bonusType = Phaser.Math.Between(1, 3);
    let bonus;
    switch (bonusType) {
        case 1:
            bonus = scene.physics.add.sprite(800, Phaser.Math.Between(100, 500), 'redCircle'); // Lactobacillus
            bonus.points = 10;
            break;
        case 2:
            bonus = scene.physics.add.sprite(800, Phaser.Math.Between(100, 500), 'blueCircle'); // Bifidobacterium
            bonus.points = 30;
            break;
        case 3:
            bonus = scene.physics.add.sprite(800, Phaser.Math.Between(100, 500), 'blackCircle'); // Saccharomyces
            bonus.points = 50;
            break;
    }
    bonus.setVelocityX(-200);
    bonus.setScale(0.1); // Ajuste a escala para reduzir a altura
    bonuses.add(bonus);
}

function jump() {
    if (player.body.touching.down) {
        player.setVelocityY(-600);
        player.setTexture('playerJump');
    }
}

function duck() {
    player.setTexture('playerDuck');
    player.setSize(player.width, player.height / 2); // Reduzir o tamanho da altura ao abaixar
}

function handleInput() {
    if (player.body.touching.down) {
        jump();
    } else if (cursors.down.isDown) {
        duck();
    }
}

function hitEnemy(player, enemy) {
    score += enemy.points;
    enemy.destroy();
    if (enemy.texture.key === 'blackVirus') {
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
