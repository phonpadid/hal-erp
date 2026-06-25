# Budget Approval Rules

> Canonical spec — describes what the **budget-approval-rules** capability currently DOES. Source of truth for the amount-threshold rules that decide which approver authorizes a budget/purchase amount.

## Purpose

Configure which approver must authorize a spend, based on an amount range. Each rule binds an `approver_id` (and optionally a `department_id`) to a `[min_amount, max_amount]` window. When a purchase/budget amount falls inside a rule's range, that rule's approver is the authorizer. A department can have multiple rules spanning different amount tiers, so larger amounts can route to higher approvers.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/budget-approval-rules/BudgetApvRuleView.vue` |
| Column | `src/modules/presentation/Admin/views/budget-approval-rules/column.ts` |
| Validation | `src/modules/presentation/Admin/views/budget-approval-rules/validation/BudgetApvRule.validate.ts` |
| Store | `src/modules/presentation/Admin/stores/budget-apv-rule.store.ts` |
| Service | `src/modules/application/services/budget-approval-rules/budget-approval-rule.service.ts` |
| Use cases | `src/modules/application/useCases/budget-approval-rules/{create,update,delete,get-all,get-one}.use-case.ts` |
| Repository (impl) | `src/modules/infrastructure/budget-approval-rules/api-budget-approval-rules.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/budget-approval-rules/budget-approval-rules.repository.ts` |
| Entity | `src/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity.ts` |
| DTO | `src/modules/application/dtos/budget-approval-rules/budget-approval-rules.repository.ts` |
| Interface | `src/modules/interfaces/budget-approval-rules/budget-approval-rule.interface.ts` |
| Port | `src/modules/application/ports/input/budget-approval-rules/budget-approval-rule-input.ts` |
| Route | `src/modules/presentation/Admin/router/budget-apv-rule.routers.ts` |

API base path: `/budget-approval-rules`. Endpoints: `POST /budget-approval-rules`, `GET /budget-approval-rules`, `GET /budget-approval-rules/{id}`, `PUT /budget-approval-rules/{id}`, `DELETE /budget-approval-rules/{id}`.

## ADDED Requirements

### Requirement: Amount-threshold rule definition

The system SHALL define an approval rule as `{ department_id, approver_id, min_amount, max_amount }`. The `[min_amount, max_amount]` window is the amount range that the named `approver_id` is authorized to approve. IDs and amounts cross the wire as numbers; the entity stores them as strings.

#### Scenario: A rule gates an amount range

- **WHEN** a rule exists with `min_amount` and `max_amount`
- **THEN** the rule applies to any amount where `amount >= min_amount AND amount <= max_amount`, routing that amount's authorization to `approver_id`

#### Scenario: Tiered approval per department

- **WHEN** a department has multiple rules with different `[min_amount, max_amount]` windows
- **THEN** each amount tier resolves to its matching rule's approver, so larger spends can route to a different (higher) approver

### Requirement: Create an approval rule

The system SHALL create a rule by sending `{ department_id, approver_id, min_amount, max_amount }` as JSON to `POST /budget-approval-rules`. On success the new `BudgetApprovalRuleEntity` is prepended to the list.

#### Scenario: Create in department mode

- **WHEN** the user picks Department mode, selects a department and approver, enters min/max amounts, and submits
- **THEN** the system `POST`s the payload (IDs and amounts coerced to numbers) and maps the response into a `BudgetApprovalRuleEntity`

#### Scenario: Create in personal mode

- **WHEN** the user picks Personal mode (no department), selects an approver, and enters amounts
- **THEN** the system creates the rule with `approver_id` set and `department_id` left empty/null

### Requirement: Rule field validation

The form SHALL require `department_id`, `approver_id`, `min_amount`, and `max_amount` (validated on blur). The system MUST reject a rule where `max_amount` is less than `min_amount`.

#### Scenario: Missing required fields

- **WHEN** any of the four fields is empty on submit
- **THEN** the `UiForm` blocks submission and shows the i18n message (`budget-apv-rule.error.{department,user,min,max}`) and no request is made

#### Scenario: Inverted amount range rejected

- **WHEN** the submitted `max_amount` is less than `min_amount`
- **THEN** the system shows an error (`"max_amount" cannot be less than "min_amount"`) and does not persist the rule

#### Scenario: Amount input formatting

- **WHEN** the user types into a min/max amount field
- **THEN** non-digit characters are stripped, the display is formatted with thousands separators via `formatPrice()`, and the raw numeric value is parsed via `parsePrice()` before submission

### Requirement: List rules with pagination and search

The system SHALL list rules via `GET /budget-approval-rules` with query params `page`, `limit`, `includeDeleted`, and optional `search`, returning a paginated `BudgetApprovalRuleEntity[]` whose rows nest the related `department` and `approver`.

#### Scenario: Paginated listing

- **WHEN** the list view loads or the user searches/pages
- **THEN** the system fetches the page, updates `pagination` (`page`, `limit`, `total`, `totalPages`), and renders each rule showing `approver.username`, `approver.tel`, formatted `min_amount` and `max_amount`, and timestamps

### Requirement: Update an approval rule

The system SHALL update a rule via `PUT /budget-approval-rules/{id}` after fetching the existing rule. If the rule does not exist, the update use case MUST throw `Unit with id {id} not found`.

#### Scenario: Edit an existing rule

- **WHEN** the user edits department/approver/min/max and submits
- **THEN** the system loads the rule, mutates it via `updated(department_id, approver_id, min_amount, max_amount)`, `PUT`s to `/budget-approval-rules/{id}`, and updates it in-place in the list

#### Scenario: Update of a missing rule

- **WHEN** the targeted `id` does not resolve to a rule
- **THEN** the update use case throws `Unit with id {id} not found` and nothing is persisted

### Requirement: Delete an approval rule (soft-delete)

The system SHALL soft-delete a rule via `DELETE /budget-approval-rules/{id}`. The delete use case MUST fetch the rule first, throw `budget with id {id} not found` if absent, and throw `budget with id {id} is already deleted` if `isDeleted()` is already true.

#### Scenario: Delete an active rule

- **WHEN** the user confirms deletion of an active rule
- **THEN** the system `DELETE`s `/budget-approval-rules/{id}`, the entity's `delete()` sets `deleted_at`, and the list is refetched

#### Scenario: Double-delete guarded

- **WHEN** a delete is attempted on a rule whose `deleted_at` is already set
- **THEN** the use case throws `budget with id {id} is already deleted` and no request is made

### Requirement: Permission-gated rule management

The system SHALL gate create/edit/delete actions behind the permissions `create-budget-approval-rule`, `update-budget-approval-rule`, and `delete-budget-approval-rule`. Super-admin and admin roles are restricted to view-only.

#### Scenario: Company admin with permission

- **WHEN** the user has the relevant permission AND is neither super-admin nor admin
- **THEN** the corresponding create/edit/delete control is rendered

#### Scenario: Super-admin or admin

- **WHEN** the user is a super-admin or admin
- **THEN** the create/edit/delete controls are hidden and the view is read-only

### Requirement: Route and authentication

The feature SHALL be reachable at the authenticated route `/budget-approval-rule` (name `budget_apv_rule.index`) rendering `BudgetApvRuleView`, with `requiredAuth: true`.

#### Scenario: Authenticated navigation

- **WHEN** an authenticated user navigates to `/budget-approval-rule`
- **THEN** the auth guard passes and `BudgetApvRuleView` renders the rules table
