# Product Type Management

> Canonical spec — describes what the **product-type** capability currently DOES. Source of truth for listing, creating, updating, soft-deleting, and restoring product types (the classification that products belong to).

## Purpose

Maintain the catalogue of product types used to classify products. A product type has a `name` and an optional `category_id` (linking it to a higher-level category), plus lifecycle timestamps. It is managed through a single paginated list view with inline create/edit/delete, and supports soft-delete, restore, and name lookup for duplicate detection.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/product-type/ProductTypeListView.vue` |
| Component | `src/modules/presentation/Admin/components/product-type/FormProductType.vue` |
| Validation | `src/modules/presentation/Admin/views/product-type/validation/product-type.vallidate.ts` |
| Store | `src/modules/presentation/Admin/stores/product-type.store.ts` |
| Service (impl) | `src/modules/application/services/product-type.service.ts` |
| Service (port) | `src/modules/application/ports/input/product-type.service.ts` |
| Use cases | `src/modules/application/useCases/product-type/{create,get,get-all,update,delete,restore}-product-type.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-product-type.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/product-type.repository.ts` |
| Entity | `src/modules/domain/entities/product-types.entity.ts` |
| DTO | `src/modules/application/dtos/product-type.dto.ts` |
| Route | `src/modules/presentation/Admin/router/product-typeRoutes.ts` |

API base path: `/product-types`. Endpoints: `GET /product-types`, `GET /product-types/:id`, `POST /product-types`, `PUT /product-types/:id`, `DELETE /product-types/:id`, `POST /product-types/:id/restore`. Name lookup reuses `GET /product-types?name=&limit=5`.

## ADDED Requirements

### Requirement: List product types with pagination and search

The system SHALL fetch product types from `GET /product-types`, passing `page`, `limit`, `search`, `sort_by`, `sortDirection`, and `include_deleted`. Each row MUST be mapped to a `ProductTypeEntity` and pagination exposed as `{ page, limit, total, totalPages }`.

#### Scenario: Fetch list

- **WHEN** the list view loads
- **THEN** the repository calls `GET /product-types` with the pagination params and returns mapped `ProductTypeEntity[]` with `totalPages` from `pagination.total_pages`

### Requirement: Create a product type

The system SHALL create a product type by sending `{ name, category_id }` to `POST /product-types`. The repository MUST normalise the payload to exactly `{ name, category_id }` before posting.

#### Scenario: Successful create

- **WHEN** a valid `CreateProductTypeDTO` (`name`, `category_id`) is submitted
- **THEN** the repository posts `{ name, category_id }` and maps `response.data.data` to a `ProductTypeEntity`

### Requirement: Update a product type

The system SHALL update a product type by sending `{ name, category_id }` to `PUT /product-types/:id`, normalising the payload to those two fields.

#### Scenario: Successful update

- **WHEN** `updateProductType(id, dto)` resolves
- **THEN** the repository PUTs `{ name, category_id }` to `/product-types/:id` and returns the updated entity

### Requirement: Category relationship

A product type MAY reference a category via `category_id` (nullable number). The entity SHALL expose `getCategoryId()` and an `updateCategoryId()` mutator; the DTOs carry `category_id` as `number | null`.

#### Scenario: Product type without a category

- **WHEN** a product type is created or returned with `category_id` null/absent
- **THEN** the entity stores `null` and `getCategoryId()` returns `null`

### Requirement: Soft-delete a product type

The system SHALL delete a product type via `DELETE /product-types/:id`. The `DeleteProductTypeUseCase` MUST first load it, throw if not found, and throw if already deleted.

#### Scenario: Delete an already-deleted product type

- **WHEN** the use case loads a product type whose `isDeleted()` is `true`
- **THEN** it throws `Product type with id <id> is already deleted` and sends no delete request

### Requirement: Restore a soft-deleted product type

The system SHALL restore a product type via `POST /product-types/:id/restore`. The `RestoreProductTypeUseCase` MUST throw if it does not exist or is not currently deleted.

#### Scenario: Restore a deleted product type

- **WHEN** `restoreProductType(id)` is called on a deleted record
- **THEN** the use case validates state then posts to `/product-types/:id/restore` and returns `true`

### Requirement: Find a product type by name

The system SHALL support lookup by exact name via `GET /product-types?name=&limit=5`, returning the first non-deleted match or `null`.

#### Scenario: Name match

- **WHEN** `findByName(name)` is called
- **THEN** the repository returns a `ProductTypeEntity` only for an entry whose `name` matches and whose `deleted_at` is null/undefined, otherwise `null`

### Requirement: Product-type entity invariants

The `ProductTypeEntity` SHALL hold private `id`, `name`, `category_id`, and timestamps, format dates with `formatDate()`, expose `isDeleted()`, and provide `delete()`/`restore()`/`updateName()`/`updateCategoryId()` plus a static `create()` factory. IDs are carried as strings (coerced via `id?.toString()`).

#### Scenario: Soft-delete flag

- **WHEN** an entity is constructed with non-null `deleted_at`
- **THEN** `isDeleted()` returns `true`

> NOTE: The entity file is named `product-types.entity.ts` (plural) while the class is `ProductTypeEntity`; the validation file is `product-type.vallidate.ts` (typo). The route has no separate create/edit pages and no `permission` meta (auth-gated only). The create repository method logs the transformed payload to the console.
