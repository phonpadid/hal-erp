# Budget

> Canonical spec — describes what the **budget** capability currently DOES. Source of truth for the budget hierarchy (accounts → items → item-details) and the increase-budget flow (increase-budget, increase-detail, increase-budget-file).

## Purpose

Plan and track allocated money in a three-level hierarchy: a **budget account** (per department, per fiscal year) owns one or more **budget items**, and each item owns **budget item-details** (province-scoped line allocations). Monetary fields (`allocated_amount`, `used_amount`/`use_amount`, `balance_amount`, `total_budget`, `increase_amount`) are tracked and formatted for display. When an account needs more money, an **increase-budget** request is raised against the account: it carries one or more **increase-details** (each adding to a specific budget item) plus one or more **increase-budget-files** (supporting documents).

## Implementation Map

| Layer | Budget-account | Budget-item | Budget-item-details | Increase-budget |
| ----- | -------------- | ----------- | ------------------- | --------------- |
| View | `views/budget/budget_account/BudgetAccount.vue` | `views/budget/budget_item/BudGetItemList.vue` | `views/budget/budget_item_details/BudgetItemDetailsList.vue` | `views/budget/increase-budget/IncreaseBudgetView.vue`, `IncreaseBudgetItemView.vue` |
| Component | `components/budget/FormBudgetAccount.vue` | `components/budget/FormBudgetItem.vue` | `components/budget/FormBudgetItemDetails.vue` | `components/budget/increase/FormIncreaseBudget.vue`, `CreateItemModal.vue`, `UpdateModal.vue` |
| Store | `stores/budget/bud-get-account.store.ts` | `stores/budget/budget-item.store.ts` | `stores/budget/budget-item-details.store.ts` | `stores/budget/increase/increase-budget.store.ts`, `increase-budget-item.store.ts` |
| Service | `application/services/budget/budget-accounts.service.ts` | `.../budget-item.service.ts` | `.../budget-item-details.service.ts` | `.../increase-budget/budget-accounts.service.ts`, `budget-accounts-item.service.ts` |
| Repository (impl) | `infrastructure/budget/api-budget-account.repository.ts` | `.../api-budget-item.repository.ts` | `.../api-budget-item-details.repository.ts` | `infrastructure/budget/increase-budget/api-increase-budget.repository.ts`, `api-increase-budget-item.repository.ts` |
| Repository (interface) | `domain/repository/budget/budget-accounts.repository.ts` | `.../budget-item.repository.ts` | `.../budget-item-details.repository.ts` | `domain/repository/budget/increase-budget/increase-buget.repository.ts`, `increase-buget-item.repository.ts` |
| Entity | `domain/entities/budget/budget-accounts.entities.ts` | `.../budget-items.entities.ts` | `.../budget-item-details.entities.ts` | `domain/entities/budget/increase/increase-budget.entity.ts`, `increase-detail.entity.ts`, `increase-budget-file.entity.ts` |
| DTO | `application/dtos/budget/budget-accounts.dto.ts` | `.../budget-items.dto.ts` | `.../budget-item-details.dto.ts` | `application/dtos/budget/increase-budget/increase-budget.dto.ts`, `increase-detail.dto.ts`, `increase-budget-file.dto.ts` |
| Route | `router/budget/bud-get-account-routes.ts` | `router/budget/bud-get-item-routes.ts` | `router/budget/bud-get-item-details-routes.ts` | `router/budget/increase-budget/increase-budget.router.ts` |

API base paths:
- Budget-account → `/budget-accounts` (`GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`)
- Budget-item → `/budget-items` (`GET`, `GET /{id}`, `GET /by-account/{budgetAccountId}`, `GET /report`, `GET /item/{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`)
- Budget-item-details → `/budget-item-details` (`GET`, `GET /{id}`, `GET /budget-item-id/{budgetItemId}`, `POST /{budget_item_id}`, `PUT /{id}`, `DELETE /{id}`)
- Increase-budget → `/increase-budgets` (`GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`)
- Increase-detail → `/increase-budget-details` (`GET /{id}`, `POST /{id}`, `PUT /{id}`, `DELETE /{id}`)

## ADDED Requirements

### Requirement: Budget-account CRUD

The system SHALL manage budget accounts with `name`, `code`, `fiscal_year`, `type`, `allocated_amount`, and a `departmentId`. Accounts track `balance_amount`, `used_amount`, `total_budget`, and `increase_amount`, and are soft-deletable via `deleted_at`. Persistence goes through `/budget-accounts` as JSON.

#### Scenario: Create a budget account

- **WHEN** the user submits the account form with `name`, `fiscal_year`, `type`, `allocated_amount`, and `departmentId`
- **THEN** the system `POST`s the payload to `/budget-accounts` and maps the response into a `BudGetAccountsEntity`

#### Scenario: Account validation

- **WHEN** the account form is submitted
- **THEN** validation requires `departmentId`, `name` (max 100), `fiscal_year`, `type`, and `allocated_amount`; any failure blocks submission

#### Scenario: List, update, delete an account

- **WHEN** the user lists, edits, or deletes an account
- **THEN** the system `GET`s `/budget-accounts` (params `page`, `limit`, `search`, `sort_by`, `sortDirection`, optional `budget_account_id`), `PUT`s `/budget-accounts/{id}`, or `DELETE`s `/budget-accounts/{id}` (soft-delete)

#### Scenario: Monetary formatting

- **WHEN** an account is rendered
- **THEN** amount getters return values formatted via `formatPrice()` (thousands separators), while `getRawAllocatedAmount()` strips commas and returns a numeric value

### Requirement: Budget-item CRUD under an account

The system SHALL manage budget items belonging to a budget account via `budget_account_id`. Each item carries `name`, `allocated_amount`, `description`, and tracks `use_amount` and `balance_amount`. Items are soft-deletable.

#### Scenario: Create an item

- **WHEN** the user submits the item form
- **THEN** the system `POST`s `{ budget_accountId, name, description }` to `/budget-items` and maps the response into a `BudGetItemEntity`

#### Scenario: Item validation

- **WHEN** the item form is submitted
- **THEN** validation requires `budget_account_id`, `name` (max 100), `description`, and `allocated_amount` matching `/^[0-9]+(\.[0-9]{1,2})?$/` (numeric, up to 2 decimals); per-detail rows additionally require `province_id` and a matching `allocated_amount`

#### Scenario: List items by account

- **WHEN** the item list is scoped to an account
- **THEN** the system `GET`s `/budget-items/by-account/{budgetAccountId}` with pagination and optional `includeDeleted`

#### Scenario: Budget item reports

- **WHEN** a report is requested
- **THEN** the system `GET`s `/budget-items/report` with `page`, `limit`, `search`, `sort_by`, `sort_direction`, an `expenditure` or `advance` flag derived from the budget type, and optional `department_id`; a single item report comes from `GET /budget-items/item/{id}`

### Requirement: Budget-item-details under an item

The system SHALL manage province-scoped line allocations belonging to a budget item via `budget_item_id`. Each detail carries `name`, `province_id` (with optional nested `province`), `description`, and `allocated_amount` (stored as a string). Details are soft-deletable.

#### Scenario: Create a detail

- **WHEN** the user submits the detail form
- **THEN** the system `POST`s the payload to `/budget-item-details/{budget_item_id}` and maps the response into a `BudGetItemDetailsEntity`

#### Scenario: Detail validation

- **WHEN** the detail form is submitted
- **THEN** validation requires `budget_item_id`, `name` (max 100), `province_id`, and `allocated_amount` matching `/^[0-9]+(\.[0-9]{1,2})?$/`

#### Scenario: List details by item

- **WHEN** the detail list is scoped to an item
- **THEN** the system `GET`s `/budget-item-details/budget-item-id/{budgetItemId}` with params `page`, `limit`, `column` (default `id`), `sort_order` (default `DESC`), and optional `search`

### Requirement: Increase-budget request against an account

The system SHALL raise an increase request against a budget account via `budget_account_id`, carrying `description`, `file_name`, the creating `user_id`, and an array of `increase_budget_details`. The response nests `budget_account`, `created_by_user`, `increase_budget_details`, and `increase_budget_files`.

#### Scenario: Create an increase request

- **WHEN** the user submits the increase-budget form
- **THEN** the system `POST`s `{ budget_account_id, description, file_name, user_id, increase_budget_details: [{ budget_item_id, allocated_amount }] }` to `/increase-budgets` and maps the response into an `IncreaseBudGetAccountsEntity`

#### Scenario: Increase-budget validation

- **WHEN** the increase-budget form is submitted
- **THEN** validation requires `budget_account_id` and `file_name`; each detail row requires `budget_item_id` and `allocated_amount`

#### Scenario: List and fetch increase requests

- **WHEN** the user lists or opens an increase request
- **THEN** the system `GET`s `/increase-budgets` (params `page`, `limit`, `search`, `date`, `sort_by`, `sortDirection`, `include_deleted`) or `GET`s `/increase-budgets/{id}` returning the fully nested entity

#### Scenario: Update an increase request

- **WHEN** the user edits an increase request
- **THEN** the system `PUT`s `{ budget_account_id, description, file_name }` to `/increase-budgets/{id}` via `updated()`

### Requirement: Increase-detail line items

The system SHALL attach one or more increase-detail line items to an increase request, each linking an `increase_budget_id` to a `budget_item_id` with an `allocated_amount`. Increase-details are soft-deletable.

#### Scenario: Add a detail to an increase request

- **WHEN** the user adds a line to an existing increase request
- **THEN** the system `POST`s `{ budget_item_id, allocated_amount }` to `/increase-budget-details/{id}` and maps the response into an `IcraseDetailEntity`

#### Scenario: List, update, delete details

- **WHEN** the user manages increase-detail lines
- **THEN** the system `GET`s `/increase-budget-details/{id}` (with pagination and `include_deleted`), `PUT`s `/increase-budget-details/{id}` via `updated(budget_item_id, allocated_amount)`, or `DELETE`s `/increase-budget-details/{id}`

#### Scenario: Dynamic detail rows in the form

- **WHEN** the user clicks to add another allocation line
- **THEN** the store's `moreFunction()` appends a new empty detail row to `formState.detail`

### Requirement: Increase-budget file attachments

The system SHALL associate supporting files with an increase request. Each `IncreaseBudgetFileEntity` carries `increase_budget_id`, `file_name`, and an optional `file_name_url`, and is soft-deletable.

#### Scenario: Increase request carries attached files

- **WHEN** an increase request is fetched
- **THEN** its `increase_budget_files` are mapped into `IncreaseBudgetFileEntity[]`, each exposing `file_name` and (when available) a `file_name_url` for download

### Requirement: Budget hierarchy and increase linkage

The system SHALL maintain referential links: a budget item references its account via `budget_account_id`, a detail references its item via `budget_item_id`, an increase request references its account via `budget_account_id`, and each increase-detail references both its increase request (`increase_budget_id`) and the target budget item (`budget_item_id`).

#### Scenario: Increase request targets specific items

- **WHEN** an increase request is created
- **THEN** each increase-detail names the `budget_item_id` it adds money to, so the increase is allocated down the hierarchy from the account to its individual items

### Requirement: Soft-delete and active filtering

Budget accounts, items, item-details, and increase-details SHALL be soft-deletable via a `deleted_at` flag exposed through `isDeleted()`. Stores expose `active*` computed lists filtering out deleted records.

#### Scenario: Active records only

- **WHEN** a list view renders without requesting deleted records
- **THEN** the store's `active*` computed (e.g. `activeBudgetAccounts`, `activeBudgetItems`, `activeBudgetItemDetails`) returns only records where `isDeleted()` is false

### Requirement: Routes and authentication

The budget feature SHALL expose authenticated routes for each level of the hierarchy and for the increase flow. All routes set `requiredAuth: true`.

#### Scenario: Hierarchy navigation routing

- **WHEN** the user navigates the budget feature
- **THEN** `/budget-accounts` (`budget-accounts`) lists accounts, `/budget-accounts/item/:id` (`budget-accounts-id-add`) drills into an account's items, `/budget-items/details/:id` (`budget_items_details`) drills into an item's details, and `/increase-budget` (`increase_budget`) plus `/create-increase-budget` (`form_increase_budget`) and `/increase-budget-item/:id` (`increase_budget_item`) drive the increase flow
