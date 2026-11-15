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

`build` refreshes the SQLite dictionary and portable macOS Dictionary source, then runs `next build`.

```sh
bun run build:db:force
```

Use `build:db:force` to rebuild regardless of source fingerprint checks.

## macOS Dictionary

The macOS build uses the same parsed entries and resolved lookup aliases as the web API. The authoritative editable source is [`src/dict.jsonl`](src/dict.jsonl). After correcting an entry there, regenerate the export from source:

```sh
bun run build:macos:source
```

This checks a content hash, rebuilds the database when its source has changed, and writes XML, CSS, and a property list to `build/macos/`. It runs on Linux or macOS. The [Apple Dictionary Development Kit](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/DictionaryServicesProgGuide/prepare/prepare.html) is needed to compile the XML into a `.dictionary` bundle, which requires macOS. Set `DICTIONARY_DEVELOPMENT_KIT` to the kit's directory and run:

```sh
DICTIONARY_DEVELOPMENT_KIT="/path/to/Dictionary Development Kit" bun run build:macos
```

References between entries open the target entry. Sense-specific deep links are not supported by the native export.

The compiled bundle is `build/macos/objects/Webster1913.dictionary`. Copy it to `~/Library/Dictionaries/`, then enable it in Dictionary > Settings. Replace that bundle and reopen Dictionary after each source correction to update system Look Up results. The generated files and compiled bundle are ignored by Git; commit source corrections to `src/dict.jsonl`.

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
