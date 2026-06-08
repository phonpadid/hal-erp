# HAL-ERP — API Documentation

> **Source of truth.** This document lists the HTTP endpoints **consumed by** the front-end. They are extracted from every `*.repository.ts` under `src/modules/infrastructure/`. The back-end implementation is not in this repository; consult the back-end project for full request/response schemas. Anything below is exactly what the SPA expects.

## 0. Conventions

### Base URL

```
{VITE_BASE_API_URL}    # default http://134.209.101.30:3000/api
```

### Authentication

Every authenticated request carries:

```
Authorization: Bearer <accessToken>
Accept-Language: en | lo | cn
Content-Type: application/json   (or multipart/form-data for uploads)
```

`accessToken` is read from `localStorage.accessToken`. The token is issued by `POST /users/login`. On any `401` (outside the forgot/reset-password endpoints) the SPA clears the token and bounces to `/login`.

### Response envelope

```jsonc
{
  "status_code": 200,
  "message": "OK",
  "data": { /* resource or list */ },
  "pagination": { "page": 1, "limit": 10, "total": 42, "total_pages": 5 }   // list endpoints only
}
```

### Common list query parameters

```
page              number   default 1
limit             number   default 10
search            string
sort_by           string
sortDirection     "asc" | "desc"
include_deleted   boolean  default false
```

### Common error semantics (from `axios.ts`)

| Status | What the SPA does                                                |
| ------ | ---------------------------------------------------------------- |
| 400/401 on `/users/login` | Show "login failed" modal, reject for store catch.                |
| 401 on `/users/forgot-password`, `/users/reset-password` | Pass through to caller. |
| 401 otherwise            | Show "session expired" modal, clear token, redirect to `/login`.  |
| 403                      | Show "no permission" modal.                                       |
| 404                      | `findById` returns `null`; everything else propagates.            |
| 500                      | Show "server error" modal.                                        |

---

## 1. Authentication

Implemented in `infrastructure/auth/api-auth.repository.ts`.

| Method | Path                       | Body                                                                | Notes                                  |
| ------ | -------------------------- | ------------------------------------------------------------------- | -------------------------------------- |
| POST   | `/users/login`             | `{ username, password }`                                            | Returns `{ access_token, user }`. SPA expects `status_code === 201` on success. |
| POST   | `/users/logout`            | —                                                                   | Server-side invalidation; SPA also clears localStorage. |
| POST   | `/users/forgot-password`   | `{ email }`                                                         | Sends reset link.                       |
| POST   | `/users/reset-password`    | `{ token, new_password, confirm_password }`                         | Token comes from the email link.        |

### Login response (`UserDTO` shape)

```jsonc
{
  "status_code": 201,
  "message": "Login successful",
  "data": {
    "access_token": "<JWT>",
    "user": {
      "id": 1,
      "username": "alice",
      "email": "alice@hal.la",
      "tel": "+85620...",
      "department_name": "Finance",
      "signature": "/uploads/sig.png",
      "roles": ["company-admin"],
      "permission": ["read-user", "write-user", ...],
      "user_type": ["company_user"],
      "created_at": "2024-05-01 10:00:00",
      "updated_at": "2025-01-12 09:00:00",
      "deleted_at": null,
      "company": { "id": 3, "name": "HAL Logistics" }
    }
  }
}
```

The SPA hard-codes one extra permission: it appends `"write-purchase-request"` to every logged-in user.

---

## 2. Users / Roles / Permissions

| Method | Path                                | Purpose                                  |
| ------ | ----------------------------------- | ---------------------------------------- |
| GET    | `/users`                            | List (paginated, supports filters).      |
| GET    | `/users/{id}`                       | Detail.                                  |
| POST   | `/users`                            | Create.                                  |
| PUT    | `/users/{id}`                       | Update.                                  |
| PUT    | `/users/change-password/{id}`       | Admin-set password.                      |
| PUT    | `/users/change-password`            | Self-service change password.            |
| DELETE | `/users/{id}`                       | Soft delete.                             |
| GET    | `/roles`                            | List roles.                              |
| GET    | `/roles/company`                    | Roles scoped to current company.         |
| GET    | `/roles/company/users`              | Company-role users join.                 |
| GET    | `/roles/department`                 | Roles scoped to a department.            |
| POST/PUT/DELETE on each above where applicable. |                                 |
| GET    | `/permissions`                      | List permissions.                        |

---

## 3. Companies & HAL Group (closest concept to "Branch")

| Method | Path                              | Purpose                                                  |
| ------ | --------------------------------- | -------------------------------------------------------- |
| GET    | `/companies`                      | List companies under the HAL Group umbrella.             |
| GET    | `/companies/{id}`                 | Detail.                                                  |
| POST   | `/companies`                      | Create company.                                          |
| PUT    | `/companies/{id}`                 | Update.                                                  |
| DELETE | `/companies/{id}`                 | Soft delete.                                             |
| POST   | `/companies/{id}/restore`         | Restore soft-deleted company.                            |
| GET    | `/companies/report/receipt`       | Per-company receipt report.                              |
| GET    | `/company-users`                  | Users scoped to a company (CRUD: GET/POST/PUT/DELETE).   |

The SPA stores the user's company in `localStorage.userCompany` and exposes `getCompanyId` / `getCompanyName` from `useAuthStore`. This is what the UI uses as the "branch" filter.

---

## 4. Departments

| Method | Path                          | Notes                                          |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/department`                 | List departments.                              |
| GET    | `/department/{id}`            | Detail.                                        |
| POST   | `/department`                 | Create.                                        |
| PUT    | `/department/{id}`            | Update.                                        |
| DELETE | `/department/{id}`            | Soft delete.                                   |
| GET    | `/department/report`          | Department report.                             |
| GET    | `/department-users`           | Department ↔ user assignments.                 |
| GET    | `/department-approvers`       | Approvers assigned to a department.            |
| GET    | `/roles/department`           | Roles scoped to a department.                  |

Department `type` is one of `in_the_office` or `outside_the_office`.

---

## 5. Catalog (Products, Categories, Units, Types)

| Method | Path                              | Notes                                       |
| ------ | --------------------------------- | ------------------------------------------- |
| GET    | `/products`                       | List (params: `category_id`, `product_type_id`, `search`, ...). |
| GET    | `/products/{id}`                  | Detail.                                     |
| POST   | `/products`                       | Create.                                     |
| PUT    | `/products/{id}`                  | Update.                                     |
| DELETE | `/products/{id}`                  | Soft delete.                                |
| POST   | `/products/{id}/restore`          | Restore.                                    |
| GET    | `/categories`                     | CRUD + `POST /{id}/restore`.                |
| GET    | `/product-types`                  | CRUD + `POST /{id}/restore`.                |
| GET    | `/units`                          | CRUD + `POST /{id}/restore`.                |

---

## 6. Vendor & Vendor Product

### 6.1 Vendor

Implemented in `infrastructure/vendors/api-vendor.repository.ts`.

| Method | Path                  | Body / Query                                   | Notes                          |
| ------ | --------------------- | ---------------------------------------------- | ------------------------------ |
| GET    | `/vendors`            | `page, limit, search, sort_by, sortDirection, include_deleted` | List. |
| GET    | `/vendors/{id}`       | —                                              | Detail.                        |
| POST   | `/vendors`            | `{ name, contact_info, vendor_bank_account[] }` | Create.                        |
| PUT    | `/vendors/{id}`       | Same shape                                     | Update.                        |
| DELETE | `/vendors/{id}`       | —                                              | Soft delete.                   |

### 6.2 Vendor Bank Account

Implemented in `infrastructure/vendors/api-vendor-bank-accounts.repository.ts`.

| Method | Path                            | Notes                                            |
| ------ | ------------------------------- | ------------------------------------------------ |
| GET    | `/vendor_bank_accounts`         | List bank accounts per vendor.                    |
| GET    | `/vendor_bank_accounts/{id}`    | Detail.                                           |
| POST   | `/vendor_bank_accounts`         | Create.                                           |
| PUT    | `/vendor_bank_accounts/{id}`    | Update.                                           |
| DELETE | `/vendor_bank_accounts/{id}`    | Delete.                                           |

### 6.3 Vendor Product

Implemented in `infrastructure/vendor-products/api-vendor-product.repository.ts` (the `vendors/` folder has a near-duplicate older copy).

| Method | Path                                  | Body / Query                                                                     |
| ------ | ------------------------------------- | -------------------------------------------------------------------------------- |
| GET    | `/vendor-products`                    | `page, limit, search, sort_by, sortDirection, include_deleted, vendor_id, product_id` |
| GET    | `/vendor-products/{id}`               | —                                                                                |
| POST   | `/vendor-products`                    | `{ vendor_id, product_id, price, currency_id }`                                  |
| PUT    | `/vendor-products/{id}`               | Same                                                                             |
| DELETE | `/vendor-products/{id}`               | Soft delete                                                                      |
| POST   | `/vendor-products/{id}/restore`       | Restore                                                                          |

Response example for a single vendor product:

```jsonc
{
  "id": 21,
  "vendor_id": 5,
  "vendor": { "id": 5, "name": "ACME" },
  "product_id": 9,
  "product": { "id": 9, "name": "A4 paper" },
  "price": "85000",
  "currency_id": 1,
  "currency": { "id": 1, "code": "LAK", "name": "Lao Kip" },
  "created_at": "2025-03-01 10:00:00",
  "updated_at": "2025-03-01 10:00:00",
  "deleted_at": null
}
```

---

## 7. Purchase Requests (PR)

Implemented in `infrastructure/purchase_requests/api-purchase-request.repository.ts`.

| Method | Path                                  | Notes                                            |
| ------ | ------------------------------------- | ------------------------------------------------ |
| GET    | `/purchase-requests`                  | List (paginated).                                |
| GET    | `/purchase-requests/{id}`             | Detail.                                          |
| POST   | `/purchase-requests`                  | Create.                                          |
| PUT    | `/purchase-requests/{id}`             | Update.                                          |
| DELETE | `/purchase-requests/{id}`             | Soft delete.                                     |
| POST   | `/approve-step/{user_approval_step_id}` | Advance approval (shared with PO and Receipt).   |

### Create body (excerpt)

```jsonc
{
  "document": {
    "description": "Office supplies",
    "documentTypeId": 4
  },
  "expired_date": "2026-06-30",
  "purposes": "Monthly stationery restock",
  "purchase_request_item": [
    {
      "title": "A4 paper",
      "file_name": null,
      "quantity": 10,
      "unit_id": 2,
      "price": 85000,
      "total_price": 850000,
      "currency_id": 1,
      "remark": ""
    }
  ]
}
```

A PR carries `is_created_po: boolean`, flipped to `true` once a PO is generated from it.

---

## 8. Purchase Orders (PO)

Implemented in `infrastructure/purchase-order/api-purchase-order.repository.ts`.

| Method | Path                                              | Notes                                                     |
| ------ | ------------------------------------------------- | --------------------------------------------------------- |
| GET    | `/purchase-orders`                                | List (paginated).                                          |
| GET    | `/purchase-orders/{id}`                           | Detail.                                                   |
| GET    | `/purchase-orders/by-token?token=...`             | Mobile / email-link approval entry.                       |
| POST   | `/purchase-orders`                                | Create from a PR.                                         |
| PUT    | `/purchase-orders/{id}`                           | Update.                                                   |
| DELETE | `/purchase-orders/{id}`                           | Soft delete.                                              |
| GET    | `/purchase-orders/export-excel?startDate&endDate` | Excel export (`responseType: blob`).                      |

A PO carries `is_created_rc: boolean`, flipped to `true` once a receipt has been recorded.

---

## 9. Receipts (acts as "Inbound" in this codebase)

Implemented in `infrastructure/api-receipt.repository.ts`.

| Method | Path                                          | Notes                                                              |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/receipts`                                   | Params: `page, limit, column=id, company_id, include_deleted, order_date, department_id, type, status_user_id, search`. |
| GET    | `/receipts/{id}`                              | Detail.                                                            |
| POST   | `/receipts`                                   | Create from a PO.                                                  |
| PUT    | `/receipts/{id}`                              | Update.                                                            |
| DELETE | `/receipts/{id}`                              | Soft delete.                                                       |
| GET    | `/receipts/export/{id}`                       | Excel export for a single receipt.                                 |
| GET    | `/receipts/export-excel?startDate&endDate`    | Bulk Excel export.                                                 |
| GET    | `/receipts/print/{id}?print=about_receipt`    | Printable view.                                                    |
| GET    | `/receipts/print/{id}?print=all_document`     | Printable bundle.                                                  |
| GET    | `/reports/receipts/money`                     | Money report.                                                      |
| GET    | `/count?type=...`                             | Receipt count by type (used by report menu badge).                  |

### Create body

```jsonc
{
  "purchase_order_id": 17,
  "remark": "Received in full",
  "document": { "description": "", "documentTypeId": 4 },
  "receipt_items": [
    {
      "purchase_order_item_id": 33,
      "payment_currency_id": 1,
      "payment_type": "transfer",   // or "cash"
      "remark": ""
    }
  ]
}
```

### Approval (`approve-step`)

```jsonc
POST /approve-step/{user_approval_step_id}
{
  "type": "...",
  "statusId": 2,                // e.g. APPROVED
  "is_otp": true,
  "otp": "123456",              // when required
  "approval_id": 145,
  "account_code": "BUD-2025-01",
  "files": ["/uploads/abc.pdf"], // when step.requires_file_upload
  "remark": "Looks good",
  "rate": [ /* per-line currency rates */ ]
}
```

Null/empty fields are filtered client-side before send.

---

## 10. Disbursement (acts as "Outbound" in this codebase)

The disbursement views (`AccountingDepartment.vue`, `AccountingDepartmentCheck.vue`, `ApprovalByFinanceDepartment.vue`, `FinancialDepartmentTransfer.vue`) hit the **same `approve-step` workflow** with different `type` / `statusId` values. There is no dedicated `/disbursements` resource — disbursement is a sequence of approval steps attached to a Receipt.

The related "money" report endpoint:

```
GET /money
GET /reports/receipts/money
```

---

## 11. Approval Workflow

| Method | Path                                                            | Notes                                                  |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/approval-workflows`                                           | List workflow templates.                                |
| POST   | `/approval-workflows`                                           | Create.                                                 |
| PUT    | `/approval-workflows/{id}`                                      | Update.                                                 |
| DELETE | `/approval-workflows/{id}`                                      | Delete.                                                 |
| POST   | `/approval-workflows/approve/{token}`                           | Token-based approve (used by `/approve` blank route).   |
| GET    | `/approval-workflow-steps`                                      | List all steps.                                         |
| GET    | `/approval-workflow-steps/approval-workflow-id/{workflowId}`    | Steps for a workflow.                                   |
| POST   | `/approval-workflow-steps`                                      | Create step.                                            |
| PUT    | `/approval-workflow-steps/{id}`                                 | Update step.                                            |
| DELETE | `/approval-workflow-steps/{id}`                                 | Delete step.                                            |
| GET    | `/user-approval`                                                | Runtime approval instances.                             |
| POST   | `/approve-step/{user_approval_step_id}`                         | Advance an approval (see §9).                           |
| GET    | `/budget-approval-rules`                                        | Map amount-range → workflow.                            |

---

## 12. Budget

| Method | Path                                              | Notes                                            |
| ------ | ------------------------------------------------- | ------------------------------------------------ |
| GET    | `/budget-accounts`                                | List budget accounts.                            |
| CRUD   | `/budget-accounts`, `/budget-accounts/{id}`       |                                                  |
| GET    | `/budget-accounts/report-to-use-budget`           | Budget usage report.                             |
| GET    | `/budget-items`                                   | CRUD.                                            |
| GET    | `/budget-item-details`                            | CRUD.                                            |
| GET    | `/increase-budgets`                               | CRUD — budget top-ups.                           |
| GET    | `/increase-budget-details`                        | CRUD.                                            |
| GET    | `/budget-approval-rules`                          | CRUD.                                            |

---

## 13. Quota (Company Quota with Vendors)

| Method | Path                       | Notes                            |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/quota-company`           | CRUD; referenced from PR items.  |

---

## 14. Reference Data

| Method | Path                       | Notes                            |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/banks`                   | CRUD.                            |
| GET    | `/vat`                     | CRUD (singular `vat` path).      |
| GET    | `/currencies`              | CRUD.                            |
| GET    | `/exchange-rates`          | CRUD.                            |
| GET    | `/document-types`          | CRUD.                            |
| GET    | `/document-categories`     | CRUD.                            |
| GET    | `/positions`               | CRUD.                            |

---

## 15. Reports

| Method | Path                                | Notes                                  |
| ------ | ----------------------------------- | -------------------------------------- |
| GET    | `/reports/purchase-orders`          | PO report.                              |
| GET    | `/reports/purchase-requests`        | PR report.                              |
| GET    | `/reports/receipts/money`           | Receipts money report.                  |
| GET    | `/companies/report/receipt`         | Per-company receipt report.             |
| GET    | `/department/report`                | Department report.                      |
| GET    | `/budget-accounts/report-to-use-budget` | Budget usage report.                |
| GET    | `/report-company`                   | Company report (`stores/company-report.store.ts`). |
| GET    | `/count?type=...`                   | Sidebar badge counts.                   |

---

## 16. Mobile / Token Approval (unauthenticated)

These public routes resolve token-bearing links from approval emails:

```
GET  /purchase-orders/by-token?token=...
POST /approval-workflows/approve/{token}
```

Front-end views: `/approval-pr/:token`, `/approval-po/:token`, `/approval-rc/:token`, `/approve` (under `views/approval-workflows/ApproveByTokenPage.vue`). They do **not** require a logged-in session.

---

## 17. Endpoints That Do **Not** Exist

For clarity, the back-end exposes no endpoints under any of these paths and the SPA never calls them:

- `/warehouses`, `/stocks`, `/inventory`, `/stock-movements`
- `/inbound`, `/outbound`, `/shipments`, `/deliveries`
- `/freight`, `/shipping`, `/rates`, `/carriers`
- `/branches`  *(use `/companies` and `/department` instead)*

Adding these would require new back-end resources and matching front-end repositories, services, stores, and routes.
