# Position Management

> Canonical spec — describes what the **position** capability currently DOES. Source of truth for listing, creating, updating, soft-deleting, and restoring job/role positions.

## Purpose

Maintain the catalogue of positions (job titles / organisational roles) used elsewhere in the ERP. A position is a minimal record (just a `name` plus lifecycle timestamps) managed through a single paginated list view with inline create/edit/delete. Positions support soft-delete, restore, and lookup by name (used for duplicate checks).

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/position/PositionListView.vue` |
| Component | `src/modules/presentation/Admin/components/position/FormPosition.vue` |
| Validation | `src/modules/presentation/Admin/views/position/validation/position.validate.ts` |
| Store | `src/modules/presentation/Admin/stores/position.store.ts` |
| Service (impl) | `src/modules/application/services/position.service.ts` |
| Service (port) | `src/modules/application/ports/input/position.service.ts` |
| Use cases | `src/modules/application/useCases/position/{create,get,get-all,update,delete,restore}-position.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-position.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/position.repository.ts` |
| Entity | `src/modules/domain/entities/position.entity.ts` |
| DTO | `src/modules/application/dtos/position.dto.ts` |
| Route | `src/modules/presentation/Admin/router/positionRountes.ts` |

API base path: `/positions`. Endpoints: `GET /positions`, `GET /positions/:id`, `POST /positions`, `PUT /positions/:id`, `DELETE /positions/:id`, `POST /positions/:id/restore`. Name lookup reuses `GET /positions?name=&limit=5`.

## ADDED Requirements

### Requirement: List positions with pagination and search

The system SHALL fetch positions from `GET /positions`, passing `page`, `limit`, `search`, `sort_by`, `sortDirection`, and `include_deleted`. Each row MUST be mapped to a `PositionEntity` and pagination exposed as `{ page, limit, total, totalPages }`.

#### Scenario: Fetch list

- **WHEN** the list view loads and requests positions
- **THEN** the repository calls `GET /positions` with the pagination params and returns the mapped `PositionEntity[]` with `totalPages` read from `pagination.total_pages`

### Requirement: Create a position

The system SHALL create a position by sending a `CreatePositionDTO` (`{ name }`) as JSON to `POST /positions` and mapping `response.data.data` to a `PositionEntity`.

#### Scenario: Successful create

- **WHEN** a valid name is submitted
- **THEN** the repository posts `{ name }`, returns the created `PositionEntity`, and the store refreshes the list

### Requirement: Position name validation

The create/edit form SHALL require a non-empty `name` before submitting.

#### Scenario: Empty name blocked

- **WHEN** the user submits with an empty name
- **THEN** the form validation blocks submission and shows the required-field message; no request is made

### Requirement: Update a position

The system SHALL update a position by sending an `UpdatePositionDTO` (`{ name }`) to `PUT /positions/:id` and returning the mapped entity.

#### Scenario: Successful update

- **WHEN** `updatePosition(id, { name })` resolves
- **THEN** the repository PUTs to `/positions/:id` and returns the updated `PositionEntity`

### Requirement: Soft-delete a position

The system SHALL delete a position via `DELETE /positions/:id`, returning `true` on success. The `DeletePositionUseCase` MUST first load the position, throw if it does not exist, and throw if it is already deleted.

#### Scenario: Delete an already-deleted position

- **WHEN** the use case loads a position whose `isDeleted()` is `true`
- **THEN** it throws `Position with id <id> is already deleted` and no delete request is sent

### Requirement: Restore a soft-deleted position

The system SHALL restore a position via `POST /positions/:id/restore`. The `RestorePositionUseCase` MUST throw if the position does not exist or is not currently deleted.

#### Scenario: Restore a deleted position

- **WHEN** `restorePosition(id)` is called on a deleted position
- **THEN** the use case validates state then posts to `/positions/:id/restore` and returns `true`

### Requirement: Find a position by name

The system SHALL support lookup by exact name via `GET /positions?name=&limit=5`, returning the first non-deleted match or `null`.

#### Scenario: Name match

- **WHEN** `getPositionByName(name)` is called
- **THEN** the repository queries by name and returns a `PositionEntity` only for an entry whose `name` matches and whose `deleted_at` is null/undefined, otherwise `null`

### Requirement: Position entity invariants

The `PositionEntity` SHALL hold private `id`/`name` and timestamps, format dates with `formatDate()` in the constructor, expose `isDeleted()`, and provide `delete()`/`restore()`/`updateName()` mutators plus a static `create()` factory. IDs are carried as strings (coerced via `id?.toString()`).

#### Scenario: Soft-delete flag

- **WHEN** an entity is constructed with non-null `deleted_at`
- **THEN** `isDeleted()` returns `true`

> NOTE: The route file is named `positionRountes.ts` (typo) and exports `positionRoutes`. Position has only a single list route (no separate create/edit pages); the route sets no `permission` meta, so it is gated by auth only.
