# Unit Management

> Canonical spec — describes what the **unit** capability currently DOES. Source of truth for listing, creating, updating, soft-deleting, and restoring measurement units.

## Purpose

Maintain the catalog of measurement units (a single `name` field) referenced by products and purchase items. The capability supports paginated/searchable listing, JSON create/update, and soft-delete with restore, structured with explicit use cases per operation.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/unit/UnitListView.vue` |
| Validation | `src/modules/presentation/Admin/views/unit/validation/*.ts` |
| Store | `src/modules/presentation/Admin/stores/unit.store.ts` |
| Service | `src/modules/application/services/unit.service.ts` |
| Use cases | `src/modules/application/useCases/unit/{create,get,update,delete,restore}-unit.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-unit.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/unit.repository.ts` |
| Entity | `src/modules/domain/entities/unit.entity.ts` |
| DTO / Interface | `src/modules/application/dtos/unit.dto.ts`, `src/modules/interfaces/unit.interface.ts` |
| Route | `src/modules/presentation/Admin/router/unitRoutes.ts` |

API base path: `/units`. Endpoints: `GET /units` (list + `findByName`), `GET /units/{id}`, `POST /units` (JSON), `PUT /units/{id}` (JSON), `DELETE /units/{id}`, `POST /units/{id}/restore`.

## ADDED Requirements

### Requirement: List units with pagination and search

The system SHALL fetch units from `GET /units` passing `page`, `limit`, `search`, `sort_by`, `sortDirection`, and `include_deleted`, then map each record to a `UnitEntity` and normalize the server pagination (`total`, `page`, `limit`, `total_pages`).

#### Scenario: Load list

- **WHEN** the list view loads and the service calls `getAllUnits(params)`
- **THEN** the repository returns mapped `UnitEntity[]` plus pagination metadata

### Requirement: Create a unit

The system SHALL create a unit by POSTing the `CreateUnitDTO` (`{ name }`) as JSON to `POST /units` and mapping the response to a `UnitEntity`.

#### Scenario: Create succeeds

- **WHEN** the user submits a valid name
- **THEN** the create use case calls the repository, which posts JSON to `/units` and returns the new `UnitEntity`

### Requirement: Form validation rules

The unit form SHALL require `name` to be present and between 2 and 100 characters.

#### Scenario: Empty name

- **WHEN** the user submits with no `name`
- **THEN** the form shows `units.validation.nameRequired` and blocks submission

#### Scenario: Name too long

- **WHEN** `name` exceeds 100 characters
- **THEN** the form shows `units.validation.nameMax`

### Requirement: Update a unit

The system SHALL update a unit by PUTting the `UpdateUnitDTO` as JSON to `PUT /units/{id}`.

#### Scenario: Update name

- **WHEN** the user edits a unit and submits
- **THEN** the update use case calls the repository, which PUTs JSON to `/units/{id}` and returns the updated entity

### Requirement: Soft-delete a unit with existence guard

The delete use case SHALL load the unit first and throw `Unit with id {id} not found` if it does not exist, then call `DELETE /units/{id}`.

#### Scenario: Delete existing unit

- **WHEN** deleting an existing unit
- **THEN** the use case calls the repository delete and resolves `true`

#### Scenario: Delete missing unit

- **WHEN** the targeted unit does not exist
- **THEN** the use case throws `Unit with id {id} not found` and no DELETE request is made

### Requirement: Restore a deleted unit

The repository SHALL restore a soft-deleted unit via `POST /units/{id}/restore`.

#### Scenario: Restore

- **WHEN** the restore use case runs for a deleted unit
- **THEN** the repository posts to `/units/{id}/restore` and resolves `true`

### Requirement: Entity normalization

The repository SHALL coerce the server `id` to a string (`unit.id?.toString() ?? ""`) and the `UnitEntity` constructor MUST format dates via `formatDate()`. `isDeleted()` returns true when `deletedAt !== null`.

> NOTE: `UnitServiceImpl` and `DeleteUnitUseCase` are wired with a `ProductRepository` dependency, but the delete path currently only checks the unit's existence — it does not yet block deletion of units in use.

#### Scenario: Map API record

- **WHEN** `toDomainModel` receives an API unit
- **THEN** it constructs a `UnitEntity` with `id.toString()`, `name`, formatted dates, and `deleted_at ?? null`
