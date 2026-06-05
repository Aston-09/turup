// game.js – Core Turup game controller
// ──────────────────────────────────────

import { Deck, SUITS } from './deck.js';
import { Player } from './player.js';
import { aiChooseCard } from './ai.js';

export class Game {
    /**
     * @param {Function} onUpdate  – callback whenever state changes (for UI)
     * @param {'easy'|'hard'} difficulty
     */
    constructor(onUpdate, difficulty = 'easy') {
        this.onUpdate = onUpdate || (() => {});
        this.difficulty = difficulty;

        // Players: 0=South(human), 1=West(AI), 2=North(AI-partner), 3=East(AI)
        this.players = [
            new Player('You',   0, true),
            new Player('West',  1, false),
            new Player('Partner (North)', 2, false),
            new Player('East',  3, false),
        ];

        // Team A = seats 0 & 2,  Team B = seats 1 & 3
        this.teamAScore = 0; // round wins
        this.teamBScore = 0;

        this.deck = new Deck();
        this.trumpSuit = null;
        this.trumpChooser = 0; // seat that picks trump
        this.currentLeader = 0;
        this.trickCards = [];       // { card, seat }
        this.trickNumber = 0;
        this.teamATricks = 0;
        this.teamBTricks = 0;

        this.phase = 'idle'; // idle | chooseTrump | playing | trickDone | roundOver
        this.waitingForHuman = false;
        this.leadSuit = null;
    }

    // ─── Lifecycle ──────────────────────────────────

    /** Start a new round */
    startRound() {
        this.deck.reset();
        this.players.forEach(p => p.resetRound());

        const hands = this.deck.dealAll(4);
        this.players.forEach((p, i) => {
            p.receiveCards(hands[i]);
            p.sortHand();
        });

        this.trickCards = [];
        this.trickNumber = 0;
        this.teamATricks = 0;
        this.teamBTricks = 0;
        this.trumpSuit = null;
        this.leadSuit = null;

        this.phase = 'chooseTrump';
        this.onUpdate('deal');
    }

    /** Human selects trump suit */
    chooseTrump(suit) {
        if (this.phase !== 'chooseTrump') return;
        this.trumpSuit = suit;
        this.phase = 'playing';
        this.currentLeader = 0; // human leads first trick
        this.startTrick();
    }

    // ─── Trick flow ──────────────────────────────────

    startTrick() {
        this.trickCards = [];
        this.leadSuit = null;
        this.trickNumber++;
        this.onUpdate('trickStart');

        if (this.players[this.currentLeader].isHuman) {
            this.waitingForHuman = true;
            this.onUpdate('waitHuman');
        } else {
            this.aiTurn();
        }
    }

    /**
     * Human plays a card
     * @param {string} cardId
     */
    humanPlay(cardId) {
        if (!this.waitingForHuman) return;

        const player = this.players[0]; // human is always seat 0
        const valid = player.getValidCards(this.leadSuit);
        const card = valid.find(c => c.id === cardId);
        if (!card) return; // invalid selection

        this.waitingForHuman = false;
        const played = player.playCard(cardId);
        this._addToTrick(played, 0);
    }

    /** AI plays automatically */
    aiTurn() {
        const seatOrder = this._turnOrder();
        const idx = this.trickCards.length; // how many have played
        if (idx >= 4) return; // trick complete

        const seat = seatOrder[idx];
        const player = this.players[seat];

        if (player.isHuman) {
            this.waitingForHuman = true;
            this.onUpdate('waitHuman');
            return;
        }

        const cardsOnly = this.trickCards.map(t => t.card);
        const card = aiChooseCard(player, this.leadSuit, this.trumpSuit, cardsOnly, this.difficulty);
        const played = player.playCard(card.id);
        this._addToTrick(played, seat);
    }

    _addToTrick(card, seat) {
        if (this.trickCards.length === 0) {
            this.leadSuit = card.suit;
        }
        this.trickCards.push({ card, seat });
        this.onUpdate('cardPlayed');

        if (this.trickCards.length < 4) {
            // schedule next player after short delay for animation
            setTimeout(() => this.aiTurn(), 600);
        } else {
            // trick complete
            setTimeout(() => this.resolveTrick(), 800);
        }
    }

    /** Determine trick winner, update scores */
    resolveTrick() {
        const winner = this._determineTrickWinner();
        const winningSeat = winner.seat;
        this.players[winningSeat].tricksWon++;

        // Team scoring
        if (winningSeat === 0 || winningSeat === 2) {
            this.teamATricks++;
        } else {
            this.teamBTricks++;
        }

        this.currentLeader = winningSeat;
        this.phase = 'trickDone';
        this.onUpdate('trickDone', { winner: winningSeat, card: winner.card });

        // Check Method C: first to 7 tricks
        if (this.teamATricks >= 7 || this.teamBTricks >= 7) {
            setTimeout(() => this.endRound(), 1200);
            return;
        }

        if (this.trickNumber >= 13) {
            setTimeout(() => this.endRound(), 1200);
            return;
        }

        // Next trick after pause
        this.phase = 'playing';
        setTimeout(() => this.startTrick(), 1000);
    }

    endRound() {
        if (this.teamATricks >= 7) {
            this.teamAScore++;
        } else {
            this.teamBScore++;
        }
        this.phase = 'roundOver';
        this.onUpdate('roundOver', {
            teamATricks: this.teamATricks,
            teamBTricks: this.teamBTricks,
            teamAScore: this.teamAScore,
            teamBScore: this.teamBScore,
        });
    }

    // ─── Helpers ────────────────────────────────────

    /** Get play order starting from currentLeader, clockwise */
    _turnOrder() {
        const order = [];
        for (let i = 0; i < 4; i++) {
            order.push((this.currentLeader + i) % 4);
        }
        return order;
    }

    /** Find which trick entry wins */
    _determineTrickWinner() {
        let best = this.trickCards[0];
        for (let i = 1; i < this.trickCards.length; i++) {
            const challenger = this.trickCards[i];
            if (this._beats(challenger.card, best.card)) {
                best = challenger;
            }
        }
        return best;
    }

    /** Does card `a` beat card `b`? */
    _beats(a, b) {
        const aT = a.suit === this.trumpSuit;
        const bT = b.suit === this.trumpSuit;
        if (aT && !bT) return true;
        if (!aT && bT) return false;
        if (aT && bT) return a.value > b.value;

        const aL = a.suit === this.leadSuit;
        const bL = b.suit === this.leadSuit;
        if (aL && !bL) return true;
        if (!aL && bL) return false;
        if (aL && bL) return a.value > b.value;
        return false;
    }

    /** Set difficulty at runtime */
    setDifficulty(d) {
        this.difficulty = d;
    }
}
