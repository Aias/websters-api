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
