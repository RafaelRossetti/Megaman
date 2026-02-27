import { Player } from './Player.js';
import { Boss } from './Boss.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        // Corregar assets usando caminhos relativos ao index.html
        this.load.audio('soundtrack', './Soundtrack.mp3');
        this.load.spritesheet('megaman', './sprite.gif', {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        // Criar animações do Player
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('megaman', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('megaman', { start: 1, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('megaman', { start: 4, end: 4 }),
            frameRate: 1
        });

        this.anims.create({
            key: 'slide',
            frames: this.anims.generateFrameNumbers('megaman', { start: 5, end: 5 }),
            frameRate: 1
        });

        // Iniciar Música
        const music = this.sound.add('soundtrack', { loop: true, volume: 0.5 });
        music.play();

        // Full Level Width
        this.levelWidth = 2000;
        this.physics.world.setBounds(0, 0, this.levelWidth, 224);

        // Create ground
        this.ground = this.add.rectangle(0, 200, this.levelWidth, 24, 0x666666).setOrigin(0);
        this.physics.add.existing(this.ground, true);

        // Create player
        this.player = new Player(this, 50, 150);
        this.physics.add.collider(this.player, this.ground);

        // Groups
        this.playerProjectiles = this.physics.add.group();
        this.bossProjectiles = this.physics.add.group();

        // Items and Checkpoints
        this.createItems();
        this.createBoss();

        // Camera follow
        this.cameras.main.setBounds(0, 0, this.levelWidth, 224);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // HUD (Fixed to camera)
        this.add.rectangle(10, 10, 50, 10, 0x000000).setScrollFactor(0).setOrigin(0);
        this.hpBar = this.add.rectangle(12, 12, 46, 6, 0x00ff00).setScrollFactor(0).setOrigin(0);
        this.add.text(10, 25, 'HP', { fontSize: '8px', fill: '#fff' }).setScrollFactor(0);

        // Collisions
        // Solid body collision between player and boss
        this.physics.add.collider(this.player, this.boss, () => {
            this.player.takeDamage(1);
        });

        this.physics.add.overlap(this.playerProjectiles, this.boss, (boss, bullet) => {
            boss.takeDamage(bullet.damage || 1);
            bullet.destroy();
        });

        this.physics.add.overlap(this.bossProjectiles, this.player, (player, bullet) => {
            player.takeDamage(1);
            bullet.destroy();
        });

        // Setup inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    createItems() {
        this.addPoint(this.levelWidth * 0.33, 'Checkpoint Alpha');
        this.addItem(this.levelWidth * 0.33 + 20, 'Extra Life');
        this.addItem(this.levelWidth * 0.66, 'Extra Life');
        this.addPoint(this.levelWidth * 0.85, 'Checkpoint Beta');
        this.addItem(this.levelWidth * 0.85 + 20, 'Full HP');
    }

    addPoint(x, label) {
        this.add.rectangle(x, 180, 2, 20, 0x00ff00);
        this.add.text(x - 20, 160, label, { fontSize: '8px', fill: '#0f0' });
    }

    addItem(x, type) {
        const color = type === 'Extra Life' ? 0xff00ff : 0x00ff00;
        const item = this.add.circle(x, 190, 5, color);
        this.physics.add.existing(item);
        item.body.setAllowGravity(false);
        this.physics.add.overlap(this.player, item, () => {
            if (type === 'Full HP') this.player.hp = this.player.maxHp;
            item.destroy();
        });
    }

    createBoss() {
        // Boss starts at the end
        this.boss = new Boss(this, 1900, 150);
        this.physics.add.collider(this.boss, this.ground);
    }

    update(time, delta) {
        this.player.update(this.cursors, this.keyX, this.keyZ, this.keyC, this.keySpace);
        if (this.boss) this.boss.update();

        // Update HP Bar
        const hpPercent = this.player.hp / this.player.maxHp;
        this.hpBar.width = 46 * hpPercent;
        if (hpPercent < 0.3) this.hpBar.setFillStyle(0xff0000);
    }
}
