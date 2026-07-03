# Approval Step (Per-Document Approve / Reject / OTP)

> Canonical spec — describes what the **approval-step** capability currently DOES. Source of truth for the runtime act of approving or rejecting a single step on a live procurement document (PR, PO, or Receipt), including the OTP two-factor flow.

## Purpose

When a document (PR, PO, or Receipt) is in flight, the backend attaches a `user_approval` record with an `approval_step` array. Each element in that array is a live approval step instance. The `approval-step` capability covers the action of submitting a decision (approve = `statusId: 2`, reject = `statusId: 3`) on one step at a time via `POST /approve-step/:approvalStepId`. If a step has `is_otp: true`, the system MUST first call `POST /send-otp/:approvalStepId` to dispatch an OTP and then re-submit the approval including the OTP code and the `approval_id` returned by the OTP response.

## Implementation Map

| Layer | File |
| ----- | ---- |
| Store | `src/modules/presentation/Admin/stores/approval-step.store.ts` |
| Use cases | `src/modules/application/useCases/approval-step/submit-approval-step.use-case.ts` (`SubmitApprovalStepUseCase`, `SendOtpUseCase`) |
| Repository (interface) | `src/modules/domain/repository/approval-step.repository.ts` |
| Repository (impl) | `src/modules/infrastructure/api-approval-step.repository.ts` |
| Entity | `src/modules/domain/entities/approval-step.entity.ts` |
| Interface | `src/modules/interfaces/approval-step.interface.ts` |
| OTP modal (PR) | `src/modules/presentation/Admin/components/purchase-requests/modal/OtpModal.vue` |
| OTP modal (Finance DPM) | `src/modules/presentation/Admin/components/disbursement-slip/approval-finance-dpm/modals/OtpModal.vue` |
| Phone approval (PR) | `src/modules/presentation/Admin/components/approval-on-phone/ApprovalPurchaseRequestDetail.vue` |
| Phone approval (PO) | `src/modules/presentation/Admin/components/approval-on-phone/ApprovalPurchaseOrderDetail.vue` |
| Phone approval (Receipt) | `src/modules/presentation/Admin/components/approval-on-phone/ApprovalOnPhoneDetail.vue` |
| Approval dept detail | `src/modules/presentation/Admin/components/approval-department/ApprovalDepartmentDetails.vue` |

API endpoints:
- `POST /approve-step/:approvalStepId` — submit approve or reject decision
- `POST /send-otp/:approvalStepId` — dispatch OTP to approver's contact

## ADDED Requirements

### Requirement: Approve type is one of 'pr', 'po', or 'r'

The system SHALL validate that the `type` field on every approval step submission is one of `"pr"` (purchase request), `"po"` (purchase order), or `"r"` (receipt). `ApprovalStepEntity.create()` MUST throw `"Invalid approval type. Must be 'pr', 'po', or 'r'."` if any other value is supplied.

#### Scenario: Invalid type rejected at entity creation

- **WHEN** `ApprovalStepEntity.create({ type: "disbursement", ... })` is called
- **THEN** a `new Error("Invalid approval type. Must be 'pr', 'po', or 'r'.")` is thrown and the submission is aborted

#### Scenario: Valid type accepted

- **WHEN** `ApprovalStepEntity.create({ type: "po", statusId: 2, approvalStepId: 5 })` is called
- **THEN** no error is thrown and the entity is constructed with `type: "po"` and `statusId: 2`

### Requirement: `approvalStepId` is required

The system SHALL throw an error `"Approval Step ID is required"` if `approvalStepId` is falsy at entity creation time. The step ID identifies which template-step instance on the live document is being acted upon.

#### Scenario: Missing approvalStepId

- **WHEN** `ApprovalStepEntity.create({ type: "pr", statusId: 2, approvalStepId: 0 })` is called
- **THEN** `"Approval Step ID is required"` is thrown

### Requirement: Standard approve or reject without OTP

The system SHALL call `POST /approve-step/:approvalStepId` with `{ type, statusId, remark, approvalStepId, purchase_order_items, account_code, files, is_otp: false }`. On success, the store shows a success notification. The document-level view is responsible for determining which step the current user may act on.

#### Scenario: Approve submission succeeds

- **WHEN** `useApprovalStepStore().submitApproval(documentId, { type, statusId: 2, approvalStepId, is_otp: false, ... })` is called and the API returns 2xx
- **THEN** `ApiApprovalStepRepository.submit` returns `true`, the store shows `"ອະນຸມັດສຳເລັດ"` via `useNotification().success`, and `submitApproval` resolves to `true`

#### Scenario: Reject submission

- **WHEN** `submitApproval` is called with `statusId: 3` and a non-empty `remark`
- **THEN** the payload is sent with `statusId: 3` and `remark` populated; on API success the notification fires and the document view refreshes its steps

#### Scenario: API error

- **WHEN** the API returns an error response during submit
- **THEN** the store sets `error.value`, shows an error notification with `(err as Error).message`, and returns `false`

### Requirement: OTP-gated steps — two-phase flow

The system SHALL detect when a step requires OTP by checking `payload.is_otp === true && !payload.otp`. In that case it MUST first call `sendOtp(approvalStepId)` via `POST /send-otp/:approvalStepId`, store the response in `otpResponse` (including `approval_id`), and return early without submitting the approval. The caller is then responsible for collecting the OTP code and calling `submitApprovalWithOtp`.

#### Scenario: OTP step detected, OTP dispatched

- **WHEN** `submitApproval(documentId, { is_otp: true, otp: undefined, approvalStepId: 7 })` is called
- **THEN** `sendOtp(7)` is called, `otpResponse.value` is set from the response (with `approval_id`, `expires_in`, `max_attempts`), a success notification `"ສົ່ງ OTP ສຳເລັດ"` fires, and the function returns `true` without posting to `/approve-step/`

#### Scenario: OTP submission with code

- **WHEN** `submitApprovalWithOtp(documentId, { otp: "123456", approvalStepId: 7, is_otp: true, ... })` is called after an OTP has been sent
- **THEN** `payload.is_otp` is forced to `true`, `payload.approval_id` is set from `otpResponse.value.approval_id`, and `SubmitApprovalStepUseCase.execute` is called with the complete payload including the OTP code

#### Scenario: OTP send failure

- **WHEN** `POST /send-otp/:approvalStepId` returns an error
- **THEN** the store sets `error.value`, shows an error notification, and `sendOtp` returns `null`

### Requirement: Purchase-order-specific approval includes budget items

The system SHALL allow attaching `purchase_order_items` (an array of `{ id, budget_item_id }`) to a PO approval step submission. The entity maps these to `{ id, budgetItemId }` internally and serialises them back as `{ id, budget_item_id }` in `toApiModel`. For non-PO steps the array is empty.

#### Scenario: PO approval with budget items

- **WHEN** `submitPurchaseOrderApproval(documentId, purchaseOrderItems, approvalStepId, 2)` is called
- **THEN** the payload sent to `/approve-step/:approvalStepId` includes `purchase_order_items: [{ id, budget_item_id }]` for each item in the array

### Requirement: File upload attachment on approval step

The system SHALL allow including uploaded file names with an approval step via the `files` field. Each element is `{ file_name: string }`. The entity maps these to `{ fileName }` internally and back to `{ file_name }` for the API.

#### Scenario: Files included in submission

- **WHEN** `ApprovalStepEntity.create({ files: [{ file_name: "receipt.pdf" }], ... })` is called and the entity is submitted
- **THEN** `toApiModel` includes `files: [{ file_name: "receipt.pdf" }]` in the request body

### Requirement: Approval step submission is routed by the calling view, not the store

The store MUST NOT redirect after `submitApproval` (used by the generic approval view). `submitPurchaseDetails` MUST redirect to `purchaseRequestsList` on success. `submitApprovalDepartMent` MUST NOT redirect after submission.

#### Scenario: submitApproval does not redirect

- **WHEN** `submitApproval` is called and the API returns success
- **THEN** the store shows a notification but does NOT call `router.push`

#### Scenario: submitPurchaseDetails redirects to PR list

- **WHEN** `submitPurchaseDetails` is called and the API returns success
- **THEN** the store calls `router.push({ name: "purchaseRequestsList" })`

### Requirement: Current approval step is determined by `step_number` order and `doc_approver` authorization

The view MUST traverse `approval_step` in ascending `step_number` order, find the first step with `status_id === 1` (Pending) whose `step_number` equals `(lastApprovedStepNumber + 1)`, then confirm the current user's username or department matches an entry in `step.doc_approver`. Only that step is the `currentApprovalStep`.

#### Scenario: User is next authorized approver

- **WHEN** step 1 has `status_id: 2` and step 2 has `status_id: 1` and `doc_approver[0].user.username` matches the logged-in user
- **THEN** `currentApprovalStep` resolves to step 2 and the approve/reject buttons are rendered

#### Scenario: User is not the next authorized approver

- **WHEN** step 2 is pending but none of its `doc_approver` entries match the current user's username or department
- **THEN** `currentApprovalStep` is `null` and no action buttons are rendered

### Requirement: `isFullyApproved` gates post-approval actions

The view MUST compute `isFullyApproved` as `true` only when every step in `approval_step` has `status_id === 2` AND no step has `status_id === 3`. When `isFullyApproved` is true, the PO detail view enables the "Create Receipt" button.

#### Scenario: All steps approved, no rejections

- **WHEN** all entries in `approvalSteps` have `status_id === 2`
- **THEN** `isFullyApproved` is `true` and `canCreatePaymentDocument` is also `true`

#### Scenario: One step rejected

- **WHEN** any entry has `status_id === 3`
- **THEN** `isFullyApproved` is `false` even if all other steps have `status_id === 2`
