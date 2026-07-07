## ADDED Requirements

### Requirement: Express Disbursement Request is an isolated module

The system SHALL provide the Express Disbursement Request ("ໃບສະເໜີເບີກຈ່າຍດ່ວນ") as a standalone feature with its own domain entity, repository, DTO, service, infrastructure repository, Pinia store, views, routes, and menu entry. The feature MUST NOT modify, re-route, or depend on the Purchase Request, Purchase Order, Receipt, or Disbursement views/stores/routes. It MAY reuse only shared/global building blocks (UI components, `useNotification`, canonical `usePermissions`, pagination/date helpers) and the generic `POST /approve-step/{id}` endpoint.

#### Scenario: Feature is self-contained

- **WHEN** the Express Disbursement Request feature is removed (its own files deleted and its route/menu/i18n entries reverted)
- **THEN** all existing Purchase Request, Purchase Order, Receipt, and Disbursement functionality continues to work unchanged, because no existing file's behavior was altered

#### Scenario: Menu entry in Lao

- **WHEN** the sidebar renders with the current locale set to `la`
- **THEN** the Express Disbursement Request menu label reads "ໃບສະເໜີເບີກຈ່າຍດ່ວນ", with equivalent keys present in `en` and `cn`

### Requirement: Express request list with status summary and filtering

The system SHALL display Express Disbursement Requests in a paginated table via `GET /express-disbursement-requests` and MUST show a summary row with counts for PENDING, APPROVED, and REJECTED. Users MUST be able to filter by document status before fetching. The edit action MUST be disabled for documents whose status is APPROVED, REJECTED, or CANCELED (case-insensitive).

#### Scenario: Initial list load

- **WHEN** the list view mounts
- **THEN** the store calls `fetchAll({ page: 1, limit: 10 })`, the table renders rows from the store, the status count cards reflect the API status summary, and pagination mirrors the store pagination state

#### Scenario: Filter by status

- **WHEN** the user selects a status from the filter dropdown and clicks Search
- **THEN** `fetchAll` is called with `status_id` as an extra param and `currentPage` is reset to 1

#### Scenario: Edit disabled for terminal statuses

- **WHEN** a row has `status` equal to `"APPROVED"`, `"REJECTED"`, or `"CANCELED"` (case-insensitive)
- **THEN** the edit control is rendered disabled and does nothing on click; the detail (view) control remains active

### Requirement: Express request creation

The system SHALL allow an authenticated user with `create-express-disbursement-request` to create an Express Disbursement Request carrying a `purpose` and at least one line item. Each line item MUST have `title`, `quantity`, `unit_id`, `price`, `remark`, and MAY carry a file/PDF attachment. Budget selection, transfer-slip files, and account code are NOT captured at creation — they are captured later, along the approval chain.

#### Scenario: Successful creation

- **WHEN** the user completes the form and confirms
- **THEN** the store maps each line item and calls the service `create()`; the repository posts `{ purpose, total, express_disbursement_request_items }` (with attachments via multipart where present) to `POST /express-disbursement-requests` and returns the new entity with its `user_approval` populated

#### Scenario: Validation prevents submission

- **WHEN** the user attempts to confirm with any required field missing (purpose, item title, quantity, unit, price, or remark)
- **THEN** form validation rejects, inline errors are shown, and no API call is made

#### Scenario: Double-submit guard

- **WHEN** a create request is already in flight, or a newly-created document id is already set
- **THEN** the confirm handler returns immediately without issuing a second API call

### Requirement: Step-aware approval detail driven by step capability flags

The system SHALL provide ONE approval detail view that renders the widget for the currently-active pending step based solely on that step's capability flags: `requires_budget_selection`, `requires_file_upload`, `requires_account_code`, and `is_otp`. The view MUST NOT choose the widget based on the approver's role or on the document type, so that the same kind of step MAY appear more than once in a chain with different flags.

#### Scenario: Budget-selection step

- **WHEN** the current pending step has `requires_budget_selection === true` and the logged-in user is that step's approver
- **THEN** a budget-item picker is shown; the approver MUST assign a `budget_item_id` to each line item before approving; on approve, the payload sent to `POST /approve-step/{id}` includes `type: "ex"` and the per-item budget selection (e.g. `express_items: [{ id, budget_item_id }]`)

#### Scenario: Transfer-slip upload step

- **WHEN** the current pending step has `requires_file_upload === true` and the logged-in user is that step's approver
- **THEN** a slip upload widget is shown; approval is blocked until at least one file is uploaded; on approve, the uploaded `files` are included in the approve-step payload

#### Scenario: Account-code step

- **WHEN** the current pending step has `requires_account_code === true` and the logged-in user is that step's approver
- **THEN** an account-code input is shown; approval is blocked until it is non-empty; on approve, `account_code` is included in the approve-step payload

#### Scenario: Plain approval step

- **WHEN** the current pending step has all capability flags false
- **THEN** only Approve and Reject controls are shown; approve submits with no extra data beyond `type`, `statusId`, `approvalStepId`, and `approval_id`

#### Scenario: OTP applies orthogonally to any step

- **WHEN** the current pending step has `is_otp === true` (regardless of its other flags)
- **THEN** `sendOtp(stepId)` is called and the OTP modal opens; the collected 6-digit OTP is included in the approve-step payload alongside that step's other captured data

#### Scenario: Multiple steps of the same kind

- **WHEN** a chain contains two finance steps where the first has `requires_file_upload === true` and the second has `requires_file_upload === false`
- **THEN** the first shows the slip upload widget and the second shows only the plain Approve/Reject controls, purely from each step's flags

### Requirement: Approver authorization per step

The system SHALL expose Approve and Reject controls only to the user who matches the currently-pending step's approver. The comparison MUST use the same convention as existing procurement approvals: matching the pending step's `doc_approver[]` user and department against the logged-in user's identity.

#### Scenario: Only the assigned approver can act

- **WHEN** the detail view loads and the earliest step with `status_id === 1` has `doc_approver[]` that does not match the logged-in user
- **THEN** the Approve/Reject controls are not rendered

#### Scenario: Reject with reason

- **WHEN** the assigned approver clicks Reject, enters a reason, and confirms
- **THEN** `submitApproval` is called with `statusId` equal to the rejected status id and the typed reason as `remark`; on success the detail is re-fetched

### Requirement: Progressive data capture and step gating

The system SHALL persist budget selection, slip files, and account code progressively through `POST /approve-step/{id}` as each step is actioned — never at document creation. A step MUST only be actionable when the preceding step (by `step_number`) has `status_id === 2`.

#### Scenario: Sequential gating

- **WHEN** an earlier step (lower `step_number`) is still pending
- **THEN** later steps are not actionable and their widgets are read-only/hidden for the current user

#### Scenario: Captured data is displayed read-only afterward

- **WHEN** a step that captured data (budget/slip/account code) has been approved
- **THEN** subsequent detail views show that captured data in read-only form

### Requirement: Budget deduction at final step is backend-authoritative

The system SHALL treat budget deduction as backend-owned. The front-end MUST NOT compute or mutate any budget amount. Budget is deducted once, when the final approval step is approved, and no Purchase Order or Receipt is created by this flow.

#### Scenario: Final approval closes the document

- **WHEN** the final pending step is approved
- **THEN** the client re-fetches the document and reflects the backend-reported terminal status; the client issues no budget-mutation call and no PO/Receipt creation call

#### Scenario: No spawned downstream documents

- **WHEN** an Express Disbursement Request is fully approved
- **THEN** no "Create PO" or "Create Receipt" action exists anywhere in the express detail view

### Requirement: Read-only detail view

The system SHALL provide a read-only detail view (route with `:id`) showing header info (requester, department, position, company), the line-items table with totals, the ordered approval steps with any captured budget/slip/account-code data, and a print action. It MUST NOT expose Approve/Reject controls.

#### Scenario: Detail load

- **WHEN** the detail view mounts with a valid route `id`
- **THEN** `fetchById(id)` is called and the detail is populated; a 404 resolves to an empty state

#### Scenario: Print

- **WHEN** the user clicks Print
- **THEN** `window.print()` is called and no server call is made

### Requirement: Permission-gated routes and actions

Express routes MUST set `requiredAuth: true`. The system SHALL evaluate `hasPermission` against `create-express-disbursement-request`, `view-express-disbursement-request`, and `update-express-disbursement-request` to gate the create button, detail access, and edit action respectively, using the canonical `usePermissions`.

#### Scenario: Unauthenticated access

- **WHEN** a user without a valid session navigates to any express route
- **THEN** the auth guard redirects to `/login`

#### Scenario: Permission-gated UI

- **WHEN** a user has `view-express-disbursement-request` but lacks `create-express-disbursement-request`
- **THEN** the detail control is visible but the create button is hidden

### Requirement: i18n coverage in three locales

The system SHALL add all user-facing strings for this feature as i18n keys present in `en`, `la`, and `cn`. No user-facing string may be hard-coded in a component.

#### Scenario: Keys exist in all locales

- **WHEN** the feature is built
- **THEN** every referenced key resolves in `en`, `la`, and `cn` with no missing-key fallbacks, and the Lao menu label equals "ໃບສະເໜີເບີກຈ່າຍດ່ວນ"
