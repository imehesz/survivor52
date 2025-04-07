// js/scenes/HowToPlayScene.js

class HowToPlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HowToPlayScene' });
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const topY = 50;

        this.add.text(centerX, topY, 'How to Play', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5, 0);

        const rulesText = `
Goal: Survive 52 days (card draws).
Manage Food & Danger.
Lose if Food < 0 or Danger >= 10.

Turns:
1. Draw a card.
2. Resolve its effect (see below).
3. Every 5 turns, consume 1 Food. If you can't, gain 2 Danger.

Card Effects:
- Red (♥♦) Even (2-10): +1 Food
- Red (♥♦) Odd (3-9): Roll D6. 4-6 = -1 Danger, 1-3 = +1 Danger
- Red (♥♦) J, Q, K: Trader. Option: Spend 2 Food for -2 Danger.
- Red (♥♦) Ace: +1 Food, -1 Danger

- Black (♣♠) 2-10: Threat. Roll D6. Need >= (Value/2, round up). Fail = -1 Food, +1 Danger.
- Black (♣♠) J, Q, K: Major Threat. Roll D6 twice. If NO 5 or 6, -1 Food, +2 Danger.
- Black (♣♠) Ace: Environmental Hazard. -1 Food, +1 Danger.

Good luck!
        `;

        this.add.text(centerX, topY + 60, rulesText, {
            fontSize: '16px', // Smaller for rules
            fontFamily: 'Arial',
            color: '#333333',
            align: 'left',
            wordWrap: { width: this.cameras.main.width - 40 } // Wrap text
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