// main.js – Entry point: wires the Game to the UI
// ─────────────────────────────────────────────────

import { Game } from './game.js';
import {
    renderHand,
    renderTrick,
    showTrumpSelector,
    updateInfoBar,
    showMessage,
    showRoundOver,
    updatePlayerLabels,
} from './ui.js';

let game;
let difficulty = 'easy';

// ─── DOM refs ────────────────────────────────────
const handSouth = document.getElementById('hand-south');
const handWest  = document.getElementById('hand-west');
const handNorth = document.getElementById('hand-north');
const handEast  = document.getElementById('hand-east');
const trickPile = document.getElementById('trick-pile');
const newGameBtn    = document.getElementById('new-game-btn');
const difficultyBtn = document.getElementById('difficulty-btn');

// ─── Helpers ─────────────────────────────────────

function handContainers() {
    return [handSouth, handWest, handNorth, handEast];
}

function refreshUI() {
    const g = game;
    const validIds = g.waitingForHuman
        ? g.players[0].getValidCards(g.leadSuit).map(c => c.id)
        : [];

    const containers = handContainers();
    g.players.forEach((p, i) => {
        renderHand(containers[i], p, validIds, i === 0 && g.waitingForHuman);
    });

    renderTrick(trickPile, g.trickCards);

    updateInfoBar({
        trumpSuit: g.trumpSuit,
        trickNumber: g.trickNumber,
        teamATricks: g.teamATricks,
        teamBTricks: g.teamBTricks,
        teamAScore: g.teamAScore,
        teamBScore: g.teamBScore,
        difficulty: g.difficulty,
    });

    updatePlayerLabels(g.players, g.currentLeader);
}

// ─── Card click handler (event delegation) ───────

handSouth.addEventListener('click', (e) => {
    const cardEl = e.target.closest('.card-clickable');
    if (!cardEl) return;
    const id = cardEl.dataset.cardId;
    if (!id) return;
    game.humanPlay(id);
});

// ─── Game event handler ──────────────────────────

function onGameUpdate(event, data) {
    switch (event) {
        case 'deal':
            showMessage('Cards dealt! Choose the trump suit.', 3000);
            refreshUI();
            showTrumpSelector(suit => {
                game.chooseTrump(suit);
            });
            break;

        case 'trickStart':
        case 'waitHuman':
        case 'cardPlayed':
            refreshUI();
            if (event === 'waitHuman') {
                showMessage('Your turn – pick a card!', 1500);
            }
            break;

        case 'trickDone': {
            refreshUI();
            const name = game.players[data.winner].name;
            showMessage(`${name} wins the trick!`, 1200);
            break;
        }

        case 'roundOver':
            refreshUI();
            showRoundOver(data, () => game.startRound());
            break;
    }
}

// ─── Button handlers ─────────────────────────────

newGameBtn.addEventListener('click', () => {
    game = new Game(onGameUpdate, difficulty);
    game.startRound();
});

difficultyBtn.addEventListener('click', () => {
    difficulty = difficulty === 'easy' ? 'hard' : 'easy';
    difficultyBtn.textContent = difficulty === 'easy' ? '🟢 Easy' : '🔴 Hard';
    if (game) game.setDifficulty(difficulty);
    showMessage(`AI difficulty: ${difficulty}`, 1200);
});

// ─── Auto-start ──────────────────────────────────
game = new Game(onGameUpdate, difficulty);
game.startRound();
