export class Player extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 16, 24, 0x00aaff);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCollideWorldBounds(true);
        this.scene = scene;

        this.SPEED = 150;
        this.JUMP_FORCE = -300;
        this.SLIDE_SPEED = 250;
        this.SLIDE_DURATION = 500;
        this.CHARGE_TIME = 1500;

        this.canDoubleJump = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.chargeTimer = 0;
        this.isCharging = false;

        this.states = {
            IDLE: 'IDLE',
            WALKING: 'WALKING',
            JUMPING: 'JUMPING',
            SLIDING: 'SLIDING'
        };
        this.currentState = this.states.IDLE;
    }

    update(cursors, keyX, keyZ, keyC, keySpace) {
        const onGround = this.body.blocked.down;

        if (onGround) {
            this.canDoubleJump = true;
            if (!this.isSliding) {
                this.currentState = Math.abs(this.body.velocity.x) > 0 ? this.states.WALKING : this.states.IDLE;
            }
        } else {
            this.currentState = this.states.JUMPING;
        }

        this.handleMovement(cursors, keyZ, keySpace, keyC, onGround);
        this.handleCombat(keyX);

        if (this.isSliding) {
            this.slideTimer -= this.scene.game.loop.delta;
            if (this.slideTimer <= 0) {
                this.stopSlide();
            }
        }
    }

    handleMovement(cursors, keyZ, keySpace, keyC, onGround) {
        if (this.isSliding) return;

        if (cursors.left.isDown) {
            this.body.setVelocityX(-this.SPEED);
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(this.SPEED);
        } else {
            this.body.setVelocityX(0);
        }

        const jumpPressed = Phaser.Input.Keyboard.JustDown(keyZ) || Phaser.Input.Keyboard.JustDown(keySpace);

        if (jumpPressed) {
            if (onGround) {
                this.body.setVelocityY(this.JUMP_FORCE);
            } else if (this.canDoubleJump) {
                this.body.setVelocityY(this.JUMP_FORCE);
                this.canDoubleJump = false;
            }
        }

        if (onGround && cursors.down.isDown && Phaser.Input.Keyboard.JustDown(keyC)) {
            this.startSlide(cursors.left.isDown ? -1 : 1);
        }
    }

    startSlide(direction) {
        this.isSliding = true;
        this.currentState = this.states.SLIDING;
        this.slideTimer = this.SLIDE_DURATION;
        this.body.setVelocityX(this.SLIDE_SPEED * direction);
        this.setSize(16, 12);
        this.setOrigin(0.5, 1);
        this.y += 6;
    }

    stopSlide() {
        this.isSliding = false;
        this.setSize(16, 24);
        this.setOrigin(0.5, 0.5);
        this.y -= 6;
    }

    handleCombat(keyX) {
        if (keyX.isDown) {
            this.chargeTimer += this.scene.game.loop.delta;
            if (this.chargeTimer > this.CHARGE_TIME) {
                this.isCharging = true;
                this.setFillStyle(0xffffff);
            }
        } else if (Phaser.Input.Keyboard.JustUp(keyX)) {
            if (this.isCharging) {
                this.shoot(true);
            } else {
                this.shoot(false);
            }
            this.isCharging = false;
            this.chargeTimer = 0;
            this.setFillStyle(0x00aaff);
        }
    }

    shoot(isCharged) {
        const direction = this.body.velocity.x >= 0 ? 1 : -1;
        const color = isCharged ? 0xffff00 : 0x00ffff;
        const size = isCharged ? 16 : 8;
        const damage = isCharged ? 2 : 1;

        const projectile = this.scene.add.circle(this.x + (direction * 10), this.y, size / 2, color);
        this.scene.playerProjectiles.add(projectile);
        this.scene.physics.add.existing(projectile);

        projectile.body.setAllowGravity(false);
        projectile.body.setVelocityX(400 * direction);
        projectile.damage = damage;

        if (this.scene.boss) {
            this.scene.boss.reactToPlayerShot();
        }

        this.scene.time.delayedCall(2000, () => {
            if (projectile.active) projectile.destroy();
        });
    }
}
