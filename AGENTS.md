# Agent Instructions

## Pre-commit

Run `bun check` before committing. It handles type checking, linting, and formatting — auto-fixing what it can. Any issues that can't be auto-fixed must be resolved before committing.

## Dictionary audits

Agents auditing the dictionary at the same time work as one team and improve the process as they go. Follow the `dictionary-audit` skill in `.agents/skills/dictionary-audit/`, and coordinate through the shared claims file and log in `.context/dictionary-audit/` (`claims.jsonl` and `COORDINATION.md`):

1. Read both files before claiming work, and again between batches. Answer any open question addressed to you before starting the next batch.
2. Post to the log as soon as you learn something that would change another agent's results, with the entries and evidence behind it. Examples include an editorial ruling, a recurring defect class, a false correction caught in verification, a cheaper method that kept the same accuracy, or a tooling failure and its fix.
3. When a lesson is settled, add it to the matching skill reference, tell every active agent, and apply it to work still under review. Lessons kept only in the log or in one session's memory disappear when that session ends.
4. Record each batch's accepted repairs, rejected or reversed proposals, holds, tokens, and elapsed time. Compare them with earlier batches before changing packet size, models, or reviewer instructions, and post the comparison.
5. When agents share a checkout, agree in the log on how each one writes `src/dict.jsonl` and stages commits before either edits it.
6. `.context/` is local to one workspace and never reaches git. Commit every hold a batch leaves open to `reports/dictionary-audit-holds.jsonl` in the same commit as the batch, and give each one the question it waits on. When the user rules on a question, record the rule in the skill references and apply it to every row with that question.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
