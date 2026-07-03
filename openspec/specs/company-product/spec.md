# Company Product Management

> Canonical spec — describes what the **company-product** capability currently DOES. Source of truth for assigning products from the shared catalogue to a company, listing (company-scoped), updating status, and unassigning (soft-delete). See `openspec/specs/product/api-company-product-vendor.md` for the backend contract.

## Purpose

Each company "selects" (assigns) products from the shared master catalogue via the `company_products` join table (`company_id` + `product_id` + `status`). One master product can be assigned by many companies (many-to-many); a `(company_id, product_id)` pair that is not soft-deleted is unique (no duplicate links). Unassigning is a soft-delete that can be re-assigned later. Managed through a single paginated list view with an assign modal (multi-select), status edit, and unassign confirm.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/company-product/CompanyProductListView.vue` |
| Component | `src/modules/presentation/Admin/components/company-product/FormCompanyProduct.vue` |
| Column | `src/modules/presentation/Admin/views/company-product/column.ts` |
| Store | `src/modules/presentation/Admin/stores/company-product.store.ts` |
| Service | `src/modules/application/services/company-product.service.ts` |
| Repository (impl) | `src/modules/infrastructure/api-company-product.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/company-product.repository.ts` |
| Entity | `src/modules/domain/entities/company-product.entity.ts` |
| DTO | `src/modules/application/dtos/company-product.dto.ts` |
| Interface | `src/modules/interfaces/company-product.interface.ts` |
| Route | `src/modules/presentation/Admin/router/companyProductRoutes.ts` |
| Menu | `src/common/shared/layouts/menu.ts` (`company-product.index`) |
| i18n | `src/common/locales/{en,la,cn}/company_products.json` + `menu-sidebar.company_product` |

API base path: `/company-products`. Endpoints: `GET /company-products`, `GET /company-products/:id`, `POST /company-products`, `PUT /company-products/:id`, `DELETE /company-products/:id`. Route name `company-product.index`; menu permission `read-company-product`; inline permissions `create-company-product` / `update-company-product` / `delete-company-product`.

## ADDED Requirements

### Requirement: List company products with pagination, search and scope

The system SHALL fetch from `GET /company-products`, passing `page`, `limit`, `search`, optional `company_id`, `product_id`, `status`, and `include_deleted`. Listing is company-scoped on the server (admins see all / may filter by `company_id`; non-admins see only their own company). Each row MUST be mapped to a `CompanyProductEntity` and pagination read from `response.data.pagination`.

#### Scenario: Fetch scoped list

- **WHEN** the list view loads
- **THEN** the repository calls `GET /company-products` with the params and returns mapped `CompanyProductEntity[]` with `totalPages` from `pagination.total_pages`

### Requirement: Assign products to a company (array, idempotent)

The system SHALL assign one or more products via `POST /company-products` with `{ product_ids: number[], status?, company_id? }`. Already-linked products are skipped server-side (idempotent); the response returns only the records actually created. The service SHALL reject an empty `product_ids`. `company_id` is honoured only for admin/super-admin and ignored for non-admins (auto-scoped).

#### Scenario: Assign a set of products

- **WHEN** `assignCompanyProducts({ product_ids: [1,2,3] })` is called
- **THEN** the repository posts the payload and returns a `CompanyProductEntity[]` of only the newly created links

#### Scenario: All products already assigned

- **WHEN** every selected product is already linked
- **THEN** the returned array is empty and the view shows the "all skipped" notice

### Requirement: Update a company product status

The system SHALL update an assignment via `PUT /company-products/:id` (primarily `status`) and return the mapped entity. Product and company are fixed once assigned (edit changes status only).

#### Scenario: Toggle status

- **WHEN** `updateCompanyProduct(id, { status: "inactive" })` resolves
- **THEN** the repository PUTs to `/company-products/:id` and returns the updated `CompanyProductEntity`

### Requirement: Unassign (soft-delete) a company product

The system SHALL unassign via `DELETE /company-products/:id` (returning `true`). The service SHALL reject if the record is missing or already unassigned. Re-assigning the same product later is allowed.

#### Scenario: Unassign then re-assign

- **WHEN** `deleteCompanyProduct(id)` is called and later the same product is assigned again
- **THEN** the DELETE returns `true` and a subsequent `POST /company-products` creates a fresh active link

### Requirement: Company product entity invariants

The `CompanyProductEntity` SHALL hold private fields `companyId`, `productId`, `productName`, `companyName` (display), and `status`; format dates with `formatDate()`; expose `isDeleted()`, `delete()`/`restore()`, `updateStatus()`, and a static `create()` factory (default `status` `"active"`). IDs are carried as strings (coerced via `id?.toString()`).

#### Scenario: Soft-delete flag

- **WHEN** an entity is constructed with non-null `deleted_at`
- **THEN** `isDeleted()` returns `true`
