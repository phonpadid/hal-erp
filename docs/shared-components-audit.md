# HAL-ERP — Shared Components Audit & Refactor Opportunities

> **สรุปย่อ (ไทย):** เอกสารนี้สำรวจว่าโปรเจกต์มี global component อะไรอยู่แล้ว และจุดไหน
> ที่ code ซ้ำกันมากจน "ควรทำเป็น global" เพื่อให้แก้ทีเดียวมีผลทุกหน้า — โดยเฉพาะ
> modal ยืนยันลบ, ปุ่ม Edit/Delete ในตาราง, และ permission `can*` computed ที่เขียนซ้ำในทุก ListView.

This document complements `project-overview.md` and `system-architecture.md`. Its goal is to give a single place where contributors can see:

1. What shared/global building blocks **already exist** (so we don't re-invent them).
2. Which UI patterns are **duplicated across features** and should become global.
3. A prioritized refactor plan.

All file paths are relative to repository root. Numbers come from `grep -rn` over `src/` at the time this doc was generated; rerun the queries before acting if the codebase has moved.

---

## 1. Existing Global Building Blocks (Inventory)

### 1.1 UI Components — `src/common/shared/components/`

| Folder       | File                                | Purpose                                              |
| ------------ | ----------------------------------- | ---------------------------------------------------- |
| `button/`    | `UiButton.vue`                      | Standard button wrapper (icon, color, shape, danger) |
|              | `UibuttonDropdown.vue`              | Button with dropdown menu                            |
|              | `UiActionGroup.vue`                 | Action button group container                        |
| `checkbox/`  | `UiCheckbox.vue`                    | Checkbox wrapper                                     |
| `Darwer/`    | (Drawer folder — typo "Darwer")     | Drawer wrapper                                       |
| `Datepicker/`| Date picker wrappers                | Date input                                           |
| `Dropdown/`  | `Dropdown.vue`                      | Generic dropdown                                     |
| `Form/`      | `UiForm.vue`, `UiFormItem.vue`      | Form + form item wrappers                            |
| `header/`    | `HeaderComponent.vue`               | Page header                                          |
|              | `ProgressStepsComponent.vue`        | Multi-step progress                                  |
| `Input/`     | `UiInput.vue`, `UiInputPassword.vue`| Text inputs                                          |
|              | `InputSearch.vue`, `InputSelect.vue`| Search bar, select input                             |
|              | `PdfUploader.vue`                   | PDF upload component                                 |
| `loading/`   | `LoadingSpinner.vue`                | Spinner wrapper                                      |
| `Modal/`     | `UiModal.vue`                       | Generic modal wrapper                                |
|              | `ChangeMyPasswordModal.vue`         | Feature modal (password change)                      |
|              | `QuickApprovalPreviewModal.vue`     | Feature modal (approval preview)                     |
| `Radio/`     | `Radio.vue`, `UiRadio.vue`          | Radio wrappers                                       |
| `Switch/`    | `Switch.vue`                        | Toggle switch                                        |
| `table/`     | `Table.vue`, `UiTable.vue`          | Table wrappers with built-in pagination              |
| `tag/`       | `UiTag.vue`                         | Tag/badge wrapper                                    |
| `UiAvatar/`  | Avatar wrappers                     | User avatar                                          |
| `Upload/`    | `UploadFile.vue`, `UploadFiles.vue` | File upload(s)                                       |
|              | `UploadDragger.vue`                 | Drag-and-drop upload                                 |
|              | `UploadFIlePDF.vue`                 | (note: typo "FIle") PDF-specific upload              |
|              | `MultipleImageUpload.vue`           | Multi-image upload                                   |

### 1.2 Layouts — `src/common/shared/layouts/`

| File                  | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `BaseLayout.vue`      | Admin dashboard wrapper (sidebar + topbar + slot)|
| `BaseSidebar.vue`     | Navigation sidebar                               |
| `BaseTopbar.vue`      | Top navigation bar                               |
| `menu.ts`             | Menu config (uses `hasPermission` directly)      |

### 1.3 Composables & Utilities

| File                                                | Purpose                                            |
| --------------------------------------------------- | -------------------------------------------------- |
| `modules/shared/utils/useNotification.ts`           | `success / error / warning / info` wrapper around `notification.service.ts` |
| `common/shared/store/usePermissions.ts`             | `hasPermission`, `hasCompanyPermission`            |
| `modules/shared/utils/usePermissions.ts`            | **Duplicate** of the above with extra computed flags |
| `modules/shared/formatdate.ts`                      | ISO → display date                                 |
| `modules/shared/pagination.ts`                      | `PaginationParams`, `PaginatedResult<T>`           |
| `modules/shared/repondata.ts`, `messageApi.ts`      | API envelope types                                 |
| `stores/global-search.store.ts`                     | Cross-page search keyword (cleared on route change)|

### 1.4 Guards

| File                                          | Behaviour                                            |
| --------------------------------------------- | ---------------------------------------------------- |
| `common/shared/guards/permission.guard.ts`    | Reads `route.meta.permission`, blocks if not allowed |
| `modules/presentation/Admin/router/guards/auth.guard.ts` | Bounces to `/login` when no token              |

### 1.5 HTTP / Notifications already centralised

- **All API calls** go through `common/config/axios/axios.ts` (single instance) — adding a header globally is a one-file change.
- **Session-expired / 403 / 500 modals** are emitted by the Axios response interceptor — feature code never needs to handle these manually.
- **Success/error notifications** have `useNotification()` available — usage is widespread but **not universal** (see Section 2.B).

---

## 2. Duplicated Patterns (Refactor Candidates)

For each pattern below: estimated occurrences, sample call sites, and a priority.

### A. Confirmation modal for "Delete" — **HIGH**

**~31 ListView/feature files** declare the same trio:

```ts
const deleteModalVisible = ref<boolean>(false);
const selectedX = ref<XInterface | null>(null);
const submitLoading = ref<boolean>(false);
```

…plus a `<UiModal>` block in the template wired to a `confirmDelete()` handler.

Sample files (representative — full list in `grep`):

- `src/modules/presentation/Admin/views/unit/UnitListView.vue:28`
- `src/modules/presentation/Admin/views/bank/BankListView.vue` (uses store-level `bankStore.showDeleteModal`)
- `src/modules/presentation/Admin/views/currencies/CurrencyView.vue:31`
- `src/modules/presentation/Admin/views/role/RoleView.vue`
- `src/modules/presentation/Admin/views/category/CategoryListView.vue`
- `src/modules/presentation/Admin/views/vendors/vendor_bank_accounts/VendorBank.vue:30`
- …(31 total)

**Existing partial solution:** `UiModal.vue` is generic; one feature already created `components/vendor-products/modals/DeleteVendorProductModal.vue` as a wrapper.

**Recommendation:** Create `common/shared/components/Modal/ConfirmDeleteModal.vue`:

```vue
<ConfirmDeleteModal
  v-model:visible="store.deleteModalVisible"
  :item-name="store.selectedItem?.name"
  :loading="store.submitLoading"
  @confirm="store.confirmDelete"
/>
```

It should:
- Render the standard "Are you sure you want to delete `{itemName}`?" body with i18n keys.
- Own the OK/Cancel buttons + loading state.
- Emit `confirm` only — parent decides what to do.

**Impact:** Removes ~3 refs and ~12 template lines from each of 31 files (~450 LOC).

---

### B. Edit / Delete action buttons in tables — **HIGH**

Every list view has the same `<template #actions="{ record }">` block:

```vue
<template #actions="{ record }">
  <div class="flex items-center justify-center gap-2">
    <UiButton v-if="canEdit*" icon="ant-design:edit-outlined" ... />
    <UiButton v-if="canDelete*" icon="ant-design:delete-outlined" danger ... />
  </div>
</template>
```

Confirmed identical (give or take icon colour) in:

- `views/unit/UnitListView.vue`
- `views/bank/BankListView.vue:136-159`
- `views/currencies/CurrencyView.vue`
- `views/role/RoleView.vue`
- `views/category/CategoryListView.vue`
- `views/product/ProductListView.vue`
- `views/user/UserList.vue`
- …~25+ ListViews and several feature components

**Recommendation:** Create `common/shared/components/table/RowActionButtons.vue`:

```vue
<RowActionButtons
  :record="record"
  :can-edit="canEditBank"
  :can-delete="canDeleteBank"
  :disabled-when="record => !!record.deleted_at"   <!-- optional -->
  @edit="bankStore.showEditModal"
  @delete="bankStore.showDeleteModal"
/>
```

Optional slots for `view`, `restore`, custom actions.

**Impact:** ~15-20 template lines per file × 25 files = **~400-500 LOC removed**.

---

### C. Permission `can*` computed refs — **HIGH**

Every ListView declares:

```ts
const canCreateX = computed(() => hasPermission("create-x"));
const canEditX   = computed(() => hasPermission("update-x"));
const canDeleteX = computed(() => hasPermission("delete-x"));
```

Confirmed in 20+ views (UnitListView, CurrencyView, RoleView, CategoryListView, BankListView, etc.).

**Also a duplicate composable exists**:
- `common/shared/store/usePermissions.ts`
- `modules/shared/utils/usePermissions.ts` ← second copy

**Recommendation (two parts):**

1. **Pick one canonical `usePermissions`** and re-export from the other path for one release cycle, then delete.
2. Add a `useResourcePermissions(resource: string)` helper:

```ts
const { canCreate, canEdit, canDelete, canView } = useResourcePermissions("unit");
// returns computed refs bound to "create-unit", "update-unit", "delete-unit", "view-unit"
```

**Impact:** Replaces 3-4 lines per ListView; eliminates a duplicate composable.

---

### D. `loading` ref + try/catch/finally inside stores — **MEDIUM**

Every store method follows:

```ts
async fetchX() {
  loading.value = true;
  try { ... } catch (e) { error.value = e } finally { loading.value = false }
}
```

Confirmed in 30+ Pinia stores (`role.store.ts`, `unit.store.ts`, `category.store.ts`, …).

**Recommendation:** Composable in `modules/shared/utils/useAsyncAction.ts`:

```ts
const { loading, run } = useAsyncAction();
await run(() => unitService.list(params));
```

Or keep stores as-is and just accept the boilerplate — the pattern is at least *consistent*.

**Impact:** ~5 LOC per store × 50 = ~250 LOC; medium because it's mechanical and stores are already readable.

---

### E. Empty-state rendering — **MEDIUM**

The Lao string `"ບໍ່ມີຂໍ້ມູນ"` (= "no data") is hard-coded in multiple places:

- `common/shared/components/table/UiTable.vue:58`
- `components/disbursement-slip/.../ApprovalDrawer.vue:292`
- `components/hal-group/_shared/components/BudgetUsageChart.vue:31,188`
- `views/vendors/vendor_product/VendorDetailView.vue:75`

Others use `<a-empty>` from Ant Design directly without i18n.

**Recommendation:** Small `EmptyState.vue` wrapping `<a-empty>` with default i18n key `common.empty`. Replace hard-coded Lao strings.

**Impact:** Small, but **fixes i18n debt** — currently `"ບໍ່ມີຂໍ້ມູນ"` is invisible to the English/Chinese locales.

---

### F. Filter bar on list pages — **MEDIUM**

Each ListView declares its own filter refs (`searchKeyword`, status select, date range), a `handleSearch`, and a `handleFilterChange`. The layout is the same.

Examples:
- `views/unit/UnitListView.vue`
- `components/hal-group/budget-list/BudgetList.vue`
- `components/hal-group/proposal-list/ProposalList.vue`
- `components/approval-department/ApprovalDepartmentTable.vue`

**Recommendation:** Either a `FilterBar.vue` taking a `fields` config prop **or** a `useListFilters()` composable returning `{ filters, setFilter, reset, debouncedFilters }`. The latter is lighter and Vue-idiomatic.

**Impact:** Medium; layouts differ slightly per page so a composable is safer than a fixed-layout component.

---

### G. Direct `message.success()` / `message.error()` outside the notification service — **LOW**

A handful of upload components bypass `useNotification()`:

- `common/shared/components/Upload/UploadFIlePDF.vue:40,54,60,80`
- `common/shared/components/Input/PdfUploader.vue:28,34,61`
- `components/disbursement-slip/.../ApprovalByFinanceDpmDetail.vue:199`

**Recommendation:** Replace with `useNotification().error(...)` for consistency. One-line change per call site.

---

## 3. Already Global (No action)

| Concern               | Where it lives                                                  |
| --------------------- | --------------------------------------------------------------- |
| HTTP error → modal    | `common/config/axios/axios.ts` response interceptor             |
| Notifications         | `modules/shared/utils/useNotification.ts`                       |
| Pagination            | `Table.vue` / `UiTable.vue` + `modules/shared/pagination.ts`    |
| Form wrapper          | `Form/UiForm.vue`, `Form/UiFormItem.vue`                        |
| Permission gating     | `usePermissions` + `permission.guard.ts` (modulo the duplicate) |

---

## 4. Proposed Refactor Roadmap

A staged plan that avoids one huge PR:

### Phase 1 — High-impact, low-risk components (1 sprint)

1. `ConfirmDeleteModal.vue`
2. `RowActionButtons.vue`
3. Adopt them in 2-3 pilot views (e.g. Unit, Bank, Currency) and review before rolling out.

### Phase 2 — Permission consolidation (1 sprint)

1. Pick canonical `usePermissions` location, mark the other deprecated.
2. Add `useResourcePermissions(name)` helper.
3. Migrate the pilot views from Phase 1.

### Phase 3 — Backfill rollout (background work)

1. Replace `deleteModalVisible` trio + `<template #actions>` block in remaining ~28 views.
2. Replace `canCreate*/canEdit*/canDelete*` triples with `useResourcePermissions`.

### Phase 4 — Polish (when ready)

1. `EmptyState.vue` + remove hard-coded Lao strings.
2. `useAsyncAction()` or accept current store pattern.
3. Standardise upload components to use `useNotification()`.

Each phase is independently shippable. Phase 1 alone removes ~900 lines of duplicated code with no behavioural change.

---

## 5. Where OpenSpec Fits

This project has OpenSpec wired (`openspec/`). Each phase above maps cleanly to a single OpenSpec **change**:

```bash
# Example
/openspec-propose Add ConfirmDeleteModal and RowActionButtons global components
```

The proposal would generate, in `openspec/changes/<change-name>/`:
- `proposal.md` — motivation, scope, non-goals
- `design.md` — props/slots/events of the new components
- `tasks.md` — checklist of pilot files to migrate
- spec entries under `specs/` if the change codifies new conventions

Then `/openspec-apply-change` walks the tasks list and ticks them off as it migrates each view; `/openspec-archive-change` closes the change once merged.

---

## 6. Re-running the Audit

Numbers in this doc came from these commands; rerun before acting:

```bash
# Count files with the delete-modal trio
grep -rln "deleteModalVisible" src/ | wc -l

# Find canCreate / canEdit / canDelete computed declarations
grep -rn "computed(() => hasPermission(" src/ | wc -l

# Find direct message.success/error calls (should migrate to useNotification)
grep -rn "message\.\(success\|error\)" src/

# Hard-coded "no data" Lao strings
grep -rn "ບໍ່ມີຂໍ້ມູນ" src/
```

When a number drifts noticeably, update the section above.
