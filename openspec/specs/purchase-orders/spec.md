# Purchase Orders

> Canonical spec — describes what the **purchase-orders** capability currently DOES. Source of truth for PO creation from an approved PR, vendor/quotation selection, VAT calculation, approval workflow integration, receipt linkage flag, and export.

## Purpose

Convert an approved Purchase Request into a Purchase Order by assigning a vendor, optional bank account, and quotation file to each PR line item, submit the PO through its own configurable multi-step approval workflow (including OTP steps), display totals with optional VAT (7%), track approval status, and expose the receipt-creation flag once the PO is fully approved.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View (list shell) | `src/modules/presentation/Admin/views/purchase_orders/PurchaseOrdersList.vue` |
| List component | `src/modules/presentation/Admin/components/purchase/purchase_orders/PurchaseOrdersList.vue` |
| Create / edit form | `src/modules/presentation/Admin/components/purchase/purchase_orders/PurchaseOrdersDetails.vue` |
| Detail (read-only) | `src/modules/presentation/Admin/components/purchase/purchase_orders/DetailsOrderList.vue` |
| PO pending sub-view | `src/modules/presentation/Admin/components/purchase/purchase_orders/PurchaseOrderPending.vue` |
| Drawer (PR summary) | `src/modules/presentation/Admin/components/drawer-pr-and-po/DrawerPr.vue` |
| Doc type select (PO entry) | `src/modules/presentation/Admin/components/purchase/purchase_orders/DocTypeSelect.vue` |
| Vendor modal | `src/modules/presentation/Admin/components/purchase/purchase_orders/ModalVendorCreate.vue` |
| Column definitions | `src/modules/presentation/Admin/views/purchase_orders/column.ts` |
| OTP modal (reused from PR) | `src/modules/presentation/Admin/components/purchase-requests/modal/OtpModal.vue` |
| Store | `src/modules/presentation/Admin/stores/purchase_requests/purchase-order.ts` |
| Service | `src/modules/application/services/purchase-order.service.ts` |
| Service interface | `src/modules/application/ports/input/purchase-order.service.ts` |
| Repository interface | `src/modules/domain/repository/purchase-order/purchase-order.repository.ts` |
| Repository (impl) | `src/modules/infrastructure/purchase-order/api-purchase-order.repository.ts` |
| Entity | `src/modules/domain/entities/purchase-order/purchase-order.entity.ts` |
| Line-item entity (creation) | `src/modules/domain/entities/purchase-order/purchase-order-item.entity.ts` |
| Line-item entity (display) | `src/modules/domain/entities/purchase-order/purchase-order-Item-data.entity.ts` |
| Vendor entity | `src/modules/domain/entities/purchase-order/purchase-order-vendor.entity.ts` |
| DTO | `src/modules/application/dtos/purchase-order/purchase-order.dto.ts` |
| Interface types | `src/modules/interfaces/purchase-requests/purchase-orders.interface.ts` |
| Route file | `src/modules/presentation/Admin/router/purchase/purchse_order/purchase-orders.router.ts` |

Sub-entities:
- `PurchaseOrderItemEntity` — creation entity: `purchaseRequestItemId`, `price`, `isVat`, `selectedVendor` (a `PurchaseOrderVendorEntity`). Validates `price >= 0` and `purchaseRequestItemId > 0`.
- `PurchaseOrderItemDataEntity` — display entity returned by GET: `id`, `purchase_order_id`, `purchase_request_item_id`, `budget_item_id`, `title`, `quantity`, `price`, `total`, `vat_total`, `total_with_vat`, `is_vat`, `unit`, `selected_vendor[]` (nested `SelectedVendorEntity`).
- `PurchaseOrderVendorEntity` — creation vendor: `vendorId`, `vendorBankAccountId`, `filename`, `reason`. Validates `vendorId > 0`.
- `SelectedVendorEntity` (internal to `PurchaseOrderItemDataEntity`) — display vendor with `vendor`, `vendor_bank_account`, `filename_url`, `selected` flag.

API base path: `/purchase-orders`. Endpoints: `POST /purchase-orders`, `GET /purchase-orders`, `GET /purchase-orders/:id`, `GET /purchase-orders/by-token`, `PUT /purchase-orders/:id`, `DELETE /purchase-orders/:id`, `GET /purchase-orders/export-excel`.

> NOTE: The PO store file is located at `stores/purchase_requests/purchase-order.ts` — inside the PR stores folder. This is a known misplacement. Do NOT move it.

> NOTE: The router folder is named `purchse_order` (typo — missing `a`). Do NOT rename in unrelated PRs.

## ADDED Requirements

### Requirement: PO list with status summary and filtering

The system SHALL display all Purchase Orders in a paginated table with status summary counts for PENDING, APPROVED, and REJECTED. Users MUST be able to filter by document type and date range. The list MUST render `po_number`, requester name, `created_at`, status (as a colored tag), and an action column.

#### Scenario: Initial list load

- **WHEN** `PurchaseOrdersList` mounts
- **THEN** `usePurchaseOrderStore.fetchAll({ page: 1, limit: 10 })` is called; `orders` populates the table; `statusSummary` drives the three count cards (pending, approved, rejected); table pagination reflects `store.pagination`

#### Scenario: Status color rendering

- **WHEN** a PO row's `document_status` string is `"PENDING"`, `"APPROVED"`, or `"REJECTED"`
- **THEN** `UiTag` is rendered with color `"warning"`, `"success"`, or `"error"` respectively

#### Scenario: Permission gate

- **WHEN** the current user lacks `read-purchase-orders` (note: plural, inconsistent naming)
- **THEN** the inline permission check `hasPermission("read-purchase-orders")` returns `false` and view-gated UI elements are hidden

### Requirement: PO creation from an approved PR

Creating a PO MUST begin at `/doc-type-select` with `?purchase_request_id=<id>` in the query. The user selects a document type, then is routed to `PurchaseOrdersDetails` which loads the PR's items and requires the user to assign a vendor to every item before submission. All items MUST have a vendor assigned (`isAllItemsHaveVendor` must be `true`) before the submit button is active.

#### Scenario: Entry from PR detail

- **WHEN** the user clicks "Create PO" on an approved PR detail page
- **THEN** the router navigates to `{ name: "doc-type-select", query: { purchase_request_id: <prId> } }`; the DocTypeSelect component loads available document types for the company

#### Scenario: PR items loaded in PO form

- **WHEN** `PurchaseOrdersDetails` mounts with `purchase_request_id` in the route query
- **THEN** `usePurchaseRequestsStore.fetchById(purchase_request_id)` is called; `purchaseItems` is populated from `requestDetail.getItems()`; each item is displayed in a selectable table row for vendor assignment

#### Scenario: Vendor assignment via modal

- **WHEN** the user selects one or more item rows and clicks the assign-vendor button, then completes `ModalVendorCreate` with `vendorId`, `bankId`, `accountNumber`, `filename`, `reason`, and optional `is_vat`
- **THEN** `handleVendorModalSubmitted` stores the vendor data in `itemVendors[itemId]` for every selected row; the row shows the vendor name inline; `selectedRowKeys` is cleared

#### Scenario: Submit guard — incomplete vendor assignment

- **WHEN** the user tries to submit but any item in `purchaseItems` has no entry in `itemVendors`
- **THEN** `isAllItemsHaveVendor` computed is `false` and the submit is blocked or throws `"ກະລຸນາເລືອກຮ້ານຄ້າສຳລັບລາຍການ \<title\>"`

#### Scenario: PO API payload construction

- **WHEN** `createPurchaseOrderPayload()` is called
- **THEN** the payload is `{ purchase_request_id, purposes, document: { description, documentTypeId }, items: [{ purchase_request_item_id, price, is_vat, selected_vendor: [{ vendor_id, vendor_bank_account_id, filename, reason, selected: true }] }] }`; `documentTypeId` is taken from `route.query.document_type_id`, falling back to `19` if absent or invalid

#### Scenario: PO created and OTP triggered

- **WHEN** `purchaseOrderStore.create(payload)` succeeds and returns a PO entity with `user_approval.approval_step[0].is_otp === true`
- **THEN** `approvalStepStore.sendOtp(stepId)` is called; on success `showOtpModal` is set to `true`; after valid 6-digit OTP confirmation `submitApproval(documentId, { type: "po", statusId: 2, remark, approvalStepId, otp, is_otp: true, approval_id })` is called; on success `currentStep` advances to 2

### Requirement: VAT calculation on PO items

Each PO item carries a boolean `is_vat` flag. The system SHALL apply 7% VAT when `is_vat` is `true`. `PurchaseOrderItemEntity.getPriceWithVAT()` returns `price * 1.07` when `isVat === true`, otherwise returns `price`. `PurchaseOrderEntity.getTotalWithVAT()` aggregates across all items using their VAT-adjusted prices.

#### Scenario: VAT applied to item price

- **WHEN** `PurchaseOrderItemEntity.getPriceWithVAT()` is called on an item with `isVat === true` and `price = 1000`
- **THEN** the returned value is `1070`

#### Scenario: VAT not applied when flag is false

- **WHEN** `getPriceWithVAT()` is called on an item with `isVat === false` and `price = 1000`
- **THEN** the returned value is `1000`

#### Scenario: Entity totals from `PurchaseOrderItemDataEntity`

- **WHEN** a PO is fetched from the API and `purchase_order_item` contains items with `total_with_vat` populated
- **THEN** `getTotalWithVAT()` on the entity sums `item.getTotalWithVat()` across all `purchase_order_item` entries; if that array is empty it falls back to summing `getItems()` using `getPriceWithVAT()` per item

### Requirement: PO data model — header, totals, and linked documents

`PurchaseOrderEntity` SHALL carry `po_number` (system-assigned, nullable until backend assigns it), `sub_total`, `vat`, `total`, `total_in_lak` (LAK equivalent), `purchaseRequestId`, `purposes`, `is_created_rc` (receipt created flag), `document_status`, and `user_last_approval`. The entity MUST expose bank and vendor helpers delegated to the first `PurchaseOrderItemDataEntity`.

#### Scenario: Entity created from API response

- **WHEN** `PurchaseOrderEntity.create(data)` is called from `toDomainModel()`
- **THEN** `po_number` is `data.po_number || null`; `sub_total`/`vat`/`total` are numeric (default 0); `total_in_lak` is `data.total_in_lak ?? data.total ?? 0`; `is_created_rc` is `Boolean(data.is_created_rc)`; `purchaseRequest` stores the raw PR nested object; `user_approval` stores the full approval object; `purchase_order_item` is an array of `PurchaseOrderItemDataEntity` constructed with the parent PR's `purchase_request_item` array for title resolution

#### Scenario: Bank and account helpers

- **WHEN** `entity.getBankName()`, `entity.getAccountName()`, `entity.getAccountNumber()`, or `entity.getCurrencyCode()` is called
- **THEN** each delegates to `purchase_order_item[0]` (first display item); if that array is empty `getBankName()` returns `"N/A"` and `getCurrencyCode()` returns `"LAK"`

#### Scenario: Receipt creation flag

- **WHEN** `entity.getIsCreatedRc()` is called
- **THEN** it returns `true` if `is_created_rc` was `true` in the API response; downstream views use this flag to determine whether a Receipt has already been created for this PO

### Requirement: Vendor and quotation selection per item

Each PO line item requires exactly one selected vendor. The vendor data model includes `vendor_id`, optional `vendor_bank_account_id`, an optional quotation `filename` (uploaded file reference), and an optional `reason` text. The `selected` flag in the persisted `selected_vendor` array identifies the chosen vendor.

#### Scenario: Vendor bank account loading

- **WHEN** the user opens the vendor-reason modal for an item with an existing `vendor_id`
- **THEN** `useVendorBankAccountStore.fetchBankAccounts(vendorId)` is called; `vendorBankOptions` lists accounts filtered to the selected vendor, formatted as `"<bank.name> - <account_number>"`

#### Scenario: Quotation file stored on vendor entry

- **WHEN** `ModalVendorCreate` emits a submitted payload with `fileNames[0]`
- **THEN** `itemVendors[itemId].filename` is set to the first file name; this is later serialized as `selected_vendor[0].filename` in the PO creation payload

#### Scenario: Selected vendor resolution on display entity

- **WHEN** `PurchaseOrderItemDataEntity.getSelectedVendor()` is called
- **THEN** it returns the first `SelectedVendorEntity` with `selected === true`; if none is flagged it returns `selected_vendor[0]`; if the array is empty it returns `null`

### Requirement: PO approval workflow display and inline approval

`DetailsOrderList` (at `/purchase-orders/details/:id`) SHALL display the PO header, linked PR items, approval steps, and document status. `PurchaseOrdersDetails` (at `/purchase-orders/detail/:id`) is the creation/edit form that also handles first-step approval. Approval step buttons display Approve and Reject only to the authorized user.

#### Scenario: Approval step authorization

- **WHEN** a PO detail view loads and the pending step's `doc_approver` is checked
- **THEN** the same matching logic as PR applies: `doc_approver[].user.username` and `doc_approver[].department.name` are compared against `localStorage.userData`; only a match exposes the Approve/Reject buttons

#### Scenario: OTP approval on PO step

- **WHEN** the authorized user clicks Approve on a PO step with `is_otp === true`
- **THEN** `approvalStepStore.sendOtp(stepId)` is called; `OtpModal` opens (the same `OtpModal` component reused from purchase-requests); confirming posts `submitApproval(documentId, { type: "po", statusId: 2, ... })`

#### Scenario: Approval status derivation on PO

- **WHEN** any PO `approval_step` has `status_id === 3`
- **THEN** the document is displayed as rejected; when no step has `status_id === 1` and all are `status_id === 2` the document is fully approved; otherwise the pending department name is shown

### Requirement: PO update

The repository MUST support `PUT /purchase-orders/:id`. The store `update(id, data)` first fetches the existing entity via `findById`, then constructs a new entity via `PurchaseOrderEntity.create({ ...data })` and calls `repository.update(id, entity)`. The `toApiModel` serializer maps items using `PurchaseOrderItemEntity` with `PurchaseOrderVendorEntity`.

#### Scenario: Update API call

- **WHEN** `usePurchaseOrderStore.update(id, updateDTO)` is invoked
- **THEN** the existing entity is fetched, a new entity is created from `data`, `toApiModel()` serializes items with their `selected_vendor` arrays (each with `selected: true` and a hard-coded current user `"phonpadid"`), and `PUT /purchase-orders/:id` is called with the serialized payload

### Requirement: PO soft delete

The repository MUST support `DELETE /purchase-orders/:id`. On success the store sets the result to `true` and removes or re-fetches the list.

#### Scenario: Delete call

- **WHEN** `usePurchaseOrderStore.remove(id)` is called
- **THEN** `repository.delete(id)` calls `DELETE /purchase-orders/:id`; on success it returns `true`; on error the store records the error message and returns `false`

### Requirement: PO list pagination and Excel export

The store SHALL maintain `pagination` updated on every `fetchAll` call, with `page`, `limit`, `total`, and `totalPages` populated from the API's `pagination` object. Excel export MUST download `purchase-orders-<today>.xlsx`.

#### Scenario: Pagination update

- **WHEN** `fetchAll` resolves
- **THEN** `store.pagination` is updated with `result.page ?? 1`, `result.limit ?? 10`, `result.total ?? 0`, `result.totalPages ?? 0`

#### Scenario: Excel export

- **WHEN** `usePurchaseOrderStore.exportExcel(startDate, endDate)` is called
- **THEN** the repository calls `GET /purchase-orders/export-excel` with optional `startDate`/`endDate` params; the Blob is downloaded as `purchase-orders-<ISO date>.xlsx` via a temporary `<a>` element and the object URL is revoked

### Requirement: PO route structure and auth

Four PO routes are registered with `requiredAuth: true` and no `permission` meta key. No inline permission check for write operations exists at the time of writing; only `read-purchase-orders` is checked in the list component.

#### Scenario: Route map

- **WHEN** the app initializes
- **THEN** the following routes are available: `/purchase-orders` → `purchaseOrdersList`, `/doc-type-select` → `doc-type-select`, `/purchase-orders/detail/:id` → `purchaseOrdersDetail` (creation/edit form), `/purchase-orders/details/:id` → `purchaseOrdersDetails` (read-only detail); all require a valid session

#### Scenario: Token-based fetch

- **WHEN** `usePurchaseOrderStore.fetchByToken(token)` is called
- **THEN** the repository calls `GET /purchase-orders/by-token?token=<token>`; on 404 it returns `null`; on other errors it throws a normalized `Error`
