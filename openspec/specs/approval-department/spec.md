# Approval Department (PO Departmental Approval View)

> Canonical spec — describes what the **approval-department** capability currently DOES. Source of truth for the departmental approval list and per-document approval detail view that department-level approvers use to review and act on Purchase Orders.

## Purpose

The approval-department module is the primary workspace for department-level approvers (non-admin, non-super-admin users) to see all Purchase Orders that are pending their review and to approve or reject individual steps. It surfaces the PO list filtered by department, status, date range, and document type. The detail page shows the full PO, the signature trail for all approval steps, a budget-code selector (gated by budget role), and the approve/reject/OTP action buttons. It also exposes a print view and a "Create Receipt" button when all steps are fully approved.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View (list) | `src/modules/presentation/Admin/views/approval-department/ApprovalDepartmentList.vue` |
| Component (list table) | `src/modules/presentation/Admin/components/approval-department/ApprovalDepartmentTable.vue` |
| Component (detail) | `src/modules/presentation/Admin/components/approval-department/ApprovalDepartmentDetails.vue` |
| Component (success) | `src/modules/presentation/Admin/components/approval-department/ApprovalsuccessDetails.vue` |
| Component (shop drawer) | `src/modules/presentation/Admin/components/approval-department/ShowShop.vue` |
| Component (print) | `src/modules/presentation/Admin/components/approval-department/PrintPurchaseOrder.vue` |
| Column definitions (list) | `src/modules/presentation/Admin/views/approval-department/column/cloumn.ts` |
| Column definitions (detail) | `src/modules/presentation/Admin/views/approval-department/column/columnDetails.ts` |
| Route | `src/modules/presentation/Admin/router/approval-department.routers.ts` |
| Store (PO) | `src/modules/presentation/Admin/stores/purchase_requests/purchase-order.ts` |
| Store (approval step) | `src/modules/presentation/Admin/stores/approval-step.store.ts` |
| Store (document status) | `src/modules/presentation/Admin/stores/document-status.store.ts` |

Routes:
- `/approval-department-panak` → `approval_department_panak` — PO list for department approvers
- `/approval-department-panak/:id` → `approval_department_panak_detail` — PO detail with approval actions

No dedicated repository — data is owned by the Purchase Order and Approval Step capabilities.

## ADDED Requirements

### Requirement: PO list supports multi-dimensional filtering

The system SHALL allow filtering the PO list by department (`department_id`), document type (`type` field — `"all"` by default), approval status (`status_user_id`), and order date range (`startDate`, `endDate`). Filter state MUST be synced to URL query params (`page`, `limit`, `department_id`, `type`, `status_user_id`, `order_date`) on every filter change so that a page refresh restores the same view.

#### Scenario: Initial URL params restore filter state

- **WHEN** the view mounts with `?page=2&department_id=5&status_user_id=PENDING` in the URL
- **THEN** `purchaseOrderStore.pagination.page` is set to `2`, `selectedDepartment` is `"5"`, and `selectedStatusUserId` is `"PENDING"`, and the first fetch uses these values

#### Scenario: Department filter change triggers reload

- **WHEN** the user changes the department select
- **THEN** `syncStateToUrl()` updates the URL and a new fetch is issued with the selected `department_id` parameter

### Requirement: List shows document status derived from approval step array

The table MUST derive a human-readable status from the document's `user_approval.approval_step` array rather than a separate status field: if any step has `status_id === 3` → rejected; if all steps have `status_id === 2` → approved; if any step has `status_id === 1` → pending with the next approver department name.

#### Scenario: Rejected step shows rejection status

- **WHEN** any entry in `approval_step` has `status_id === 3`
- **THEN** the status column displays a red "ຖືກປະຕິເສດ" badge

#### Scenario: All steps approved

- **WHEN** every entry in `approval_step` has `status_id === 2` and none is `3`
- **THEN** the status column displays a green "ອະນຸມັດສຳເລັດ" badge

#### Scenario: Pending at next department

- **WHEN** the first pending step (`status_id === 1`) is found
- **THEN** the status shows `"ລໍຖ້າ <department_name> ກວດສອບ"` in an orange badge

### Requirement: Approval step buttons are visible only to the next authorized approver

The detail view MUST determine `currentApprovalStep` by finding the pending step at `(lastApprovedStepNumber + 1)` and verifying the current user appears in `step.doc_approver` (by username or department). Approve and reject buttons MUST NOT render for any other user. Super-admin and admin users bypass the `doc_approver` check if they are explicitly named, or may act if no `doc_approver` entries exist for the step.

#### Scenario: PO requester can approve step 0 (self-submit)

- **WHEN** the PO's first approval step (`step_number === 0`) is pending (`status_id === 1`) and the logged-in user is the PO requester (matched via `doc_approver[0].user.username` or `getRequester().username`)
- **THEN** `currentApprovalStep` resolves to step 0 and the approve/reject header buttons are rendered

#### Scenario: Non-authorized user sees no buttons

- **WHEN** the next pending step's `doc_approver` list does not include the current user's username or department
- **THEN** `canApprove` is false, `customButtons` returns an empty array, and no approve/reject buttons appear

### Requirement: Budget-code assignment is required before approval for budget-admin/budget-user roles

The system SHALL validate that every PO line item has a budget code selected before allowing approval, but ONLY if `canManageBudget` is true (user has role `budget-admin` or `budget-user`). If any item is missing a budget code, `error()` notification fires and the approval submission is blocked.

#### Scenario: Budget-admin approves without selecting all budget codes

- **WHEN** `canManageBudget` is true and one or more PO items have no entry in `selectedBudgets`
- **THEN** `validateBudgetSelection()` returns `false`, an error notification fires listing the count of missing items, and `handleApprove()` is not called

#### Scenario: Non-budget user can approve without budget codes

- **WHEN** `canManageBudget` is false
- **THEN** `validateBudgetSelection()` returns `true` immediately and the approval proceeds

### Requirement: OTP approval on PO detail shows an OTP modal

The system SHALL detect an OTP-required step in the approval flow for PO detail. When the current step has `is_otp: true` and the user clicks approve, the store first dispatches an OTP and returns early. The `OtpModal` component is then shown (keyed on `currentPoStepId` and `currentPoIsOtp`) for the user to enter the code. On confirmation the store's `submitApprovalWithOtp` is called.

#### Scenario: OTP modal opens for OTP step

- **WHEN** the current approval step has `is_otp: true` and the user clicks approve
- **THEN** `approvalStepStore.sendOtp(currentApprovalStep.id)` is called, `isOtpModalVisible` is set to `true`, and `OtpModal` renders with the correct `approvalStepId`

#### Scenario: OTP confirmed and submitted

- **WHEN** the user enters the OTP code in the modal and confirms
- **THEN** `handleOtpConfirm(otpCode)` calls `approvalStepStore.submitApprovalWithOtp(documentId, { otp: otpCode, ... })`, `isOtpModalVisible` is set to `false`, and on success the document reloads

### Requirement: Signature trail renders all steps in step_number order

The detail view MUST sort `approval_step` by `step_number` (ascending) before rendering the signature area. Each step slot shows: a digital signature image if `status_id === 2` and `approver.user_signature` exists; a red X icon if `status_id === 3`; a "pending" text placeholder if `status_id === 1`.

#### Scenario: Approved step shows signature

- **WHEN** a step has `status_id === 2` and `step.approver.user_signature.signature_url` is non-null
- **THEN** an `<img>` element renders the signature URL in a fixed `120x80 px` container

#### Scenario: Rejected step shows icon

- **WHEN** a step has `status_id === 3`
- **THEN** a red `mdi:close-circle-outline` icon renders in place of the signature, and the rejection `remark` text is shown below

### Requirement: "Create Receipt" button only shows when PO is fully approved and receipt not yet created

The system SHALL render a "ສ້າງໃບເບີກຈ່າຍ" button only when `isFullyApproved` is `true` AND `orderDetails.getIsCreatedRc()` returns `false`. Clicking it opens the `SelectDocumentTypeModal` to initiate receipt creation.

#### Scenario: Receipt already created

- **WHEN** `orderDetails.getIsCreatedRc()` returns `true`
- **THEN** the "ສ້າງໃບເບີກຈ່າຍ" button is NOT included in `customButtons` even if all steps are approved

#### Scenario: Fully approved, no receipt yet

- **WHEN** `isFullyApproved` is `true` and `!orderDetails.getIsCreatedRc()` is also `true`
- **THEN** `customButtons` includes the "ສ້າງໃບເບີກຈ່າຍ" button; clicking it sets `selectedData` to the PO ID and opens `open = true` to mount `SelectDocumentTypeModal`

### Requirement: Print action always available regardless of approval status

The system SHALL always include a "Print" button in `customButtons` that calls `window.print()`. The print content is rendered by the `<PrintPurchaseOrder>` component in a CSS `print-only` div.

#### Scenario: Print button present in all states

- **WHEN** `customButtons` is computed in any state (pending, fully approved, or no approval access)
- **THEN** a Print button with `onClick: handlePrint` is included whenever any other buttons are also present

### Requirement: No dedicated permission check on approval-department routes

The approval-department routes (`/approval-department-panak` and `/approval-department-panak/:id`) have only `requiredAuth: true` in their route meta. No `permission` meta key is set.

#### Scenario: Authenticated user accesses department approval list

- **WHEN** any authenticated user navigates to `/approval-department-panak`
- **THEN** the route guard passes (`authGuard` succeeds, no `permissionGuard` check) and the view renders
