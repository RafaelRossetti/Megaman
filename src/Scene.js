import { Player } from './Player.js';
import { Boss } from './Boss.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        console.log('Preloading assets...');
    }

    create() {
        // Full Level Width
        this.levelWidth = 2000;
        this.physics.world.setBounds(0, 0, this.levelWidth, 224);

        // Create ground
        this.ground = this.add.rectangle(0, 200, this.levelWidth, 24, 0x666666).setOrigin(0);
        this.physics.add.existing(this.ground, true);

        // Create player
        this.player = new Player(this, 50, 150);
        this.physics.add.collider(this.player, this.ground);

        // Camera follow
        this.cameras.main.setBounds(0, 0, this.levelWidth, 224);
        this.cameras.main.startFollow(this.player);

        // HUD/Text (Fixed to camera)
        this.hudText = this.add.text(10, 10, 'MEGAMAN PHASER 3', { fontSize: '10px', fill: '#fff' }).setScrollFactor(0);

        // Groups
        this.playerProjectiles = this.physics.add.group();
        this.bossProjectiles = this.physics.add.group();

        // Items and Checkpoints
        this.createItems();
        this.createBoss();

        // Collisions
        this.physics.add.overlap(this.playerProjectiles, this.boss, (boss, bullet) => {
            boss.takeDamage(bullet.damage || 1);
            bullet.destroy();
        });

        this.physics.add.overlap(this.bossProjectiles, this.player, (player, bullet) => {
            console.log('Player hit!');
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
            console.log(`Picked up ${type}`);
            item.destroy();
        });
    }

    createBoss() {
        this.boss = new Boss(this, this.levelWidth - 100, 150);
        this.physics.add.collider(this.boss, this.ground);
    }

    update(time, delta) {
        this.player.update(this.cursors, this.keyX, this.keyZ, this.keyC, this.keySpace);
        if (this.boss) this.boss.update();
    }
}
