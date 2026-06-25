# Capability Index — HAL-ERP Specs

Reverse-engineered canonical specs for every feature in the codebase. Each links to `<capability>/spec.md`, which documents the current behavior across all Clean-Architecture layers (view → store → service → repository → entity → DTO → route). See `README.md` for how to read and change these.

## Identity & Access

| Capability | Spec | Summary |
| ---------- | ---- | ------- |
| Authentication & Session | [authentication](./authentication/spec.md) | Login, logout, forgot/reset password, session rehydration, route guard. **Gold-standard example.** |
| User | [user](./user/spec.md) | User CRUD, role/permission assignment, password reset/change. |
| Role | [role](./role/spec.md) | Role CRUD, role→permission grouping. |
| Permission | [permission](./permission/spec.md) | Read-only permission catalog, `<verb>-<resource>` convention, runtime resolution. |
| Company | [company](./company/spec.md) | Company CRUD with bootstrap user. |
| Company User | [company-user](./company-user/spec.md) | Users scoped to a company, with roles/permissions. |
| Departments | [departments](./departments/spec.md) | Department + approver + role + user sub-entities, signature upload. |
| Position | [position](./position/spec.md) | Job-position CRUD. |
| Director | [director](./director/spec.md) | ⚠️ Thin/mock view, no API. |
| HAL Group | [hal-group](./hal-group/spec.md) | ⚠️ Overview is real; create/edit are stubs. |

## Reference Data (CRUD)

| Capability | Spec | Summary |
| ---------- | ---- | ------- |
| Bank | [bank](./bank/spec.md) | Bank CRUD with logo upload + restore. |
| Category | [category](./category/spec.md) | Product category CRUD with restore. |
| Product Type | [product-type](./product-type/spec.md) | Product types linked to category. |
| Product | [product](./product/spec.md) | Products linked to product-type + unit. |
| Unit | [unit](./unit/spec.md) | Measurement units. |
| Currency | [currency](./currency/spec.md) | Currencies (batch create, no restore). |
| Exchange Rate | [exchange-rate](./exchange-rate/spec.md) | Exchange rates (batch create, active flag). |
| VAT | [vat](./vat/spec.md) | Singleton VAT rate (findOne + update only). |
| Document Type | [document-type](./document-type/spec.md) | Document types + category + status lookups. |

## Procurement Workflow

| Capability | Spec | Summary |
| ---------- | ---- | ------- |
| Purchase Requests | [purchase-requests](./purchase-requests/spec.md) | PR header + line items, submit, approval linkage, budget. |
| Purchase Orders | [purchase-orders](./purchase-orders/spec.md) | PO header + items + vendor, quotation, VAT/totals. |
| Receipts | [receipts](./receipts/spec.md) | Goods-received against a PO. |
| Disbursement Slip | [disbursement-slip](./disbursement-slip/spec.md) | Payment/disbursement step. |
| Review Money | [review-money](./review-money/spec.md) | Finance review of amounts. |
| Quotas | [quotas](./quotas/spec.md) | Budget/spending quotas. |

## Approval System

| Capability | Spec | Summary |
| ---------- | ---- | ------- |
| Approval Workflows | [approval-workflows](./approval-workflows/spec.md) | Ordered workflow definitions. |
| Approval Workflow Steps | [approval-workflow-steps](./approval-workflow-steps/spec.md) | Step definitions binding approver/role/department. |
| Approval Step | [approval-step](./approval-step/spec.md) | Per-document step state — approve/reject/OTP. |
| Approval Department | [approval-department](./approval-department/spec.md) | Department-scoped approval. |
| User Approvals | [user-approvals](./user-approvals/spec.md) | A user's pending approvals. |

## Budget

| Capability | Spec | Summary |
| ---------- | ---- | ------- |
| Budget | [budget](./budget/spec.md) | Account → item → item-detail hierarchy + increase-budget flow. |
| Budget Approval Rules | [budget-approval-rules](./budget-approval-rules/spec.md) | Amount-threshold approver gating. |

## Vendors

| Capability | Spec | Summary |
| ---------- | ---- | ------- |
| Vendors | [vendors](./vendors/spec.md) | Vendor CRUD + bank accounts + vendor products. |
| Vendor Products | [vendor-products](./vendor-products/spec.md) | Standalone vendor-product module. |

## Reporting & Cross-cutting

| Capability | Spec | Summary |
| ---------- | ---- | ------- |
| Reports | [reports](./reports/spec.md) | PR/PO/Receipt reports, status cards, `.xlsx` export. |
| Global Search | [global-search](./global-search/spec.md) | Shared search keyword auto-cleared per route. |

---

**Coverage:** 36 capabilities · 270 requirements · 564 scenarios. Specs flagged ⚠️ document features whose code is thin, mocked, or partially stubbed — noted so future work knows what is real vs placeholder.
