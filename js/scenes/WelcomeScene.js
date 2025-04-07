// js/scenes/WelcomeScene.js

class WelcomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WelcomeScene' });
    }

    preload() {
        // Load assets for this scene if any (e.g., background image, button sprites)
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        if (!this.scene.isActive('FooterScene')) {
            this.scene.launch('FooterScene');
            console.log("Launched FooterScene"); // For debugging
        } else {
             console.log("FooterScene already active"); // For debugging
        }

        // Title
        this.add.text(centerX, centerY - 200, 'Survivor: 52', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        // Play Button
        const playButton = this.add.text(centerX, centerY - 50, 'PLAY', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        playButton.on('pointerover', () => playButton.setBackgroundColor('#777777'));
        playButton.on('pointerout', () => playButton.setBackgroundColor('#555555'));


        // How to Play Button
        const howToPlayButton = this.add.text(centerX, centerY + 50, 'HOW TO PLAY', {
             fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        howToPlayButton.on('pointerdown', () => {
            this.scene.start('HowToPlayScene');
        });
        howToPlayButton.on('pointerover', () => howToPlayButton.setBackgroundColor('#777777'));
        howToPlayButton.on('pointerout', () => howToPlayButton.setBackgroundColor('#555555'));

        // About Button
        const aboutButton = this.add.text(centerX, centerY + 150, 'ABOUT', {
             fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        aboutButton.on('pointerdown', () => {
            this.scene.start('AboutScene');
        });
        aboutButton.on('pointerover', () => aboutButton.setBackgroundColor('#777777'));
        aboutButton.on('pointerout', () => aboutButton.setBackgroundColor('#555555'));

        // setting registry entries
        this.game.registry.set('gameTitle', gameConfig.appInfo.title)
        this.game.registry.set('gameVersion', gameConfig.appInfo.version)
    }
}