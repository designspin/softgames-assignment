# Softgames Developer Assignment

A collection of three interactive demos built with Typescript and PixiJS v8.

**[Live Demo](https://designspin.github.io/softgames-assignment)**

## Demos

**Ace of Shadows** — 144 procedurally-rendered playing cards dealt in a fan arc across three player stacks and back, with arc-trajectory tweening and card flip animations.

**Magic Words** — A dialogue renderer that combines inline text and custom emoji sprites, fetching live data from a remote API with progressive bubble reveal and smooth auto-scroll.

**Phoenix Flame** — A particle fire effect using 10 additive-blended sprites with pooled object reuse, randomised velocity, sine-wave alpha fade, and colour interpolation from yellow to red.

## Tech Stack

- [PixiJS v8](https://pixijs.com/) — WebGL rendering
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tooling

## Architecture

The project uses a lightweight scene/system pattern:

- **`Scene`** — interface for top-level views (`enter`, `exit`, `update`, `resize`, `destroy`)
- **`BaseScene`** — abstract base managing a list of `System` instances
- **`System`** — interface for isolated update/resize/destroy logic within a scene
- **`SceneManager`** — handles scene transitions with background colour lerping and fade animations
- **`StateMachine<T>`** — generic state machine utility used by `CardSystem`

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```