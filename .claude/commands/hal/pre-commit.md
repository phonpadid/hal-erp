---
description: Run the project quality gates (type-check + lint) and smoke-test reminder before committing
---

Run the hal-erp quality gates and report status.

Steps:
1. Run `pnpm type-check` and capture exit code
2. Run `pnpm lint` and capture exit code
3. Run `git status --short` to show what's about to be committed
4. Run `git diff --stat` to show change size
5. Report:
   - ✅ / ❌ type-check
   - ✅ / ❌ lint
   - File count of staged + unstaged changes
   - Reminder: smoke-test the touched views in `pnpm dev` before committing (no automated tests exist in this repo)
6. If either gate failed, summarize the errors and offer to fix them
7. DO NOT commit yourself — only report. The user commits manually.
