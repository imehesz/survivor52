// js/scenes/GameOverScene.js

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.win = data.win || false; // Did the player win?
        this.message = data.message || (this.win ? 'You Survived!' : 'You Perished...');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Display Win/Loss Message
        this.add.text(centerX, centerY - 100, this.message, {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: this.win ? '#008000' : '#ff0000', // Green for win, Red for loss
            align: 'center'
        }).setOrigin(0.5);

        // Restart Button
        const restartButton = this.add.text(centerX, centerY + 50, 'Play Again', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#007bff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerdown', () => {
            // Restart the game by going back to the Game Scene
            // Ensure previous game/ui scenes are stopped if they weren't already
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('GameScene'); // Start a fresh game
        });
        restartButton.on('pointerover', () => restartButton.setBackgroundColor('#0056b3'));
        restartButton.on('pointerout', () => restartButton.setBackgroundColor('#007bff'));


        // Main Menu Button
        const menuButton = this.add.text(centerX, centerY + 150, 'Main Menu', {
             fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#6c757d',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        menuButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('WelcomeScene');
        });
        menuButton.on('pointerover', () => menuButton.setBackgroundColor('#5a6268'));
        menuButton.on('pointerout', () => menuButton.setBackgroundColor('#6c757d'));
    }
}