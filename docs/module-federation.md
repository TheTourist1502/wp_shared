# wp_shared — Module Federation contract

Shared library remote. Runs on port **3001**. Must be up before any other repo starts. Owns no
routes.

## Folder structure

```
src/
├── Card.tsx     EXPOSED as `wp_shared/Card`
└── index.tsx    local preview page (not exposed)
```

## Exposes

| Key | File | Export | Consumed by |
|---|---|---|---|
| `./Card` | `src/Card.tsx` | `Card: FC<{ title: string; children?: ReactNode }>` | `wp_layout`, `wp_dashboard`, `wp_portfolio`, `wp_watchlist`, `wp_alerts` |

Each consumer declares this type in its own `src/remotes.d.ts`. If you change an exported
signature, update every consumer's declaration in the same change.

Planned here per `.claude/rules/architecture.md`: `types`, `api` (queries/mutations), `hooks`,
`components`, `stores`, `eventBus`. Add each as its own `exposes` key when it is built.

## Consumes

Nothing (`remotes: {}`). `wp_shared` never imports from a feature remote or the host.

## Shared singletons

| Package | Config |
|---|---|
| `react` | `singleton` |
| `react-dom` | `singleton` |
| `@tanstack/react-query` | `singleton` |

Add `@tanstack/react-router` here too as soon as a shared module imports it.

## Environment

| Variable | Example |
|---|---|
| `PORT` | `3001` |

## Run

```bash
pnpm dev          # :3001, serves /remoteEntry.js
pnpm type-check
pnpm build
```
