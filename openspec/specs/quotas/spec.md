# Quotas

> Canonical spec — describes what the **quotas** capability currently DOES. Source of truth for quota CRUD, validation, permission gating, vendor-product linkage, and soft-delete.

## Purpose

Manage annual purchase quantity allocations (`quota-company`) that link a `vendor_product` (vendor + product combination) to a company and a calendar year with an allowed quantity (`qty`). Quotas constrain how much of a vendor's product a company may procure in a given year. Company-admins own create/update/delete; super-admins and regular admins are read-only viewers.

## Implementation Map

| Layer | File |
| ----- | ---- |
| Entity | `src/modules/domain/entities/quotas/quota.entity.ts` |
| Repository interface | `src/modules/domain/repository/quotas/quota.repository.ts` |
| DTO | `src/modules/application/dtos/quotas/quota.dto.ts` |
| Service interface | `src/modules/application/ports/input/quotas/quota.service.ts` |
| Service impl | `src/modules/application/services/quotas/quota.service.ts` |
| Use cases | `src/modules/application/useCases/quotas/` (create, update, delete, get-one, get-quota) |
| Repository impl | `src/modules/infrastructure/quotas/api-quota.repository.ts` |
| Repository (mock) | `src/modules/infrastructure/quotas/mock-quota.repository.ts` |
| Interface | `src/modules/interfaces/quotas/quota.interface.ts` |
| Store | `src/modules/presentation/Admin/stores/quotas/quota.store.ts` |
| View | `src/modules/presentation/Admin/views/quotas/quota-view/QuotaView.vue` |
| Column definition | `src/modules/presentation/Admin/views/quotas/column.ts` |
| Validation | `src/modules/presentation/Admin/views/quotas/validation/quota.validate.ts` |
| Form component | `src/modules/presentation/Admin/components/quotas/quota-form/QuotaForm.vue` |
| Form modal | `src/modules/presentation/Admin/components/quotas/quota-form/QuotaFormModal.vue` |
| Form with vendor selection | `src/modules/presentation/Admin/components/quotas/quota-form/QuotaFormWithVendorSelection.vue` |
| Vendor selection modal | `src/modules/presentation/Admin/components/quotas/vendor-selection/VendorSelectionModal.vue` |
| Route | `src/modules/presentation/Admin/router/quotas/quota.routers.ts` |

API base path: `/quota-company`. Endpoints: `GET /quota-company`, `GET /quota-company/:id`, `POST /quota-company`, `PUT /quota-company/:id`, `DELETE /quota-company/:id`, `POST /quota-company/:id/restore`, `GET /quota-company/exists`, `GET /quota-company/unique`.

## ADDED Requirements

### Requirement: Quota entity structure and validation

The `QuotaEntity` SHALL carry `id` (string), `vendor_product_id` (number), `company_id` (optional number), `vendor_id` (optional number), `product_id` (optional number), `qty` (number), `year` (string), `created_at` (Date), `updated_at` (Date), and `deleted_at` (Date | null). The entity MUST expose `validate()` which returns a string array of error messages for: invalid year (outside 1900–2100), `qty <= 0`, and negative IDs. The entity also exposes `isValidYear()` and `isValidQty()` helpers.

#### Scenario: Creating a valid quota entity

- **WHEN** `QuotaEntity.create({ vendor_product_id, qty, year, company_id? })` is called
- **THEN** a new entity is instantiated with a browser-generated ID (`quota_<timestamp36>_<random>`), `created_at` and `updated_at` set to `new Date()`, and `deleted_at` as `null`

#### Scenario: Validation rejects bad data

- **WHEN** `quota.validate()` is called with `qty === 0` or a year outside 1900–2100
- **THEN** the returned errors array contains `"Quantity must be greater than 0"` or `"Invalid year format"` respectively, and `CreateQuotaUseCase.execute()` throws `"Validation errors: <messages>"`

### Requirement: Quota CRUD through use cases

The system SHALL implement create, read (single and paginated list), update, and soft-delete through dedicated use cases. The `CreateQuotaUseCase` validates the entity before calling `quotaRepository.create()`. `UpdateQuotaUseCase` calls `quotaRepository.update(id, entity)`. `DeleteQuotaUseCase` calls `quotaRepository.delete(id)`. `GetOneQuotaUseCase` calls `quotaRepository.getById(id)`. `GetQuotasUseCase` calls `quotaRepository.getAll(options)`.

#### Scenario: Create quota

- **WHEN** `quotaService.createQuota(dto)` is called with valid `{ vendor_product_id, qty, year, company_id? }`
- **THEN** the use case builds a `QuotaEntity`, validates it, posts `{ qty, vendor_product_id, year }` to `POST /quota-company`, and returns the mapped domain entity

#### Scenario: Update quota

- **WHEN** `quotaStore.updateQuota(id, data)` is called
- **THEN** the store extracts any existing `id` from `data`, merges the param `id` as authoritative, and calls `quotaService.updateQuota({ id, ...rest })`, which issues `PUT /quota-company/:id`

### Requirement: Paginated quota list with filters

The system SHALL fetch quotas via `GET /quota-company` accepting `page`, `limit`, `search`, `column`, `sort_order`, `company_id`, `vendor_id`, `product_id`, `vendor_product_id`, `year`, and `include_deleted`. The response MUST be parsed from three possible structures: `{ data[], pagination: { total, page, limit } }` (primary), a flat array, or a legacy `{ data[], total, page, limit }` wrapper. The store exposes `quotasWithDetails` as a computed array enriched with display fields: `product_name`, `vendor_name`, `price`, `product_type`, `unit`.

#### Scenario: List loads on mount

- **WHEN** `QuotaView.vue` mounts
- **THEN** `vendorStore.fetchVendors({ page: 1, limit: 1000 })` is called first (to populate the vendor filter), then `quotaStore.fetchQuotas(params)` is called with the current search, year, and vendor_id values

#### Scenario: Filter changes trigger debounced reload

- **WHEN** the user changes `search`, `year`, `vendor_id`, or `pageSize`
- **THEN** a 300 ms debounced watcher calls `loadQuotas(true)` (resetting to page 1)

### Requirement: Nested vendor and product data enrichment

The API response for each quota MAY include nested `vendor_product`, `Product` (uppercase), `product` (lowercase, legacy), and `vendor` objects. The repository's `toDomainModel()` MUST store these as dynamic properties on the entity instance (e.g., `(entity as any).vendor_product = apiModel.vendor_product`). The store's `quotasWithDetails` computed MUST resolve product name, vendor name, product type, and unit name from these nested objects using a priority chain: `Product` > `vendor_product.product` > `product` > fallback string.

#### Scenario: Product name resolution

- **WHEN** the API returns `{ Product: { name: "Laptop" } }` on a quota record
- **THEN** `quotasWithDetails` exposes `product_name: "Laptop"` for that row; if `Product` is absent but `vendor_product.product.name` exists, that value is used; if both are absent the fallback is `"ສິນຄ້າ #<vendor_product_id>"`

### Requirement: Soft delete and in-memory optimistic update

The system SHALL soft-delete a quota by calling `DELETE /quota-company/:id`. On success the store calls `quota.softDelete()` on the matching entity (which returns a new immutable entity with `deleted_at = new Date()`) and replaces it in `quotas.value[index]`. `activeQuotas` computed filters entries where `isDeleted()` returns `false`.

#### Scenario: Quota soft-deleted

- **WHEN** `quotaStore.deleteQuota(id)` completes successfully
- **THEN** the entry at `quotas.value[index]` is replaced with the result of `quota.softDelete()`, `currentQuota` is set to `null` if it matched, and `activeQuotas` no longer includes the deleted entry

### Requirement: Quota uniqueness check

The system SHALL expose `quotaRepository.exists(company_id, vendor_product_id, year)` via `GET /quota-company/exists?company_id=&vendor_product_id=&year=`, returning `response.data.exists` (boolean). The method `getByUniqueKey(company_id, vendor_product_id, year)` calls `GET /quota-company/unique` with the same params and returns the matching entity or `null` on 404.

#### Scenario: Duplicate prevention

- **WHEN** `quotaRepository.exists(companyId, vendorProductId, year)` is called before creating
- **THEN** the repository returns `true` if a quota already exists for that combination, allowing the caller to prevent duplicates; network or API errors return `false` (no-throw)

### Requirement: Permission-gated CRUD UI

The system SHALL gate create, update, and delete buttons in `QuotaView.vue` using explicit permission flags. `canCreateQuotas` requires `hasPermission("create-quota-company") && !isSuperAdmin && !isAdmin`. `canUpdateQuotas` requires `hasPermission("update-quota-company") && !isSuperAdmin && !isAdmin`. `canDeleteQuotas` requires `hasPermission("delete-quota-company") && !isSuperAdmin && !isAdmin`. Super-admins and regular admins are read-only.

#### Scenario: Super-admin sees no action buttons

- **WHEN** `isSuperAdmin.value` is `true`
- **THEN** `canCreateQuotas`, `canUpdateQuotas`, and `canDeleteQuotas` all evaluate to `false`; the create button, edit icon, and delete icon are hidden via `v-if`

#### Scenario: Company-admin with quota permissions

- **WHEN** the user has `create-quota-company`, `update-quota-company`, and `delete-quota-company` permissions and is not a super-admin or admin
- **THEN** the create button and the edit/delete icons in the table actions column are visible

### Requirement: Restore deleted quota

The system SHALL restore a soft-deleted quota via `POST /quota-company/:id/restore`. The repository method `restore(id)` calls this endpoint and returns the restored `QuotaEntity`. No store action wires this endpoint yet — it exists only at the repository layer.

#### Scenario: Repository restore call

- **WHEN** `quotaRepository.restore(id)` is called
- **THEN** `POST /quota-company/:id/restore` is issued and the restored entity is returned via `toDomainModel(response.data)`

### Requirement: Three route contexts for quota view

The system SHALL register the `QuotaView.vue` component at three routes with distinct names and breadcrumbs: `/quotas` (global list, `name: "quotas"`), `/companies/:companyId/quotas` (company-scoped, `name: "quotas.company"`), and `/vendors/:vendorId/quotas` (vendor-scoped, `name: "quotas.vendor"`). All three routes use `requiresAuth: true` (note: this key uses camelCase `requiresAuth`, inconsistent with the rest of the app which uses `requiredAuth`).

#### Scenario: Route to company-scoped quota list

- **WHEN** a user navigates to `/companies/5/quotas`
- **THEN** `QuotaView.vue` renders with the breadcrumb `Dashboard > Companies > Company Quotas`; the view does not automatically pre-filter by `companyId` from the route params — that filtering is driven only by the in-component `vendor_id` / `year` / `search` refs
