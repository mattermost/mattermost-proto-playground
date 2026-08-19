# mattermost-proto-playground

A playground to prototype and test Mattermost UI components and flows. For internal Mattermost team use.

## Setup

Clone the repo, then:

```bash
npm install
npm run dev
```

The Vite dev server will start; open the URL shown in the terminal.

## Project structure

- **`src/router/index.tsx`** — Register prototype flows here. Each entry becomes a sidebar nav item and a route.
- **`src/pages/`** — Page components: `Home`, `Components` (component showcase), and prototype pages (e.g. `ExampleFlow`).
- **`src/components/`** — Reusable UI components (`Button`, `Checkbox`, `TextInput`, etc.) and layout (`AppShell`, `Sidebar`).
- **`src/styles/`** — Global styles and design tokens (`tokens.scss`).
