# HAL-ERP — Database / Data Model Design

> **Scope of this document.** The HAL-ERP repository is a front-end Single Page Application. It does **not** contain SQL migrations, an ORM, or a schema file. The data model below is reverse-engineered from:
>
> 1. `src/modules/domain/entities/**/*.entity.ts` (private fields → table columns)
> 2. `src/modules/application/dtos/**/*.dto.ts` (request/response shapes)
> 3. `src/modules/infrastructure/**/*.repository.ts` (which endpoints exist and what params they take)
>
> Field types are TypeScript types as written in the entities; the real back-end column types (varchar lengths, indexes, constraints) live in the back-end project and are not visible from this repo.

## 1. Entity Map (high-level relationships)

```
┌────────────┐       ┌────────────┐       ┌────────────────┐
│  Company   │──┬───▶│ Department │──┬───▶│ DepartmentUser │
└────────────┘  │    └────────────┘  │    └────────────────┘
                │                     │
                │                     └───▶ DepartmentApprover
                │                     └───▶ DepartmentRole
                │
                ▼
        ┌──────────────┐                     ┌──────────────┐
        │ CompanyUser  │◀───── User ─────────│   Position   │
        └──────────────┘                     └──────────────┘
                │                                   │
                │                                   ▼
                ▼                            ┌──────────────┐
        ┌──────────────┐                     │     Role     │──▶ Permission
        │ DocumentType │                     └──────────────┘
        └──────────────┘
                │
                ▼
   ┌────────────────────┐     ┌───────────────────┐     ┌──────────┐     ┌───────────────┐
   │  PurchaseRequest   │────▶│   PurchaseOrder   │────▶│ Receipt  │────▶│  Disbursement │
   └────────────────────┘     └───────────────────┘     └──────────┘     └───────────────┘
            │  *                       │  *                  │  *
            ▼                          ▼                     ▼
   ┌────────────────────┐     ┌───────────────────┐    ┌──────────────┐
   │ PurchaseRequest    │     │ PurchaseOrder     │    │  ReceiptItem │
   │ Item               │     │ Item / ItemData / │    └──────────────┘
   └────────────────────┘     │ Vendor            │
                              └───────────────────┘

            ┌──────────────┐       ┌──────────────┐       ┌─────────────────┐
            │   Vendor     │──┬───▶│ VendorBank   │       │ VendorProduct   │◀── Product
            └──────────────┘  │    │ Account      │◀──────│  (price, ccy)   │
                              │    └──────────────┘       └─────────────────┘
                              └─── linked many-to-many to Product via VendorProduct

   ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
   │ ApprovalWorkflow     │──┬─▶│ ApprovalWorkflowStep │     │ BudgetApprovalRule   │
   └──────────────────────┘  │  └──────────────────────┘     └──────────────────────┘
                              │
                              ▼
                     ┌──────────────────┐       ┌────────────────────┐
                     │ UserApproval     │──┬───▶│ ApprovalStep       │
                     └──────────────────┘  │    │ (runtime record)   │
                                            ▼    └────────────────────┘
                                     attached to PR / PO / RC document

   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ BudgetAccount│────▶│  BudgetItem  │────▶│ BudgetItem   │
   └──────────────┘     └──────────────┘     │   Detail     │
                                              └──────────────┘
                                              ▲
                                       ┌──────┴───────┐
                                       │ IncreaseBudget│
                                       └──────────────┘

   Reference tables: Category, ProductType, Unit, Bank, Vat, Currency, ExchangeRate,
                     DocumentCategory, DocumentStatus, QuotaCompany
```

## 2. Core Tables (derived from entities)

### 2.1 `users`
Source: `domain/entities/user.entities.ts`, `auth.entity.ts`, DTO `auth.dto.ts → UserDTO`.

| Column           | Type           | Notes                                     |
| ---------------- | -------------- | ----------------------------------------- |
| id               | number (PK)    | numeric IDs in API, stringified in some entities |
| username         | string         |                                           |
| email            | string         | login identifier                          |
| tel              | string         |                                           |
| signature        | string         | path / URL to signature image             |
| department_name  | string         | denormalised on login response            |
| user_type        | string[]       | e.g. `["company_user"]`                   |
| created_at       | timestamp      |                                           |
| updated_at       | timestamp      |                                           |
| deleted_at       | timestamp NULL | soft-delete                                |

Joined to `roles[]`, `permissions[]`, `company`.

Endpoints: `/users`, `/users/login`, `/users/logout`, `/users/forgot-password`, `/users/reset-password`, `/users/change-password/{id}`.

### 2.2 `companies`
Source: `domain/entities/company.entity.ts`.

| Column   | Type         | Notes                              |
| -------- | ------------ | ---------------------------------- |
| id       | number (PK)  |                                    |
| name     | string       |                                    |
| logo     | string NULL  | stored path                        |
| logo_url | string NULL  | absolute URL returned by server    |
| tel      | string       |                                    |
| email    | string       |                                    |
| address  | string       |                                    |
| created_at / updated_at / deleted_at | | soft-delete                |

A user belongs to **one** company (`localStorage.userCompany`). Multiple companies are grouped under the **HAL Group** umbrella (routes under `hal-group.routes.ts`). This is the closest concept to "branch" in the codebase.

Endpoints: `/companies`, `/companies/{id}`, `/companies/{id}/restore`, `/companies/report/receipt`.

### 2.3 `departments`
Source: `domain/entities/departments/department.entity.ts`.

| Column              | Type                                           |
| ------------------- | ---------------------------------------------- |
| id                  | number (PK)                                    |
| name                | string                                         |
| code                | string                                         |
| department_head_id  | number NULL                                    |
| type                | enum `'in_the_office' \| 'outside_the_office'` |
| created_at / updated_at / deleted_at | timestamps                    |

Related tables (separate entities):
- `department_users` (`department-user.entity.ts`) — users assigned to a department.
- `department_approvers` (`department-approver.entity.ts`) — users who can approve for the department.
- `department_roles` (`department-role.entity.ts`) — roles assigned within a department.

Endpoints: `/department`, `/department/report`, `/department-users`, `/department-approvers`, `/roles/department`.

### 2.4 `positions`
Source: `position.entity.ts`. Columns: `id`, `name`, `created_at`, `updated_at`. Endpoint: `/positions`.

### 2.5 `roles`, `permissions`
| Table        | Key columns                                                     |
| ------------ | ---------------------------------------------------------------- |
| `roles`      | `id`, `name`, plus join to `permissions` (many-to-many)          |
| `permissions`| `id`, `name`                                                     |

Endpoints: `/roles`, `/roles/company`, `/roles/company/users`, `/roles/department`, `/permissions`.

## 3. Catalog Tables

### 3.1 `products`
Source: `product.entity.ts`. Endpoint: `/products`. Links to `categories`, `product-types`, `units`. Used by `vendor-products` and `purchase_request_item`.

### 3.2 `categories`, `product_types`, `units`
Simple reference tables: `id`, `name`, soft-delete timestamps. Endpoints: `/categories`, `/product-types`, `/units` (each with `POST /{id}/restore`).

### 3.3 `vat`, `banks`, `currencies`, `exchange_rates`
- `vat`: `id`, `rate` — endpoint `/vat`.
- `banks`: `id`, `name`, `code` — endpoint `/banks`.
- `currencies`: `id`, `code`, `name` — endpoint `/currencies`.
- `exchange_rates`: `id`, `from_currency_id`, `to_currency_id`, `rate`, effective dates — endpoint `/exchange-rates`.

### 3.4 `document_types`, `document_categories`, `document_statuses`
- `document_types` (`document-type.entities.ts`): `id`, `name`, `document_category_id`.
- `document_categories` (`document-category.entity.ts`): `id`, `name`.
- `document_statuses` (`document-status.entity.ts`): `id`, `name` (e.g. PENDING, APPROVED, REJECTED).

## 4. Procurement Tables

### 4.1 `purchase_requests`
Source: `domain/entities/purchase-requests/purchase-request.entity.ts`.

| Column                | Type                                                |
| --------------------- | --------------------------------------------------- |
| id                    | number (PK)                                         |
| pr_number             | string NULL — generated by back-end                 |
| document_type_id      | FK → document_types                                 |
| document_description  | string                                              |
| requested_date        | timestamp                                           |
| expired_date          | timestamp                                           |
| purposes              | string                                              |
| status                | string (default `PENDING`)                          |
| department_id         | FK → departments (carried via embedded `department` object) |
| requester_id          | FK → users                                          |
| position_id           | FK → positions                                      |
| company_id            | FK → companies                                      |
| total                 | decimal                                             |
| is_created_po         | bool — set after a PO is generated from this PR     |
| user_approval_id      | FK → user_approvals                                 |
| created_at / updated_at / deleted_at |                                              |

#### `purchase_request_items`
Source: `purchase-request-item.entity.ts` and DTO in `api-purchase-request.repository.ts`.

| Column            | Type            |
| ----------------- | --------------- |
| id                | number (PK)     |
| purchase_request_id | FK            |
| title             | string          |
| file_name         | string NULL     |
| quantity          | number          |
| unit_id           | FK → units      |
| price             | decimal         |
| total_price       | decimal         |
| rate              | decimal NULL    |
| total_in_lak      | decimal NULL    |
| currency_id       | FK → currencies |
| quota_company_id  | FK → quota_company NULL |
| remark            | string          |

Endpoints: `/purchase-requests`, `/purchase-requests/{id}`.

### 4.2 `purchase_orders`
Source: `purchase-order.entity.ts`.

| Column                | Type                                            |
| --------------------- | ----------------------------------------------- |
| id                    | number (PK)                                     |
| po_number             | string NULL                                     |
| purchase_request_id   | FK → purchase_requests                          |
| sub_total / vat / total / total_in_lak | decimals                       |
| is_created_rc         | bool                                            |
| budget_item_id        | FK → budget_items                               |
| purposes              | string                                          |
| document_id           | FK → documents (joined inline `document` block) |
| user_approval_id      | FK → user_approvals NULL                        |
| created_by / updated_by | usernames                                     |
| created_at / updated_at / deleted_at |                                  |

#### `purchase_order_items` (header items)
`purchase-order-item.entity.ts` — references a `purchase_request_item_id` plus vendor selection.

#### `purchase_order_item_data` (per-vendor line)
`purchase-order-Item-data.entity.ts` — denormalises chosen vendor pricing.

#### `purchase_order_vendors`
`purchase-order-vendor.entity.ts` — vendor candidates linked to a PO line.

Endpoints: `/purchase-orders`, `/purchase-orders/{id}`, `/purchase-orders/by-token?token=...`, `/purchase-orders/export-excel`.

### 4.3 `receipts`
Source: `domain/entities/receipts/receipt.entity.ts`.

| Column              | Type                                |
| ------------------- | ----------------------------------- |
| id                  | number (PK)                         |
| purchase_order_id   | FK → purchase_orders                |
| document_id         | FK → documents                      |
| document_type_id    | FK → document_types                 |
| remark              | string                              |
| created_at / updated_at / deleted_at |                      |

#### `receipt_items`
Source: `receipt-item.entity.ts`, DTO `receipt-item.dto.ts`.

| Column                    | Type                                |
| ------------------------- | ----------------------------------- |
| id                        | number (PK)                         |
| receipt_id                | FK                                  |
| purchase_order_item_id    | FK → purchase_order_items           |
| payment_currency_id       | FK → currencies                     |
| payment_type              | enum `'transfer' \| 'cash'`         |
| remark                    | string                              |

Endpoints: `/receipts`, `/receipts/{id}`, `/receipts/export/{id}`, `/receipts/export-excel`, `/receipts/print/{id}?print=about_receipt|all_document`, `/reports/receipts/money`.

> **Inbound mapping note.** Receipts are the closest the system has to an "inbound goods" concept: they record that a PO has been fulfilled and trigger the next approval/payment step.

## 5. Vendor Tables

### 5.1 `vendors`
Source: `vendors/vendor/vendors.entities.ts`.

| Column        | Type                                  |
| ------------- | ------------------------------------- |
| id            | number (PK, stringified in entity)    |
| name          | string                                |
| contact_info  | string                                |
| created_at / updated_at / deleted_at |                       |

Endpoint: `/vendors`.

### 5.2 `vendor_bank_accounts`
Source: `vendors/vendor_bank_accounts/vendors-bank-accounts.entities.ts`. Holds bank routing info per vendor. Endpoint: `/vendor_bank_accounts`.

### 5.3 `vendor_products`
Source: `vendor-products/vendor-product.entity.ts`.

| Column        | Type                            |
| ------------- | ------------------------------- |
| id            | number (PK)                     |
| vendor_id     | FK → vendors                    |
| product_id    | FK → products                   |
| price         | decimal (parsed via `parseFloat`)|
| currency_id   | FK → currencies                 |
| created_at / updated_at / deleted_at |                  |

Endpoints: `/vendor-products`, `/vendor-products/{id}`, `/vendor-products/{id}/restore`. Query params: `vendor_id`, `product_id`, `search`.

## 6. Budget Tables

| Table                  | Source entity (under `domain/entities/budget` or `budget-approval-rules`) | Purpose                                          |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| `budget_accounts`      | budget account entity                                                     | Top-level budget bucket per department/company   |
| `budget_items`         | budget item entity                                                        | Categories of spend under an account             |
| `budget_item_details`  | budget item detail entity                                                 | Monthly/period allocation under an item           |
| `increase_budgets` + `increase_budget_details` | increase budget entities                            | Top-up requests with their own approval flow      |
| `budget_approval_rules`| budget approval rule entity                                               | Maps amount-range → approval workflow             |

Endpoints: `/budget-accounts`, `/budget-items`, `/budget-item-details`, `/increase-budgets`, `/increase-budget-details`, `/budget-approval-rules`, `/budget-accounts/report-to-use-budget`.

## 7. Approval Workflow Tables

| Table                       | Source entity                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `approval_workflows`        | `approval-workflows.entity.ts`                                                               |
| `approval_workflow_steps`   | `approval-workflows-step.entity.ts` (`is_otp`, `requires_file_upload`, `step_number`)        |
| `user_approvals`            | runtime container per document                                                               |
| `user_approval_steps`       | step instance: `approver_id`, `status_id`, `remark`, `approved_at`, `is_otp`, `requires_file_upload` |

Endpoints: `/approval-workflows`, `/approval-workflow-steps`, `/user-approval`, `/approve-step/{id}`, `/approval-workflows/approve/{token}`.

## 8. Quota Table

`quota_company` (`domain/entities/quotas/`) — pre-purchased quotas a company has with a vendor. Joined onto purchase request items via `quota_company_id`. Endpoint: `/quota-company`.

## 9. Reporting Endpoints (not tables)

- `/reports/purchase-orders`
- `/reports/purchase-requests`
- `/reports/receipts/money`
- `/companies/report/receipt`
- `/department/report`
- `/budget-accounts/report-to-use-budget`

These return aggregated data; the underlying tables are those above.

## 10. Conventions Observed Across Entities

- Every persisted entity has `created_at`, `updated_at`, `deleted_at` — soft-deletes are universal.
- The back-end response envelope is `{ status_code, message, data, pagination }`. Listing endpoints attach pagination `{ page, limit, total, total_pages }`.
- Query parameters used by listing endpoints: `page`, `limit`, `search`, `sort_by`, `sortDirection`, `include_deleted` (often defaulting to `false`).
- IDs are returned as numbers but a handful of entities (`VendorsEntity`, `CompanyEntity`) coerce them to strings. New code should treat IDs as `number`.

## 11. What the Schema Does **Not** Contain

The codebase has **no** tables for:

- Warehouses, stock locations, inventory levels, lot/serial tracking.
- Inbound shipments, outbound shipments, packing lists.
- Freight rates, shipping carriers, distance/weight calculations.
- Customer / sales orders / quotations to customers.

If those domains are planned, they will require new entities, repositories, services and migrations on the back-end first.
