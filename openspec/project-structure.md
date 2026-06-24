# HAL-ERP — Project Structure Reference

This is the file-by-file map of the codebase. Use it together with `openspec/AGENTS.md` (which has the conventions and pitfalls) and `docs/system-architecture.md` (the narrative explanation).

Top-down: each section names a folder, says what lives in it, and lists representative files. Where two similar files exist (legacy + new), both are noted.

---

## Top-level layout

```
hal-erp/
├── src/                      ← the application
│   ├── App.vue               ← root Vue component
│   ├── main.ts               ← Vue app bootstrap (Pinia, router, i18n, antd)
│   ├── common/               ← cross-cutting infrastructure (no business logic)
│   └── modules/              ← business code split into Clean Architecture layers
├── docs/                     ← long-form documentation
├── openspec/                 ← spec-driven change workflow (you are here)
├── public/                   ← Vite static assets
├── dist/                     ← build output (deployed via scp)
├── package.json              ← pnpm scripts + deps
├── vite.config.ts            ← Vite config (modes: halgroup, logistics)
├── tsconfig*.json            ← project references (app + node)
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.ts
├── CLAUDE.md                 ← project rules for AI assistants
└── README.md
```

---

## `src/common/` — cross-cutting infrastructure

Used by every feature; cannot import from `src/modules/`.

### `src/common/config/`
- `axios/axios.ts` — single Axios instance. Adds `Authorization` and `Accept-Language` headers, handles `FormData`, surfaces 401/403/500 modals, redirects to `/login` on session expiry. **All HTTP traffic flows through here.**
- `i18n/i18n.config.ts` — `createI18n` setup. Dynamic glob-imports `../../locales/**/*.json`. Active locale persisted in `localStorage.locale`.

### `src/common/locales/`
- `en/`, `la/`, `cn/` — one JSON file per feature (e.g. `units.json`, `vendors.json`). Sub-folders allowed; the glob walks the tree.
- **Convention:** any new i18n key MUST be added to all three locale folders in the same change. The fallback is English.

### `src/common/middlewares/`
- `auth.guard.ts` — bounces unauthenticated users to `/login`. Registered globally on the router.
- `permission.guard.ts` — reads `route.meta.permission` and checks `useAuthStore().userPermissions`. Lets super-admin / admin through.

### `src/common/shared/`
- `assets/` — fonts (`Montserrat`, `NotoSansLao`), images, layout SVGs.
- `components/` — generic UI building blocks. See `openspec/AGENTS.md` §5 for the full inventory.
  - `button/UiButton.vue` — wrapper around `<a-button>` with icon, color, shape, danger props.
  - `Modal/UiModal.vue` — wrapper around `<a-modal>` with responsive class, custom icon-title slot, OK/Cancel emit.
  - `Modal/ConfirmDeleteModal.vue` *(introduced by `extract-list-view-globals`)* — standard delete confirmation.
  - `Modal/ChangeMyPasswordModal.vue` — change-password modal (feature-specific, not generic).
  - `Modal/QuickApprovalPreviewModal.vue` — approval preview modal.
  - `table/Table.vue`, `table/UiTable.vue` — Ant table wrappers with built-in pagination.
  - `table/RowActionButtons.vue` *(introduced by `extract-list-view-globals`)* — Edit/Delete row actions.
  - `Form/UiForm.vue`, `Form/UiFormItem.vue` — form wrappers; `UiForm.validateFields()` throws on errors.
  - `Input/UiInput.vue`, `UiInputPassword.vue`, `InputSearch.vue`, `InputSelect.vue`, `PdfUploader.vue`.
  - `loading/LoadingSpinner.vue` — spinner; no global loading store exists.
  - `Upload/UploadFile.vue`, `UploadFiles.vue`, `UploadDragger.vue`, `UploadFIlePDF.vue` (typo intentional), `MultipleImageUpload.vue`.
  - `Darwer/` (typo: Drawer), `Datepicker/`, `Dropdown/`, `Radio/`, `Switch/`, `checkbox/`, `header/`, `tag/`, `UiAvatar/`.
- `composables/` *(folder introduced by `extract-list-view-globals`)* — generic composables that don't fit elsewhere. Currently: `useResourcePermissions.ts`.
- `guards/permission.guard.ts` — duplicate location for the permission guard alongside `common/middlewares/`. Imports identically.
- `layouts/` — `BaseLayout.vue` (admin shell), `BaseSidebar.vue`, `BaseTopbar.vue`, `menu.ts` (sidebar menu config — invokes `hasPermission` for visibility), `menu.interface.ts`.
- `router/index.ts` — **the single composition point for all routes.** Imports every per-feature route module from `modules/presentation/Admin/router/` and registers the two global guards.
- `store/usePermissions.ts` — **canonical** `usePermissions()` composable. Surfaces `hasPermission`, `hasCompanyPermission`, with localStorage fallback.
- `styles/` — global Tailwind / SCSS.

### `src/common/infrastructure/`
Reserved for cross-cutting infrastructure that isn't HTTP (currently mostly empty). Don't put feature repositories here.

---

## `src/modules/` — business code, Clean Architecture layers

### `src/modules/domain/` — pure types & business rules

No I/O, no HTTP, no Vue.

- `entities/` — rich classes with private fields + getters and small business methods (`delete()`, `restore()`, `isDeleted()`). Constructor formats incoming ISO strings via `formatDate()`.
  - Flat entities (no submodule): `bank.entity.ts`, `categories.entity.ts`, `company.entity.ts`, `company-user.entity.ts`, `currency.entity.ts`, `document-category.entity.ts`, `document-status.entity.ts`, `document-type.entities.ts`, `exchange-rate.entities.ts`, `permission.entities.ts`, `position.entity.ts`, `product.entity.ts`, `product-types.entity.ts`, `role.entities.ts`, `unit.entity.ts`, `user.entities.ts`, `vat.entity.ts`, `approval-step.entity.ts`, `approval-workflows.entity.ts`, `approval-workflows-step.entity.ts`.
  - Sub-foldered features: `auth/`, `budget/`, `budget-approval-rules/`, `budget/increase/`, `departments/`, `purchase-order/`, `purchase-requests/`, `quotas/`, `receipts/` (with `receipts/purchase-request/`), `user-approvals/`, `vendor-products/`, `vendors/vendor/`, `vendors/vendor_bank_accounts/`, `vendors/vendor_product/`.
- `repository/` — **interfaces only**. Mirrors `entities/` layout. Each file declares the contract that `infrastructure/` must implement.
  - Same flat/sub-foldered split: e.g. `bank.repository.ts`, `auth/`, `vendors/vendor/`, `vendors/vendors_bank_accounts/` *(note the typo: `vendors_bank_accounts` here vs `vendor_bank_accounts` elsewhere)*.

### `src/modules/application/` — use cases, DTOs, services

May import from `domain/` only.

- `dtos/<feature>.dto.ts` — plain TypeScript shapes that cross the wire. One per feature, sub-folders mirror `domain/`.
- `ports/input/<feature>.service.ts` — interface a service implementation must satisfy. Mirrors the dtos layout.
- `useCases/<feature>/<verb>-<feature>.usecase.ts` — single-operation business functions (e.g. `create-unit.usecase.ts`, `list-units.usecase.ts`, `update-unit.usecase.ts`, `delete-unit.usecase.ts`).
- `services/<feature>.service.ts` — implementations that compose the use cases and call the repository. Stores create these via a factory function.
  - Special: `services/notification.service.ts` — wraps Ant Design `notification` API. Don't call `notification.*` directly from features; use `useNotification()` instead.

### `src/modules/infrastructure/` — HTTP adapters

Each feature has its own folder (e.g. `vendors/`, `budget/`, `purchase-order/`, `purchase_requests/`, `quotas/`, `reports/`, `user-approvals/`, `vendor-products/`, `budget-approval-rules/`, `departments/`, `auth/`). Inside:

- `api-<feature>.repository.ts` — implements the `domain/repository/<feature>.repository.ts` interface. Uses `api.get/post/put/delete` from `common/config/axios/axios.ts`.
- Sub-feature repositories live alongside (e.g. `vendors/api-vendor.repository.ts`, `vendors/api-vendor-bank-accounts.repository.ts`, `vendors/api-vendor-product.repository.ts`).

### `src/modules/interfaces/`

TypeScript shapes shared between `infrastructure/` and `presentation/` (column definitions, table-row types, etc.). Mirrors the same feature folders.

### `src/modules/presentation/Admin/` — UI

The only sub-folder under `presentation/` is `Admin/` (no public-facing UI). Structure inside:

- `views/<feature>/<Feature>{List,Create,Edit,Detail}View.vue` — routed pages.
  - Examples: `unit/UnitListView.vue`, `bank/BankListView.vue`, `currencies/CurrencyView.vue`, `role/RoleView.vue`, `vendors/vendor/VendorView.vue`, `vendors/vendor_bank_accounts/VendorBank.vue`, `vendors/vendor_product/VendorDetailView.vue`, `purchase_orders/PurchaseOrdersList.vue`, `purchase_requests/...` (note: both `purchase_requests/` and `purchase-requests/` exist — the underscore folder predates the kebab-case rename).
- `components/<feature>/` — feature-scoped components used by the views.
  - Form components: `unit/FormUnit.vue`, `bank/BankForm.vue`, etc.
  - Cross-feature dashboards: `hal-group/`, `approval-department/`, `approval-on-phone/`, `disbursement-slip/`, `drawer-pr-and-po/`, `review-money/`.
- `stores/<feature>.store.ts` — Pinia setup-style stores. One per feature; some grouped into sub-folders (`authentication/auth.store.ts`, `budget/...`, `departments/...`, `purchase_requests/...`, `quotas/...`, `reports/...`, `vendor-products/...`, `vendors/...`).
- `router/<feature>{Routes,Rountes,routers}.ts` — per-feature route modules registered by `common/shared/router/index.ts`. Naming is inconsistent (legacy typos `positionRountes.ts`, `purchase-reques.router.ts`). Don't rename — it would break imports.
  - Sub-folders for grouped routes: `router/budget/`, `router/departments/`, `router/purchase/`, `router/purchase-requests/`, `router/quotas/`, `router/reports/`, `router/vendors/`.
  - `router/guards/auth.guard.ts` — duplicates `common/middlewares/auth.guard.ts` location (same intent).
- `dashboard/` — dashboard-specific views & router (entry point after login).

### `src/modules/shared/` — module-level utilities

Helpers that any layer of `modules/` may import. Don't put feature business logic here.

- `formatdate.ts` — ISO → display string. Every entity's constructor uses it.
- `pagination.ts` — `PaginationParams`, `PaginatedResult<T>` types.
- `repondata.ts` — `ApiListResponse` envelope type.
- `messageApi.ts` — `ApiResponse` envelope type.
- `column/` — shared column definition helpers for tables.
- `validations/` — Ant Design Vue form validators.
- `utils/`:
  - `useNotification.ts` — composable wrapping `notification.service.ts`. **Use this for all success/error toasts.**
  - `usePermissions.ts` — duplicate of the canonical one in `common/shared/store/`. Being deprecated by the `extract-list-view-globals` change.
  - Other helpers as the codebase grows.

---

## `docs/`

| File                              | What's in it                                                  |
| --------------------------------- | ------------------------------------------------------------- |
| `project-overview.md`             | Business scope, tech stack, build modes, what this project is NOT |
| `system-architecture.md`          | Layer rules, store pattern, HTTP layer, guards, approval engine, trade-offs |
| `api-documentation.md`            | Endpoint catalogue                                            |
| `database-design.md`              | Backend data model (the API's source, not this repo's data)   |
| `shared-components-audit.md`      | Existing global components inventory + duplicated patterns + refactor roadmap |

When adding documentation, decide whether it's *narrative* (goes in `docs/`) or *spec-driven contract* (goes in `openspec/specs/`). This file you're reading is a reference for the openspec workflow itself.

---

## `openspec/`

| Path                          | Purpose                                                                |
| ----------------------------- | ---------------------------------------------------------------------- |
| `AGENTS.md`                   | Working guide — read first.                                            |
| `project-structure.md`        | This file.                                                             |
| `config.yaml`                 | Schema + project context (auto-fed to artifact creators).              |
| `specs/<capability>/spec.md`  | Canonical specs (source of truth for capabilities). Populated by archiving completed changes. |
| `changes/<name>/`             | In-flight change with `proposal.md`, `design.md`, `specs/`, `tasks.md`.|
| `changes/archive/`            | Archived completed changes.                                            |
| `proposal.md`, `design.md`, `tasks.md` *(orphans at root)* | Historical record of the very first OpenSpec change that produced the files under `docs/`. They were placed at the openspec root instead of inside `changes/<name>/`. **Don't put new artifacts at the root** — use `changes/<name>/` per the workflow. Leave these untouched for provenance. |

### Current in-flight changes
- `changes/extract-list-view-globals/` — introduces `ConfirmDeleteModal`, `RowActionButtons`, `useResourcePermissions`; consolidates duplicate `usePermissions`; migrates 3 pilot views.

---

## Build & deploy files

- `package.json` — scripts (`dev`, `build`, `build:halgroup`, `build:logistics`, `type-check`, `lint`, `preview`, `deploy`) and dependencies. **Match these script names; don't add new ones casually.**
- `vite.config.ts` — Vite plugin chain (Vue, Tailwind, alias `@` → `src/`). Modes `halgroup` and `logistics` change which `.env.<mode>` Vite loads.
- `tsconfig.json` — project references; `tsconfig.app.json` for `src/`, `tsconfig.node.json` for tooling.
- `tailwind.config.js`, `postcss.config.js`, `eslint.config.ts` — style/lint config.
- `index.html` — Vite entry HTML (rarely edited).

---

## Environment variables (in `.env`)

- `VITE_BASE_API_URL` — backend REST root.
- `VITE_IMG_URL` — static image host.

Commented-out alternatives in `.env` show `127.0.0.1:3000/api` for local and `erp.hal-logistics.la/api` for production.

---

## Where to start when adding a new feature

Follow the steps in `CLAUDE.md` §"Adding a New Feature" — 11 steps from `domain/entities/` through `presentation/router/`. The conventions in `openspec/AGENTS.md` §4 give you the exact filenames.

When the feature is more than trivial, file an OpenSpec change first (`/openspec-propose`) so the contract is captured before code is written.
