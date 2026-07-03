# Category Management

> Canonical spec — describes what the **category** capability currently DOES. Source of truth for listing, creating, updating, soft-deleting, and restoring product categories.

## Purpose

Maintain the catalog of categories (a single `name` field) used to classify items across the ERP. The capability supports paginated/searchable listing, JSON create/update, and soft-delete with restore. It is structured with explicit use cases per operation.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/category/CategoryListView.vue` |
| Column / Validation | `src/modules/presentation/Admin/views/category/column.ts`, `src/modules/presentation/Admin/views/category/validation/category.vallidate.ts` |
| Store | `src/modules/presentation/Admin/stores/category.store.ts` |
| Service | `src/modules/application/services/category.service.ts` |
| Use cases | `src/modules/application/useCases/category/{create,get,update,delete,restore}-category.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-category.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/category.repository.ts` |
| Entity | `src/modules/domain/entities/categories.entity.ts` |
| DTO / Interface | `src/modules/application/dtos/category.dto.ts`, `src/modules/interfaces/category.interface.ts` |
| Route | `src/modules/presentation/Admin/router/categoryRoutes.ts` |

API base path: `/categories`. Endpoints: `GET /categories` (list + `findByName`), `GET /categories/{id}`, `POST /categories` (JSON), `PUT /categories/{id}` (JSON), `DELETE /categories/{id}`, `POST /categories/{id}/restore`.

## ADDED Requirements

### Requirement: List categories with pagination and search

The system SHALL fetch categories from `GET /categories` passing `page`, `limit`, `search`, `sort_by`, `sortDirection`, and `include_deleted`, then map each record to a `CategoryEntity` and normalize the server pagination (`total`, `page`, `limit`, `total_pages`).

#### Scenario: Load list

- **WHEN** the list view loads and the service calls `getAllCategories(params)`
- **THEN** the repository returns mapped `CategoryEntity[]` plus pagination metadata

### Requirement: Create a category

The system SHALL create a category by POSTing the `CreateCategoryDTO` (`{ name }`) as JSON to `POST /categories` and mapping the response to a `CategoryEntity`.

#### Scenario: Create succeeds

- **WHEN** the user submits a valid name
- **THEN** the create use case calls the repository, which posts JSON to `/categories` and returns the new `CategoryEntity`

### Requirement: Form validation rules

The category form SHALL require `name` to be present and between 2 and 100 characters.

#### Scenario: Empty name

- **WHEN** the user submits with no `name`
- **THEN** the form shows `categories.validation.nameRequired` and blocks submission

#### Scenario: Name too short

- **WHEN** `name` is shorter than 2 characters
- **THEN** the form shows `categories.validation.nameMin`

### Requirement: Update a category

The system SHALL update a category by PUTting the `UpdateCategoryDTO` as JSON to `PUT /categories/{id}`.

#### Scenario: Update name

- **WHEN** the user edits a category and submits
- **THEN** the update use case calls the repository, which PUTs JSON to `/categories/{id}` and returns the updated entity

### Requirement: Soft-delete a category with guard

The delete use case SHALL load the category first and throw if it does not exist (`Category with id {id} not found`) or is already deleted (`Category with id {id} is already deleted`) before calling `DELETE /categories/{id}`.

#### Scenario: Delete active category

- **WHEN** deleting an existing, non-deleted category
- **THEN** the use case calls the repository delete and resolves `true`

#### Scenario: Delete already-deleted category

- **WHEN** the targeted category's `isDeleted()` is true
- **THEN** the use case throws and no DELETE request is made

### Requirement: Restore a deleted category with guard

The restore use case SHALL load the category first and throw if it does not exist or is NOT deleted (`Category with id {id} is not deleted`) before calling `POST /categories/{id}/restore`.

#### Scenario: Restore a deleted category

- **WHEN** restoring a category whose `isDeleted()` is true
- **THEN** the use case calls `POST /categories/{id}/restore` and resolves `true`

#### Scenario: Restore a non-deleted category

- **WHEN** the targeted category is not deleted
- **THEN** the use case throws `Category with id {id} is not deleted`

### Requirement: Entity normalization

The repository SHALL coerce the server `id` to a string (`category.id?.toString() ?? ""`) and the `CategoryEntity` constructor MUST format dates via `formatDate()`. `isDeleted()` returns true when `deletedAt !== null`.

> PITFALL: `findByName` filters client-side for an exact non-deleted match; on any error it logs and returns `null` rather than throwing.

#### Scenario: Map API record

- **WHEN** `toDomainModel` receives an API category
- **THEN** it constructs a `CategoryEntity` with `id.toString()`, `name`, formatted dates, and `deleted_at ?? null`
