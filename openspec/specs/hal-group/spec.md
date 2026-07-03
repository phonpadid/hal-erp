# HAL Group

> Canonical spec — describes what the **hal-group** capability currently DOES. MIXED maturity: the group **overview/list** is real and data-backed (it composes the company-report and HAL-budget report stores), while the **create** and **edit** views are STUBS that simulate persistence with `setTimeout` and mock data — no HAL-group CRUD API exists yet. Source of truth for the overview dashboard and the placeholder create/edit screens.

## Purpose

Give group-level administrators a consolidated overview of the affiliated companies under the HAL group: their budget allocation/usage, monthly budget overruns vs. within-budget figures, and per-company drill-down. The create/edit screens are UI scaffolds for future HAL-group record management.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View (list → overview) | `src/modules/presentation/Admin/views/hal-group/HalGroupListView.vue` (renders `OverView`) |
| View (create) | `src/modules/presentation/Admin/views/hal-group/HalGroupCreateView.vue` |
| View (edit) | `src/modules/presentation/Admin/views/hal-group/HalGroupEditView.vue` |
| Component (overview) | `src/modules/presentation/Admin/components/hal-group/overView/OverView.vue` |
| Component (affiliated company) | `src/modules/presentation/Admin/components/hal-group/affiliated-company/AffiliatedCompany.vue` |
| Component (company detail) | `src/modules/presentation/Admin/components/hal-group/company-detail/CompanyDetail.vue` |
| Store (consumed) | `company-report.store.ts`, `company-reports.store.ts`, `reports/report-hal.store.ts`, `departments/department.store.ts`, `receipt.store.ts` |
| Service (consumed) | `src/modules/application/services/reports/report-company.service.ts`, `report-hal.service.ts` |
| Static data | `src/modules/shared/halgroup.json`, `data-all-box-hal-group.json` |
| Route | `src/modules/presentation/Admin/router/hal-group.routes.ts` |

The overview reads company and HAL-group budget data through the **reports** capability's endpoints (`/report-company`, `/companies/report/receipt`, `/budget-accounts/report-hal-groups-monthly-budget`). There is NO dedicated `/hal-groups` write API.

Routes (all `requiredAuth: true`, no `permission` meta): `/hal-groups` (`hal-group.index`), `/hal-groups/overview` (`hal-group.overview`), `/hal-groups/create` (`hal-group.create`), `/hal-groups/edit/:id` (`hal-group.edit`), `/hal-groups/company/:id` (`hal-group.company.detail`).

## ADDED Requirements

### Requirement: HAL-group overview dashboard

The `/hal-groups` route SHALL render the `OverView` component, which composes the company-report and HAL-budget report stores to display affiliated-company budget allocation/usage and HAL-group budget overrun vs. within-budget figures, with a company filter.

#### Scenario: Loading the overview

- **WHEN** the user navigates to `/hal-groups`
- **THEN** `HalGroupListView` renders `OverView`, which pulls affiliated companies via the company-report service and HAL-group monthly budget data via `useReportHalStore`, exposing `getBudgetOverruns()` and `getWithinBudget()` to the dashboard

#### Scenario: Filtering by company

- **WHEN** the user selects a specific company in the overview filter
- **THEN** the affiliated-company list is filtered to companies whose name includes the selected value (`filters.company !== "all"`)

### Requirement: Per-company drill-down

The system SHALL provide a company detail route that renders `CompanyDetail` for a given company id.

#### Scenario: Opening a company's detail

- **WHEN** the user navigates to `/hal-groups/company/:id`
- **THEN** the lazily-loaded `CompanyDetail` component renders, scoped to that company id

### Requirement: HAL-group create is a non-persisting stub

The create view SHALL validate `name` (required, 2–100 chars) and `description` (max 500 chars), then SIMULATE saving with a `setTimeout` delay before showing a success notification and navigating back to `/hal-groups`. No API request is made.

> NOTE: Placeholder behavior. When a HAL-group CRUD API exists, `handleFormSubmit` MUST POST the form data through a repository instead of the `setTimeout` simulation.

#### Scenario: Submitting the create form

- **WHEN** the user submits a valid create form
- **THEN** `handleFormSubmit` awaits a simulated 1s delay, calls `success(t("halGroup.success.created"))`, and routes to `/hal-groups` — no network call occurs

#### Scenario: Validation blocks submit

- **WHEN** `name` is shorter than 2 characters
- **THEN** `UiForm` validation blocks submission and shows `t("halGroup.validation.nameMin")`

### Requirement: HAL-group edit loads and saves mock data

The edit view SHALL, on mount, SIMULATE loading a HAL group by route id (producing mock `name`/`description`), and on submit SIMULATE an update before notifying success and navigating back. No API request is made.

> NOTE: Placeholder behavior — `loadHalGroupData` returns hard-coded mock data and `handleFormSubmit` only simulates persistence.

#### Scenario: Opening the edit form

- **WHEN** the user navigates to `/hal-groups/edit/:id`
- **THEN** `loadHalGroupData` awaits a simulated delay and populates `formState` with mock values `HAL Group {id}` / `Description for HAL Group {id}`

#### Scenario: Submitting the edit form

- **WHEN** the user submits the edit form
- **THEN** `handleFormSubmit` awaits a simulated 1s delay, calls `success(t("halGroup.success.updated"))`, and routes to `/hal-groups`
