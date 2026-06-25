# Approval Workflows

> Canonical spec — describes what the **approval-workflows** capability currently DOES. Source of truth for creating, reading, updating, deleting, verifying, and mail-triggering named approval workflows that gate procurement documents.

## Purpose

An approval workflow is a named configuration object that binds a document type (PR, PO, etc.) to an ordered set of approval steps. Administrators create and manage workflows; the backend attaches the appropriate workflow to a document when it is submitted. The workflow can be in one of two lifecycle states (`pending` / `approved`) which controls whether it is active in the procurement pipeline. A mail-trigger feature sends an email invitation to a designated approver when a workflow is pending.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/approval-workflows/ApprovalWorkflowView.vue` |
| Token approval page | `src/modules/presentation/Admin/views/approval-workflows/ApproveByTokenPage.vue` |
| Column definitions | `src/modules/presentation/Admin/views/approval-workflows/column.ts` |
| Form validation | `src/modules/presentation/Admin/views/approval-workflows/validation/approval-workflow.validate.ts` |
| Store | `src/modules/presentation/Admin/stores/approval-workflow.store.ts` |
| Service (impl) | `src/modules/application/services/approval-flow.service.ts` |
| Service (port) | `src/modules/application/ports/input/approval-workflow.service.ts` |
| Use cases | `src/modules/application/useCases/approval-flows/` (create, get-all, get-one, update-department, delete, approval-status, send-mail) |
| Repository (interface) | `src/modules/domain/repository/approval-workflow.repository.ts` |
| Repository (impl) | `src/modules/infrastructure/api-approval-workflow.repository.ts` |
| Entity | `src/modules/domain/entities/approval-workflows.entity.ts` |
| DTO | `src/modules/application/dtos/approval-workflow.dto.ts` |
| Interface (API model) | `src/modules/interfaces/approval-workflow.interface.ts` |
| Route | `src/modules/presentation/Admin/router/approval-workflow.routers.ts` |
| i18n | `src/common/locales/{en,la,cn}/approval-workflow.json` |

API base path: `/approval-workflows`. Endpoints:
- `POST /approval-workflows` — create
- `GET /approval-workflows` — paginated list (params: `page`, `limit`, `search`, `includeDeleted`)
- `GET /approval-workflows/:id` — find by ID
- `PUT /approval-workflows/:id` — update name/document_type
- `DELETE /approval-workflows/:id` — soft-delete
- `PUT /approval-workflows/approve/:id` — toggle lifecycle status (`pending` ↔ `approved`)
- `POST /approval-workflows/:id/send-approval-mail` — send email to a designated approver
- `POST /approval-workflows/approve-by-token` — approve via email token link (unauthenticated)

## ADDED Requirements

### Requirement: List approval workflows with pagination and search

The system SHALL fetch a paginated list of approval workflows via `GET /approval-workflows` and display them in a table. The store MUST update `approval_workflows`, `pagination.total`, `pagination.page`, and `pagination.limit` from the response. The view MUST support a search input that filters by name and re-fetches from page 1 on submit.

#### Scenario: Successful list load on mount

- **WHEN** the `ApprovalWorkflowView` component mounts
- **THEN** `store.fetchApprovalWorkflows({ page: 1, limit: 10 })` is called, the table is populated with `store.approval_workflows`, and the total count tag reflects `store.pagination.total`

#### Scenario: Search clears and re-fetches

- **WHEN** the user clears the search input (value becomes `''`)
- **THEN** the watcher triggers `loadData()` which re-fetches all workflows from page 1

#### Scenario: Pagination change

- **WHEN** the user changes page or page-size via the table pagination control
- **THEN** `store.setPagination({ page, limit, total })` is called followed by `loadData()` which re-fetches at the new page

### Requirement: Create a new approval workflow

The system SHALL navigate to `/create-approval-workflow` (route `create-approval-workflow`) when the user clicks the add button. Creation is handled by the `ApprovalWorkflow.vue` component at that route. The store's `create` action posts to `POST /approval-workflows` and prepends the returned entity to `approval_workflows`.

#### Scenario: Create button visibility gated by permission

- **WHEN** `hasPermission('create-approval-workflow')` is true AND the user is neither `isSuperAdmin` nor `isAdmin`
- **THEN** the "Add" button is rendered and clicking it navigates to the creation route

#### Scenario: Create button hidden for super-admin/admin

- **WHEN** `isSuperAdmin.value` or `isAdmin.value` is true
- **THEN** `canCreateStep` evaluates to false and the create button is not rendered, regardless of the `create-approval-workflow` permission

### Requirement: Update an approval workflow

The system SHALL allow editing a workflow's `name` and `document_type_id` through an inline edit modal. The store's `update` action calls `PUT /approval-workflows/:id` and replaces the matching entry in `approval_workflows`.

#### Scenario: Edit modal pre-populates from record

- **WHEN** the edit button is clicked on a row
- **THEN** `showEditModal(record)` populates `formModel.name` from `record.name` and `formModel.document_type_id` from `record.document_type?.id`, then sets `editModalVisible = true`

#### Scenario: Successful update

- **WHEN** the user submits the edit form and the API returns the updated entity
- **THEN** the store replaces the entity at the matching index in `approval_workflows`, a success notification is shown, and `loadData()` re-fetches the list

### Requirement: Delete an approval workflow

The system SHALL soft-delete a workflow via `DELETE /approval-workflows/:id`. The store's `remove` action calls the API and replaces the deleted entity in the local array with a new instance carrying the current timestamp as `deletedAt` and `updatedAt`.

#### Scenario: Delete confirmation and execution

- **WHEN** the user confirms the delete modal
- **THEN** `store.remove(id)` is called, the entity in `approval_workflows` is replaced with its soft-deleted copy, a success notification fires, and `loadData()` re-fetches

### Requirement: Toggle workflow lifecycle status (verify/approve)

The system SHALL allow toggling a workflow between `pending` and `approved` states via `PUT /approval-workflows/approve/:id`. If the current status is `approved`, the payload is `{ status: "pending" }`; if `pending`, it is `{ status: "approved" }`.

#### Scenario: Toggle from pending to approved

- **WHEN** the verify button is clicked on a workflow whose `status` is `"pending"` and the user confirms
- **THEN** `store.approvalStatus(record.id, { status: "approved" })` is called, a success notification fires, and the list reloads showing the new status badge as green

#### Scenario: Toggle from approved to pending

- **WHEN** the verify button is clicked on a workflow whose `status` is `"approved"` and the user confirms
- **THEN** `store.approvalStatus(record.id, { status: "pending" })` is called and the status badge reverts to yellow

### Requirement: Send approval mail to a designated approver

The system SHALL allow sending an email invitation to an approver for a `pending` workflow via `POST /approval-workflows/:id/send-approval-mail`. The payload MUST include `approver_user_id` and MAY include a non-empty `description`.

#### Scenario: Mail button only visible for pending workflows

- **WHEN** a workflow's `status` is `"approved"`
- **THEN** the mail button is NOT rendered (the `v-if` condition `canEditStep && record.status === 'pending'` is false)

#### Scenario: Successful mail dispatch

- **WHEN** the user selects an approver user and submits the send-mail form
- **THEN** `store.sendApprovalMail(id, { approver_user_id, description })` is called, description is trimmed and omitted if blank, a success notification fires, and the list reloads

### Requirement: Token-based email approval (unauthenticated)

The system SHALL expose a public page (`/approve-by-token`) that reads `token` and `approval_workflow_id` from query parameters and posts them to `POST /approval-workflows/approve-by-token` without an Authorization header. On success the page shows a confirmation animation; on error it maps HTTP status codes to typed error messages and does NOT redirect on failure.

#### Scenario: Valid token results in approval confirmation

- **WHEN** the page mounts with valid `?token=...&approval_workflow_id=...` query params and the API returns success
- **THEN** `state` transitions to `"success"`, `workflowName` is set from the response, and a 5-second countdown auto-redirects to `/login`

#### Scenario: Expired or invalid token

- **WHEN** the API returns `401`
- **THEN** `state` transitions to `"error"` and `errorMessage` is set to the `approve_by_token.error.expired` i18n key

#### Scenario: Already-approved conflict

- **WHEN** the API returns `409`
- **THEN** `state` transitions to `"error"` with message key `approve_by_token.error.already_approved`

### Requirement: Permission-gated action buttons

The system SHALL evaluate `hasPermission` against the verbs `create-approval-workflow`, `update-approval-workflow`, `read-approval-workflow-step`, and `delete-approval-workflow`. Super-admins and admins are explicitly excluded from all these buttons (`!isSuperAdmin.value && !isAdmin.value`).

#### Scenario: Standard user with all permissions

- **WHEN** a non-admin user has all four permissions
- **THEN** create, edit, view-step, delete, and mail buttons are all rendered in the table

#### Scenario: Super admin exclusion

- **WHEN** `isSuperAdmin.value` is true
- **THEN** `canCreateStep`, `canEditStep`, `canViewStep`, and `canDeleteStep` are all false and no action buttons render
