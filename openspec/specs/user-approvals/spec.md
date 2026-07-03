# User Approvals

> Canonical spec — describes what the **user-approvals** capability currently DOES. Source of truth for listing, creating, updating, and deleting user-approval records — the cross-document view of pending and historical approvals for the authenticated user.

## Purpose

A user-approval record (`UserApprovalEntity`) is a denormalized summary that links a document to the approval workflow instance assigned to it and carries a top-level `status_id` (Pending / Approved / Rejected), a human-readable `status_name`, a `doc_title`, and the workflow name. The `/user-approvals` view is the approval inbox — it shows every document approval assignment for the logged-in user, regardless of document type. CRUD operations exist but the primary use-case in the running system is read (`GET /user-approval`, `GET /user-approval/:id`).

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/user-approvals/UserApprovalView.vue` |
| Column definitions | `src/modules/presentation/Admin/views/user-approvals/column.ts` |
| Form validation | `src/modules/presentation/Admin/views/user-approvals/validation/user-approval.validate.ts` |
| Store | `src/modules/presentation/Admin/stores/user-approval.store.ts` |
| Service (impl) | `src/modules/application/services/user-approvals/department.service.ts` |
| Service (port) | `src/modules/application/ports/input/user-approvals/user-approval.service.ts` |
| Use cases | `src/modules/application/useCases/user-approvals/` (create, get-all, get-one, update, delete) |
| Repository (interface) | `src/modules/domain/repository/user-approvals/user-approval.repository.ts` |
| Repository (impl) | `src/modules/infrastructure/user-approvals/api-user-approval.repository.ts` |
| Entity | `src/modules/domain/entities/user-approvals/user-approval.entity.ts` |
| DTO | `src/modules/application/dtos/user-approvals/user-approval.dto.ts` |
| Interface (API model) | `src/modules/interfaces/user-approvals/user-approval.interface.ts` |
| Route | `src/modules/presentation/Admin/router/user-approval.ts` |
| i18n | `src/common/locales/{en,la,cn}/user_approval.json` |

API base path: `/user-approval`. Endpoints:
- `POST /user-approval` — create a user-approval record
- `GET /user-approval` — paginated list (params: `page`, `limit`, `search`, `includeDeleted`)
- `GET /user-approval/:id` — get single record
- `PUT /department/:id` — update (NOTE: URL bug — uses `/department/` not `/user-approval/`)
- `DELETE /department/:id` — delete (NOTE: same URL bug)

## ADDED Requirements

### Requirement: List user-approval records with pagination and search

The system SHALL fetch a paginated list of user-approval records via `GET /user-approval` and populate `userApproval` in the store. The store MUST update `pagination.page`, `pagination.limit`, `pagination.total`, and `pagination.totalPages` from the response. All four pagination fields default to zero/one when the API returns null.

#### Scenario: List loads on mount

- **WHEN** `UserApprovalView` mounts
- **THEN** `userApprovalStore.fetchUserApproval({ page: 1, limit: 10 })` is called and the table is populated with the returned `UserApprovalEntity` instances

#### Scenario: Search narrows results

- **WHEN** the user types a search term and submits
- **THEN** `userApprovalStore.searchByName(name, { page: 1, limit })` is called, which calls `getAll({ ...params, search: name })` and updates `userApproval` with the filtered results

### Requirement: Fetch a single user-approval record by ID

The system SHALL retrieve a single user-approval record via `GET /user-approval/:id` and set `currentUserApproval` in the store. A 404 response returns `null` without throwing.

#### Scenario: Successful fetch by ID

- **WHEN** `userApprovalStore.fetchUserApprovalById("42")` is called and the API returns data
- **THEN** `currentUserApproval.value` is set to the mapped `UserApprovalEntity` with all fields populated

#### Scenario: Not-found returns null

- **WHEN** the API returns HTTP 404 for `GET /user-approval/:id`
- **THEN** the repository returns `null`, the store sets `currentUserApproval.value = null`, and no error is thrown

### Requirement: Create a new user-approval record

The system SHALL create a user-approval record via `POST /user-approval` with `{ document_id, approval_workflow_id, status_id }`. On success the new entity is prepended to `userApproval` in the store.

#### Scenario: Successful create

- **WHEN** `userApprovalStore.createUserApproval({ document_id: "101", approval_workflow_id: "7", status_id: "1" })` is called and the API returns the created record
- **THEN** the mapped entity is prepended to `userApproval.value` and the store's `loading` flag returns to `false`

#### Scenario: Create failure re-throws

- **WHEN** the API returns an error during create
- **THEN** the store sets `error.value` to the caught error and re-throws it so the caller can handle it

### Requirement: Update a user-approval record

The system SHALL update a user-approval record via `PUT /department/:id` (note: the infrastructure URL is `/department/`, not `/user-approval/` — this is a known path inconsistency). The updated entity replaces the matching entry in `userApproval` and also updates `currentUserApproval` if it matches.

#### Scenario: Successful update

- **WHEN** `userApprovalStore.updateUserApproval("42", { id: "42", document_id: "101", approval_workflow_id: "7", status_id: "2" })` is called
- **THEN** `PUT /department/42` is called, the returned entity replaces `userApproval.value[matchingIndex]`, and if `currentUserApproval.value.getId() === "42"` it is also updated

#### Scenario: Update failure re-throws

- **WHEN** the API returns an error during update
- **THEN** `error.value` is set and the error is re-thrown

### Requirement: Delete a user-approval record

The system SHALL delete a user-approval record via `DELETE /department/:id` (same path inconsistency as update). After deletion the store replaces the local entity with a soft-deleted copy carrying the current timestamp. The `UserApprovalEntity.delete()` method is intentionally empty — the timestamp copy is constructed manually in the store's `deleteUserApproval` action.

#### Scenario: Successful delete

- **WHEN** `userApprovalStore.deleteUserApproval("42")` is called and the API returns success
- **THEN** `userApproval.value[matchingIndex]` is replaced with a new `UserApprovalEntity` constructed from the existing entity's fields plus `new Date().toISOString()` as the second-to-last and third-to-last constructor arguments (updatedAt and deletedAt positions)

#### Scenario: Delete failure re-throws

- **WHEN** the API returns an error during delete
- **THEN** `error.value` is set and the error is re-thrown; the local array is NOT modified

### Requirement: `UserApprovalEntity` carries denormalized display fields

The entity MUST store `doc_title`, `status_name`, and `approval_workflow_name` as nullable strings for display in the inbox table without requiring additional API calls. The repository's `toDomainModel` MUST map these from the API response with `|| ""` defaults to prevent null renders.

#### Scenario: Inbox table shows doc_title and workflow name

- **WHEN** the API returns a record with `doc_title: "PR-2024-001"` and `approval_workflow_name: "IT Approval Flow"`
- **THEN** `entity.getDocumentName()` returns `"IT Approval Flow"` (NOTE: `getDocumentName()` is actually mapped from `approval_workflow_name` in `toDomainModel` — the argument order is swapped from the constructor signature; see infrastructure mapping) and the table row shows both values

#### Scenario: Missing optional fields default to empty string

- **WHEN** the API omits `doc_title` and `status_name`
- **THEN** the repository maps them as `""` via `data.doc_title || ""` and no null appears in the UI

### Requirement: `status_id` is stored and compared as a string on `UserApprovalEntity`

The `UserApprovalEntity` stores `status_id` as `string` (unlike the per-step `status_id` on `approval_step` which is an integer). The API model interface declares `status_id?: string`. Callers MUST NOT compare `userApproval.getStatusId()` to integers; they MUST compare to string values such as `"1"`, `"2"`, or `"3"`.

#### Scenario: Status comparison in view

- **WHEN** code checks whether a user-approval record is pending
- **THEN** it MUST use `entity.getStatusId() === "1"` (string), not `=== 1` (integer)

### Requirement: No permission check on user-approval route

The `/user-approvals` route carries only `requiredAuth: true` in its meta. No `permission` key is configured. Any authenticated user can access the inbox.

#### Scenario: Authenticated user accesses user-approval inbox

- **WHEN** an authenticated user navigates to `/user-approvals`
- **THEN** the `authGuard` passes, no `permissionGuard` runs, and `UserApprovalView` renders

### Requirement: `UserApprovalDTO` exposes optional `approval_step` and `document_status` for downstream use

The DTO interface (`UserApprovalDTO`) declares optional fields `approval_step?: ApprovalStep[]` and `document_status?: DocumentStatus`. These mirror the shape embedded in PR/PO `user_approval` objects but are not persisted in `UserApprovalEntity`. They exist so the DTO can be used in contexts (e.g. PR detail) where the backend embeds step data inline.

#### Scenario: DTO used in PR context includes step array

- **WHEN** the backend embeds `approval_step` in the user-approval payload for a PR detail request
- **THEN** the consuming code can read `dto.approval_step` to iterate step statuses, even though `UserApprovalEntity` has no such property
