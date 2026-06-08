# OpenSpec Tasks — Document HAL-ERP Existing System

Execution checklist for the documentation pass. Tasks are written so each one is independently verifiable.

## Phase 1 — Discovery

- [x] List every folder under `src/modules/{domain,application,infrastructure,presentation}` to catalogue modules that actually exist.
- [x] Read `src/common/shared/router/index.ts` and per-feature route modules to confirm the routed surface.
- [x] Read `src/common/config/axios/axios.ts` to document HTTP behaviour (interceptors, error modals, language header).
- [x] Audit `src/modules/infrastructure/**/*.repository.ts` for every `private readonly baseUrl` and `api.{get,post,put,delete}(...)` call.
- [x] Confirm by `grep` that the following do **not** exist anywhere in `src/`: `warehouse`, `inbound`, `outbound`, `freight`, `branch` (as a discrete module name).

## Phase 2 — Module deep-reads

- [x] **Authentication.** Read `auth.entity.ts`, `api-auth.repository.ts`, `auth.service.ts`, `auth.dto.ts`, `auth.store.ts`. Note the hard-coded `"write-purchase-request"` permission patch on login.
- [x] **Vendor.** Read `vendors/vendor/vendors.entities.ts` and `api-vendor.repository.ts`. Note dual ID coercion (`id.toString()`).
- [x] **Vendor Bank Accounts.** Confirm the `/vendor_bank_accounts` (underscore) path.
- [x] **Vendor Product.** Read `vendor-product.entity.ts` and `api-vendor-product.repository.ts`. Capture the price/currency join and `restore` endpoint.
- [x] **Purchase Request.** Read `purchase-request.entity.ts`, `purchase-request-item.entity.ts`, `api-purchase-request.repository.ts`. Capture the create payload.
- [x] **Purchase Order.** Read `purchase-order.entity.ts`, `api-purchase-order.repository.ts`. Capture `by-token`, `export-excel`, `is_created_rc`.
- [x] **Receipts (Inbound proxy).** Read `receipt.entity.ts`, `receipt-item.entity.ts`, `api-receipt.repository.ts`. Capture `print`, `export`, `count`, and the `approve-step` integration.
- [x] **Disbursement (Outbound proxy).** Read the four `disbursement-slip/*.vue` views. Confirm there is no dedicated `/disbursements` endpoint and document that disbursement is a sequence of `approve-step` calls.
- [x] **Branch proxy.** Read `company.entity.ts`, `api-company.repository.ts`, `department.entity.ts`. Document the company × department hierarchy as the closest analogue.

## Phase 3 — Write `docs/`

- [x] `docs/project-overview.md` — narrative, module audit table, tech stack, build commands, environments, "is not" disclaimer.
- [x] `docs/system-architecture.md` — layers, dependency rules, feature skeleton (Auth as example), Pinia pattern, Axios behaviour, router & guards, permissions, i18n, approval engine, trade-offs.
- [x] `docs/database-design.md` — ASCII entity diagram, per-table column lists from entity private fields, conventions section, "tables that do not exist" section.
- [x] `docs/api-documentation.md` — base URL, auth headers, envelope, list query params, per-module endpoint tables, payload examples for the procurement flow, token-based approval, endpoints that do not exist.

## Phase 4 — Write `openspec/`

- [x] `openspec/proposal.md` — why, what, non-goals, success criteria, scope.
- [x] `openspec/design.md` — sourcing rule, naming policy, doc boundaries, validation procedure, trade-offs.
- [x] `openspec/tasks.md` — this file.

## Phase 5 — Validation

Run each of these and confirm the docs match. Any mismatch is a blocker.

- [ ] **Endpoint reality check.**
  ```bash
  grep -rh "private readonly baseUrl" src/modules/infrastructure/ | sort -u
  grep -rh "api\.\(get\|post\|put\|delete\)" src/modules/infrastructure/ \
    | grep -oE "['\"][/a-zA-Z0-9_{}-]+['\"]" | sort -u
  ```
  Cross-reference results against `docs/api-documentation.md`. Add anything missing; remove anything fabricated.

- [ ] **Entity reality check.**
  ```bash
  find src/modules/domain/entities -name "*.entity*.ts" | sort
  ```
  Cross-reference against `docs/database-design.md`.

- [ ] **Module audit consistency check.** The three documents that contain the "requested module → status" table (`project-overview.md`, `api-documentation.md`, `openspec/design.md`) must agree. A quick `diff` between the tables catches drift.

- [ ] **Type-check & build sanity.** No source files were edited, so `pnpm type-check` should still pass. If it doesn't, this change inadvertently touched something it shouldn't have.

## Phase 6 — Follow-ups (out of scope for this change)

- [ ] Decide whether Warehouse / Inbound / Outbound / Freight modules should be built. If yes, each one is its own OpenSpec proposal.
- [ ] Add a CI job that re-runs the Phase 5 validation greps on every PR so the docs cannot silently rot.
- [ ] Remove the hard-coded `"write-purchase-request"` permission patch in `useAuthStore.login()` once permissions are sourced from JSON config.
- [ ] Normalise the dual vendor-product repository (`infrastructure/vendors/api-vendor-product.repository.ts` vs `infrastructure/vendor-products/api-vendor-product.repository.ts`).
