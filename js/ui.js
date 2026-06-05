// ui.js – Rendering, animations, and DOM helpers
// ─────────────────────────────────────────────────

const SUIT_HTML = {
    '♠': '<span class="suit black">♠</span>',
    '♥': '<span class="suit red">♥</span>',
    '♦': '<span class="suit red">♦</span>',
    '♣': '<span class="suit black">♣</span>',
};

// ─── Card rendering ──────────────────────────────

/**
 * Build HTML for a visible card (front-facing)
 * @param {object} card
 * @param {boolean} clickable
 * @param {boolean} highlighted  – is it a valid play?
 * @returns {string}
 */
export function renderCardFront(card, clickable = false, highlighted = false) {
    const colorClass = card.color === 'red' ? 'card-red' : 'card-black';
    const clickAttr = clickable ? `data-card-id="${card.id}"` : '';
    const hlClass = highlighted ? 'card-valid' : '';
    const pointerClass = clickable ? 'card-clickable' : '';

    return `
        <div class="card ${colorClass} ${hlClass} ${pointerClass}" ${clickAttr}>
            <div class="card-corner card-corner-top">
                <span class="card-rank">${card.rank}</span>
                <span class="card-suit">${card.suit}</span>
            </div>
            <div class="card-center">
                <span class="card-suit-big">${card.suit}</span>
            </div>
            <div class="card-corner card-corner-bottom">
                <span class="card-rank">${card.rank}</span>
                <span class="card-suit">${card.suit}</span>
            </div>
        </div>`;
}

/** Build HTML for a hidden card (back-facing) */
export function renderCardBack() {
    return `
        <div class="card card-back-face">
            <div class="card-back-pattern">
                <div class="card-back-inner">T</div>
            </div>
        </div>`;
}

// ─── Hand rendering ──────────────────────────────

/**
 * Render a player's hand into a container
 */
export function renderHand(container, player, validIds = [], clickable = false) {
    container.innerHTML = '';
    player.hand.forEach(card => {
        const isValid = validIds.includes(card.id);
        if (player.isHuman) {
            container.innerHTML += renderCardFront(card, clickable && isValid, isValid);
        } else {
            container.innerHTML += renderCardBack();
        }
    });
}

// ─── Pile / trick rendering ──────────────────────

/**
 * Render the center trick pile
 */
export function renderTrick(container, trickCards) {
    container.innerHTML = '';
    const positions = ['pile-south', 'pile-west', 'pile-north', 'pile-east'];

    trickCards.forEach(({ card, seat }) => {
        const posClass = positions[seat];
        const el = document.createElement('div');
        el.className = `pile-card ${posClass} card-enter`;
        el.innerHTML = `
            <div class="card ${card.color === 'red' ? 'card-red' : 'card-black'} card-small">
                <span class="card-rank">${card.rank}</span>
                <span class="card-suit">${card.suit}</span>
            </div>`;
        container.appendChild(el);
    });
}

// ─── Trump selector modal ────────────────────────

export function showTrumpSelector(onSelect) {
    const overlay = document.getElementById('trump-overlay');
    overlay.classList.add('visible');

    const buttons = overlay.querySelectorAll('.trump-btn');
    buttons.forEach(btn => {
        btn.onclick = () => {
            const suit = btn.dataset.suit;
            overlay.classList.remove('visible');
            onSelect(suit);
        };
    });
}

// ─── Info bar updates ────────────────────────────

export function updateInfoBar({ trumpSuit, trickNumber, teamATricks, teamBTricks, teamAScore, teamBScore, difficulty }) {
    const el = document.getElementById('info-bar');
    if (!el) return;
    el.innerHTML = `
        <div class="info-item">
            <span class="info-label">Trump</span>
            <span class="info-value trump-display ${trumpSuit ? '' : 'hidden'}">${trumpSuit || '?'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Trick</span>
            <span class="info-value">${trickNumber} / 13</span>
        </div>
        <div class="info-item">
            <span class="info-label">Your Team</span>
            <span class="info-value accent">${teamATricks}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Opponents</span>
            <span class="info-value">${teamBTricks}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Rounds</span>
            <span class="info-value">${teamAScore} – ${teamBScore}</span>
        </div>
        <div class="info-item">
            <span class="info-label">AI</span>
            <span class="info-value">${difficulty === 'easy' ? '🟢 Easy' : '🔴 Hard'}</span>
        </div>
    `;
}

// ─── Message toast ───────────────────────────────

export function showMessage(text, duration = 2000) {
    const el = document.getElementById('message-toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), duration);
}

// ─── Round-over modal ────────────────────────────

export function showRoundOver({ teamATricks, teamBTricks, teamAScore, teamBScore }, onNewRound) {
    const overlay = document.getElementById('round-overlay');
    const won = teamATricks >= 7;
    overlay.querySelector('.round-result').textContent = won
        ? '🎉 Your team wins the round!'
        : '😞 Opponents win the round!';
    overlay.querySelector('.round-detail').textContent =
        `Tricks: ${teamATricks} – ${teamBTricks}  |  Rounds: ${teamAScore} – ${teamBScore}`;
    overlay.classList.add('visible');

    overlay.querySelector('.round-continue-btn').onclick = () => {
        overlay.classList.remove('visible');
        onNewRound();
    };
}

// ─── Player labels ───────────────────────────────

export function updatePlayerLabels(players, currentLeader) {
    players.forEach((p, i) => {
        const label = document.getElementById(`label-${['south','west','north','east'][i]}`);
        if (!label) return;
        label.textContent = p.name + (i === currentLeader ? ' ⭐' : '');
        label.querySelector?.('.tricks-badge')?.remove();
        const badge = document.createElement('span');
        badge.className = 'tricks-badge';
        badge.textContent = ` (${p.tricksWon})`;
        label.appendChild(badge);
    });
}
