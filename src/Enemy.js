export class Enemy extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 20, 20, 0xffbb00); // Yellow/Orange rectangle as enemy
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCollideWorldBounds(true);
        this.body.setAllowGravity(true);
        this.scene = scene;

        this.hp = 2; // Dies with 2 normal shots or 1 charged shot
        this.speed = -50; // Moves left
        this.body.setVelocityX(this.speed);
    }

    update() {
        if (this.hp <= 0) {
            this.destroy();
            return;
        }

        // Simple bounce logic at walls/ground
        if (this.body.blocked.left || this.body.blocked.right) {
            this.speed *= -1;
            this.body.setVelocityX(this.speed);
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.scene.cameras.main.shake(50, 0.002);
    }
}
