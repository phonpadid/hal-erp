# Reports

> Canonical spec — describes what the **reports** capability currently DOES. Covers the Purchase-Request, Purchase-Order, and Receipt report views (with status summary cards, filters, pagination, and per-row Excel export), plus the company-report stores (`companyReport` singular and `companyReports` plural) and HAL-group budget reports consumed by the HAL-group overview. Source of truth for procurement and company reporting.

## Purpose

Provide read-only, filterable, paginated reports over procurement documents (purchase requests, purchase orders, receipts) with status-summary cards and money totals, plus per-document Excel export. Separately, aggregate company-level statistics (allocated budget, users, receipts) and HAL-group monthly budget overruns/within-budget figures for the group overview dashboards.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View (PR) | `src/modules/presentation/Admin/views/reports/ReportPrView.vue` |
| View (PO) | `src/modules/presentation/Admin/views/reports/ReportPoView.vue` |
| View (Receipt) | `src/modules/presentation/Admin/views/reports/ReportReceiptView.vue` |
| Store (PR) | `src/modules/presentation/Admin/stores/reports/report-pr.store.ts` |
| Store (PO) | `src/modules/presentation/Admin/stores/reports/report-po.store.ts` |
| Store (HAL) | `src/modules/presentation/Admin/stores/reports/report-hal.store.ts` |
| Store (Budget) | `src/modules/presentation/Admin/stores/reports/budget-reports.store.ts` |
| Store (Company, singular) | `src/modules/presentation/Admin/stores/company-report.store.ts` |
| Store (Company, plural) | `src/modules/presentation/Admin/stores/company-reports.store.ts` |
| Service | `src/modules/application/services/reports/report-purchase-request.service.ts`, `report-purchase-order.service.ts`, `report-company.service.ts`, `report-hal.service.ts` |
| Repository (impl) | `src/modules/infrastructure/reports/report-purchase-request.repository.ts`, `report-purchase-order.repository.ts`, `report-company.repository.ts`, `report-hal.repository.ts` |
| DTO | `src/modules/application/dtos/report/report-pr.dto.ts`, `report-po.dto.ts` |
| Route | `src/modules/presentation/Admin/router/reports/report-pr.ts`, `report-po.ts` |

API base paths and endpoints:
- PR: `/reports/purchase-requests` (list), `/reports/purchase-requests/money` (status totals), `/reports/receipts/money` (receipt totals), `purchase-requests/export/:id` (blob export)
- PO: `/reports/purchase-orders` (list), `/reports/purchase-orders/money` (status totals), `purchase-orders/export/:id` (blob export)
- Company: `GET /report-company` (statistics), `GET /companies/report/:companyId` (one company detail), `GET /companies/report?company_id=:id`, `GET /companies/report/receipt` (companies with receipts)
- HAL: `GET /budget-accounts/report-hal-groups-monthly-budget`, plus HAL-group state

Routes: `/report-purchase-request` (`report_pr`), `/report-purchase-order` (`report_po`), `/report-receipt` (`report_receipt`). All set `requiredAuth: true`; none declare a `permission` meta key.

## ADDED Requirements

### Requirement: Procurement report list with status summary cards

The system SHALL render PR/PO report views with four status-summary cards (Total, Pending, Approved, Rejected). Card counts come from the `status` array returned by the list endpoint; card money totals come from the `report_money` array fetched from the `/money` endpoint. The list table is paginated via `page`/`limit`.

#### Scenario: Loading the PO report

- **WHEN** `ReportPoView` mounts and calls `reportPo(params)`
- **THEN** the store GETs `/reports/purchase-orders`, populates `report_po`, maps `result.status` into the `status` cards, and updates `pagination` from the result

#### Scenario: Money totals fetched separately

- **WHEN** the view requests money totals
- **THEN** the store GETs `/reports/purchase-orders/money` (or `/reports/purchase-requests/money` for PR) and stores the array in `report_money`

### Requirement: Report filtering

The system SHALL allow filtering the procurement reports by department, status, date range, and free-text search. PR/PO use `requested_date_start` / `requested_date_end`; the receipt report uses `start_date` / `end_date`. A Clear control resets the filters and reloads.

#### Scenario: Filtering by date range

- **WHEN** the user picks a date range on the PR report
- **THEN** the store sends `requested_date_start` and `requested_date_end` (plus `department_id`, `status_id`, `search` when set) and reloads the list

#### Scenario: Receipt report uses different date keys

- **WHEN** the receipt report filters by date
- **THEN** it sends `start_date` and `end_date` (not `requested_date_*`)

### Requirement: Per-document Excel export

The system SHALL export a single procurement document as an `.xlsx` file. The repository requests the export endpoint with `responseType: "blob"`, and the client builds an object URL and triggers a download.

#### Scenario: Exporting a purchase order

- **WHEN** `reportPoExport(id)` runs
- **THEN** the repository GETs `purchase-orders/export/{id}` as a blob, and the client creates a `<a download>` link named `purchase-order-{id}-{date}.xlsx`, clicks it, and revokes the object URL

#### Scenario: Exporting a purchase request

- **WHEN** `reportPrExport(id)` runs
- **THEN** the repository GETs `purchase-requests/export/{id}` as a blob and downloads it as `purchase-request-{id}-{date}.xlsx`

### Requirement: Receipt report with currency awareness

The system SHALL render the receipt report using `useReceiptStore` for the rows and `report_receipt_money` (from the PR report store, fed by `GET /reports/receipts/money`) for the money cards, displaying each total alongside its `currency_code`. Row detail navigates to the finance-department approval detail route.

#### Scenario: Showing receipt money with currency

- **WHEN** the receipt report renders its money cards
- **THEN** each card shows the total and its `currency_code` from `report_receipt_money`

### Requirement: Company statistics report (singular store)

The `useCompanyReportStore` SHALL load aggregate statistics via `GET /report-company` into `statistics` (`total_companies`, `total_allocated`, `total_users`) and the per-company receipts breakdown via `GET /companies/report/receipt` into `companiesWithReceipts`. It exposes `hasData` / `hasCompaniesData` getters and `clearData()`.

#### Scenario: Loading company statistics

- **WHEN** `fetchReportStatistics()` runs
- **THEN** the store GETs `/report-company`, assigns `response.data` to `statistics`, and `hasData` becomes `true`

#### Scenario: Loading companies with receipts

- **WHEN** `fetchCompaniesWithReceipts(params)` runs
- **THEN** the store GETs `/companies/report/receipt` and fills `companiesWithReceipts` (each with `receipt_count`, `total_allocated`, `total_used_amount`)

### Requirement: Detailed company report (plural store)

The `useCompanyReportsStore` SHALL load the full per-company detail (documents, budget accounts, users) via `GET /companies/report/:companyId`, and `loadCompanyReports()` first lists companies then fetches each company's detail. It exposes `getCompanyById(id)` and a `getPendingDocuments` computed that flattens all documents with status `pending` across companies.

#### Scenario: Aggregating pending documents

- **WHEN** a consumer reads `getPendingDocuments`
- **THEN** the store returns every document with `status === 'pending'` collected from all loaded companies

### Requirement: HAL-group monthly budget report

The system SHALL fetch HAL-group monthly budget figures via `GET /budget-accounts/report-hal-groups-monthly-budget` (optionally filtered by `company_id`, `departmentId`, `fiscal_year`) into `useReportHalStore`, exposing budget-overrun and within-budget data plus HAL-group state for the group overview dashboard.

#### Scenario: Loading HAL-group budget data

- **WHEN** the HAL-group overview requests monthly budget data
- **THEN** the store GETs `/budget-accounts/report-hal-groups-monthly-budget` with any provided filters and exposes the overruns / within-budget breakdown to the overview components
