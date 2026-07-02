# Vendors

> Canonical spec — describes what the **vendors** capability currently DOES. Covers the vendor master record, its nested **vendor bank accounts** sub-entity, and the per-vendor **vendor product** price list shown on the vendor detail page. Source of truth for vendor CRUD, bank-account management, and the vendor-scoped product list.

## Purpose

Maintain the supplier (vendor) master data: each vendor has a name, free-text contact info, a list of bank accounts (one of which can be marked "in use"), and a price list of products it supplies. Vendors are the counterparties referenced by the procurement flow (purchase orders, quotas, disbursements).

## Implementation Map

| Layer | File |
| ----- | ---- |
| View (list) | `src/modules/presentation/Admin/views/vendors/vendor/VendorView.vue` |
| View (detail / product list) | `src/modules/presentation/Admin/views/vendors/vendor_product/VendorDetailView.vue` |
| View (bank accounts) | `src/modules/presentation/Admin/views/vendors/vendor_bank_accounts/VendorBank.vue` |
| Component (vendor form) | `src/modules/presentation/Admin/components/vendors/vendor/FormVendor.vue` |
| Component (bank form) | `src/modules/presentation/Admin/components/vendors/vendor_bank_accounts/FormVendorBank.vue` |
| Component (product form + list) | `src/modules/presentation/Admin/components/vendors/vendor_product/FormVendorProduct.vue`, `VendorProductList.vue` |
| Store (vendor) | `src/modules/presentation/Admin/stores/vendors/vendor.store.ts` |
| Store (bank accounts) | `src/modules/presentation/Admin/stores/vendors/vendor-bank-accounts.store.ts` |
| Store (vendor product) | `src/modules/presentation/Admin/stores/vendors/vendor-product.store.ts` |
| Service | `src/modules/application/services/vendors/vendor/vendor.service.ts`, `.../vendor_bank_accounts/...`, `.../vendor_product/...` |
| Repository (impl) | `src/modules/infrastructure/vendors/api-vendor.repository.ts`, `api-vendor-bank-accounts.repository.ts`, `api-vendor-product.repository.ts` |
| Entity | `src/modules/domain/entities/vendors/vendor/vendors.entities.ts`, `.../vendor_bank_accounts/vendors-bank-accounts.entities.ts`, `.../vendor_product/vendor-product.entity.ts` |
| Route | `src/modules/presentation/Admin/router/vendors/vendorRoutes.ts`, `vendorBankAccountRoutes.ts` |

API base paths:
- Vendor: `/vendors` — `GET /vendors`, `GET /vendors/:id`, `POST /vendors`, `PUT /vendors/:id`, `DELETE /vendors/:id`
- Vendor bank account: `/vendor_bank_accounts` — `GET /vendor_bank_accounts/vendor/:vendorId`, `GET /vendor_bank_accounts/:id`, `POST /vendor_bank_accounts`, `PUT /vendor_bank_accounts/:id`, `PUT /vendor_bank_accounts/use/:id`, `DELETE /vendor_bank_accounts/:id`

Routes: `/vendors` (`vendors.index`), `/vendors/:id` (`vendors.detail`), `/vendors-bank/:id` (`vendors.bank.index`). All set `requiredAuth: true`; none declare a `permission` meta key.

## ADDED Requirements

### Requirement: Vendor list with pagination and search

The system SHALL fetch vendors from `GET /vendors` through `useVendorStore.fetchVendors`, passing `page`, `limit`, `search`, `sort_by`, `sortDirection`, and `include_deleted`. It MUST map each row to a `VendorsEntity` and populate `pagination` from `response.data.pagination` (`total`, `page`, `limit`, `total_pages`).

#### Scenario: Loading the vendor list

- **WHEN** the vendor list view mounts and calls `fetchVendors`
- **THEN** the store sets `loading`, calls the service, replaces `vendors` with the mapped entities, updates `pagination`, and clears `loading` in `finally`

#### Scenario: Invalid API response shape

- **WHEN** the API response lacks `data` or `pagination`
- **THEN** the repository throws `"Invalid response format from API"`, normalized by `handleApiError`, and the store records it in `error` and re-throws

#### Scenario: Search input placeholder is vendor-specific

- **WHEN** the Vendors list page renders its `InputSearch` in any locale
- **THEN** the placeholder resolves from `vendors.placeholder.search` (Vendor Bank Accounts uses `vendors_bank.placeholder.search`) and never reuses the `currency` namespace

### Requirement: Vendor create and update

The system SHALL create a vendor via `POST /vendors` and update via `PUT /vendors/:id`, sending the `VendorCreateInteface` / `VendorUpdateIntrface` payload (`name`, `contact_info`, and a `vendor_bank_account` array). On create the new entity is prepended to `vendors`; on update the matching entity is replaced in place and `currentVendor` is refreshed if it is the edited one.

#### Scenario: Creating a vendor

- **WHEN** the user submits the vendor form
- **THEN** the store calls `createVendor`, the repository POSTs the payload, the response is mapped to a `VendorsEntity`, and it is inserted at the head of `vendors.value`

#### Scenario: Bank accounts flattened for the payload

- **WHEN** the store serializes a vendor for create/update
- **THEN** each `VendorsBankAccountEntity` is reduced to `{ currency_id, bank_id, account_name, account_number }` via `bankAccountToSimpleObject`, coercing `currency_id` and `bank_id` to `Number`

### Requirement: Vendor soft delete

The system SHALL delete a vendor via `DELETE /vendors/:id`. On success the store MUST mark the matching in-memory entity deleted by calling its `delete()` method (setting `deleted_at`) rather than removing it from the array.

#### Scenario: Deleting a vendor

- **WHEN** `deleteVendor(id)` succeeds
- **THEN** the store finds the entity by `getId()` and calls `entity.delete()`, so `isDeleted()` becomes `true` and the `activeVendors` / `inactiveVendors` computed split reflects it

### Requirement: Vendor entity exposes active/inactive derived state

The `VendorsEntity` SHALL track `deleted_at` and expose `isDeleted()`, and the store SHALL expose `activeVendors`, `inactiveVendors`, `totalActiveVendors`, and `totalInactiveVendors` computed from `isDeleted()`. Dates passing through the constructor are normalized with `formatDate()`.

#### Scenario: Active vendor filtering

- **WHEN** the view reads `activeVendors`
- **THEN** it returns only vendors whose `deleted_at` is `null`

### Requirement: Vendor bank accounts are managed per vendor

The system SHALL list a vendor's bank accounts via `GET /vendor_bank_accounts/vendor/:vendorId` and support create (`POST /vendor_bank_accounts`), update (`PUT /vendor_bank_accounts/:id`), and delete (`DELETE /vendor_bank_accounts/:id`) through `useVendorBankAccountStore`. Each account carries `vendor_id`, `currency_id`, `bank_id` (read from the nested `bank.id`), `account_name`, `account_number`, and `is_selected`, plus optional nested `bank`, `vendor`, and `currency` objects.

#### Scenario: Listing a vendor's bank accounts

- **WHEN** `fetchBankAccounts(vendorId, params)` runs
- **THEN** the repository GETs `/vendor_bank_accounts/vendor/{vendorId}` with pagination params, maps rows to `VendorsBankAccountEntity`, and the store updates `bankAccounts` and `pagination`

#### Scenario: Deleting a bank account soft-deletes in memory

- **WHEN** `deleteBankAccount(id)` succeeds
- **THEN** the store calls `entity.delete()` on the matching account rather than removing it

### Requirement: Exactly one bank account marked "in use"

The system SHALL toggle a bank account's `is_selected` flag via `PUT /vendor_bank_accounts/use/:id` with body `{ is_selected }`. The store action `toggleBankAccountSelection` replaces the affected entity with the server's response.

#### Scenario: Marking an account as in use

- **WHEN** `toggleBankAccountSelection(id, true)` is called
- **THEN** the repository PUTs `/vendor_bank_accounts/use/{id}` with `{ is_selected: true }`, and the store swaps in the returned entity (and updates `currentBankAccount` if it matches)

### Requirement: Vendor product price list on the vendor detail page

The system SHALL show the products a vendor supplies on `/vendors/:id` (`vendors.detail`), each with a `price` and `currency`, managed through `useVendorProductStore` against `GET /vendor-products` (filtered by `vendor_id`). Create uses `POST /vendor-products`, update `PUT /vendor-products/:id`, delete `DELETE /vendor-products/:id`, restore `POST /vendor-products/:id/restore`.

> NOTE: There are two distinct `VendorProductEntity` classes — the legacy mutable one under `domain/entities/vendors/vendor_product/` (used by `stores/vendors/vendor-product.store.ts`) and the newer immutable one under `domain/entities/vendor-products/` (used by `stores/vendor-products/vendor-product.store.ts`). The vendor-detail page and the standalone vendor-products feature are documented separately; see the `vendor-products` spec for the standalone module.

#### Scenario: Listing products for a vendor

- **WHEN** the vendor detail view requests products scoped to the vendor
- **THEN** the repository GETs `/vendor-products` with `vendor_id` set, maps rows via `VendorProductEntity.fromApiResponse`, and the list renders product name, price, and currency

#### Scenario: Price required to be positive

- **WHEN** a vendor product is validated
- **THEN** `validate()` reports an error if `price <= 0`, `vendor_id <= 0`, or `product_id <= 0`
