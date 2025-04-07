// js/main.js

const gameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, // Fit to window keeping aspect ratio
        parent: 'game-container',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 480,  // Portrait aspect ratio
        height: 800
    },
    backgroundColor: '#ffffff', // White background for the game area
    scene: [
        WelcomeScene, // Start with Welcome
        HowToPlayScene,
        AboutScene,
        GameScene,
        UIScene,      // UI runs in parallel with GameScene
        GameOverScene
    ]
};

const game = new Phaser.Game(gameConfig);