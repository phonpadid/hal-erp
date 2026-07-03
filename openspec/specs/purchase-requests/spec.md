# Purchase Requests

> Canonical spec — describes what the **purchase-requests** capability currently DOES. Source of truth for PR creation, line-item management, approval workflow integration, status display, and conversion to a Purchase Order.

## Purpose

Allow any authenticated user to raise a Purchase Request (PR), attach line items (with optional file or PDF attachments and quota/vendor pre-selections), submit the document through a configurable multi-step approval workflow (including OTP steps), track approval status in real time, and — once all approval steps are complete — trigger creation of a Purchase Order.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View (list + create flow) | `src/modules/presentation/Admin/views/purchase-requests/PurchaseRequestView.vue` |
| View (approval list) | `src/modules/presentation/Admin/components/purchase-requests/approval-purchase-requests/ApprovalPuchaseRq.vue` |
| View (approval detail) | `src/modules/presentation/Admin/components/purchase-requests/approval-purchase-requests/ApprovalPuchaseRqDetail.vue` |
| View (read-only detail) | `src/modules/presentation/Admin/components/purchase-requests/PurchaseRequestDetail.vue` |
| View (edit) | `src/modules/presentation/Admin/components/purchase-requests/UpdatePurchaseRequest.vue` |
| Create wizard (shell) | `src/modules/presentation/Admin/components/purchase-requests/CreatePurchaseRq.vue` |
| Create wizard step 0 | `src/modules/presentation/Admin/components/purchase-requests/DocTypeSelect.vue` |
| Create wizard step 1 | `src/modules/presentation/Admin/components/purchase-requests/PurchaseForm.vue` |
| Form state | `src/modules/presentation/Admin/components/purchase-requests/formstate.ts` |
| Form validation | `src/modules/presentation/Admin/views/purchase-requests/validation/create-purchase-request.ts` |
| Column definitions | `src/modules/presentation/Admin/views/purchase-requests/column.ts` |
| OTP modal | `src/modules/presentation/Admin/components/purchase-requests/modal/OtpModal.vue` |
| Upload modal | `src/modules/presentation/Admin/components/purchase-requests/modal/UploadModal.vue` |
| Success modal | `src/modules/presentation/Admin/components/purchase-requests/modal/SuccessModal.vue` |
| Secondary list view (approval role) | `src/modules/presentation/Admin/views/purchase_requests/PurchaseRequestsList.vue` (shell) |
| Secondary list component | `src/modules/presentation/Admin/components/purchase/purchase_requests/PurchaseRequestsList.vue` |
| Secondary detail | `src/modules/presentation/Admin/components/purchase/purchase_requests/PurchaseRequestDetails.vue` |
| Store | `src/modules/presentation/Admin/stores/purchase_requests/purchase-requests.store.ts` |
| Service | `src/modules/application/services/purchase-request.service.ts` |
| Service interface | `src/modules/application/ports/input/purchase-request.service.ts` |
| Repository interface | `src/modules/domain/repository/purchase-requests/purchase-request.repository.ts` |
| Repository (impl) | `src/modules/infrastructure/purchase_requests/api-purchase-request.repository.ts` |
| Entity | `src/modules/domain/entities/purchase-requests/purchase-request.entity.ts` |
| Line-item entity | `src/modules/domain/entities/purchase-requests/purchase-request-item.entity.ts` |
| DTO | `src/modules/application/dtos/purchase-requests/purchase-request.dto.ts` |
| Interface types | `src/modules/interfaces/purchase-requests/purchase-request.interface.ts` |
| Route file (kebab, primary) | `src/modules/presentation/Admin/router/purchase-requests/purchase-reques.router.ts` |
| Route file (snake, secondary) | `src/modules/presentation/Admin/router/purchase/purchase_request/purchase-requests.router.ts` |

Sub-entities: `PurchaseRequestItemEntity` (title, file_name, file_name_url, quantity, unit_id, price, total_price, remark, quota_company_id).

API base path: `/purchase-requests`. Endpoints: `POST /purchase-requests`, `GET /purchase-requests`, `GET /purchase-requests/:id`, `GET /purchase-requests/by-token`, `PUT /purchase-requests/:id`, `DELETE /purchase-requests/:id`, `GET /purchase-requests/export-excel`.

> NOTE: The router file name `purchase-reques.router.ts` contains a known typo (missing `t`). Do NOT rename it in unrelated PRs.

> NOTE: Two parallel folder sets exist. `views/purchase-requests/` and `components/purchase-requests/` (kebab) serve the primary create/approval flow. `views/purchase_requests/` and `components/purchase/purchase_requests/` (snake) serve a secondary read-only list used from the PO side. Both use `usePurchaseRequestsStore`. Do NOT merge or rename these folders.

## ADDED Requirements

### Requirement: PR list with status summary and filtering

The system SHALL display all Purchase Requests in a paginated table and MUST show a summary card row with counts for PENDING, APPROVED, and REJECTED statuses. Users MUST be able to filter by document type and by document status before fetching. The edit action MUST be disabled for documents whose status is APPROVED, REJECTED, or CANCELED.

#### Scenario: Initial list load

- **WHEN** `PurchaseRequestView` mounts
- **THEN** the store calls `fetchAll({ page: 1, limit: 10 })`, the table renders rows from `purchaseRequestStore.requests`, the three status count cards reflect `statusSummary` from the API response, and pagination mirrors `purchaseRequestStore.pagination`

#### Scenario: Filter by document type and status

- **WHEN** the user selects a document type and/or a status from the filter dropdowns and clicks Search
- **THEN** `fetchAll` is called with `document_type_id` and/or `status_id` as extra params, and `currentPage` is reset to 1

#### Scenario: Edit button disabled for terminal statuses

- **WHEN** a PR row has `status` equal to `"APPROVED"`, `"REJECTED"`, or `"CANCELED"` (case-insensitive)
- **THEN** the edit button is rendered in a disabled/gray state and clicking it does nothing; the detail (view) button remains active

#### Scenario: Permission-gated actions

- **WHEN** the current user lacks the `read-purchase-request` permission
- **THEN** the detail button is hidden; when lacking `update-purchase-request` the edit button is hidden

### Requirement: PR creation wizard — step 0: document type selection

The system SHALL present a two-step creation wizard. Step 0 MUST require the user to select a document type from the authenticated company's available types before proceeding.

#### Scenario: Document type selected and advance

- **WHEN** the user selects a document type and clicks Next
- **THEN** `stepsData[0]` is populated with `{ document_type_id }` and the wizard advances to step 1 (`currentStep` becomes 1)

#### Scenario: Company-scoped document types

- **WHEN** the DocTypeSelect component mounts or the effective company ID changes
- **THEN** `useDocumentTypeStore.fetchdocumentType` is called filtered by `companyId`, and only the returned types are offered in the dropdown

### Requirement: PR creation wizard — step 1: line items and form data

The system SHALL collect `expired_date`, `purpose`, and at least one line item before the PR can be submitted. Each line item MUST have `title`, `count` (quantity, 1–20), `unit_id`, `price` (1–999 999 999 999), `remark`, and an attached file (image or PDF). An optional quota company selection MAY auto-fill `title`, `unit_id`, and `price` for the item.

#### Scenario: Successful form submission to API

- **WHEN** the user completes the form and the layout confirm handler fires
- **THEN** `PurchaseForm.handleSave()` is called; the store `create()` maps each `AddMoreItem` to a `PurchaseRequestItemParams` and calls `PurchaseRequestEntity.createPurchaseRequestWithItems()`; the repository posts `{ document, expired_date, purposes, total, purchase_request_items }` to `POST /purchase-requests` and returns the new entity with its `user_approval` populated

#### Scenario: Validation prevents submission

- **WHEN** the user attempts to confirm step 1 with any required field missing (expired_date, purpose, item title, quantity, unit, price, remark, or image)
- **THEN** `formRef.validate()` rejects, the errors are shown inline, and no API call is made

#### Scenario: File attachment per line item

- **WHEN** the user opens the upload modal for a line item and selects a file
- **THEN** the file is sent via `uploadFile()` (multipart `POST /upload`); on success the returned `fileName` string is stored in `item.file_name` and the file type (`'pdf'` or `'image'`) in `item.fileType`; the item preview shows a blob URL

#### Scenario: Quota auto-fill

- **WHEN** the user picks a quota for a line item via the quota selector
- **THEN** `item.title`, `item.unit_id`, and `item.price` are overwritten with the quota's product name, unit, and vendor-product price respectively; `item.quota_company_id` is set to the quota ID

#### Scenario: Double-submit guard

- **WHEN** `isCreating` is already `true` or `newlyCreatedDocumentId` is already set
- **THEN** the confirm handler returns immediately without issuing a second API call

### Requirement: OTP verification on first approval step after creation

After a PR is successfully created the system SHALL immediately trigger the first approval step. If that step has `is_otp === true` the system MUST send an OTP, open `OtpModal`, and only advance to step 2 (success) upon valid 6-digit confirmation. If `is_otp === false` the modal still opens but the OTP field is bypassed.

#### Scenario: OTP step — send and confirm

- **WHEN** the newly created PR's `user_approval.approval_step[0].is_otp` is `true`
- **THEN** `approvalStepStore.sendOtp(stepId)` is called; on success `showOtpModal` is set to `true`; after the user enters a 6-digit OTP and confirms, `approvalStepStore.submitApproval(documentId, { type: "pr", statusId: 2, remark, approvalStepId, otp, is_otp: true, approval_id })` is called; on success `currentStep` advances to 2 and the router navigates to `/approval-purchase-requests` after 1.5 s

#### Scenario: Non-OTP first step

- **WHEN** `user_approval.approval_step[0].is_otp` is `false`
- **THEN** `OtpModal` opens with `is_otp` prop set to `false`; confirming sends `submitApproval` with an empty OTP string; the same redirect behaviour follows

#### Scenario: Success screen shown

- **WHEN** `currentStep` reaches 2
- **THEN** a success icon and message are displayed with a single "OK" button that navigates to `apv_purchase_request.index`

### Requirement: PR edit (update)

The system SHALL allow editing a PR that is not in a terminal status. The edit view reuses `PurchaseForm` in `isEditing` mode, pre-populates the form from `fetchById`, and submits via `PUT /purchase-requests/:id`.

#### Scenario: Form pre-population

- **WHEN** `UpdatePurchaseRequest` mounts with a valid `id` param
- **THEN** `purchaseRequestStore.fetchById(id)` is called; `formState` is populated with `expired_date`, `purpose`, and `addMore` array reconstructed from `entity.getItems()`

#### Scenario: Update submitted

- **WHEN** the user clicks the edit confirm button
- **THEN** `purchaseFormRef.handleSave()` is called; the store calls `repository.update(id, payload)` with `PUT /purchase-requests/:id`; on success the router navigates to `purchase_request.index`

### Requirement: Approval workflow display and inline approval

The approval detail view (`ApprovalPuchaseRqDetail`) SHALL display all `approval_step` entries ordered by `step_number`, derive a human-readable document status from the steps, and expose Approve and Reject buttons only to the user whose `username` and `department_name` match the currently pending step's `doc_approver` entries.

#### Scenario: Pending step authorization check

- **WHEN** the detail view loads and `user_approval.approval_step` contains a step with `status_id === 1`
- **THEN** the system compares `doc_approver[].user.username` and `doc_approver[].department.name` against the logged-in user's `userData` from `localStorage`; only if both match is `canApprove` set to `true` and the Approve/Reject buttons rendered

#### Scenario: Approve with OTP

- **WHEN** the user clicks Approve and the current step has `is_otp === true`
- **THEN** `approvalStepStore.sendOtp(step.id)` is called; `OtpModal` opens; after valid OTP entry `submitApproval` is called with `{ type: "pr", statusId: approvedStatusId, remark: "Approved", approvalStepId, is_otp: true, otp, approval_id }`; on success the PR entity is re-fetched via `fetchById`

#### Scenario: Approve without OTP

- **WHEN** the user clicks Approve and the current step has `is_otp === false`
- **THEN** `OtpModal` opens immediately (no `sendOtp` call); confirming sends `submitApproval` with an empty `otp` string and `is_otp: false`

#### Scenario: Reject action

- **WHEN** the user clicks Reject, enters a reason in the reject modal, and confirms
- **THEN** `submitApproval` is called with `statusId` equal to `rejectedStatusId` and the typed reason as `remark`; on success the detail is re-fetched

#### Scenario: Document status derivation

- **WHEN** any `approval_step` has `status_id === 3`
- **THEN** the derived status label shows "ຖືກປະຕິເສດ" in red; when no step has `status_id === 1` (all complete), it shows "ອະນຸມັດສຳເລັດ" in green; otherwise it shows "ລໍຖ້າ \<department\> ກວດສອບ" in orange using `doc_approver[0].department.name`

#### Scenario: Post-approval redirect logic

- **WHEN** a step with `step_number === 0` or `step_number === 1` is approved
- **THEN** the success modal is shown and the router navigates to `apv_purchase_request.index` after 1.5–2 s; for the last step when no PO exists yet, the page stays and the Create PO button becomes visible; for the last step when a PO already exists, the router redirects after 1.5 s

### Requirement: Convert an approved PR to a Purchase Order

The system SHALL display a "Create PO" button on the PR detail view when all approval steps have `status_id === 2` AND `is_created_po` is `false`. Clicking it navigates to the PO creation route with the PR ID as a query param.

#### Scenario: Create PO button visibility

- **WHEN** `isFullyApproved` is `true` (every step has `status_id === 2`) and `isPoCreated` is `false`
- **THEN** the "Create PO" button is rendered in `customButtons` and `customButtonSuccess`

#### Scenario: Navigation to PO creation

- **WHEN** the user clicks Create PO
- **THEN** the router navigates to `{ name: "doc-type-select", query: { purchase_request_id: pr.getId() } }`

### Requirement: PR data model and status lifecycle

`PurchaseRequestEntity` SHALL carry `status` as a plain string (default `"PENDING"`), derived from `user_approval.document_status.name` when mapping from the API. The entity MUST track `is_created_po` as a boolean. Status is NOT compared to integer IDs at the entity level; integer `status_id` comparisons happen only on `approval_step` entries.

#### Scenario: Default status on creation

- **WHEN** `PurchaseRequestEntity.create()` is called client-side
- **THEN** `status` is set to `"PENDING"` and `is_created_po` defaults to `false`

#### Scenario: Status mapped from API

- **WHEN** `toDomainModel()` maps an API response
- **THEN** `status` is set from `data.user_approval.document_status.name`; if absent it falls back to `"pending"`; `is_created_po` is set from `data.is_created_po` (defaults to `false`)

### Requirement: PR list pagination and export

The store SHALL maintain `pagination` state (`page`, `limit`, `total`, `totalPages`) updated on every `fetchAll` call. The system MUST support Excel export via `GET /purchase-requests/export-excel` with optional `startDate`/`endDate` filters, downloading the result as `purchase-requests-<today>.xlsx`.

#### Scenario: Table pagination change

- **WHEN** the user changes the page or page size in the table
- **THEN** `handleTableChange` updates `currentPage` and `pageSize` and calls `fetchData()` which re-invokes `fetchAll` with updated params

#### Scenario: Excel export

- **WHEN** `purchaseRequestStore.exportExcel(startDate, endDate)` is called
- **THEN** the repository calls `GET /purchase-requests/export-excel` with optional date params, receives a Blob, creates a temporary `<a>` element, triggers a download named `purchase-requests-<ISO date>.xlsx`, and revokes the object URL

### Requirement: PR read-only detail view

`PurchaseRequestDetail` (at `/purchase-requests/:id`) SHALL display header info (requester, department, position, company), a line-items table, totals, approval steps, and a print button. It MUST NOT expose Approve/Reject buttons.

#### Scenario: Detail load

- **WHEN** `PurchaseRequestDetail` mounts with a valid route param `id`
- **THEN** `purchaseRequestStore.fetchById(id)` is called and `requestDetail` is populated; if the API returns 404 the entity is `null` and the view shows an empty state

#### Scenario: Print

- **WHEN** the user clicks Print
- **THEN** `window.print()` is called; no server call is made

### Requirement: Permission checks on PR routes

PR routes MUST require `requiredAuth: true`. No `permission` meta key is set on any PR route in the current router file; inline permission checks use `hasPermission("read-purchase-request")` and `hasPermission("update-purchase-request")`. The `write-purchase-request` permission is force-patched onto every user at login (see authentication spec).

#### Scenario: Unauthenticated access

- **WHEN** a user without a valid session navigates to any `/purchase-requests*` route
- **THEN** `authGuard` redirects to `/login`

#### Scenario: Permission-gated UI

- **WHEN** a user has `read-purchase-request` but lacks `update-purchase-request`
- **THEN** the detail (eye) button is visible but the edit (pencil) button is hidden
