// Inside js/main.js
const gameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, // Fit to window keeping aspect ratio
        parent: 'game-container', // Target the container div
        autoCenter: Phaser.Scale.NONE, // Tell Phaser to center within the parent
        width: 480,  // Portrait aspect ratio
        height: 800
    },
    backgroundColor: '#ffffff', // White background for the game area
    scene: [
        WelcomeScene,
        HowToPlayScene,
        AboutScene,
        GameScene,
        UIScene,
        GameOverScene
    ]
};

const game = new Phaser.Game(gameConfig);