// js/scenes/AboutScene.js

class AboutScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AboutScene' });
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const topY = 50;

        this.add.text(centerX, topY, 'About Survivor: 52', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5, 0);

        const aboutText = `
You are stranded. Alone.
Your only companions are a standard deck of playing cards and a single six-sided die.
Each card drawn represents a day, an event, a challenge, or a small fortune.
Can you manage your dwindling food supplies and stave off the ever-present danger long enough to survive 52 days?

This game prototype explores simple resource management and chance within a card game framework.
        `;

        this.add.text(centerX, topY + 60, aboutText, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#333333',
            align: 'center',
            wordWrap: { width: this.cameras.main.width - 60 }
        }).setOrigin(0.5, 0);

        // Back Button
        const backButton = this.add.text(centerX, this.cameras.main.height - 50, 'BACK', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('WelcomeScene');
        });
         backButton.on('pointerover', () => backButton.setBackgroundColor('#777777'));
         backButton.on('pointerout', () => backButton.setBackgroundColor('#555555'));
    }
}