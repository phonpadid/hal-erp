## Context

The HAL-ERP admin SPA has accumulated 31 list-view pages that all share the same delete confirmation modal, the same Edit/Delete row-action button pair, and the same triple of permission-bound computed refs (`canCreate*`, `canEdit*`, `canDelete*`). The patterns drifted slightly per author (different icon colors, different i18n keys, occasionally a missed permission check). At the same time, **two distinct `usePermissions` composables exist** — one at `src/common/shared/store/usePermissions.ts` and one at `src/modules/shared/utils/usePermissions.ts` — which is now causing inconsistent imports as new files are added.

This change introduces three small globals (`ConfirmDeleteModal`, `RowActionButtons`, `useResourcePermissions`), consolidates the duplicate composable, and migrates three pilot views (Unit, Bank, Currency) to prove the API before a wider rollout. The full audit, including counts per pattern and the broader roadmap, lives in `docs/shared-components-audit.md`.

## Goals / Non-Goals

**Goals:**
- Ship three additive globals that are safe to adopt incrementally (no flag day).
- Reduce duplication in the three pilot views by ~30-40 lines each without changing observable behavior.
- Establish a documented permission-naming convention (`create-<r>`, `update-<r>`, `delete-<r>`, `view-<r>`) that future modules can rely on.
- Leave a single source of truth for `usePermissions` with the old path still working as a deprecated re-export.

**Non-Goals:**
- Migrating the other 28 list views (tracked as a follow-up change once pilots stabilize).
- Touching the create/edit modal flow — those modals have feature-specific form bodies and are not duplicated the same way.
- Refactoring stores (`bank.store.ts`, etc.); we only verify their existing `deleteModalVisible` / `confirmDelete` shape lines up with the new modal contract.
- Introducing `useLoading`, `EmptyState`, or filter-bar abstractions (separate MEDIUM-priority items in the audit).
- Changing axios, notification, pagination, or auth code paths.

## Decisions

### 1. `ConfirmDeleteModal` is a thin specialization of `UiModal`, not a `Modal.confirm()` wrapper

`UiModal.vue` already centralizes the `wrap-class-name`, responsive breakpoints, and icon-title pattern. `ConfirmDeleteModal` will import and compose `UiModal` rather than re-implementing the Ant Design `Modal` wiring. We deliberately do **not** use Ant Design's imperative `Modal.confirm({ ... })` API because:

- The imperative API doesn't share `UiModal`'s responsive class.
- It's harder to wire async loading state.
- Existing list views already pass `v-model:visible` patterns down from the store — a declarative component aligns with the rest of the codebase.

Trade-off: callers must declare `<ConfirmDeleteModal>` in their template rather than calling a function. This is the same trade-off the rest of the codebase already makes for `UiModal`.

### 2. `confirm` event is emitted but the modal does NOT close itself

Two options were considered:

- **Auto-close on confirm**: The component emits `confirm` and immediately also emits `update:visible: false`.
- **Caller-controlled close** *(chosen)*: The component emits only `confirm`. The caller's async handler closes the modal explicitly after the delete request settles.

Auto-close looks simpler but causes a UX bug: if the delete request fails, the modal is already gone and the user has no spinner/feedback affordance. Caller-controlled close mirrors what the existing 31 views already do (their `confirmDelete` handlers explicitly set `deleteModalVisible.value = false` in their `finally` block), so adoption is a near-mechanical replacement.

### 3. `RowActionButtons` is a component, not a column renderer or render-function

Alternatives considered:

- **Render function injected into column config**: Push the buttons into the column `customRender` so views never have to write the `#actions` slot. Rejected because (a) columns are defined in separate `column.ts` files for each feature and (b) it couples the buttons to table column shape, making it harder to use the same buttons in non-table contexts (e.g. card grids in future).
- **Higher-order Table**: A `<ListTable>` that wraps `Table.vue` and bakes in the actions column. Rejected because pilot views differ in their other columns and we'd be building a much bigger abstraction without enough validation.
- **Component used inside `<template #actions>`** *(chosen)*: Lowest-cost migration. View templates only swap their inline button block for `<RowActionButtons :record="..." ... />`.

### 4. Permission strings follow `<verb>-<resource>` where `verb ∈ {create, update, delete, view}`

The repo already uses `create-unit`, `update-unit`, `delete-unit`, etc. — the composable just codifies it. Note the asymmetry: the verb for editing is `update` (not `edit`), which matches the existing convention. Documented inline in the composable's JSDoc.

### 5. Deprecate, don't delete, the duplicate `usePermissions`

The `modules/shared/utils/usePermissions.ts` path is imported by an unknown set of files. Deleting it would force a "big bang" migration unrelated to this change's scope. Instead, replace its body with `export { usePermissions } from "@/common/shared/store/usePermissions"` plus a `@deprecated` JSDoc. A follow-up change can hunt down imports and remove the file entirely.

### 6. No new dependencies; reuse `Iconify` and `UiButton`

`RowActionButtons` uses the existing `UiButton` wrapper rather than rolling its own. This keeps style consistency and means future `UiButton` changes propagate automatically.

## Risks / Trade-offs

- **Risk**: A pilot view's store has a slightly different `confirmDelete` signature than expected (e.g. takes the record as an argument instead of from store state) → **Mitigation**: The new modal's `confirm` event payload is empty by default, but a `:record` prop is passed through unchanged. The migration step for each pilot includes reading the store's actual handler shape before wiring.
- **Risk**: Soft-delete records (`deleted_at != null`) need different disable rules per feature → **Mitigation**: `RowActionButtons` exposes a `:disabled` function prop receiving the record, defaulting to `() => false`. Pilots that need the rule pass it; others don't.
- **Risk**: Existing `<UiButton>` Edit/Delete blocks have feature-specific tooltips or extra classes → **Mitigation**: The `extra` slot covers any genuinely-different case. For tooltips on the standard buttons, the spec is to accept `:edit-tooltip` / `:delete-tooltip` string props with sensible defaults — adding these props is cheap.
- **Trade-off**: We are codifying the permission-naming convention via the composable. New modules that want different verbs (e.g. `approve-budget`) cannot use the composable's defaults — they fall back to calling `hasPermission()` directly. This is acceptable: the composable targets CRUD-shaped resources, which is what list views are.
- **Trade-off**: The deprecated `usePermissions` re-export stays in the tree until a follow-up change. This is preferable to a noisier migration in this PR.

## Migration Plan

This change is fully additive plus three view migrations. There is no flag day and no data migration.

**Rollout steps:**

1. Land the three new global files (`ConfirmDeleteModal.vue`, `RowActionButtons.vue`, `useResourcePermissions.ts`) and the i18n bundle additions. These are inert until a view imports them.
2. Replace `src/modules/shared/utils/usePermissions.ts` body with a re-export + `@deprecated` tag.
3. Migrate `UnitListView.vue`, `BankListView.vue`, `CurrencyView.vue` one at a time, smoke-testing each before moving on:
   - Replace `canCreate*/canEdit*/canDelete*` block with `useResourcePermissions("<resource>")` destructure.
   - Replace inline Edit/Delete buttons with `<RowActionButtons>`.
   - Replace the inline `<UiModal>` delete confirmation with `<ConfirmDeleteModal>`.
4. Run `pnpm type-check` and `pnpm lint` after each pilot.

**Rollback:** Revert the PR. The new global files are unreferenced after revert; the deprecated re-export reverts to the original duplicate implementation. No state, no DB, no API contract is involved.

## Open Questions

- Do we want a project-level ESLint rule banning imports from `modules/shared/utils/usePermissions` once the canonical export is in place? *Tentative answer*: not in this change — wait until after the wider rollout so we don't trip up code we haven't migrated yet.
- Should `RowActionButtons` ship with a "More" overflow menu for cases with 3+ actions? *Tentative answer*: no — `UibuttonDropdown.vue` already exists for that case and overengineering this component delays the win.
