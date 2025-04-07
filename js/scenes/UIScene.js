// js/scenes/UIScene.js

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.gameScene = null;

        // --- Log Properties ---
        this.logHistory = [];        // Array to store log message strings
        this.maxLogLines = 100;       // Max number of lines to keep in history
        this.logText = null;         // The Phaser Text object for the log
        this.logMaskGraphics = null; // Graphics object for the mask shape
        this.logScrollY = 0;         // Current vertical scroll position of the log text
        this.logBackground = null;   // Reference to the background rectangle
        // --------------------
    }

    // init(data) remains the same...
    init(data) {
        if (data && data.gameScene) {
            this.gameScene = data.gameScene;
        } else {
            console.warn("UIScene initialized without a gameScene reference.");
        }
    }


    create() {
        const padding = 15;
        const topY = padding;
        const bottomY = this.cameras.main.height - padding;
        const centerX = this.cameras.main.width / 2;
        const width = this.cameras.main.width;

        this.logHistory = [];

        // --- Top Stats (remain the same) ---
        this.foodText = this.add.text(padding, topY, 'Food: 6', { fontSize: '20px', fontFamily: 'Arial', color: '#008000' }).setOrigin(0, 0);
        this.dangerText = this.add.text(width - padding, topY, 'Danger: 0', { fontSize: '20px', fontFamily: 'Arial', color: '#ff0000' }).setOrigin(1, 0);
        this.turnText = this.add.text(centerX, topY, 'Day: 0/52', { fontSize: '20px', fontFamily: 'Arial', color: '#000000' }).setOrigin(0.5, 0);
        this.deckText = this.add.text(centerX, topY + 25, 'Deck: 52', { fontSize: '16px', fontFamily: 'Arial', color: '#555555' }).setOrigin(0.5, 0);

        // --- Current Card Area (remains the same) ---
        const cardAreaHeight = 200;
        const cardAreaWidth = 150;
        const cardAreaY = 80;
        this.cardOutline = this.add.rectangle(centerX, cardAreaY + cardAreaHeight / 2, cardAreaWidth, cardAreaHeight)
            .setStrokeStyle(2, 0x000000)
            .setOrigin(0.5);
        this.cardDisplayText = this.add.text(centerX, cardAreaY + cardAreaHeight / 2 - 15, 'X', {
            fontSize: '60px', fontFamily: 'Arial', color: '#000000', align: 'center'
        }).setOrigin(0.5);
        this.cardInfoText = this.add.text(centerX, cardAreaY + cardAreaHeight / 2 + 40, 'CURRENT CARD', {
            fontSize: '18px', fontFamily: 'Arial', color: '#555555', align: 'center'
        }).setOrigin(0.5);

        // --- Action Buttons (remain mostly the same, just adjusted Y) ---
        const buttonY = cardAreaY + cardAreaHeight + 40;
        const buttonStyle = { fontSize: '24px', fontFamily: 'Arial', color: '#ffffff', backgroundColor: '#007bff', padding: { x: 15, y: 8 }, align: 'center' };
        const secondaryButtonStyle = { ...buttonStyle, backgroundColor: '#6c757d' };
        const confirmButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', fontSize: '18px' }; // Smaller font for trader accept
        const cancelButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545' };

        this.drawCardButton = this.createButton(centerX, buttonY, 'Draw Card', buttonStyle, () => { if (this.gameScene) this.gameScene.handleDrawCard(); });
        this.setButtonHover(this.drawCardButton, '#0056b3', buttonStyle.backgroundColor, secondaryButtonStyle);

        this.rollD6Button = this.createButton(centerX, buttonY, 'Roll D6', secondaryButtonStyle, () => { if (this.gameScene) this.gameScene.handleRollD6(); });
        this.setButtonHover(this.rollD6Button, '#5a6268', secondaryButtonStyle.backgroundColor, secondaryButtonStyle);
        this.rollD6Button.setVisible(false).setActive(false);

        this.traderChoiceContainer = this.add.container(centerX, buttonY);
        const traderButtonY = 0;
        const traderButtonSpacing = this.cameras.main.width * 0.4; // Adjust spacing based on screen width

        this.traderAcceptButton = this.createButton(-traderButtonSpacing / 2, traderButtonY, 'Spend 2 Food\n(-2 Danger)', confirmButtonStyle, () => { if (this.gameScene) this.gameScene.handleTraderChoice(true); }).setOrigin(0.5);
        this.setButtonHover(this.traderAcceptButton, '#218838', confirmButtonStyle.backgroundColor, secondaryButtonStyle);

        this.traderIgnoreButton = this.createButton(traderButtonSpacing / 2, traderButtonY, 'Ignore', cancelButtonStyle, () => { if (this.gameScene) this.gameScene.handleTraderChoice(false); }).setOrigin(0.5);
        this.setButtonHover(this.traderIgnoreButton, '#c82333', cancelButtonStyle.backgroundColor, secondaryButtonStyle);

        this.traderChoiceContainer.add([this.traderAcceptButton, this.traderIgnoreButton]);
        this.traderChoiceContainer.setVisible(false).setActive(false);


        // --- Log Message Area (Setup for Scrolling) ---
        const logAreaTopY = buttonY + 65; // Y position for the top of the log area
        const logAreaHeight = 150; // Make it taller for scrolling
        const logAreaWidth = width - padding * 2;
        const logAreaX = padding;

        // Background Rect (defines boundaries and interaction area)
        this.logBackground = this.add.rectangle(logAreaX + logAreaWidth / 2, logAreaTopY + logAreaHeight / 2, logAreaWidth, logAreaHeight)
            .setFillStyle(0xeeeeee)
            .setStrokeStyle(1, 0xaaaaaa)
            .setOrigin(0.5);

        // Text Object for Log History
        this.logText = this.add.text(logAreaX + 5, logAreaTopY + 5, 'Welcome to Survivor: 52!', {
            fontSize: '14px', // Slightly smaller for more lines
            fontFamily: 'Arial',
            color: '#333333',
            wordWrap: { width: logAreaWidth - 10 }, // Wrap inside the box
            lineSpacing: 3
        }).setOrigin(0, 0); // Origin top-left

        // Masking Graphics (defines the visible area for logText)
        this.logMaskGraphics = this.make.graphics();
        this.logMaskGraphics.fillStyle(0xffffff); // Color doesn't matter for mask
        this.logMaskGraphics.fillRect(logAreaX, logAreaTopY, logAreaWidth, logAreaHeight);

        // Apply the mask
        this.logText.setMask(this.logMaskGraphics.createGeometryMask());

        // Store initial Y position for scrolling calculations
        this.logScrollY = this.logText.y;

        // --- Input Listener for Scrolling ---
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            // Check if the pointer is roughly over the log background area
            // Note: This check is basic. For perfect accuracy, use geometry checks or make logBackground interactive.
             if (pointer.y > logAreaTopY && pointer.y < logAreaTopY + logAreaHeight) {
                 this.scrollLog(deltaY);
             }
        });


        // --- Bottom Buttons (Adjusted Y) ---
        const bottomButtonY = logAreaTopY + logAreaHeight + 40; // Position below log area
        const bottomButtonStyle = { fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', backgroundColor: '#6c757d', padding: { x: 10, y: 5 }, align: 'center' };
        const restartButtonStyle = { ...bottomButtonStyle, backgroundColor: '#dc3545' };

        this.restartButton = this.createButton(width - padding, bottomButtonY, 'Restart Game', restartButtonStyle, () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene'); // Stop self
            this.scene.start('WelcomeScene');
        }).setOrigin(1, 0.5);
        this.setButtonHover(this.restartButton, '#c82333', restartButtonStyle.backgroundColor, secondaryButtonStyle);


        // --- Event Listeners from GameScene (remain the same) ---
        this.registerGameEventListeners();


        // Initial UI update needs to happen *after* GameScene has initialized stats
        // We'll rely on the initial update triggered from GameScene's create
         this.logMessage("Game started. Draw a card.", false); // Initial log message
    }


    // --- Helper Functions (createButton, setButtonHover - remain the same) ---
    createButton(x, y, text, style, callback) {
        const button = this.add.text(x, y, text, style)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true }); // Add hand cursor on hover
        button.on('pointerdown', callback);
        return button;
    }

    setButtonHover(button, hoverColor, originalColor, style) {
        button.on('pointerover', () => {
            if (button.input.enabled) button.setBackgroundColor(hoverColor); // Check if button is enabled
        });
        button.on('pointerout', () => {
             if (button.input.enabled) button.setBackgroundColor(originalColor);
        });
         // Also handle disable state appearance
        button.on('disable', () => {
            button.setBackgroundColor('#cccccc'); // Grey out when disabled
            button.setColor('#666666');
        });
        button.on('enable', () => {
             button.setBackgroundColor(originalColor); // Restore original color
             button.setColor(style.color || '#ffffff'); // Restore text color from style
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
            this.cardDisplayText.setText('X');
            this.cardDisplayText.setColor('#000000');
            this.cardInfoText.setText('GAME OVER');
        }
    }

    // --- LOG MESSAGE UPDATE ---
    logMessage(message, appendIgnored = false) { // append flag is no longer needed for logic here
        if (!this.logText) return; // Don't process if text object isn't ready

        // Add the new message to the beginning of the history array
        this.logHistory.unshift(message.trim()); // Add to front, trim whitespace

        // Limit the history size
        if (this.logHistory.length > this.maxLogLines) {
            this.logHistory.pop(); // Remove the oldest message from the end
        }

        // Update the text object's content
        this.logText.setText(this.logHistory.join('\n')); // Join with newlines

        // Reset scroll position to show the latest message at the top
        this.logText.y = this.logScrollY; // Reset to initial Y within the mask
        this.scrollLog(0); // Apply clamping immediately in case content height changed
    }
    // --------------------------

    // --- SCROLL LOG FUNCTION ---
    scrollLog(deltaY) {
        if (!this.logText || this.logText.displayHeight <= this.logBackground.displayHeight) {
           // No scrolling needed if text fits or doesn't exist
           this.logText.y = this.logScrollY; // Ensure it's at the top position
           return;
        }

        // Adjust the Y position based on wheel delta (invert deltaY for natural scrolling)
        this.logText.y -= deltaY * 0.5; // Adjust sensitivity multiplier as needed

        // Clamp the Y position to prevent scrolling too far
        const topBound = this.logScrollY; // Cannot scroll text higher than its initial position
        const bottomBound = this.logScrollY + this.logBackground.displayHeight - this.logText.displayHeight; // Bottom of text aligns with bottom of mask

        this.logText.y = Phaser.Math.Clamp(this.logText.y, bottomBound, topBound);
    }
    // -------------------------


    // --- Button State Management (Small change for trader button enabling) ---
    hideActionButtons() {
        this.drawCardButton.setVisible(false).setActive(false);
        this.rollD6Button.setVisible(false).setActive(false);
        this.traderChoiceContainer.setVisible(false).setActive(false);
         // Ensure trader buttons inside container are also disabled conceptually
         this.traderAcceptButton.disableInteractive();
         this.traderIgnoreButton.disableInteractive();
    }

    showDrawButton() {
        this.hideActionButtons(); // Ensure others are hidden
        this.drawCardButton.setVisible(true).setActive(true).setInteractive(); // Make sure it's interactive
    }

    showRollButton() {
        this.hideActionButtons();
        this.rollD6Button.setVisible(true).setActive(true).setInteractive(); // Make sure it's interactive
    }

    showTraderChoice(canAfford) {
        this.hideActionButtons();
        this.traderChoiceContainer.setVisible(true).setActive(true);
        this.traderIgnoreButton.setInteractive(); // Ignore button is always active

        // Enable/disable accept button based on affordability
        if (canAfford) {
            this.traderAcceptButton.setInteractive();
            this.traderAcceptButton.emit('enable'); // Trigger style update if using enable/disable events
        } else {
            this.traderAcceptButton.disableInteractive();
             this.traderAcceptButton.emit('disable'); // Trigger style update
        }
    }

    // --- Event Listener Management ---
    registerGameEventListeners() {
        // Ensure we only register listeners if gameScene exists and avoid duplicates
        if (this.gameScene && !this.gameScene.events.listenerCount('updateUI')) {
            this.gameScene.events.on('updateUI', this.updateStats, this);
            this.gameScene.events.on('displayCard', this.displayCard, this);
            this.gameScene.events.on('logMessage', this.logMessage, this);
            this.gameScene.events.on('promptRoll', this.showRollButton, this);
            this.gameScene.events.on('promptTrader', this.showTraderChoice, this);
            this.gameScene.events.on('hideActions', this.hideActionButtons, this);
            this.gameScene.events.on('showDraw', this.showDrawButton, this);

            // Cleanup listeners when this UIScene shuts down
            this.events.on('shutdown', this.unregisterGameEventListeners, this);
        }
    }

    unregisterGameEventListeners() {
        if (this.gameScene) {
            this.gameScene.events.off('updateUI', this.updateStats, this);
            this.gameScene.events.off('displayCard', this.displayCard, this);
            this.gameScene.events.off('logMessage', this.logMessage, this);
            this.gameScene.events.off('promptRoll', this.showRollButton, this);
            this.gameScene.events.off('promptTrader', this.showTraderChoice, this);
            this.gameScene.events.off('hideActions', this.hideActionButtons, this);
            this.gameScene.events.off('showDraw', this.showDrawButton, this);
        }
    }

     // Call registration when scene wakes up too (if applicable)
     // awake() { this.registerGameEventListeners(); }
}