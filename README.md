# Webster's 1913 Dictionary

## Stack

- Next.js 16 (App Router, Turbopack default)
- React 19
- Tailwind CSS v4
- Bun runtime + package manager
- TypeScript 7 preview (`tsgo`) + `oxlint` + `oxfmt` (plus `typescript@5` for Next.js toolchain compatibility)

## Setup

```sh
bun install
```

## Development

```sh
bun run dev
```

## Build

```sh
bun run build
```

`build` first regenerates the SQLite dictionary, then runs `next build`.

To also regenerate vector embeddings:

```sh
bun run build:embeddings
```

Throttled/deferred embedding builds (recommended on laptops):

```sh
EMBEDDING_BATCH_SIZE=8 EMBEDDING_PAUSE_MS=50 bun run build:embeddings
```

The embedding builder is resumable by default (it skips keys already present in `entry_vectors`).
Use `EMBEDDING_REBUILD=1` to force a full rebuild from scratch.
Use `EMBEDDING_LOG_EVERY` to control progress log cadence (default: `10`).
In interactive terminals, embedding progress renders as a live-updating progress bar with percentage and ETA.

To run full dictionary + embeddings + Next build:

```sh
bun run build:full
```

## Quality

```sh
bun check
```

`check` runs lint + type-check + format with auto-fixes (`oxlint`, `tsgo`, `oxfmt`).

```sh
bun run lint:check
bun run type-check
bun run format:check
```

## Production

```sh
bun run start
```

## Data Notes

- Runtime reads use `better-sqlite3` in Next server code.
- Database generation (`build:db`) uses Bun's built-in SQLite API.
- Vector embedding generation (`build:embeddings`) uses Bun SQLite + `sqlite-vec`.
- On macOS/Linux, set `SQLITE_DYLIB_PATH` if Bun cannot load extensions with the bundled SQLite.
