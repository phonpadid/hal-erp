# Design — Fix search-input placeholder

## Context

`InputSearch` placeholders were copy-pasted from the `currency` feature across many list views, leaving `t('currency.placeholder.search')` hard-wired on unrelated pages. This change fixes only the Vendors and Document Types pages.

## Decisions

### Decision: Add a dedicated `placeholder.search` key per namespace

Each feature already owns an i18n bundle (`vendors.json`, `vendors_bank.json`, `documentType.json`). We add `placeholder.search` to each rather than reusing the generic `list.search` ("ຄົ້ນຫາ" / "Search") so the placeholder can be descriptive ("Search vendor information") and consistent with how `currency` already does it.

**Alternative considered:** point the views at the existing `list.search` key. Rejected because those values are bare "Search…" and lose the descriptive wording; a dedicated placeholder key matches the established `currency.placeholder.search` shape and reads better.

### Decision: Keep scope to Vendors + Document Types

The wrong key leaks into 8 views total. Fixing all of them in one change widens the blast radius and mixes unrelated features. We fix the two the user reported; a follow-up change can sweep the rest (`currencies`, `user`, `budget/*`).

## Risks / Trade-offs

- **Low risk:** only display strings change; no logic, API, or state touched.
- **i18n coverage:** new key MUST be added to all three locales in this change (per project rule) or the missing-locale falls back to the raw key.

## Rollback

Revert the 3 view edits and remove the 3 added keys per locale. No data migration involved.
