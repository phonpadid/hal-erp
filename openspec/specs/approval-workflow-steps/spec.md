# Approval Workflow Steps

> Canonical spec — describes what the **approval-workflow-steps** capability currently DOES. Source of truth for managing the ordered set of steps that make up an approval workflow definition.

## Purpose

An approval workflow step is a single node in a workflow template. Each step is assigned a `step_number` (determines execution order), a `step_name`, an approver `type` (`department_head`, `department`, `specific_user`, or `condition`), a bound `user_id` or `department_id`, and boolean flags for `requires_file` and `is_otp`. Steps are listed under a parent workflow via `/approval-workflow-steps/approval-workflow-id/:id`. The step list supports drag-and-drop reordering that calls a dedicated reorder endpoint.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/approval-workflow-steps/ApprovalWorkflowStepView.vue` |
| Column definitions | `src/modules/presentation/Admin/views/approval-workflow-steps/column.ts` |
| Form validation | `src/modules/presentation/Admin/views/approval-workflow-steps/validation/approval-workflow-step.validate.ts` |
| Store | `src/modules/presentation/Admin/stores/approval-workflow-step.store.ts` |
| Service (impl) | `src/modules/application/services/approval-workflow-step.service.ts` |
| Service (port) | `src/modules/application/ports/input/approval-workflow-step.service.ts` |
| Use cases | `src/modules/application/useCases/approval-flows-step/` (create, get-all, get-one, update-department, delete) |
| Repository (interface) | `src/modules/domain/repository/approval-workflow-step.repository.ts` |
| Repository (impl) | `src/modules/infrastructure/api-approval-workflow-step.repository.ts` |
| Entity | `src/modules/domain/entities/approval-workflows-step.entity.ts` |
| DTO | `src/modules/application/dtos/approval-workflow-step.dto.ts` |
| Interface (API model) | `src/modules/interfaces/approval-workflow-step.interface.ts` |
| Route | `src/modules/presentation/Admin/router/approval-workflow-step.routers.ts` |
| i18n | `src/common/locales/{en,la,cn}/approval-workflow-step.json` |

API base path: `/approval-workflow-steps`. Endpoints:
- `POST /approval-workflow-steps/:workflowId` — create step under workflow
- `GET /approval-workflow-steps/approval-workflow-id/:id` — list steps for a workflow (params: `page`, `limit`, `sort_order=ASC`, `search`)
- `GET /approval-workflow-steps/work-flow-step-id/:id` — find step by ID
- `PUT /approval-workflow-steps/:id` — update step
- `DELETE /approval-workflow-steps/:id` — soft-delete step
- `PUT /approval-workflow-steps/order-by/:workflowId` — reorder steps by submitting `{ ids: number[] }` in desired order

## ADDED Requirements

### Requirement: List steps for a parent workflow, sorted ascending by step_number

The system SHALL fetch the steps for a given workflow ID (passed as route param `:id`) via `GET /approval-workflow-steps/approval-workflow-id/:id` with `sort_order: 'ASC'`. The store MUST update `approval_workflow_steps`, `pagination`, and render them in the table.

#### Scenario: Steps load on mount

- **WHEN** `ApprovalWorkflowStepView` mounts with route param `id`
- **THEN** `apvWorkflowStepStore.fetchApprovalWorkflowSteps(id, { page: 1, limit: 10, sort_order: 'ASC' })` is called and the table shows the returned steps in ascending step_number order

#### Scenario: Search re-fetches from page 1

- **WHEN** the user enters a search term and presses enter
- **THEN** `fetchApprovalWorkflowSteps(id, { page: 1, limit, search })` is called with `page` reset to 1

### Requirement: Create a new step under the parent workflow

The system SHALL allow creating a new step by posting to `POST /approval-workflow-steps/:workflowId`. The workflow ID comes from the current route param. The new entity is prepended to `approval_workflow_steps` in the store.

#### Scenario: Create modal shows blank form

- **WHEN** the user clicks the create button (`canCreateStep` is true)
- **THEN** `resetForm()` is called, `isEdit` is set to false, and `modalVisible` is set to true with all fields blank

#### Scenario: Successful step creation

- **WHEN** the user fills the form (step_number, step_name, type, plus conditional department_id or user_id) and submits
- **THEN** `apvWorkflowStepStore.create(Number(workflowId), { department_id, step_name, step_number, type, user_id, requires_file, is_otp })` is called, a success notification fires, `modalVisible` is closed, and the step list reloads

### Requirement: Approver type conditions user/department field visibility

The system SHALL conditionally render the `department_id` field only when `formState.type === 'department'` and the `user_id` field only when `formState.type === 'specific_user'`. Types `department_head` and `condition` do not require either field.

#### Scenario: Type is 'specific_user'

- **WHEN** the user selects `specific_user` from the type dropdown
- **THEN** the user select field is rendered (`v-if="formState.type === 'specific_user'"`) and the department field is hidden

#### Scenario: Type is 'department'

- **WHEN** the user selects `department` from the type dropdown
- **THEN** the department select field is rendered and the user field is hidden

### Requirement: Update an existing step

The system SHALL allow editing any step field through the shared create/edit modal. The store's `update` action calls `PUT /approval-workflow-steps/:id` and replaces the entity in `approval_workflow_steps` at the matching index.

#### Scenario: Edit modal pre-populates from record

- **WHEN** the edit button is clicked on a step row
- **THEN** `showEditModal(record)` sets `isEdit = true`, populates `formState` from the record's current values (including `requires_file` and `is_otp` as stringified booleans), and opens the modal

#### Scenario: Successful update

- **WHEN** the user confirms the edit modal
- **THEN** `apvWorkflowStepStore.update(id, updatedDTO)` is called, a success notification fires, and the list reloads

### Requirement: Delete a step

The system SHALL soft-delete a step via `DELETE /approval-workflow-steps/:id`. The store replaces the local entity with a new instance carrying the current ISO timestamp as `updatedAt` and `deletedAt`.

#### Scenario: Delete confirmation and execution

- **WHEN** the user confirms the delete modal
- **THEN** `apvWorkflowStepStore.remove(id)` is called, the local entity is soft-marked deleted, a success notification fires, and the list reloads

### Requirement: Drag-and-drop reordering of steps

The system SHALL allow authorized users to drag rows within the step table to reorder them. On drop, the store calls `reorderSteps(workflowId, ids)` which posts the new order to `PUT /approval-workflow-steps/order-by/:workflowId`. Drag is gated by `canEditStep`.

#### Scenario: Successful reorder

- **WHEN** a user with `canEditStep = true` drags a step row and drops it at a new index
- **THEN** the array is reordered in memory, `apvWorkflowStepStore.reorderSteps(id, reorderedIds)` is called with all step IDs in their new order, a success notification fires, and the list reloads from the API

#### Scenario: Drag blocked for unauthorized user

- **WHEN** `canEditStep` is false
- **THEN** `handleDragStart` calls `event.preventDefault()` and the drag is cancelled; `handleDrop` also exits early without calling reorder

### Requirement: `requires_file` and `is_otp` stored and displayed as string booleans

The system SHALL store `requires_file` and `is_otp` as strings `"true"` or `"false"` on the entity. The repository's `toApiModel` converts them with `Boolean(value === "true")` before sending to the API. The view renders them in the table via a color-coded display: green for `"true"`, red for `"false"`.

#### Scenario: OTP step indicator in table

- **WHEN** a step has `is_otp === "true"`
- **THEN** the is_otp column shows the translated "yes" label in green text

#### Scenario: Repository conversion to boolean

- **WHEN** `toApiModel` is called on a step entity
- **THEN** `is_otp` is sent as `Boolean(entity.getIsOtp() === "true")` (a native boolean, not a string)

### Requirement: Step list is scoped to the parent workflow route parameter

The system SHALL use the `id` route parameter from `/approval-workflows-step/:id` as the workflow ID for all API calls. The back-button navigates `router.back()`.

#### Scenario: Back navigation

- **WHEN** the user clicks the back button
- **THEN** `router.back()` is called, returning to the previous history entry (typically the workflow list)
