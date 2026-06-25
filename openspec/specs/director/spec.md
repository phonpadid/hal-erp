# Director

> Canonical spec — describes what the **director** capability currently DOES. This is a THIN / unfinished feature: the list and detail views are wired into the router but render against MOCK data with hard-coded summary counts and a non-functional search. There is no store, service, repository, or API endpoint. Source of truth for the current placeholder behavior only.

## Purpose

Present a director-facing view of procurement documents (proposals) with status grouping (in-progress / completed / rejected) and a detail page. As implemented today it is a UI scaffold over static sample data, intended to be backed by a real API later.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View (list) | `src/modules/presentation/Admin/views/director/views/DirectorList.vue` (thin wrapper rendering `FormListTable`) |
| Component (list table) | `src/modules/presentation/Admin/components/director/FormListTable.vue` |
| Component (detail) | `src/modules/presentation/Admin/components/director/FormDetails.vue` |
| Component (success) | `src/modules/presentation/Admin/components/director/FormSucess.vue` |
| Columns | `src/modules/presentation/Admin/views/director/column/column.ts`, `columnDetails.ts` |
| Mock data | `src/modules/shared/utils/purchaseOrder.ts` (`purchaseOrderData`) |
| Interface | `src/modules/interfaces/director.interface.ts` |
| Route | `src/modules/presentation/Admin/router/director.router.ts` |

No store, service, repository, DTO, or API endpoint exists for this feature.

Routes: `/director` (`director-list`), `/director/detail/:id` (`director-detail`). Both set `requiredAuth: true`; neither declares a `permission` meta key. Meta titles are hard-coded English strings (`"Director List"`, `"Director Detail"`).

## ADDED Requirements

### Requirement: Director list renders mock procurement documents

The list view SHALL render a table of documents sourced from the static `purchaseOrderData` mock (via `FormListTable`), with status tags. The summary header SHALL show three groups — in-progress, completed, rejected — but their counts are CURRENTLY hard-coded (each displayed as `12 ໃບສະເໜີ`) and not derived from the data.

> NOTE: This is placeholder behavior. When a backend is wired up, the counts MUST be computed from real data and the mock data source replaced.

#### Scenario: Viewing the director list

- **WHEN** the user navigates to `/director`
- **THEN** `DirectorList` renders `FormListTable`, which displays the `purchaseOrderData` rows with status tags colored by `getStatusColor` (pending→warning, completed→success, rejected→error)

#### Scenario: Search is non-functional

- **WHEN** the user clicks the search button
- **THEN** `handleSearch` only logs the filter selection to the console; no data is filtered or fetched

### Requirement: Navigate to director detail

The list SHALL provide a per-row action that navigates to the detail route by record id.

#### Scenario: Opening a document detail

- **WHEN** the user clicks the detail action on a row
- **THEN** the router pushes `{ name: "director-detail", params: { id: record.id } }`, loading `FormDetails`

### Requirement: Status presentation helpers

The component SHALL map document status to a color, icon, and Lao label via `getStatusColor`, `getStatusIcon`, and `getStatusText` (`pending`→`ກຳລັງດຳເນີນການ`, `completed`→`ສຳເລັດ`, `rejected`→`ປະຕິເສດ`).

#### Scenario: Rendering a pending status

- **WHEN** a row has `status === "pending"`
- **THEN** the tag shows color `warning`, the clock icon, and the label `ກຳລັງດຳເນີນການ`
