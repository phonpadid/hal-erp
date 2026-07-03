# Product Management

> Canonical spec — describes what the **product** capability currently DOES. Source of truth for listing, creating, updating, soft-deleting, and restoring products, including their product-type and unit relationships.

## Purpose

Maintain the product catalogue of the ERP. A product has a `name`, `description`, a `status`, a required `product_type_id` (classifying it under a product type), and an optional `unit_id` (with an embedded `UnitEntity` when the API returns it). Products are managed through a single paginated list view with inline create/edit/delete and support soft-delete, restore, and several lookup queries (by name, by product type, by unit).

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/product/ProductListView.vue` |
| Component | `src/modules/presentation/Admin/components/product/FormProduct.vue` |
| Validation | `src/modules/presentation/Admin/views/product/validation/product.validation.ts` |
| Store | `src/modules/presentation/Admin/stores/product.store.ts` |
| Service (impl) | `src/modules/application/services/product.service.ts` |
| Service (port) | `src/modules/application/ports/input/product.service.ts` |
| Use cases | `src/modules/application/useCases/product/{create,get,update,delete,restore}-product.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-product.repository.ts` (mock: `mock-product.repository.ts`) |
| Repository (interface) | `src/modules/domain/repository/product.repository.ts` |
| Entity | `src/modules/domain/entities/product.entity.ts` |
| DTO | `src/modules/application/dtos/product.dto.ts` |
| Interface | `src/modules/interfaces/product.interface.ts` |
| Route | `src/modules/presentation/Admin/router/productRoutes.ts` |

API base path: `/products`. Endpoints: `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, `POST /products/:id/restore`. Lookups reuse `GET /products?name=&limit=5`, `GET /products?product_type_id=`, and `GET /products?unit_id=`.

## ADDED Requirements

### Requirement: List products with pagination and search

The system SHALL fetch products from `GET /products`, passing `page`, `limit`, `search`, `sort_by`, `sortDirection`, `include_deleted`, and an optional `company_id`. Each row MUST be mapped to a `ProductEntity` and pagination exposed as `{ page, limit, total, totalPages }` (read from the top-level `response.data.pagination`).

#### Scenario: Fetch list

- **WHEN** the list view loads
- **THEN** the repository calls `GET /products` with the pagination params and returns mapped `ProductEntity[]` with `totalPages` from `pagination.total_pages`

### Requirement: Company-scoped product listing

`GET /products` is auto-scoped by the caller's company on the server. The client SHALL forward an optional `company_id` (from `PaginationParams.company_id`) on the list query so that an admin/super-admin can view a chosen company's catalogue; when omitted, axios drops the param and the server applies its default scope. `getProductById` (get one) is NOT company-scoped and MUST stay unchanged.

#### Scenario: Admin filters by company

- **WHEN** `findAll` is called with `params.company_id` set
- **THEN** the repository sends `GET /products?company_id=<id>` and returns that company's assigned products

#### Scenario: Non-admin auto-scope

- **WHEN** `findAll` is called without `company_id`
- **THEN** the repository omits the `company_id` query param and the server returns only the caller's company's `active` products (empty when the company has no assignments)

### Requirement: Create a product

The system SHALL create a product by sending a `CreateProductDTO` (`name`, `description`, `product_type_id`, optional `unit_id`) to `POST /products` and mapping `response.data.data` to a `ProductEntity` (defaulting `status` to `"active"`).

#### Scenario: Successful create

- **WHEN** a valid product is submitted
- **THEN** the repository posts the DTO and returns the created `ProductEntity`

### Requirement: Product form validation

The create/edit form SHALL require `name` (2–200 chars), a `product_type_id` that is a number ≥ 1, and (when provided) a `description` of 5–1000 chars. The `description` itself is optional.

#### Scenario: Missing product type

- **WHEN** the user submits without selecting a product type
- **THEN** validation blocks submission with the `productTypeRequired` message; no request is made

#### Scenario: Name out of range

- **WHEN** the name is shorter than 2 or longer than 200 characters
- **THEN** validation blocks submission with the corresponding message

### Requirement: Product-type relationship

Every product SHALL carry a required numeric `product_type_id` linking it to a product type. The system SHALL support listing all non-deleted products for a given product type via `GET /products?product_type_id=`.

#### Scenario: Products for a product type

- **WHEN** `findByProductTypeId(typeId)` is called
- **THEN** the repository requests `GET /products?product_type_id=<typeId>` and returns only products whose `deleted_at` is null/undefined, mapped to `ProductEntity[]` (empty array on error)

### Requirement: Unit relationship

A product MAY reference a unit via `unit_id` and the API MAY embed a `unit` object, which the repository maps into a `UnitEntity`. The system SHALL support listing non-deleted products for a unit via `GET /products?unit_id=`.

#### Scenario: Embedded unit mapping

- **WHEN** the API returns a product with a nested `unit`
- **THEN** the repository constructs a `UnitEntity` from it and the product exposes it via `getUnit()`; `getUnitId()` returns the `unit_id`

### Requirement: Update a product

The system SHALL update a product by sending an `UpdateProductDTO` (partial `name`, `description`, `product_type_id`, `unit_id`, `status`) to `PUT /products/:id` and returning the mapped entity.

#### Scenario: Successful update

- **WHEN** `updateProduct(id, dto)` resolves
- **THEN** the repository PUTs to `/products/:id` and returns the updated `ProductEntity`

### Requirement: Soft-delete and restore a product

The system SHALL delete a product via `DELETE /products/:id` (returning `true`) and restore it via `POST /products/:id/restore` (returning `true`).

#### Scenario: Delete then restore

- **WHEN** `deleteProduct(id)` is called and later `restoreProduct(id)`
- **THEN** the repository sends `DELETE /products/:id` then `POST /products/:id/restore`, each returning `true`

### Requirement: Find a product by name

The system SHALL support lookup by exact name via `GET /products?name=&limit=5`, returning the first non-deleted match or `null`.

#### Scenario: Name match

- **WHEN** `findByName(name)` is called
- **THEN** the repository returns a `ProductEntity` only for an entry whose `name` matches and whose `deleted_at` is null/undefined, otherwise `null`

### Requirement: Product entity invariants

The `ProductEntity` SHALL hold private fields including `product_type_id` (number), `unit_id` (string|null), an optional `unit` `UnitEntity`, and `status`; format dates with `formatDate()`; expose `isDeleted()`; and provide `delete()`/`restore()` plus per-field `updateX()` mutators and a static `create()` factory (default `status` `"active"`). IDs are carried as strings (coerced via `id?.toString()`).

#### Scenario: Soft-delete flag

- **WHEN** an entity is constructed with non-null `deleted_at`
- **THEN** `isDeleted()` returns `true`

> NOTE: A `mock-product.repository.ts` exists alongside the API repository. The entity carries `unit_id` as a string while `product.interface.ts` types it as a number — keep the entity-string / interface-number split when editing. The route has no separate create/edit pages and no `permission` meta (auth-gated only).
