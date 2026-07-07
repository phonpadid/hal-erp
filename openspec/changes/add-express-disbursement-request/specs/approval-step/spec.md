## ADDED Requirements

### Requirement: Approve-step accepts the express document type

The generic `POST /approve-step/{approvalStepId}` endpoint SHALL accept a new document `type` value `"ex"` for Express Disbursement Requests, in addition to the existing `"pr"`, `"po"`, and `"r"` types. The express payload MAY carry per-item budget selection, `account_code`, `files`, and `otp` depending on the acted step's capability flags, following the same shape conventions as the existing PO and Receipt approve-step payloads.

#### Scenario: Express approval with budget selection

- **WHEN** an approver approves an express step whose `requires_budget_selection` is true
- **THEN** the client posts `{ type: "ex", statusId, approvalStepId, approval_id, express_items: [{ id, budget_item_id }] }` to `POST /approve-step/{approvalStepId}` and the backend records the budget selection for that document

#### Scenario: Express approval with slip and/or account code

- **WHEN** an approver approves an express step whose `requires_file_upload` and/or `requires_account_code` is true
- **THEN** the client includes `files` and/or `account_code` in the `type: "ex"` payload, and the backend persists them against the document

#### Scenario: Existing types unaffected

- **WHEN** an approver approves a `"pr"`, `"po"`, or `"r"` step
- **THEN** behavior is exactly as before; the addition of `"ex"` does not change any existing type's handling

### Requirement: Approval steps expose capability flags

Per-document `approval_step[]` entries returned by the API SHALL expose the boolean capability flags `requires_budget_selection` and `requires_account_code` in addition to the existing `is_otp` and `requires_file_upload`. Clients determine which widget/data a step needs solely from these flags.

#### Scenario: Flags present on express steps

- **WHEN** an express document's `user_approval.approval_step[]` is fetched
- **THEN** each step includes `is_otp`, `requires_file_upload`, `requires_budget_selection`, and `requires_account_code` as booleans

#### Scenario: Flags default false when absent

- **WHEN** an approval step from any document type omits the new flags
- **THEN** the client treats `requires_budget_selection` and `requires_account_code` as `false`
