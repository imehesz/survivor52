// Inside js/main.js
const gameConfig = {
    appInfo: {
        title: 'Survivor: 52 - BASIC',
        version: '0.1.{{VERSION}}',
        author: 'Imre Mehesz',
        description: 'A simple card game prototype exploring resource management and chance.',
        website: 'https://mehesz.net/survivor52',
        github: 'https://github.com/imehesz/survivor52'
    },
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
        GameOverScene,
        FooterScene
    ]
};

const game = new Phaser.Game(gameConfig);