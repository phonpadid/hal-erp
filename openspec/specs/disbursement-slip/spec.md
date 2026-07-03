# Disbursement Slip

> Canonical spec — describes what the **disbursement-slip** capability currently DOES. The disbursement slip is not a separate domain entity; it is a view over approved Receipt records that presents the payment-and-disbursement approval stage, gated sequentially by Accounting DPM then Finance DPM.

## Purpose

Expose approved receipts for final disbursement. There are two sequential sub-modules: the **Accounting DPM** view (entry of accounting code and first-stage approval) and the **Finance DPM** view (exchange-rate confirmation, transfer-slip upload, and second-stage approval). Both sub-modules read and write to the same Receipt records via the shared `approve-step` and `receipts` API. No separate disbursement entity or store exists — state is managed entirely through `useReceiptStore`.

## Implementation Map

| Layer | File |
| ----- | ---- |
| Store (shared) | `src/modules/presentation/Admin/stores/receipt.store.ts` |
| View — Accounting DPM list | `src/modules/presentation/Admin/views/disbursement-slip/AccountingDepartment.vue` |
| View — Accounting DPM check | `src/modules/presentation/Admin/views/disbursement-slip/AccountingDepartmentCheck.vue` |
| Component — Accounting DPM detail | `src/modules/presentation/Admin/components/disbursement-slip/accounting-dpm/AccountingDepartmentDetail.vue` |
| Component — Accounting DPM layout | `src/modules/presentation/Admin/components/disbursement-slip/accounting-dpm/AccountingDpmLayout.vue` |
| View — Finance DPM list | `src/modules/presentation/Admin/views/disbursement-slip/ApprovalByFinanceDepartment.vue` |
| Component — Finance DPM detail | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/ApprovalByFinanceDpmDetail.vue` |
| Component — Finance DPM layout | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/ApvLayout.vue` |
| Component — Finance DPM column | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/column.ts` |
| Shared column definition | `src/modules/presentation/Admin/views/disbursement-slip/column.ts` |
| Drawer — PO details | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/drawers/ApprovalDrawer.vue` |
| Drawer — PR details | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/drawers/PropovalDrawer.vue` |
| Drawer — Vendor details | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/drawers/VendorDrawer.vue` |
| Modal — OTP | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/modals/OtpModal.vue` |
| Modal — Upload slip | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/modals/UploadSlipModal.vue` |
| Modal — Print | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/modals/Print.vue` |
| Reject schema | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/modals/rejected.schema.ts` |
| Route | `src/modules/presentation/Admin/router/disbursement.router.ts` |

API base path: `/receipts` (read) and `/approve-step/:stepId` (write). No disbursement-specific API endpoints exist.

## ADDED Requirements

### Requirement: Two-stage sequential disbursement flow

The system SHALL present disbursement in two distinct sub-modules that correspond to sequential approval steps: Accounting DPM (route `/accounting-department`) processes the accounting code and performs its approval step first; Finance DPM (route `/approval-receipt`) performs transfer-slip upload, exchange-rate entry, and final approval. The routes are independent views; there is no automated handoff between them.

#### Scenario: Accounting DPM list view

- **WHEN** a user navigates to `/accounting-department`
- **THEN** `AccountingDepartment.vue` renders a static 3-card summary (pending / approved / rejected counts are hard-coded placeholders in the current implementation) and a table bound to `dataAccounting` static mock data filtered by document type and status selects; no live API fetch for the list is wired in this view

#### Scenario: Finance DPM list view

- **WHEN** a user navigates to `/approval-receipt`
- **THEN** `ApprovalByFinanceDepartment.vue` fetches real receipt records from `GET /receipts` via `useReceiptStore`, renders a table of receipts with live status cards (PENDING / APPROVED / REJECTED counts from `rStore.status`), and provides filter controls for type, department, status, and date

### Requirement: Accounting DPM detail is a stub

The system SHALL route to `AccountingDepartmentDetail.vue` at `/accounting-department-detail/:id`. In the current implementation this component renders only a back button and the literal text "detail" — no receipt data is loaded or displayed.

> NOTE: This component is a known stub. It MUST NOT be used as a reference for real detail-page patterns. The Finance DPM detail (`ApprovalByFinanceDpmDetail.vue`) is the working reference.

#### Scenario: Navigation to accounting detail

- **WHEN** the user clicks the detail button in the Accounting DPM list
- **THEN** the router navigates to `accounting-department-detail.index` with the record `id` as a param, and the detail component shows only a back button

### Requirement: Finance DPM quick-preview modal

The system SHALL open a `QuickApprovalPreviewModal` when the user clicks a row in the Finance DPM list, showing receipt number, purpose, total, and approve/reject buttons. The modal MUST skip to the full detail page instead when: (a) the receipt has no pending approval steps, or (b) the current pending step has `requires_file_upload === true`.

#### Scenario: Quick approve from list

- **WHEN** the logged-in user is the current approver, the step does not require file upload, and the step is not an OTP step
- **THEN** clicking "approve" in the preview modal calls `rStore.approvalReceipt(stepId, { type: "r", statusId: 2, is_otp: false, files: [] })` and on success refreshes the list

#### Scenario: OTP step redirects to detail page

- **WHEN** the current pending step has `is_otp === true`
- **THEN** the quick-preview modal closes and the user is navigated to `/approval-by-finance-department/:id?action=approve`

### Requirement: Finance DPM detail page — role-based UI sections

The system SHALL render the Finance DPM detail page (`ApprovalByFinanceDpmDetail.vue`) with sections conditional on the logged-in user's roles. Role flags (`isRole` for ACCOUNT_ADMIN/ACCOUNT_USER, `isFinanceRole` for FINANCE_ADMIN/FINANCE_USER) are derived from `userRole` (from `localStorage` via `getUserRole()`).

#### Scenario: Accounting role sees account-code input

- **WHEN** `isRole === true`, the user is the current pending approver, and `receipt.account_code` is empty
- **THEN** a text input for `account_code` is displayed; the approve button in `ApvLayout.vue` validates that `account_code` is non-empty before submitting; after approval the field is read-only on subsequent views

#### Scenario: Finance role sees exchange-rate editor

- **WHEN** `isFinanceRole === true`, the user is the current pending approver, and the user's step is the lowest-numbered still-pending step
- **THEN** an exchange-rate editor panel is displayed showing all active rates whose target currency code is `LAK`; the user can edit rate values inline and save them via `erStore.updated()`

### Requirement: Transfer-slip upload on Finance detail page

The system SHALL display an image upload area when the current pending step has `requires_file_upload === true` and the logged-in user is that step's approver. The upload area is hidden when: (a) the user is not the current approver, or (b) the step does not require file upload. Already-uploaded attachments from `receipt.document_attachment[]` are shown as read-only image tiles.

#### Scenario: User uploads transfer slip images

- **WHEN** the user clicks the dashed upload box in `UploadSlipModal.vue` and selects files
- **THEN** each file is sent via `uploadFile(FormData)` and `{ file_name }` is pushed to `formState.files`; `uploadCompleted` is set to `true`; the approve button in `ApvLayout.vue` blocks if `is_upload === true` and `files` is empty

#### Scenario: Delete an uploaded image before approval

- **WHEN** the user clicks the "×" button on a newly uploaded image preview
- **THEN** the blob URL is removed from `uploadedImages` and the corresponding entry is spliced from `formState.files`; if all new images are removed and no prior attachments exist, `createModalVisible` re-opens

### Requirement: Approval flow with OTP in detail page

The system SHALL trigger OTP flow via `approvalStepStore.sendOtp(stepId)` when the pending step has `is_otp === true`. The OTP modal (`OtpModal.vue`) is used in both the `ApvLayout.vue` header and `FormCreate.vue`. On reject, the user enters a remark in the reject modal (`UiModal` with `rejectRule` validation), after which OTP is requested if needed before submitting `statusId: 3`.

#### Scenario: Approve with OTP

- **WHEN** the user clicks "approve" and `is_otp === true`
- **THEN** `requestOtp()` sends the OTP, `isOtpModalVisible` is set to `true`, and after the user enters the OTP `handleOtpConfirm` is called; on success `isSuccessModalVisible` is set to `true`

#### Scenario: Reject with remark

- **WHEN** the user clicks "reject" and enters a remark in the reject modal
- **THEN** `handleReject()` validates the remark via `rejectRule`, stores it in `dataHead.data.remark`, then follows the OTP path if `is_otp === true`, else opens `isOtpModalVisible`; the actual API call posts `statusId: 3` with the remark

### Requirement: Document-chain drawers

The system SHALL provide three slide-in drawers on the Finance DPM detail page: a PR drawer (`PropovalDrawer.vue`) opened with the receipt's `purchase_request_id`, a PO drawer (`ApprovalDrawer.vue`) opened with the receipt's `purchase_order_id`, and a vendor drawer (`VendorDrawer.vue`) opened with the vendor data of a selected receipt item's `selected_vendor[0]`.

#### Scenario: User views the linked PR

- **WHEN** the user clicks the PR document chip in the "doc_attachment" section
- **THEN** `showPropoval()` sets `selectedId` to `Number(receipt.purchase_request_id)` and opens the `PropovalDrawer` at width 1185px

### Requirement: Approval signature panel

The system SHALL render a signature strip at the bottom of the Finance DPM detail page with one slot per `approval_step`, ordered ascending by `step_number`. Each slot shows the step's `approver.user_signature.signature_url` image (or an empty placeholder), the approver's display name, their position, and `approved_at` date.

#### Scenario: Special-case title override for known approvers

- **WHEN** the step's `doc_approver[0].user.username` is `"khamthanom"` or `"Thipkhouneheuan"`
- **THEN** `getStepTitle()` and `getStepPosition()` return `"ຫົວໜ້າ" + receipt.document.department.name` instead of the approver's own department name

### Requirement: Financial Department Transfer view

The system SHALL provide a route `/financial-department-transfer` (`FinancialDepartmentTransfer.vue`) that renders the same static table and filter UI as `AccountingDepartment.vue` — using hard-coded `dataAccounting` mock data and static status-card counts. This view is currently a placeholder and contains no live API integration.

#### Scenario: Navigation to financial transfer

- **WHEN** a user navigates to `/financial-department-transfer` or `/financial-department-transfer/:id`
- **THEN** the `FinancialDepartmentTransfer.vue` renders the table with static mock data; no API calls are made
