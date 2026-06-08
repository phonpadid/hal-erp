# HAL-ERP — Project Overview

## 1. What This System Is

HAL-ERP is the **front-end web application** for HAL Logistics' internal enterprise resource planning system. The repository contains a Vue 3 + TypeScript single-page application that talks to a remote REST API (see `.env` → `VITE_BASE_API_URL`).

Despite the parent company being a logistics business, **the application itself is a Procurement / Purchase ERP**. Its primary concern is moving a purchase from request to payment with a multi-step approval workflow, not warehouse or freight management.

## 2. Core Business Flow

```
Purchase Request (PR)
        │
        ▼  approval workflow (multi-step, optional OTP)
Purchase Order (PO)
        │
        ▼  approval workflow
Receipt (RC)   ← goods/services received from vendor
        │
        ▼  approval workflow
Disbursement   ← finance department transfers payment
```

Each stage is a separate document type backed by its own entity, repository, service, store and views. A shared `user_approval` object is attached to PR / PO / RC documents and is advanced by `POST /approve-step/{id}`.

## 3. Modules Identified in Source

The table below maps the modules the user asked about against what is actually implemented in the codebase. **"Status"** is based on directly inspecting `src/modules/domain/entities/`, `src/modules/infrastructure/`, `src/modules/application/services/`, and `src/common/shared/router/index.ts`.

| Requested Module       | Status in Code            | Implemented As                                                                                                                                  |
| ---------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication         | ✅ Present                | `domain/entities/auth/`, `infrastructure/auth/`, `application/services/auth/`, `stores/authentication/`, views `Login.vue` & `ResetPassword.vue` |
| Branch                 | ⚠️ No direct module       | Closest concepts: **Company** (`companies`) under the HAL Group hierarchy, and **Department** (`departments`) with `in_the_office` / `outside_the_office` types |
| Warehouse              | ❌ Not implemented        | No warehouse, inventory, or stock entity / repository / route exists in the codebase                                                            |
| Inbound                | ⚠️ No standalone module   | The "goods received" step is implemented as **Receipts** (`receipts`) which references a `purchase_order_id`                                    |
| Outbound               | ⚠️ No standalone module   | Outflow of funds is **Disbursement** (`disbursement-slip` views: AccountingDepartment, FinancialDepartmentTransfer, ApprovalByFinanceDepartment) |
| Vendor                 | ✅ Present                | `domain/entities/vendors/vendor/`, plus `vendor_bank_accounts` sub-entity                                                                       |
| Vendor Product         | ✅ Present                | `domain/entities/vendor-products/` — links a vendor to a product with `price` and `currency_id`                                                 |
| Freight calculation    | ❌ Not implemented        | No freight, shipping cost, weight, distance or rate-card logic anywhere in `src/`                                                                |

### Other modules present (not in the original list but real in code)

`approval-workflows`, `approval-workflow-steps`, `budget` (accounts / items / item-details / approval-rules / increase-budget), `categories`, `currencies`, `document-types`, `document-categories`, `exchange-rates`, `permissions`, `positions`, `product-types`, `products`, `quotas` (`quota-company`), `reports` (purchase-orders / purchase-requests / receipts), `roles`, `units`, `users`, `user-approvals`, `vat`, `banks`, `hal-group`.

## 4. Tech Stack (resolved from `package.json`)

| Concern          | Choice                                       |
| ---------------- | -------------------------------------------- |
| Framework        | Vue 3.5 (Composition API, `<script setup>`)  |
| Language         | TypeScript 5.8                               |
| Build            | Vite 6                                       |
| UI               | Ant Design Vue 4.x + Tailwind CSS 3 + SCSS   |
| State            | Pinia 3                                      |
| Routing          | Vue Router 4                                 |
| HTTP             | Axios 1.9 (single instance in `common/config/axios/axios.ts`) |
| i18n             | vue-i18n 11 — locales `en`, `la`, `cn`       |
| Date             | dayjs                                        |
| Auth token       | JWT in `localStorage.accessToken`, decoded with `jwt-decode` |
| Package manager  | pnpm                                         |

## 5. Build & Deploy

```bash
pnpm install            # install
pnpm dev                # local dev server
pnpm build              # type-check + production build
pnpm build:halgroup     # mode=halgroup
pnpm build:logistics    # mode=logistics
pnpm lint               # eslint --fix
pnpm deploy             # scp dist/ to root@134.209.101.30:/var/www/admin/
```

Two build modes exist (`halgroup`, `logistics`), suggesting the same codebase is deployed for both the HAL Group parent and the HAL Logistics tenant.

## 6. Languages

Three locale folders exist under `src/common/locales/`: `en`, `la` (Lao), `cn` (Chinese). The default fallback is English. User messages emitted by `axios.ts` interceptors (session expired, login failed, server error, permission denied) are hard-coded in Lao.

## 7. Environments

Configured via `.env`:

- `VITE_BASE_API_URL` — backend REST root (default `http://134.209.101.30:3000/api`)
- `VITE_IMG_URL` — static image host (same default)

Commented-out alternatives in `.env` show `127.0.0.1:3000/api` for local, and `erp.hal-logistics.la/api` for production.

## 8. What This Project Is **Not**

To prevent confusion for future contributors, the following are **not** part of this codebase:

- No warehouse / stock / inventory module.
- No freight, shipping cost, or logistics-route calculation.
- No inbound or outbound goods movement tracking distinct from procurement receipts.
- No POS, no e-commerce, no customer-facing surface.
- No back-end source — only the front-end SPA lives in this repository.
