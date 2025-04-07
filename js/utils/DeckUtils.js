// js/utils/DeckUtils.js

const DeckUtils = {
    createStandardDeck: function() {
        const suits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        let deck = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
            }
        }
        return deck;
    },

    // Fisher-Yates (Knuth) Shuffle
    shuffleDeck: function(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
        }
        return deck; // Return shuffled deck (optional, as it shuffles in place)
    },

    getCardValueNumeric: function(cardValue) {
        if (!isNaN(parseInt(cardValue))) {
            return parseInt(cardValue);
        }
        switch (cardValue) {
            case 'A': return 1; // Or 11/14 depending on game rules, here Ace has special rules
            case 'J': return 11;
            case 'Q': return 12;
            case 'K': return 13;
            default: return 0;
        }
    },

    isRed: function(card) {
        return card.suit === 'H' || card.suit === 'D';
    },

    isBlack: function(card) {
        return card.suit === 'C' || card.suit === 'S';
    },

    getCardText: function(card) {
        if (!card) return "No Card";
        let suitSymbol = '';
        switch (card.suit) {
            case 'H': suitSymbol = '♥'; break; // Hearts
            case 'D': suitSymbol = '♦'; break; // Diamonds
            case 'C': suitSymbol = '♣'; break; // Clubs
            case 'S': suitSymbol = '♠'; break; // Spades
        }
        return `${card.value}${suitSymbol}`;
    },

     getCardColor: function(card) {
        return (card && (card.suit === 'H' || card.suit === 'D')) ? '#ff0000' : '#000000';
     }
};