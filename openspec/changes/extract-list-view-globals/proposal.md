## Why

The HAL-ERP front-end has ~31 ListView/feature files that copy the same three patterns: a `deleteModalVisible` confirmation modal, an Edit/Delete `UiButton` row-action template, and a triple of `canCreate*/canEdit*/canDelete*` permission computed refs. Maintaining these in lockstep is error-prone (style drift, missed permission checks, untranslated strings), and adding a fourth action — e.g. "Restore" or "View detail" — currently means touching every list. There are also **two competing `usePermissions` composables** at `common/shared/store/usePermissions.ts` and `modules/shared/utils/usePermissions.ts`, which is already causing confusion when new code imports the wrong one. Centralizing these now makes future list views cheap to build and unblocks Phase 2 of the broader refactor roadmap in `docs/shared-components-audit.md`.

## What Changes

- **Add** `ConfirmDeleteModal.vue` under `src/common/shared/components/Modal/` — a generic delete-confirmation modal that owns the visible / loading / OK / Cancel state and emits a single `confirm` event with the target item.
- **Add** `RowActionButtons.vue` under `src/common/shared/components/table/` — a slot-extensible button group rendering Edit / Delete (and optionally View / Restore) with built-in permission gating, intended for the `#actions` table slot.
- **Add** `useResourcePermissions(resource)` composable under `src/common/shared/composables/` — returns `{ canCreate, canEdit, canDelete, canView }` computed refs bound to the canonical permission naming convention (`create-<resource>`, `update-<resource>`, `delete-<resource>`, `view-<resource>`).
- **Consolidate** the two `usePermissions` implementations: pick `common/shared/store/usePermissions.ts` as canonical, replace `modules/shared/utils/usePermissions.ts` with a deprecation-marked re-export.
- **Migrate 3 pilot views** to use the new building blocks: `UnitListView.vue`, `BankListView.vue`, `CurrencyView.vue`. The remaining ~28 views are explicitly out of scope for this change and will be migrated in a follow-up.

Non-goals for this change:
- Do **not** touch the create/edit modal flow (different shape per feature — separate work).
- Do **not** modify `axios.ts`, `useNotification`, or any HTTP/notification behavior.
- Do **not** migrate the other ~28 list views — they remain as-is until a follow-up change.
- Do **not** introduce a `useLoading` composable or `EmptyState` component — those are MEDIUM priority in the audit and tracked separately.

## Capabilities

### New Capabilities
- `confirm-delete-modal`: A reusable confirmation-modal UX contract for "delete an item" actions across all list pages, with consistent copy, i18n, loading state, and confirm/cancel emit semantics.
- `row-action-buttons`: A reusable row-actions component for table rows, providing permission-gated Edit / Delete (and optional View / Restore) buttons with a slot for additional custom actions.
- `resource-permissions`: A canonical composable contract for per-resource permission checks (`create / update / delete / view <resource>`), plus a single source-of-truth location for `usePermissions`.

### Modified Capabilities
<!-- None — this is the first OpenSpec change in this repo; no prior specs exist. -->

## Impact

- **New files**:
  - `src/common/shared/components/Modal/ConfirmDeleteModal.vue`
  - `src/common/shared/components/table/RowActionButtons.vue`
  - `src/common/shared/composables/useResourcePermissions.ts`
- **Modified files**:
  - `src/modules/shared/utils/usePermissions.ts` — replaced body with re-export + `@deprecated` JSDoc.
  - `src/modules/presentation/Admin/views/unit/UnitListView.vue` — migrate to new components/composable.
  - `src/modules/presentation/Admin/views/bank/BankListView.vue` — same.
  - `src/modules/presentation/Admin/views/currencies/CurrencyView.vue` — same.
- **Affected stores** (read-only verification only):
  - `unit.store.ts`, `bank.store.ts`, `currency.store.ts` — confirm their `deleteModalVisible`, `submitLoading`, `confirmDelete` surface is compatible with the new modal's `v-model:visible` + `@confirm` contract. No store rewrites in this change.
- **i18n keys**: Add `common.confirmDelete.title`, `common.confirmDelete.body`, `common.confirmDelete.ok`, `common.confirmDelete.cancel` to `en`, `la`, `cn` locale bundles.
- **Permissions naming convention**: Codifies `<verb>-<resource>` as the required permission string format (`create-unit`, `update-unit`, etc.). Existing code already follows this — the composable just makes it discoverable.
- **No backend / API impact**. No new dependencies. No build / deploy changes.
- **Backwards compatibility**: Existing 28 non-pilot views continue to work unchanged — the new components are additive. The duplicate `usePermissions` keeps a working re-export so any import paths still resolve.
