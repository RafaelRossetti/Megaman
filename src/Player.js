export class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'megaman_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Ajustar escala e hitbox (Imagens individuais costumam ser grandes)
        this.setDisplaySize(24, 24);
        this.body.setSize(20, 24);
        this.body.setOffset(2, 0);

        this.body.setCollideWorldBounds(true);
        this.scene = scene;

        this.SPEED = 150;
        this.JUMP_FORCE = -300;
        this.SLIDE_SPEED = 250;
        this.SLIDE_DURATION = 500;
        this.CHARGE_TIME = 1500;

        this.hp = 10;
        this.maxHp = 10;
        this.isInvulnerable = false;
        this.invulTimer = 0;
        this.shootingVisualTimer = 0;

        this.canDoubleJump = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.chargeTimer = 0;
        this.isCharging = false;

        this.states = {
            IDLE: 'IDLE',
            WALKING: 'WALKING',
            JUMPING: 'JUMPING',
            SLIDING: 'SLIDING',
            SHOOTING: 'SHOOTING'
        };
        this.currentState = this.states.IDLE;
    }

    update(cursors, keyX, keyZ, keyC, keySpace) {
        const onGround = this.body.blocked.down;

        if (onGround) {
            this.canDoubleJump = true;
            if (!this.isSliding) {
                if (Math.abs(this.body.velocity.x) > 0) {
                    this.currentState = this.states.WALKING;
                } else {
                    this.currentState = this.states.IDLE;
                }
            }
        } else {
            this.currentState = this.states.JUMPING;
        }

        // Texture switching logic
        if (this.shootingVisualTimer > 0) {
            this.setTexture('megaman_shooting');
            this.shootingVisualTimer -= this.scene.game.loop.delta;
            this.stopRunTween();
        } else {
            switch (this.currentState) {
                case this.states.JUMPING:
                    this.setTexture('megaman_jump');
                    this.stopRunTween();
                    break;
                case this.states.WALKING:
                    this.setTexture('megaman_run');
                    this.startRunTween();
                    break;
                case this.states.SLIDING:
                    this.setTexture('megaman_slide');
                    this.stopRunTween(); // Added this line to stop tween when sliding
                    break;
                default:
                    this.setTexture('megaman_idle');
                    this.stopRunTween();
            }
        }

        // Flip sprite
        if (this.body.velocity.x > 0) this.setFlipX(false);
        else if (this.body.velocity.x < 0) this.setFlipX(true);

        this.handleMovement(cursors, keyZ, keySpace, keyC, onGround);
        this.handleCombat(keyX);

        if (this.isInvulnerable) {
            this.invulTimer -= this.scene.game.loop.delta;
            this.setAlpha(Math.sin(this.scene.time.now / 50) > 0 ? 0.3 : 0.8);
            if (this.invulTimer <= 0) {
                this.isInvulnerable = false;
                this.setAlpha(1);
            }
        }
    }

    takeDamage(amount) {
        if (this.isInvulnerable) return;

        this.hp -= amount;
        this.isInvulnerable = true;
        this.invulTimer = 1000; // 1s
        this.scene.cameras.main.shake(100, 0.005);

        if (this.hp <= 0) {
            this.scene.scene.restart();
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
        this.setTexture('megaman_run'); // Use run texture for sliding if no slide sprite
        this.slideTimer = this.SLIDE_DURATION;
        this.body.setVelocityX(this.SLIDE_SPEED * direction);
        this.body.setSize(20, 12);
        this.body.setOffset(6, 20);
    }

    stopSlide() {
        this.isSliding = false;
        this.body.setSize(20, 24);
        this.body.setOffset(6, 8);
    }

    startRunTween() {
        if (this.runTween) return;
        this.runTween = this.scene.tweens.add({
            targets: this,
            y: '-=2',
            duration: 100,
            yoyo: true,
            loop: -1
        });
    }

    stopRunTween() {
        if (this.runTween) {
            this.runTween.remove();
            this.runTween = null;
        }
    }

    handleCombat(keyX) {
        if (keyX.isDown) {
            this.chargeTimer += this.scene.game.loop.delta;
            if (this.chargeTimer > this.CHARGE_TIME) {
                this.isCharging = true;
                this.setTint(0x55ffff); // Brilho de carga
            }
        } else if (Phaser.Input.Keyboard.JustUp(keyX)) {
            if (this.isCharging) {
                this.shoot(true);
            } else {
                this.shoot(false);
            }
            this.isCharging = false;
            this.chargeTimer = 0;
            this.clearTint();
        }
    }

    shoot(isCharged) {
        this.shootingVisualTimer = 200; // Show shooting texture for 200ms
        const direction = this.flipX ? -1 : 1;
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
