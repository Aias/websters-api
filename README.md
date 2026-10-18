# Webster's 1913 Dictionary

## Stack

- Next.js 16 (App Router, Turbopack default)
- React 19
- Tailwind CSS v4
- Node.js 26 runs the Next.js server (`bun run` honors the `next` binary's `node` shebang)
- Bun for package management, `build:db`, and tests
- TypeScript 7 + `oxlint` + `oxfmt`

## Setup

Requires Node.js 26 (`.node-version`) and Bun.

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

```sh
bun run build:db:force
```

Use `build:db:force` to rebuild regardless of source fingerprint checks.

## Quality

```sh
bun check
```

`check` runs lint + type-check + format with auto-fixes (`oxlint`, `tsc`, `oxfmt`).

```sh
bun run lint:check
bun run type-check
bun run format:check
```

## Production

```sh
bun run start
```

`ecosystem.config.cjs` runs this under pm2 on port 3031.

## Data Notes

- Runtime reads use `better-sqlite3` in Next server code.
- Database generation (`build:db`) uses Bun's built-in SQLite API.
- Build metadata stores both source fingerprint and parser version for skip decisions.
