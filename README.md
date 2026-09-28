<div align="center">

# Vibe Coding Simulator

### When AI replaces everything, how long can you survive?

[🎮 Play the game](https://thatbobo.com/vibe_coding_sim/)

[English](README.md) · [简体中文](README.zh-CN.md)

</div>

![Vibe Coding Simulator screenshot](https://github.com/user-attachments/assets/3ee9b981-42d5-4ed6-8d5c-97742d2a37ef)

Vibe Coding Simulator is a browser game about making a living with AI-assisted programming. You start with **$500**, a laptop, and a growing list of obligations. Token prices keep moving, rent is due every seven days, and every decision affects how long you can stay in the game.

Buy AI tokens, use them to complete freelance jobs, trade them across markets, or invest in GPU infrastructure to produce tokens of your own. Protect your cash flow, spirit, and reputation long enough to build a fortune—or find out how quickly the AI economy can replace you.

## How to play

- **Buy tokens and take jobs.** Choose a model, accept projects, and balance cost, quality, and completion risk.
- **Trade the market.** Compare the official API Marketplace with the eBay Resale market, where discounts come with volatility and hidden traps.
- **Manage your life.** Rent, electricity, coffee, rest, and reputation all change the choices available to you.
- **Build compute capacity.** Unlock the GPU Compute Center, choose which model to run, and weigh production against electricity costs and hardware lifespan.
- **Read the room.** Check the Twitter feed for market events and unexpected turns in the AI economy.
- **Retire on your terms.** Liquidate your assets when you have enough—or keep playing until the market catches up with you.

## Quick start

Requires **Node.js 20 or newer**.

```bash
git clone https://github.com/Luciferbobo/vibe_coding_sim.git
cd vibe_coding_sim
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

To create a production build and preview it locally:

```bash
npm run build
npm run preview
```

## GitHub Pages

Every push to `main` runs the GitHub Actions workflow in [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). In a fork, enable **Settings → Pages → GitHub Actions** to publish the built `dist` directory.

## Language support

The game includes an **EN / 中文** switch in the top-right corner. The English interface uses dollar values converted from the Chinese game values at a 1:10 ratio, while the Chinese interface keeps the original RMB values.

## Tech stack

React · TypeScript · Vite · Zustand · Tailwind CSS

## License

This project is released under the [PolyForm Noncommercial License 1.0.0](LICENSE). Commercial use is not permitted.

