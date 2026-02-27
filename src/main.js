import { StartScene } from './StartScene.js';
import { MainScene } from './Scene.js';

const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 224,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [StartScene, MainScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

new Phaser.Game(config);
