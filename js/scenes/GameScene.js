// js/scenes/GameScene.js

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Game State Variables
        this.deck = [];
        this.currentCard = null;
        this.food = 0;
        this.danger = 0;
        this.turn = 0;

        // State for multi-step actions
        this.needsRoll = false;
        this.rollCallback = null; // Function to call after rolling
        this.needsTraderChoice = false;
    }

    create() {
        console.log("GameScene create");
        this.initializeGame();

        // Launch the UI Scene in parallel, passing a reference to this scene
        this.scene.launch('UIScene', { gameScene: this });

        // Initial UI update
        this.updateUI();
        this.events.emit('logMessage', 'Game started. Draw your first card.');
        this.events.emit('showDraw'); // Show the draw button initially
    }

    initializeGame() {
        this.deck = DeckUtils.shuffleDeck(DeckUtils.createStandardDeck());
        this.currentCard = null;
        this.food = 6;
        this.danger = 0;
        this.turn = 0;
        this.needsRoll = false;
        this.rollCallback = null;
        this.needsTraderChoice = false;

        // Reset UI elements if restarting the scene directly
        this.events.emit('displayCard', null); // Clear card display
    }

    // --- Core Game Flow ---

    handleDrawCard() {
        if (this.deck.length === 0) {
            console.error("Attempted to draw from empty deck.");
            // This case should ideally be handled by the win condition check
            return;
        }
        if (this.needsRoll || this.needsTraderChoice) {
            console.warn("Cannot draw card while waiting for player action.");
            return;
        }

        this.turn++;
        this.currentCard = this.deck.pop();
        console.log(`Turn ${this.turn}: Drew ${DeckUtils.getCardText(this.currentCard)}`);

        this.events.emit('hideActions'); // Hide buttons during resolution
        this.events.emit('displayCard', this.currentCard);
        this.updateUI(); // Update deck size etc.

        this.resolveCardEffect(this.currentCard);

        // Don't immediately show Draw button if an action (roll/choice) is needed
        if (!this.needsRoll && !this.needsTraderChoice) {
             this.checkEndOfTurn(); // Check food consumption, win/loss if no further action needed
        }
    }


// Function inside GameScene.js

resolveCardEffect(card) {
    const value = DeckUtils.getCardValueNumeric(card.value);
    const isRed = DeckUtils.isRed(card);
    let message = `Day ${this.turn}: Drew ${DeckUtils.getCardText(card)}. `; // Base message for the log

    // Reset interaction flags at the start of card resolution
    this.needsRoll = false;
    this.rollCallback = null;
    this.needsTraderChoice = false;

    if (isRed) {
        // --- Red Cards (Hearts, Diamonds) ---
        if (card.value === 'A') {
            // Red Ace: Simple bonus
            message += "Good fortune! +1 Food, -1 Danger.";
            this.food++;
            this.danger = Math.max(0, this.danger - 1); // Danger can't go below 0
            this.events.emit('logMessage', message);
            // No further player action needed for this card effect

        } else if (['K', 'Q', 'J'].includes(card.value)) {
            // Red Face Card: Trader encounter
            message += "A Trader appears. Spend 2 Food to remove 2 Danger?";
            this.needsTraderChoice = true; // Set flag indicating player needs to choose
            this.events.emit('logMessage', message); // Log the prompt
            // Signal UI to show trader buttons, passing whether the player can afford it
            this.events.emit('promptTrader', this.food >= 2);
            // checkEndOfTurn() will be called within handleTraderChoice() after the player decides

        } else if (value % 2 === 0) { // Even Numbered Red Card (2, 4, 6, 8, 10)
            message += "Found supplies! +1 Food.";
            this.food++;
            this.events.emit('logMessage', message);
            // No further player action needed for this card effect

        } else { // Odd Numbered Red Card (3, 5, 7, 9) - Single Roll
            message += "Found potential shelter. Roll D6 to check safety.";
            this.needsRoll = true; // Set flag indicating player needs to roll
            this.rollCallback = (roll) => { // Define the specific action for this roll
                let rollMsg = ` Rolled ${roll}.`;
                if (roll >= 4) {
                    rollMsg += " Secure! -1 Danger.";
                    this.danger = Math.max(0, this.danger - 1);
                } else {
                    rollMsg += " Risky! +1 Danger.";
                    this.danger++;
                }
                this.events.emit('logMessage', message + rollMsg); // Log the final outcome

                // --- State cleanup & progression ---
                this.needsRoll = false; // Clear the flag after roll is processed
                this.rollCallback = null; // Clear the callback
                this.checkEndOfTurn(); // Proceed to end-of-turn checks
                // ------------------------------------
            };
            this.events.emit('logMessage', message); // Log the initial prompt
            this.events.emit('promptRoll'); // Signal UI to show the Roll D6 button
            // checkEndOfTurn() will be called inside the rollCallback
        }
    } else {
        // --- Black Cards (Spades, Clubs) ---
        if (card.value === 'A') {
            // Black Ace: Simple penalty
            message += "Environmental Hazard! -1 Food, +1 Danger.";
            this.food--;
            this.danger++;
            this.events.emit('logMessage', message);
            // No further player action needed for this card effect

        } else if (['K', 'Q', 'J'].includes(card.value)) { // Black Face Card: Major Threat - Double Roll
            message += "Major Threat! Roll D6 twice. Need a 5 or 6 to avoid penalty.";
            this.needsRoll = true; // Set flag for the entire double-roll sequence
            let rolls = []; // Array to store the two rolls

            // Define the callback for the FIRST roll
            this.rollCallback = (roll1) => {
                rolls.push(roll1);
                let rollMsg = ` First roll: ${roll1}.`;
                // Log the first roll result immediately and prompt for the second
                this.events.emit('logMessage', message + rollMsg + " Roll again.");

                // --- Redefine the rollCallback for the SECOND roll ---
                this.rollCallback = (roll2) => {
                    rolls.push(roll2);
                    rollMsg += ` Second roll: ${roll2}.`; // Append second roll info to the message

                    // Determine final outcome based on both rolls
                    if (rolls.includes(5) || rolls.includes(6)) {
                        rollMsg += " Success! Threat avoided.";
                    } else {
                        rollMsg += " Failure! -1 Food, +2 Danger.";
                        this.food--;
                        this.danger += 2;
                    }
                    this.events.emit('logMessage', message + rollMsg); // Log the final outcome

                    // --- State cleanup & progression AFTER second roll ---
                    this.needsRoll = false; // Clear flag only after sequence completes
                    this.rollCallback = null; // Clear callback
                    this.checkEndOfTurn(); // Proceed to end-of-turn checks
                    // -------------------------------------------------
                };
                // -----------------------------------------------------

                // Re-trigger the prompt for the roll button in UI for the second roll
                this.events.emit('promptRoll');
            };

            // Log the initial prompt and show the button for the FIRST roll
            this.events.emit('logMessage', message);
            this.events.emit('promptRoll');
            // checkEndOfTurn() will be called inside the *second* roll's callback

        } else { // Numbered Black Card (2-10) - Single Roll
            const target = Math.ceil(value / 2); // Calculate target number, rounding up
            message += ` Threat (${value})! Roll D6. Need ${target} or higher.`;
            this.needsRoll = true; // Set flag indicating player needs to roll
            this.rollCallback = (roll) => { // Define the specific action for this roll
                let rollMsg = ` Rolled ${roll}.`;
                if (roll >= target) {
                    rollMsg += " Success! Threat overcome.";
                } else {
                    rollMsg += ` Failure! -1 Food, +1 Danger.`;
                    this.food--;
                    this.danger++;
                }
                this.events.emit('logMessage', message + rollMsg); // Log the final outcome

                // --- State cleanup & progression ---
                this.needsRoll = false; // Clear the flag after roll is processed
                this.rollCallback = null; // Clear the callback
                this.checkEndOfTurn(); // Proceed to end-of-turn checks
                // ------------------------------------
            };
            this.events.emit('logMessage', message); // Log the initial prompt
            this.events.emit('promptRoll'); // Signal UI to show the Roll D6 button
            // checkEndOfTurn() will be called inside the rollCallback
        }
    }

    // --- Fallback End-of-Turn Check ---
    // If the card effect resolved completely without needing a roll or trader choice
    // (e.g., Red Ace, Red Even, Black Ace), we need to manually trigger the end-of-turn check here.
    if (!this.needsRoll && !this.needsTraderChoice) {
        this.checkEndOfTurn();
    }
}



    handleRollD6() {
        if (!this.needsRoll || !this.rollCallback) {
            console.warn("Roll D6 called inappropriately.");
            return;
        }

        const roll = Phaser.Math.Between(1, 6);
        console.log("Rolled:", roll);

        // Note: checkEndOfTurn is now called *within* the rollCallback for async actions
        if (this.rollCallback) {
            this.rollCallback(roll);
        } else {
            // Should not happen if the initial check passed, but good for safety
            console.error("Roll callback was unexpectedly null!");
        }
    }

    handleTraderChoice(accepted) {
        if (!this.needsTraderChoice) {
            console.warn("Trader choice handled inappropriately.");
            return;
        }

        this.needsTraderChoice = false;
        let message = `Day ${this.turn}: Drew ${DeckUtils.getCardText(this.currentCard)}. Trader encounter. `;

        if (accepted) {
            if (this.food >= 2) {
                message += "You traded 2 Food for -2 Danger.";
                this.food -= 2;
                this.danger = Math.max(0, this.danger - 2);
            } else {
                // This case should be prevented by the UI disabling the button, but handle defensively
                message += "You couldn't afford the trade. Ignored.";
            }
        } else {
            message += "You ignored the trader.";
        }

        this.events.emit('logMessage', message);
        this.checkEndOfTurn(); // Now check end of turn stuff
    }


    checkEndOfTurn() {
        // 1. Consume Food every 5 turns (after resolving card)
        if (this.turn > 0 && this.turn % 5 === 0) {
            let foodMsg = ` End of Day ${this.turn}: Time to eat.`;
            if (this.food >= 1) {
                this.food--;
                foodMsg += " Consumed 1 Food.";
            } else {
                this.danger += 2;
                foodMsg += " Not enough food! +2 Danger!";
            }
            // Append food consumption message to the log (or show separately)
             this.events.emit('logMessage', foodMsg, true);
        }

        // 2. Check Win/Loss Conditions
        this.updateUI(); // Update stats *before* checking conditions

        if (this.food < 0) {
            this.gameOver(false, "You starved!");
            return; // Stop further processing
        }
        if (this.danger >= 10) {
            this.gameOver(false, "Danger \r\n overwhelmed you!");
            return; // Stop further processing
        }
        if (this.turn >= 52 && this.deck.length === 0) {
             // Check after turn 52 is fully resolved
            this.gameOver(true, "You survived 52 days!");
            return; // Stop further processing
        }

        // 3. If game continues, allow next draw
        if (!this.needsRoll && !this.needsTraderChoice) { // Double check no pending actions
             this.events.emit('showDraw');
        }
    }

    gameOver(win, message) {
        console.log("Game Over:", message);
        this.events.emit('hideActions'); // Hide all action buttons
        this.events.emit('logMessage', `Game Over: ${message}`);
        this.events.emit('displayCard', null); // Clear card display
        // Optionally disable restart button in UIScene? Or just transition.

        // Delay slightly before showing game over screen
        this.time.delayedCall(1500, () => {
            this.scene.stop('UIScene'); // Stop the UI scene too
            this.scene.start('GameOverScene', { win: win, message: message });
        });
    }

    updateUI() {
        // Send current state to UIScene
        this.events.emit('updateUI', {
            food: this.food,
            danger: this.danger,
            turn: this.turn,
            deckSize: this.deck.length
        });
    }
}