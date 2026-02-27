export class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        // Load menu background
        this.load.image('menu_bg', './Main.png');

        // Preload game assets
        this.load.audio('soundtrack', './Soundtrack.mp3');
        this.load.image('megaman_idle', './Idle.png');
        this.load.image('megaman_run', './Run.png');
        this.load.image('megaman_jump', './Jump.png');
        this.load.image('megaman_shooting', './Shooting.png');
    }

    create() {
        // Background Image
        const bg = this.add.image(128, 112, 'menu_bg');
        bg.setDisplaySize(256, 224);

        // Blinking Text
        this.startText = this.add.text(128, 190, 'INSERT COIN TO START', {
            fontSize: '10px',
            fill: '#fff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.startText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            loop: -1
        });

        // Event listener for starting the game
        const startGame = () => {
            if (this.gameStarted) return;
            this.gameStarted = true;

            // Start music on first interaction (browser requirement)
            if (!this.sound.get('soundtrack')) {
                const music = this.sound.add('soundtrack', { loop: true, volume: 0.5 });
                music.play();
            }

            this.scene.start('MainScene');
        };

        this.input.keyboard.on('keydown', startGame);
        this.input.on('pointerdown', startGame);
    }
}
