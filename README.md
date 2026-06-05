# Turup – Classic Indian Card Game

A browser-based implementation of **Turup** (also known as *Court Piece*), a classic Indian trick-taking card game for 4 players.

## How to Play

1. **Open** `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
2. The game **auto-starts** a round – 13 cards are dealt to each of the 4 players.
3. **Choose a trump suit** when prompted. The trump suit can beat cards from any other suit.
4. **Click a card** from your hand to play it.  
   - Cards with a glowing blue border are valid plays.
   - You **must** follow the lead suit if you have a card of that suit.
5. The AI opponents play automatically.
6. The first team to win **7 tricks** wins the round.
7. Click **New Game** to start a fresh round at any time.
8. Toggle **Easy / Hard** AI difficulty with the button.

## Game Rules

| Rule | Detail |
|------|--------|
| Players | 4 (you + 3 AI), seated North/South vs East/West |
| Deck | Standard 52 cards, no jokers |
| Card ranking | A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2 |
| Trump | Chosen by you at the start of each round |
| Follow suit | Mandatory – you must play the lead suit if you can |
| Winning a trick | Highest trump wins; otherwise highest card of the lead suit |
| Winning a round | First team to reach 7 tricks (Method C) |

## File Structure

```
Turup/
├── index.html          – Main page
├── server.js           – Lightweight Express/HTTP dev server
├── package.json        – Dependencies & scripts
├── css/
│   ├── style.css       – Global theme & layout
│   └── cards.css       – Card component styles
├── js/
│   ├── main.js         – Entry point & UI wiring
│   ├── game.js         – Game controller
│   ├── deck.js         – Deck creation & shuffle
│   ├── player.js       – Player hand management
│   ├── ai.js           – AI logic (easy/hard)
│   └── ui.js           – DOM rendering helpers
├── assets/             – Images, sounds, icons
├── .gitignore          – Git ignore rules
└── README.md
```

## Tech Stack

- **Vanilla HTML / CSS / JavaScript** – no frameworks, no build tools.
- **ES Modules** – native `import`/`export`.
- **Node.js** – lightweight static file server with optional Socket.IO support.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/Turup.git
cd Turup

# 2. Install dependencies
npm install

# 3. Start the development server (auto-restarts on changes)
npm run dev

# 4. Open in your browser
#    http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon (auto-reload) |
| `npm start` | Start production server |

## License

Personal / educational use.
