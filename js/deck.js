// deck.js – Deck management
// ──────────────────────────

const SUITS = ['♠', '♥', '♦', '♣'];
const SUIT_NAMES = { '♠': 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs' };
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

/** Create a single card object */
function createCard(suit, rank) {
    return {
        suit,
        rank,
        suitName: SUIT_NAMES[suit],
        value: RANK_VALUES[rank],
        id: `${rank}_${SUIT_NAMES[suit]}`,
        color: (suit === '♥' || suit === '♦') ? 'red' : 'black',
        display: `${rank}${suit}`
    };
}

export class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    /** Build a fresh 52-card deck */
    reset() {
        this.cards = [];
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                this.cards.push(createCard(suit, rank));
            }
        }
    }

    /** Fisher-Yates shuffle */
    shuffle() {
        const a = this.cards;
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }

    /** Draw n cards from the top */
    draw(n = 1) {
        return this.cards.splice(0, n);
    }

    /** Deal all cards equally among `count` players, returns array of arrays */
    dealAll(count = 4) {
        this.shuffle();
        const hands = Array.from({ length: count }, () => []);
        let idx = 0;
        while (this.cards.length > 0) {
            hands[idx % count].push(this.cards.shift());
            idx++;
        }
        return hands;
    }

    get remaining() {
        return this.cards.length;
    }
}

export { SUITS, SUIT_NAMES, RANKS, RANK_VALUES };
