export class Boss extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 16, 24, 0xff0000);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCollideWorldBounds(true);
        this.scene = scene;
        this.player = scene.player;

        this.hp = 20;
        this.maxHp = 20;
        this.SPEED = 100;
        this.jumpChance = 0.4;

        this.shootTimer = 2000;
        this.chargeTimer = 0;
        this.isCharging = false;

        this.states = {
            APPROACH: 'APPROACH',
            CHARGE: 'CHARGE',
            REACTIVE: 'REACTIVE'
        };
        this.currentState = this.states.APPROACH;
    }

    update() {
        if (this.hp <= 0) {
            this.destroy();
            return;
        }

        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
        this.handleAI(distance);

        if (this.hp < this.maxHp / 2) {
            this.currentState = this.states.CHARGE;
        }
    }

    handleAI(distance) {
        if (this.x > this.player.x) {
            this.body.setVelocityX(-this.SPEED);
        } else {
            this.body.setVelocityX(this.SPEED);
        }

        this.shootTimer -= this.scene.game.loop.delta;
        if (this.shootTimer <= 0) {
            if (this.currentState === this.states.CHARGE) {
                this.isCharging = true;
                this.chargeTimer += 1000;
                if (this.chargeTimer >= 1500) {
                    this.shoot(true);
                    this.shootTimer = 2000;
                    this.chargeTimer = 0;
                    this.isCharging = false;
                }
            } else {
                this.shoot(false);
                this.shootTimer = 2000;
            }
        }

        if (this.isCharging) {
            this.setFillStyle(0xffaaaa);
        } else {
            this.setFillStyle(0xff0000);
        }
    }

    reactToPlayerShot() {
        if (this.body.blocked.down && Math.random() < this.jumpChance) {
            this.body.setVelocityY(-300);
        }
    }

    shoot(isCharged) {
        const direction = this.player.x < this.x ? -1 : 1;
        const color = isCharged ? 0xffaa00 : 0xff5555;
        const size = isCharged ? 16 : 8;

        const projectile = this.scene.add.circle(this.x + (direction * 10), this.y, size / 2, color);
        this.scene.bossProjectiles.add(projectile);
        this.scene.physics.add.existing(projectile);
        projectile.body.setAllowGravity(false);
        projectile.body.setVelocityX(300 * direction);

        this.scene.time.delayedCall(2000, () => {
            if (projectile.active) projectile.destroy();
        });
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.scene.cameras.main.shake(100, 0.005);
    }
}
