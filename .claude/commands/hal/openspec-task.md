---
description: Run any feature change or bug fix through the full OpenSpec flow (investigate → propose → apply → verify → archive) the way this repo expects
argument-hint: <what to build or fix, e.g. "vendor detail errors until refresh">
---

Drive the task **"$ARGUMENTS"** through this project's OpenSpec discipline. Follow these phases in order and keep the user in the loop between phases.

## Phase 0 — Locate the capability

1. Identify which capability the task touches and read its canonical spec first: `openspec/specs/<capability>/spec.md`. If unsure which, scan `openspec/specs/INDEX.md`.
2. From the spec's **Implementation Map**, open the real files across the affected layers (view → store → service → repository → entity → DTO → route).
3. State the root cause / scope in one short paragraph before writing anything. For a bug, name the exact file:line and why it misbehaves. Do NOT guess — confirm by reading the code.

## Phase 1 — Propose (create the change)

Create `openspec/changes/<kebab-change-name>/` with:
- `proposal.md` — Why + What changes + Impact (affected capabilities, files, risk).
- `design.md` — only if non-trivial: decisions with rationale + alternatives + rollback.
- `specs/<capability>/spec.md` — delta. Use `## MODIFIED Requirements` (copy the WHOLE existing requirement block before editing) or `## ADDED Requirements`. Requirements = exactly `###`, Scenarios = exactly `####`.
- `tasks.md` — `- [ ] N.M task` checkboxes ONLY (the parser ignores anything else). Split anything too vague to tick.

Pause and let the user review the change folder before implementing, unless they said to proceed straight through.

## Phase 2 — Apply (work the tasks)

1. Implement each `tasks.md` checkbox in order; tick `- [x]` as you finish each.
2. Obey repo conventions: setup-style Pinia stores, `<script setup lang="ts">`, all API calls through `api-*.repository.ts`, IDs coerced with `.toString()`, notifications via `useNotification`.
3. **i18n rule (mandatory):** every new key goes into all three locales — `src/common/locales/{en,la,cn}/`. Never add to just one.

## Phase 3 — Verify

1. `pnpm type-check` — MUST pass.
2. `pnpm lint` — MUST be clean (a PostToolUse hook also auto-runs eslint --fix on edited files).
3. Validate any edited JSON locale files parse.
4. The browser smoke-test is the ONLY real test in this repo and you cannot run it — explicitly hand it to the user with the exact view(s) to open via `pnpm dev`, and leave that task unchecked.

## Phase 4 — Archive (after the user confirms the smoke-test + merge)

1. Fold each delta requirement back into the canonical `openspec/specs/<capability>/spec.md` (append/replace the requirement or add scenarios).
2. Move the change folder to `openspec/changes/archive/<change-name>/`.
3. Do this ONLY when the user confirms — never archive an unverified change.

## Rules

- **Additive-first (hard rule): adding new files/features MUST NOT break existing code.** Prefer new files over editing shared ones. When you must touch a shared file (route registry, locale bundle, index/barrel), only APPEND — never rename, reorder, change signatures, or repurpose existing entries. Keep existing imports, props, store shapes, route names, and i18n keys working unchanged. If a breaking change is unavoidable, STOP and ask the user first. After adding code, confirm `pnpm type-check` still passes and grep for usages of anything you touched.
- Keep each change to ONE scope. If you spot the same bug elsewhere, note it and offer a separate change — do not widen this one.
- Never commit or push unless the user explicitly asks.
- Prefer small, easily-reverted edits.
