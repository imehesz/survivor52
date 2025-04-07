// js/scenes/FooterScene.js

class FooterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FooterScene' });
    }

    create() {
        console.log("FooterScene create"); // For debugging

        const padding = 15; // Small padding from the edge
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        // Retrieve data from registry (ensure it's set before this scene is launched)
        const gameName = this.registry.get('gameTitle') || 'Survivor: 52'; // Default value just in case
        const version = this.registry.get('gameVersion') || '?.?.?';      // Default value

        const footerText = `${gameName} v${version}`;

        // Create the text object
        this.footerDisplay = this.add.text(
            padding, // Centered horizontally
            gameHeight - padding, // Positioned at the bottom with padding
            footerText,
            {
                fontSize: '12px', // Make it small
                fontFamily: 'Arial',
                color: '#777777', // Light grey, less intrusive
                align: 'center'
            }
        )
        .setOrigin(0, 1) // Origin bottom-center for easy positioning
        .setDepth(1000) // Set a very high depth to ensure it draws on top of everything else
        .setScrollFactor(0); // Ensure it doesn't move with camera scroll (if camera is used)

    }

    // No update needed for static text
    // update() {}
}