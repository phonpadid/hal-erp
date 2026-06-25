# Receipts

> Canonical spec — describes what the **receipts** capability currently DOES. Source of truth for receipt creation, receipt items, approval, export, print, and the receipt/purchase-order/purchase-request linkage.

## Purpose

Record the physical receipt of goods against an approved Purchase Order. A Receipt groups one or more `ReceiptItem` records that each map a PO line item (`purchase_order_item_id`) to a payment currency and payment type (cash / transfer / cheque). The receipt enters a multi-step approval workflow immediately on creation; approval steps are driven by the shared `user_approval` / `approve-step` infrastructure, not a receipt-specific endpoint.

## Implementation Map

| Layer | File |
| ----- | ---- |
| Entity (Receipt) | `src/modules/domain/entities/receipts/receipt.entity.ts` |
| Entity (ReceiptItem) | `src/modules/domain/entities/receipts/receipt-item.entity.ts` |
| Entity (PurchaseRequestItem — linked) | `src/modules/domain/entities/receipts/purchase-request/purchase-request-item.entity.ts` |
| Repository interface | `src/modules/domain/repository/receipt.repository.ts` |
| DTO | `src/modules/application/dtos/receipt.dto.ts` (also `receipt-item.dto.ts`) |
| Service interface | `src/modules/application/ports/input/receipt.service.ts` |
| Service impl | `src/modules/application/services/receipt.service.ts` |
| Use cases | `src/modules/application/useCases/receipts/` (create, update, delete, get-all, get-one, approval, approvalhal, report-menu) |
| Repository impl | `src/modules/infrastructure/api-receipt.repository.ts` |
| Store | `src/modules/presentation/Admin/stores/receipt.store.ts` |
| View (list) | `src/modules/presentation/Admin/views/review-money/views/ReviewMoneyView.vue` |
| View (create) | `src/modules/presentation/Admin/components/receipt/FormCreate.vue` |
| View (details) | `src/modules/presentation/Admin/components/receipt/FormDetails.vue` |
| View (success) | `src/modules/presentation/Admin/components/receipt/FormSucess.vue` |
| Component (list table) | `src/modules/presentation/Admin/components/receipt/FormListTable.vue` |
| Route | `src/modules/presentation/Admin/router/review-money.router.ts` |

API base path: `/receipts`. Endpoints: `GET /receipts`, `GET /receipts/:id`, `POST /receipts`, `PUT /receipts/:id`, `DELETE /receipts/:id`, `POST /approve-step/:stepId`, `GET /receipts/export/:id`, `GET /receipts/export-excel`, `GET /receipts/print/:id`, `GET /count?type=:type`.

## ADDED Requirements

### Requirement: Receipt creation from an approved Purchase Order

The system SHALL create a Receipt by posting `{ purchase_order_id, remark, document: { description, documentTypeId }, receipt_items[] }` to `POST /receipts`. Each element of `receipt_items` MUST supply `purchase_order_item_id`, `payment_currency_id`, `payment_type` (one of `cash`, `transfer`, or `cheque`), and `remark`. The user MUST select a payment type before submission; missing payment type blocks the submit handler.

#### Scenario: User submits a valid receipt

- **WHEN** the user selects a payment type and clicks submit on `FormCreate.vue`
- **THEN** the store calls `serice.create(payload)`, the API creates the receipt record with all receipt items, and the OTP modal opens if the first approval step has `is_otp === true`; otherwise the OTP/approval modal opens directly

#### Scenario: Payment type not selected

- **WHEN** the user clicks submit without choosing cash, transfer, or cheque
- **THEN** `submitPaymentRequest` calls `error("ກະລຸນາເລືອກປະເພດການຈ່າຍເງິນ")` and no API request is made

### Requirement: Receipt entity and item structure

The `ReceiptEntity` SHALL carry `purchase_order_id`, `documentType_id`, `remark`, a nullable array of `ReceiptItemEntity[]`, and nullable `document_type`. The `ReceiptItemEntity` SHALL carry `purchase_order_item_id`, `payment_currency_id`, `payment_type`, and `remark`, with optional references to the nested `PurchaseOrderItemEntity` and `CurrencyEntity`. Both entities support soft-delete via `deleted_at` / `isDeleted()`.

#### Scenario: Entity construction from API response

- **WHEN** `toDomainModel()` is called in the repository with a raw API object
- **THEN** a `ReceiptEntity` is built with `id`, `purchase_order_id`, `document_id` mapped to `documentType_id`, `remark`, and a mapped `ReceiptItemEntity[]` array; `created_at` and `updated_at` are formatted with `formatDate()`

### Requirement: Paginated receipt list with multi-filter

The system SHALL fetch receipts via `GET /receipts` with query parameters `page`, `limit`, `column`, `company_id`, `include_deleted`, and optionally `order_date`, `department_id`, `type`, `status_user_id`, and `search`. The response MUST be parsed into `{ data, status[], total, page, limit, totalPages }`. The store SHALL expose `status` as an array of `{ id, amount, status }` objects for the three summary cards (PENDING / APPROVED / REJECTED).

#### Scenario: Finance DPM list view loads

- **WHEN** `ApprovalByFinanceDepartment.vue` mounts
- **THEN** it fetches document statuses first, resolves the PENDING status ID, sets it as the default `filterStatusUserId`, then calls `rStore.fetchAll()`, and populates the table and summary cards from `rStore.receipts` and `rStore.status`

#### Scenario: Filtering by department and date

- **WHEN** the user changes `filterDepartment`, `filterType`, `filterDate`, or `filterStatusUserId`
- **THEN** a watcher calls `loadFilteredReceipts(true)` which resets page to 1 and calls `rStore.fetchAll()` with the updated params, then calls `syncStateToUrl()` to write the filter state into the URL query string

### Requirement: Current-approver resolution from `user_approval`

The system SHALL determine whether the logged-in user is the current pending approver by comparing `userData.username` from `localStorage` to `receipt.user_last_approval` (backend-provided next-approver field), falling back to scanning `approval_step` entries whose `status_id === 1` and whose `doc_approver[].user.username` matches, with an additional department match where `doc_approver.department` is non-null.

#### Scenario: User is the current approver

- **WHEN** `computeCurrentApprovalStep()` finds a pending step (`status_id === 1`) whose `doc_approver` includes the logged-in user (username match and department match if applicable)
- **THEN** `previewCanApprove` is set to `true` and the approve/reject buttons appear in the quick-preview modal

#### Scenario: Steps requiring file upload bypass quick preview

- **WHEN** the current pending step has `requires_file_upload === true`
- **THEN** the quick-preview modal closes and the user is navigated to the full detail page `approval-by-finance-department-detail.index` so they can upload the transfer slip

### Requirement: Approval step submission

The system SHALL submit an approval decision to `POST /approve-step/:stepId` with payload `{ type: "r", statusId: 2|3, is_otp, otp?, approval_id?, account_code?, files?, remark?, rate? }`. Fields with `null`, `undefined`, or empty-string values are stripped before sending. The `type` field MUST be `"r"` for receipts. `statusId: 2` means Approved; `statusId: 3` means Rejected.

#### Scenario: Accounting-role user approves with account code

- **WHEN** the logged-in user has an accounting role (`ACCOUNT_ADMIN` or `ACCOUNT_USER`) and the receipt has no `account_code` yet
- **THEN** `ApvLayout.vue` validates that `account_code` is non-empty before calling the approve flow; on submission `account_code` is included in the payload

#### Scenario: OTP step approval

- **WHEN** `is_otp === true` on the pending step
- **THEN** `requestOtp()` calls `approvalStepStore.sendOtp(stepId)`, the OTP modal opens, and the actual approval API call is made only after the user enters the valid OTP

### Requirement: File upload for transfer slip

The system SHALL allow uploading transfer-slip image files when the current pending step has `requires_file_upload === true` and the logged-in user is the current approver. Files are uploaded via `uploadFile(FormData)` and the returned `fileName` is appended to `formState.files`. Previously uploaded attachments from `receipt.document_attachment[]` are displayed as read-only images.

#### Scenario: User uploads a transfer slip

- **WHEN** the user clicks the dashed upload box and selects image files
- **THEN** each file is uploaded via `uploadFile()`, a blob preview URL is added to `uploadedImages`, and `{ file_name }` is pushed to `formState.files`; the approve button is blocked unless at least one file is present when `is_upload === true`

### Requirement: Finance-department exchange-rate editor

The system SHALL display an exchange-rate editor on the receipt detail page exclusively for Finance-role users (`FINANCE_ADMIN` or `FINANCE_USER`) who are the current pending approver AND whose step is the lowest-numbered pending step. The editor shows all active exchange rates whose target currency code is `LAK`.

#### Scenario: Finance user edits an exchange rate

- **WHEN** `showFinanceRate` is `true` and the user clicks the edit icon on a rate row
- **THEN** an inline `InputNumber` appears; on save the store calls `erStore.updated()` with `PUT /exchange-rates/:id`, a success notification is shown, and the rate list refreshes

### Requirement: Receipt print and Excel export

The system SHALL support two print modes triggered via `GET /receipts/print/:id?print=about_receipt|all_document`: `"about_receipt"` prints the receipt slip only; `"all_document"` prints PR + PO + Receipt together. A per-receipt Excel export is available at `GET /receipts/export/:id`; a bulk export across a date range is available at `GET /receipts/export-excel?startDate=&endDate=` and downloads as a `.xlsx` blob.

#### Scenario: User selects print mode

- **WHEN** the user opens the print modal and selects a mode then clicks confirm
- **THEN** `rStore.printReceipt(id, type)` fetches data from the API, sets `printData` and `printMode` in the store, waits for `nextTick` and all images to load, then calls `window.print()`; the `<div class="print-only">` block renders the `Print.vue` component while the main layout is hidden via `@media print`

### Requirement: Report-menu count

The system SHALL expose a count of receipts by type via `GET /count?type=:type`. The store action `reportMenu(type)` stores the result as `counts.value[type] = result.amount`.

#### Scenario: Count fetch on mount

- **WHEN** a component calls `rStore.reportMenu(type)`
- **THEN** the store fetches the count and caches it under `counts[type]` for use in summary cards

### Requirement: Soft delete

The system SHALL support soft-deleting a receipt via `DELETE /receipts/:id`. The `ReceiptEntity.isDeleted()` returns `true` when `deleted_at` is non-null. The `findAll` call accepts `include_deleted: true` to include soft-deleted records.

#### Scenario: User deletes a receipt

- **WHEN** `rStore.deleted(id)` is called
- **THEN** `DELETE /receipts/:id` is sent and the store returns `true` on success; the list view must refresh manually — the store does not auto-remove the record from `receipts`
