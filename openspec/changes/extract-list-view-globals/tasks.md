## 1. Add i18n keys

- [ ] 1.1 Add `common.confirmDelete.{title,body,ok,cancel}` to `src/common/locales/en/common.json` (create file if missing); body MUST use `{itemName}` placeholder
- [ ] 1.2 Add the same four keys to `src/common/locales/la/common.json` with Lao copy
- [ ] 1.3 Add the same four keys to `src/common/locales/cn/common.json` with Chinese copy
- [ ] 1.4 Verify the keys resolve via `$t('common.confirmDelete.title')` in a throwaway component before continuing

## 2. Build `useResourcePermissions` composable

- [ ] 2.1 Create `src/common/shared/composables/` directory (if not present)
- [ ] 2.2 Create `src/common/shared/composables/useResourcePermissions.ts` that takes `resource: string` and returns `{ canCreate, canEdit, canDelete, canView }` as `ComputedRef<boolean>` bound to `hasPermission('create-<r>' | 'update-<r>' | 'delete-<r>' | 'view-<r>')`
- [ ] 2.3 Import `usePermissions` from the canonical path `@/common/shared/store/usePermissions` only
- [ ] 2.4 Add JSDoc documenting the verb convention (`create / update / delete / view`) and example usage
- [ ] 2.5 Verify type inference: callers should get `Ref<boolean>` (not `unknown`) when destructuring

## 3. Build `ConfirmDeleteModal` component

- [ ] 3.1 Create `src/common/shared/components/Modal/ConfirmDeleteModal.vue`
- [ ] 3.2 Compose `UiModal` rather than `<Modal>` directly; accept props `visible: boolean`, `itemName?: string`, `loading?: boolean`, `title?: string`, `body?: string`, `okText?: string`, `cancelText?: string`, `danger?: boolean` (default `true`)
- [ ] 3.3 Emit `update:visible`, `confirm`, and `cancel`. On OK click, emit `confirm` ONLY (do not auto-close)
- [ ] 3.4 When `loading === true`, forward `confirmLoading` to `UiModal`, and pass `maskClosable: false` + `keyboard: false` via `okButtonProps`/`cancelButtonProps`/`closable` so backdrop/Escape cannot dismiss
- [ ] 3.5 Default the title to `t('common.confirmDelete.title')`; default the body to `t('common.confirmDelete.body', { itemName })`; default OK/Cancel to the matching i18n keys
- [ ] 3.6 When `danger === true`, pass `okType: 'primary'` plus `okButtonProps: { danger: true }`; when `false`, use plain `okType: 'primary'` without `danger`
- [ ] 3.7 Manual smoke test: open and close via `v-model:visible`, confirm flow, cancel flow, loading flow

## 4. Build `RowActionButtons` component

- [ ] 4.1 Create `src/common/shared/components/table/RowActionButtons.vue`
- [ ] 4.2 Accept props: `record: any`, `canEdit?: boolean` (default `false`), `canDelete?: boolean` (default `false`), `canView?: boolean` (default `false`), `canRestore?: boolean` (default `false`), `disabled?: (record) => boolean` (default returns `false`), `editTooltip?: string`, `deleteTooltip?: string`, `viewTooltip?: string`, `restoreTooltip?: string`
- [ ] 4.3 Render order in flex row: View → Edit → Restore → Delete → `<slot name="extra" :record="record" />`
- [ ] 4.4 Each button uses `<UiButton>` with matching icon: `eye-outlined` (View), `edit-outlined` (Edit, orange), `reload-outlined` (Restore), `delete-outlined` (Delete, danger=red); all `shape="circle"`, `size="small"`
- [ ] 4.5 Each button is rendered with `v-if` against its `can*` prop (not `v-show`); Edit button receives `:disabled="disabled(record)"`
- [ ] 4.6 Emit events `view`, `edit`, `restore`, `delete` — each with the `record` as payload (single argument)
- [ ] 4.7 Wrap each button in `<a-tooltip>` only when a tooltip prop is non-empty

## 5. Consolidate `usePermissions`

- [ ] 5.1 Confirm `src/common/shared/store/usePermissions.ts` is the canonical implementation (it is — see Read at design time)
- [ ] 5.2 Replace the entire body of `src/modules/shared/utils/usePermissions.ts` with: a single `export { usePermissions } from "@/common/shared/store/usePermissions"` line, preceded by a JSDoc block tagged `@deprecated` pointing to the canonical path
- [ ] 5.3 Run `pnpm type-check` — all existing imports from the deprecated path must still resolve
- [ ] 5.4 Manually verify in IDE that hovering an import from the deprecated path shows the `@deprecated` tooltip

## 6. Pilot migration — `UnitListView.vue`

- [ ] 6.1 Read `src/modules/presentation/Admin/views/unit/UnitListView.vue` and the matching `unit.store.ts` to confirm the `deleteModalVisible` / `submitLoading` / `confirmDelete()` surface
- [ ] 6.2 Replace `canCreateUnit`/`canEditUnit`/`canDeleteUnit` block with `const { canCreate, canEdit, canDelete } = useResourcePermissions('unit')`
- [ ] 6.3 Update template references in the toolbar and any `v-if` accordingly
- [ ] 6.4 Replace the inline Edit/Delete `<UiButton>` block inside `<template #actions="{ record }">` with `<RowActionButtons :record="record" :can-edit="canEdit" :can-delete="canDelete" @edit="..." @delete="..." />`
- [ ] 6.5 Replace the inline `<UiModal>` delete confirmation with `<ConfirmDeleteModal v-model:visible="..." :item-name="selectedUnit?.name" :loading="submitLoading" @confirm="confirmDelete" />`
- [ ] 6.6 Remove now-unused imports (`UiModal`, `UiButton` if only used here, the old `usePermissions` import)
- [ ] 6.7 Run `pnpm type-check && pnpm lint` and confirm zero new diagnostics
- [ ] 6.8 Browser smoke test: create / edit / delete a unit, including the loading state and the cancel path

## 7. Pilot migration — `BankListView.vue`

- [ ] 7.1 Read `src/modules/presentation/Admin/views/bank/BankListView.vue` and `bank.store.ts` (note: bank store owns the modal visibility — see `bankStore.showDeleteModal`)
- [ ] 7.2 Replace the per-view `canEdit*`/`canDelete*` refs with `useResourcePermissions('bank')` if they exist; if the view reads them off the store, leave the store as-is for this change
- [ ] 7.3 Migrate the row-action template block to `<RowActionButtons>`; pass through the `:disabled="(r) => !!r.deleted_at"` rule already present at line 146
- [ ] 7.4 Migrate the delete confirmation modal to `<ConfirmDeleteModal>`, wiring its `visible` to whatever store flag currently controls it
- [ ] 7.5 Run `pnpm type-check && pnpm lint`
- [ ] 7.6 Browser smoke test: same as Unit

## 8. Pilot migration — `CurrencyView.vue`

- [ ] 8.1 Read `src/modules/presentation/Admin/views/currencies/CurrencyView.vue` and the currency store
- [ ] 8.2 Apply the same three-step migration (composable → row buttons → confirm modal)
- [ ] 8.3 Run `pnpm type-check && pnpm lint`
- [ ] 8.4 Browser smoke test

## 9. Verification & docs

- [ ] 9.1 Re-run the `grep` queries from `docs/shared-components-audit.md` §6 — pilot views should no longer match `deleteModalVisible` or `canCreate*` patterns
- [ ] 9.2 Confirm bundle size hasn't grown unreasonably (run `pnpm build` and compare `dist/assets/*.js` size with main branch — informational only)
- [ ] 9.3 Update `docs/shared-components-audit.md` §1.1 inventory: add the three new components/composables
- [ ] 9.4 Update `docs/shared-components-audit.md` §4 roadmap: mark Phase 1 as in-progress with pilot view names

## 10. Wrap up

- [ ] 10.1 Confirm `pnpm build` succeeds with no type errors
- [ ] 10.2 Confirm `pnpm lint` is clean
- [ ] 10.3 Self-review the diff: every removed line should be replaced by an obvious equivalent, no behavior changes outside the pilots
- [ ] 10.4 Ready for `/openspec-archive-change` after merge
