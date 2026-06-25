# Review Money

> Canonical spec — describes what the **review-money** capability currently DOES. This capability is a thin routing layer and list view that surfaces Purchase Orders pending receipt creation; it is not a standalone domain module.

## Purpose

Present Purchase Orders that are ready for receipt creation to the requester or an authorized user. The "Review Money" route (`/receipts`) renders a list of Purchase Orders via `usePurchaseOrderStore` and allows the user to navigate to a PO detail page where they can initiate receipt (disbursement slip) creation. The view and its sub-routes share components with the Receipt module and use the PO store directly — there is no dedicated review-money entity, store, or API endpoint.

> NOTE: This capability is partially implemented. The list view renders PO data from `usePurchaseOrderStore` with static status-card counts, and routes to receipt creation and detail views that delegate actual business logic to the receipts and purchase-order modules. Some UI strings are hard-coded Lao and no i18n keys for the summary card labels exist in the locale files.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View (list) | `src/modules/presentation/Admin/views/review-money/views/ReviewMoneyView.vue` |
| Component (list table) | `src/modules/presentation/Admin/components/receipt/FormListTable.vue` |
| Component (create receipt) | `src/modules/presentation/Admin/components/receipt/FormCreate.vue` |
| Component (PO detail / initiate receipt) | `src/modules/presentation/Admin/components/receipt/FormDetails.vue` |
| Component (success page) | `src/modules/presentation/Admin/components/receipt/FormSucess.vue` |
| Store (PO — reused) | `src/modules/presentation/Admin/stores/purchase_requests/purchase-order.ts` |
| Store (Receipt — reused) | `src/modules/presentation/Admin/stores/receipt.store.ts` |
| Route | `src/modules/presentation/Admin/router/review-money.router.ts` |

API base path: none dedicated. Delegates to `GET /purchase-orders` (via `usePurchaseOrderStore`) and `POST /receipts` (via `useReceiptStore`).

## ADDED Requirements

### Requirement: Review-money route surfaces the PO list at `/receipts`

The primary route `/receipts` (`name: "receipt.index"`) SHALL render `ReviewMoneyView.vue`, which delegates entirely to `FormListTable.vue`. `FormListTable.vue` fetches all Purchase Orders via `purchaseOrderStore.fetchAll({ page: 1, limit: 1000 })` on mount and displays them in a table. The route is registered in `review-money.router.ts` with `requiredAuth: true` and no permission guard.

#### Scenario: Page loads

- **WHEN** a user navigates to `/receipts`
- **THEN** `ReviewMoneyView.vue` renders `FormListTable.vue`; on `onMounted` the component calls `fetchAllDepartments()` (limit 1000) and `purchaseOrderStore.fetchAll({ page: 1, limit: 1000 })`; the table binds to `purchaseOrderStore.orders`

### Requirement: Status summary cards from PO store

The system SHALL render three summary cards — pending, completed, and rejected — whose counts are derived from `purchaseOrderStore.statusSummary`. `pendingCount` is `statusSummary.find(s => s.status === "PENDING")?.amount || 0`; similarly for `COMPLETED` and `REJECTED`. Card labels and icons are hard-coded Lao strings ("ກຳລັງດຳເນີນການ", "ສຳເລັດ", "ປະຕິເສດ") not covered by i18n keys.

#### Scenario: Summary card counts populate

- **WHEN** `purchaseOrderStore.fetchAll()` completes and `statusSummary` is populated
- **THEN** `pendingCount`, `completedCount`, and `rejectedCount` computed properties update the card display values

### Requirement: Department and date-range filter

The system SHALL provide a department select (populated from `departmentStore.departments`) and a date-range picker in `FormListTable.vue`. Selecting a department sets `selectedDepartment`; clicking "ຄົ້ນຫາ" calls `handleSearch()` which calls `purchaseOrderStore.fetchAll({ page: 1, limit: 1000, search: selectedDepartment })`. Date range picker values (`dates.startDate`, `dates.endDate`) are bound but NOT passed to the API in the current implementation.

#### Scenario: Department filter applied

- **WHEN** the user selects a department from the dropdown and clicks the search button
- **THEN** `handleSearch()` passes `{ page: 1, limit: 1000, search: selectedDepartment }` to `purchaseOrderStore.fetchAll()`; if the value is `"all"` the `search` param is omitted

#### Scenario: Date range not passed to API

- **WHEN** the user sets `dates.startDate` and `dates.endDate`
- **THEN** those values are bound to the `DatePicker` component but are NOT included in the `fetchAll` params — the date filter has no effect on the current API call

### Requirement: Navigation to PO detail and receipt creation

The system SHALL navigate to the `review-money-details` route when the user clicks the detail button for a PO row. `FormDetails.vue` at `/review-money/details/:id` loads the PO by ID via `purchaseOrderStore.fetchById(Number(id))` and displays PO line items. A "ສ້າງໃບເບີກຈ່າຍ" (Create Disbursement Slip) button opens `SelectDocumentTypeModal.vue` to choose a document type, then navigates to `create-receipt` at `/receipt/create/receipt_id=:id/document_type=:docid`.

#### Scenario: User opens PO detail

- **WHEN** the user clicks the detail button in the list
- **THEN** `onDetail(record.id)` pushes `{ name: "review-money-details", params: { id } }`; `FormDetails.vue` calls `purchaseOrderStore.fetchById(Number(purchaseOrderId))` and populates `orderDetails`

#### Scenario: User initiates receipt creation

- **WHEN** the user clicks "ສ້າງໃບເບີກຈ່າຍ" in `FormDetails.vue`
- **THEN** `SelectDocumentTypeModal.vue` opens with the PO ID; after the user selects a document type the router navigates to `create-receipt` with `receipt_id` and `document_type` as route params

### Requirement: Receipt creation form at `FormCreate.vue`

The system SHALL render the receipt creation form at `/receipt/create/receipt_id=:id/document_type=:docid`. On mount it loads the PO via `purchaseOrderStore.fetchById(Number(purchaseOrderId))` and displays line items. The user selects a payment type (cash / transfer / cheque via `Radio` component). Clicking "ສ້າງໃບເບີກຈ່າຍ" calls `submitPaymentRequest()`.

#### Scenario: Submit receipt

- **WHEN** the user selects a payment type and clicks submit
- **THEN** `rStore.created({ purchase_order_id, remark, documentType_id, receipt_items })` is called; `receipt_items` are built from `orderDetails.getPurchaseOrderItem()` with `payment_type = selectType`, `payment_currency_id` from `item.getCurrency().id`, and `remark` from the remark input; on success the OTP modal or approval modal opens

### Requirement: Status display in list table

The system SHALL render a status tag per row in `FormListTable.vue` using the PO's `user_approval.document_status.name` via `getDocumentStatus(record)`. The status text is resolved through `getStatusText()` which maps `"PENDING"` → `"ກຳລັງດຳເນີນການ"`, `"COMPLETED"` → `"ສຳເລັດ"`, `"REJECTED"` → `"ປະຕິເສດ"` — all hard-coded Lao strings.

#### Scenario: Status tag renders for a pending PO

- **WHEN** a PO row has `user_approval.document_status.name === "PENDING"`
- **THEN** `UiTag` renders with `color: "warning"`, `icon: "ant-design:clock-circle-outlined"`, and `text: "ກຳລັງດຳເນີນການ"`

### Requirement: Document-chain drawers on FormCreate and FormDetails

Both `FormCreate.vue` and `FormDetails.vue` SHALL provide drawer links to view the linked PR and PO documents. `PropovalDrawer.vue` opens with the PR ID; `ApprovalDrawer.vue` opens with the PO ID; `VendorDrawer.vue` opens with `selected_vendor[0]` data of the clicked PO item.

#### Scenario: User views the linked PR from FormCreate

- **WHEN** the user clicks the PR document chip at the bottom of the create form
- **THEN** `showPropoval()` sets `selectedId = Number(orderDetails.getPurchaseRequest().id)` and `openPropoval = true`; the PR drawer opens at width 1185px showing PR details

### Requirement: No permission guard on review-money routes

All review-money routes (`/receipts`, `/review-money/details/:id`, `/review-money/create`, `/review-money/success`, `/receipt/create/receipt_id=:id/document_type=:docid`) MUST carry `requiredAuth: true` but have NO `permission` key in their `meta`. Any authenticated user can access these routes.

> NOTE: This is a known gap. Permission checks for receipt creation and review should be defined (suggested: `view-receipt`, `create-receipt`) once the backend permission model is established.

#### Scenario: Authenticated user accesses create route

- **WHEN** a user with a valid session navigates to `/receipt/create/receipt_id=5/document_type=2`
- **THEN** `authGuard` passes (token present), `permissionGuard` skips (no `permission` in meta), and `FormCreate.vue` renders
