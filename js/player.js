// player.js – Player hand management
// ────────────────────────────────────

export class Player {
    /**
     * @param {string} name   – display name
     * @param {number} seat   – 0=South(human), 1=West, 2=North, 3=East
     * @param {boolean} isHuman
     */
    constructor(name, seat, isHuman = false) {
        this.name = name;
        this.seat = seat;
        this.isHuman = isHuman;
        this.hand = [];
        this.tricksWon = 0;
    }

    /** Receive dealt cards */
    receiveCards(cards) {
        this.hand.push(...cards);
    }

    /** Sort hand by suit then rank (ascending) */
    sortHand() {
        const suitOrder = { '♠': 0, '♥': 1, '♦': 2, '♣': 3 };
        this.hand.sort((a, b) => {
            if (suitOrder[a.suit] !== suitOrder[b.suit]) {
                return suitOrder[a.suit] - suitOrder[b.suit];
            }
            return a.value - b.value;
        });
    }

    /** Remove and return a card from hand by id */
    playCard(cardId) {
        const idx = this.hand.findIndex(c => c.id === cardId);
        if (idx === -1) return null;
        return this.hand.splice(idx, 1)[0];
    }

    /** Get cards that match the lead suit */
    getCardsOfSuit(suit) {
        return this.hand.filter(c => c.suit === suit);
    }

    /** Get valid cards: must follow suit if possible */
    getValidCards(leadSuit) {
        if (!leadSuit) return [...this.hand]; // leading, anything goes
        const suited = this.getCardsOfSuit(leadSuit);
        return suited.length > 0 ? suited : [...this.hand];
    }

    /** Reset for a new round */
    resetRound() {
        this.hand = [];
        this.tricksWon = 0;
    }
}
