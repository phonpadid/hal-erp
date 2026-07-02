# Vendor Products (standalone module)

> Canonical spec — describes what the standalone **vendor-products** capability currently DOES. This is the `vendor-products/` module (immutable entity + dedicated store), distinct from the per-vendor product list rendered inside the vendor detail page (see the `vendors` spec). Source of truth for the vendor↔product price catalogue with full pagination, filtering, soft-delete, and restore.

## Purpose

Manage the catalogue that links a vendor to a product at a given price and currency. Each `VendorProductEntity` is immutable: every mutation (`update`, `softDelete`, `restore`) returns a NEW entity instance rather than mutating in place. The module supports listing, filtering by vendor/product, existence checks (to prevent duplicate vendor+product pairs), soft-delete, and restore.

## Implementation Map

| Layer | File |
| ----- | ---- |
| Store | `src/modules/presentation/Admin/stores/vendor-products/vendor-product.store.ts` |
| Component (form) | `src/modules/presentation/Admin/components/vendor-products/modals/CreateVendorProductModal.vue`, `EditVendorProductModal.vue`, `DeleteVendorProductModal.vue` |
| Validation | `src/modules/presentation/Admin/components/vendor-products/validation/vendor-product.validation.ts` |
| Service | `src/modules/application/services/vendor-products/vendor-product.service.ts` |
| Use cases | `src/modules/application/useCases/vendors/vendor_product/{create,update,delete,get-all}-vendor-product.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/vendor-products/api-vendor-product.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/vendor-products/vendor-product.repository.ts` |
| Entity | `src/modules/domain/entities/vendor-products/vendor-product.entity.ts` |
| DTO | `src/modules/application/dtos/vendor-products/vendor-product.dto.ts` |

API base path: `/vendor-products`. Endpoints: `GET /vendor-products` (with `page`, `limit`, `search`, `sort_by`, `sortDirection`, `include_deleted`, optional `vendor_id`, `product_id`), `GET /vendor-products/:id`, `POST /vendor-products`, `PUT /vendor-products/:id`, `DELETE /vendor-products/:id`, `POST /vendor-products/:id/restore`.

> NOTE: This module ships no dedicated route in the router. Its store and modals are consumed from within other views (notably the vendor detail page).

## ADDED Requirements

### Requirement: Paginated vendor-product list with filters

The system SHALL fetch vendor products via `GET /vendor-products` through `useVendorProductStore.fetchVendorProducts`, merging caller params with the store's `currentPage`, `pageSize`, `search`, `selectedVendorId`, and `selectedProductId`. `vendor_id` and `product_id` are only sent when truthy. The store MUST update `vendorProducts`, `total`, `currentPage`, and `pageSize` from the result.

#### Scenario: Fetching with active filters

- **WHEN** `setFilters({ vendorId, productId, search })` has been called and `fetchVendorProducts()` runs
- **THEN** the repository GETs `/vendor-products` with those query params and the store replaces `vendorProducts` with the mapped entities

#### Scenario: Invalid API response shape

- **WHEN** the response lacks `data` or `pagination`
- **THEN** the repository throws `"Invalid response format from API"`, the store stores the message in `error` (exposed via `hasError` / `errorMessage`), and logs it — it does NOT re-throw on fetch

### Requirement: Immutable entity with API mapping

The `VendorProductEntity` SHALL be immutable (all fields `readonly`); `update()`, `softDelete()`, and `restore()` each return a new instance with a refreshed `updated_at`. `fromApiResponse()` MUST tolerate both `vendor.name`/`vendor_name` and `product.name`/`product_name` shapes, coerce `id` to string, parse numeric `price`, and safely parse dates (falling back to `new Date()` on invalid values).

#### Scenario: Updating returns a new instance

- **WHEN** `entity.update({ price })` is called
- **THEN** a new `VendorProductEntity` is returned with the new price and a fresh `updated_at`, leaving the original unchanged

#### Scenario: Mapping a legacy API row

- **WHEN** `fromApiResponse` receives `{ vendor_name, product_name }` without nested objects
- **THEN** it still resolves the display names and produces a valid entity

### Requirement: Create with duplicate prevention

The system SHALL create a vendor product via `POST /vendor-products`. After a successful create the store re-fetches the list. An existence check is available via `checkVendorProductExists(vendorId, productId)` which queries the list filtered by both ids.

#### Scenario: Creating a vendor product

- **WHEN** `createVendorProduct(data)` succeeds
- **THEN** the repository POSTs the payload and the store calls `fetchVendorProducts()` to refresh the list, returning the created entity

#### Scenario: Checking for an existing pair

- **WHEN** `checkVendorProductExists(vendorId, productId)` is called
- **THEN** the service queries `findByVendorAndProduct` and returns `true` only if a matching row exists

### Requirement: Soft delete and restore

The system SHALL delete via `DELETE /vendor-products/:id` and restore via `POST /vendor-products/:id/restore`. On delete the store removes the row from `vendorProducts` and decrements `total` (floored at 0); on restore it inserts/updates the restored entity and increments `total`.

#### Scenario: Deleting a vendor product

- **WHEN** `deleteVendorProduct(id)` succeeds
- **THEN** the store filters the entity out of `vendorProducts`, clears `selectedVendorProduct` if it matched, and decrements `total`

#### Scenario: Restoring a vendor product

- **WHEN** `restoreVendorProduct(id)` succeeds
- **THEN** the repository POSTs `/vendor-products/{id}/restore`, and the store replaces or pushes the restored entity and increments `total`

### Requirement: Lookup helpers by vendor and by product

The store SHALL expose `fetchVendorProductsByVendorId` and `fetchVendorProductsByProductId`, returning the full list (limit 1000) for the given id, and `vendorProductOptions` mapping entities to `{ value, label, entity }` for dropdowns.

#### Scenario: Building dropdown options

- **WHEN** a component reads `vendorProductOptions`
- **THEN** each entry's `label` is `"<productName> (Vendor: <vendorId>)"` and `value` is the entity id
