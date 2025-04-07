// js/scenes/UIScene.js

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.gameScene = null; // Reference to the main game scene
    }

    // Called when the scene starts, receiving data from the launching scene
    init(data) {
        // Check if gameScene is provided, usually by GameScene starting this scene
        if (data && data.gameScene) {
            this.gameScene = data.gameScene;
        } else {
            console.warn("UIScene initialized without a gameScene reference.");
            // Fallback or error handling might be needed depending on game flow
        }
    }

    create() {
        const padding = 15;
        const topY = padding;
        const bottomY = this.cameras.main.height - padding;
        const centerX = this.cameras.main.width / 2;
        const width = this.cameras.main.width;

        // --- Top Stats ---
        this.foodText = this.add.text(padding, topY, 'Food: 6', { fontSize: '20px', fontFamily: 'Arial', color: '#008000' }).setOrigin(0, 0); // Green for food
        this.dangerText = this.add.text(width - padding, topY, 'Danger: 0', { fontSize: '20px', fontFamily: 'Arial', color: '#ff0000' }).setOrigin(1, 0); // Red for danger
        this.turnText = this.add.text(centerX, topY, 'Day: 0/52', { fontSize: '20px', fontFamily: 'Arial', color: '#000000' }).setOrigin(0.5, 0);
        this.deckText = this.add.text(centerX, topY + 25, 'Deck: 52', { fontSize: '16px', fontFamily: 'Arial', color: '#555555' }).setOrigin(0.5, 0);


        // --- Current Card Area (Wireframe Style) ---
        const cardAreaHeight = 200;
        const cardAreaWidth = 150;
        const cardAreaY = 80; // Moved up slightly
        this.cardOutline = this.add.rectangle(centerX, cardAreaY + cardAreaHeight / 2, cardAreaWidth, cardAreaHeight)
            .setStrokeStyle(2, 0x000000) // Black outline
            .setOrigin(0.5);

        // Placeholder for card text/symbol
        this.cardDisplayText = this.add.text(centerX, cardAreaY + cardAreaHeight / 2 - 15, 'X', {
            fontSize: '60px',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);
         this.cardInfoText = this.add.text(centerX, cardAreaY + cardAreaHeight / 2 + 40, 'CURRENT CARD', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#555555',
            align: 'center'
        }).setOrigin(0.5);

        // --- Action Buttons ---
        const buttonY = cardAreaY + cardAreaHeight + 40; // Adjusted Y
        const buttonStyle = {
            fontSize: '24px', fontFamily: 'Arial', color: '#ffffff',
            backgroundColor: '#007bff', padding: { x: 15, y: 8 }, align: 'center'
        };
        const secondaryButtonStyle = { ...buttonStyle, backgroundColor: '#6c757d' }; // Grey for secondary actions
        const confirmButtonStyle = { ...buttonStyle, backgroundColor: '#28a745' }; // Green for confirm
        const cancelButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545' }; // Red for cancel/ignore

        // Draw Card Button
        this.drawCardButton = this.createButton(centerX, buttonY, 'Draw Card', buttonStyle, () => {
            if (this.gameScene) this.gameScene.handleDrawCard();
        });
        this.setButtonHover(this.drawCardButton, '#0056b3', buttonStyle.backgroundColor);

        // Roll D6 Button (Initially hidden)
        this.rollD6Button = this.createButton(centerX, buttonY, 'Roll D6', secondaryButtonStyle, () => {
            if (this.gameScene) this.gameScene.handleRollD6();
        });
        this.setButtonHover(this.rollD6Button, '#5a6268', secondaryButtonStyle.backgroundColor);
        this.rollD6Button.setVisible(false).setActive(false); // Start hidden and inactive

        // Trader Choice Buttons (Initially hidden)
        this.traderChoiceContainer = this.add.container(centerX, buttonY);
        const traderButtonY = 0; // Relative to container
        const traderButtonSpacing = 150;

        this.traderAcceptButton = this.createButton(-traderButtonSpacing / 2, traderButtonY, 'Spend 2 Food\n(-2 Danger)', confirmButtonStyle, () => {
             if (this.gameScene) this.gameScene.handleTraderChoice(true);
        }).setOrigin(0.5);
        this.setButtonHover(this.traderAcceptButton, '#218838', confirmButtonStyle.backgroundColor);

        this.traderIgnoreButton = this.createButton(traderButtonSpacing / 2, traderButtonY, 'Ignore', cancelButtonStyle, () => {
             if (this.gameScene) this.gameScene.handleTraderChoice(false);
        }).setOrigin(0.5);
        this.setButtonHover(this.traderIgnoreButton, '#c82333', cancelButtonStyle.backgroundColor);

        this.traderChoiceContainer.add([this.traderAcceptButton, this.traderIgnoreButton]);
        this.traderChoiceContainer.setVisible(false).setActive(false);


        // --- Log Message Area ---
        const logY = buttonY + 60; // Adjusted Y
        const logHeight = 100; // Increased height
        this.logBackground = this.add.rectangle(centerX, logY + logHeight/2, width - padding*2, logHeight)
            .setFillStyle(0xeeeeee)
            .setStrokeStyle(1, 0xaaaaaa)
            .setOrigin(0.5);

        this.logText = this.add.text(padding + 10, logY + 10, 'Game started. Draw a card.', {
            fontSize: '16px', fontFamily: 'Arial', color: '#333333',
            wordWrap: { width: width - padding*2 - 20 }, // Wrap inside the box
            lineSpacing: 4
        }).setOrigin(0, 0);


        // --- Bottom Buttons ---
        const bottomButtonY = bottomY - 30;
        const bottomButtonStyle = {
            fontSize: '20px', fontFamily: 'Arial', color: '#ffffff',
            backgroundColor: '#6c757d', padding: { x: 10, y: 5 }, align: 'center'
        };
        const restartButtonStyle = { ...bottomButtonStyle, backgroundColor: '#dc3545' };

        // Restart Game Button
        this.restartButton = this.createButton(width - padding, bottomButtonY, 'Restart Game', restartButtonStyle, () => {
            // Stop current game scenes and start Welcome scene
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('WelcomeScene');
        }).setOrigin(1, 0.5); // Align to right
        this.setButtonHover(this.restartButton, '#c82333', restartButtonStyle.backgroundColor);

        // --- Event Listeners from GameScene ---
        this.gameScene.events.on('updateUI', this.updateStats, this);
        this.gameScene.events.on('displayCard', this.displayCard, this);
        this.gameScene.events.on('logMessage', this.logMessage, this);
        this.gameScene.events.on('promptRoll', this.showRollButton, this);
        this.gameScene.events.on('promptTrader', this.showTraderChoice, this);
        this.gameScene.events.on('hideActions', this.hideActionButtons, this); // Hide all mid-actions
        this.gameScene.events.on('showDraw', this.showDrawButton, this); // Show draw after action completes

        // Optional: Cleanup listener on shutdown
        this.events.on('shutdown', () => {
            if (this.gameScene) {
                this.gameScene.events.off('updateUI', this.updateStats, this);
                this.gameScene.events.off('displayCard', this.displayCard, this);
                this.gameScene.events.off('logMessage', this.logMessage, this);
                this.gameScene.events.off('promptRoll', this.showRollButton, this);
                this.gameScene.events.off('promptTrader', this.showTraderChoice, this);
                this.gameScene.events.off('hideActions', this.hideActionButtons, this);
                this.gameScene.events.off('showDraw', this.showDrawButton, this);
            }
        });
    }

    // Helper to create buttons
    createButton(x, y, text, style, callback) {
        const button = this.add.text(x, y, text, style)
            .setOrigin(0.5)
            .setInteractive();
        button.on('pointerdown', callback);
        return button;
    }

    // Helper for button hover effect
    setButtonHover(button, hoverColor, originalColor) {
        button.on('pointerover', () => {
            if (button.active) button.setBackgroundColor(hoverColor);
        });
        button.on('pointerout', () => {
            if (button.active) button.setBackgroundColor(originalColor); // Use the original style's color
        });
    }

    // --- UI Update Functions ---

    updateStats(stats) {
        this.foodText.setText(`Food: ${stats.food}`);
        this.dangerText.setText(`Danger: ${stats.danger}`);
        this.turnText.setText(`Day: ${stats.turn}/52`);
        this.deckText.setText(`Deck: ${stats.deckSize}`);
    }

    displayCard(card) {
        if (card) {
            this.cardDisplayText.setText(DeckUtils.getCardText(card));
            this.cardDisplayText.setColor(DeckUtils.getCardColor(card));
            this.cardInfoText.setText('CURRENT CARD');
        } else {
            // Initial state or after game over
            this.cardDisplayText.setText('X');
            this.cardDisplayText.setColor('#000000');
            this.cardInfoText.setText('GAME OVER');
        }
    }

    logMessage(message, append = false) { // <<< CHANGE: Add append parameter
        if (append && this.logText) { // Check if logText exists
            // Append the new message to the existing text
            this.logText.setText(this.logText.text + message);
        } else if (this.logText) { // Check if logText exists
            // Default behavior: replace the text
            this.logText.setText(message);
        } else {
            console.warn("logText UI element not ready for message:", message);
        }
        // Optional: Implement scrolling if text exceeds log box height
        // e.g., check this.logText.height vs this.logBackground.height
    }

    // --- Button State Management ---

    hideActionButtons() {
        this.drawCardButton.setVisible(false).setActive(false);
        this.rollD6Button.setVisible(false).setActive(false);
        this.traderChoiceContainer.setVisible(false).setActive(false);
    }

    showDrawButton() {
        this.hideActionButtons(); // Ensure others are hidden
        this.drawCardButton.setVisible(true).setActive(true);
    }

    showRollButton() {
        this.hideActionButtons();
        this.rollD6Button.setVisible(true).setActive(true);
    }

    showTraderChoice(canAfford) {
        this.hideActionButtons();
        this.traderChoiceContainer.setVisible(true).setActive(true);
        // Disable accept button if player can't afford it
        if (!canAfford) {
            this.traderAcceptButton.disableInteractive();
            this.traderAcceptButton.setStyle({ color: '#aaaaaa', backgroundColor: '#999999'}); // Visually disable
        } else {
             this.traderAcceptButton.setInteractive(); // Ensure it's interactive if they can afford
             this.traderAcceptButton.setStyle({ color: '#ffffff', backgroundColor: '#28a745'}); // Reset style
        }
    }
}