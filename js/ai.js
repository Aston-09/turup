// ai.js – AI opponent logic
// ─────────────────────────

/**
 * AI picks a card from the valid set.
 *
 * @param {import('./player.js').Player} player
 * @param {string|null} leadSuit   – suit of the lead card (null if leading)
 * @param {string}      trumpSuit  – the turup suit
 * @param {object[]}    trickCards – cards already played in this trick
 * @param {'easy'|'hard'} difficulty
 * @returns {object} the chosen card object
 */
export function aiChooseCard(player, leadSuit, trumpSuit, trickCards, difficulty = 'easy') {
    const valid = player.getValidCards(leadSuit);

    if (difficulty === 'easy') {
        // Random valid card
        return valid[Math.floor(Math.random() * valid.length)];
    }

    // ── Hard AI strategy ──────────────────────────────────
    const isLeading = !leadSuit;

    if (isLeading) {
        // Lead with highest non-trump card to force opponents
        const nonTrump = valid.filter(c => c.suit !== trumpSuit);
        if (nonTrump.length > 0) {
            nonTrump.sort((a, b) => b.value - a.value);
            return nonTrump[0];
        }
        // Only trumps remain – play lowest trump
        valid.sort((a, b) => a.value - b.value);
        return valid[0];
    }

    // Following suit
    const suitCards = valid.filter(c => c.suit === leadSuit);

    if (suitCards.length > 0) {
        // Can follow suit – figure out current winning card in trick
        const currentWinner = currentTrickWinner(trickCards, leadSuit, trumpSuit);
        const beaters = suitCards.filter(c => c.value > currentWinner.value && c.suit === currentWinner.suit);
        if (beaters.length > 0) {
            // Play lowest card that still wins
            beaters.sort((a, b) => a.value - b.value);
            return beaters[0];
        }
        // Can't beat – dump lowest
        suitCards.sort((a, b) => a.value - b.value);
        return suitCards[0];
    }

    // Can't follow suit
    const trumpCards = valid.filter(c => c.suit === trumpSuit);
    const highestTrumpInTrick = trickCards
        .filter(c => c.suit === trumpSuit)
        .sort((a, b) => b.value - a.value)[0];

    if (trumpCards.length > 0) {
        if (highestTrumpInTrick) {
            const beaters = trumpCards.filter(c => c.value > highestTrumpInTrick.value);
            if (beaters.length > 0) {
                beaters.sort((a, b) => a.value - b.value);
                return beaters[0];
            }
        } else {
            // No trump played yet – play lowest trump
            trumpCards.sort((a, b) => a.value - b.value);
            return trumpCards[0];
        }
    }

    // No trumps either – discard lowest value card
    valid.sort((a, b) => a.value - b.value);
    return valid[0];
}

/** Determine current trick-winner from the cards played so far */
function currentTrickWinner(trickCards, leadSuit, trumpSuit) {
    let best = trickCards[0];
    for (let i = 1; i < trickCards.length; i++) {
        best = beats(trickCards[i], best, leadSuit, trumpSuit) ? trickCards[i] : best;
    }
    return best;
}

/** Does card `a` beat card `b`? */
function beats(a, b, leadSuit, trumpSuit) {
    const aIsTrump = a.suit === trumpSuit;
    const bIsTrump = b.suit === trumpSuit;

    if (aIsTrump && !bIsTrump) return true;
    if (!aIsTrump && bIsTrump) return false;
    if (aIsTrump && bIsTrump) return a.value > b.value;

    // Neither is trump
    if (a.suit === leadSuit && b.suit !== leadSuit) return true;
    if (a.suit !== leadSuit && b.suit === leadSuit) return false;
    if (a.suit === leadSuit && b.suit === leadSuit) return a.value > b.value;

    return false; // both off-suit, first played wins
}
