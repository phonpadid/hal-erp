## ADDED Requirements

### Requirement: Workflow step definitions carry budget and account-code capability flags

Approval workflow step definitions SHALL additionally carry the boolean flags `requires_budget_selection` and `requires_account_code`, alongside the existing `is_otp` and `requires_file_upload`. These flags let an administrator configure, per department and per step, which data/widget an express chain step requires — including chains where the same kind of step (e.g. finance) appears more than once with different flags.

#### Scenario: Configure a budget-selection step

- **WHEN** an administrator defines a workflow step and sets `requires_budget_selection = true`
- **THEN** documents whose approval reaches that step present a budget-item picker to the assigned approver

#### Scenario: Configure an account-code step

- **WHEN** an administrator defines a workflow step and sets `requires_account_code = true`
- **THEN** documents whose approval reaches that step present an account-code input to the assigned approver

#### Scenario: Repeated step kind with distinct flags

- **WHEN** a workflow defines two finance steps, the first with `requires_file_upload = true` and the second with all capability flags false
- **THEN** the ordered chain is honored and each step's flags independently drive its widget

#### Scenario: Existing workflows unaffected

- **WHEN** an existing PR/PO/Receipt workflow that does not set the new flags is used
- **THEN** the new flags default to `false` and existing approval behavior is unchanged
