# Company Vendor Management

> Canonical spec — describes what the **company-vendor** capability currently DOES. Source of truth for assigning a vendor from the shared master to a company together with per-company credit terms, listing (company-scoped), updating, and unassigning (soft-delete). See `openspec/specs/product/api-company-product-vendor.md` for the backend contract.

## Purpose

Each company "selects" (assigns) vendors from the shared master via the `company_vendors` join table. Unlike company-product, a vendor is assigned **one at a time** because each carries per-company credit terms: `credit_term_days`, `credit_limit`, and `payment_term`. One master vendor can be assigned by many companies; a non-deleted `(company_id, vendor_id)` pair is unique — a duplicate assign returns `409 already_exists`. Unassigning is a soft-delete that can be re-assigned later.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/company-vendor/CompanyVendorListView.vue` |
| Component | `src/modules/presentation/Admin/components/company-vendor/FormCompanyVendor.vue` |
| Column | `src/modules/presentation/Admin/views/company-vendor/column.ts` |
| Store | `src/modules/presentation/Admin/stores/company-vendor.store.ts` |
| Service | `src/modules/application/services/company-vendor.service.ts` |
| Repository (impl) | `src/modules/infrastructure/api-company-vendor.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/company-vendor.repository.ts` |
| Entity | `src/modules/domain/entities/company-vendor.entity.ts` |
| DTO | `src/modules/application/dtos/company-vendor.dto.ts` |
| Interface | `src/modules/interfaces/company-vendor.interface.ts` |
| Route | `src/modules/presentation/Admin/router/companyVendorRoutes.ts` |
| Menu | `src/common/shared/layouts/menu.ts` (`company-vendor.index`) |
| i18n | `src/common/locales/{en,la,cn}/company_vendors.json` + `menu-sidebar.company_vendor` |

API base path: `/company-vendors`. Endpoints: `GET /company-vendors`, `GET /company-vendors/:id`, `POST /company-vendors`, `PUT /company-vendors/:id`, `DELETE /company-vendors/:id`. Route name `company-vendor.index`; menu permission `read-company-vendor`; inline permissions `create-company-vendor` / `update-company-vendor` / `delete-company-vendor`.

## ADDED Requirements

### Requirement: List company vendors with pagination, search and scope

The system SHALL fetch from `GET /company-vendors`, passing `page`, `limit`, `search`, optional `company_id`, `vendor_id`, `status`, and `include_deleted`. Listing is company-scoped on the server (admins see all / may filter; non-admins see only their own company). Each row MUST be mapped to a `CompanyVendorEntity` including its credit terms, and pagination read from `response.data.pagination`.

#### Scenario: Fetch scoped list

- **WHEN** the list view loads
- **THEN** the repository calls `GET /company-vendors` with the params and returns mapped `CompanyVendorEntity[]` carrying `credit_term_days`, `credit_limit`, `payment_term`

### Requirement: Assign a vendor to a company (single, with credit terms)

The system SHALL assign exactly one vendor via `POST /company-vendors` with `{ vendor_id, status?, credit_term_days?, credit_limit?, payment_term?, company_id? }` (no array assign — terms differ per vendor). The service SHALL reject a missing `vendor_id`. A duplicate `(company_id, vendor_id)` link surfaces the server's `409 already_exists` error to the view. `company_id` is honoured only for admin/super-admin and ignored for non-admins.

#### Scenario: Assign with credit terms

- **WHEN** `assignCompanyVendor({ vendor_id: 7, credit_term_days: 30, credit_limit: 1000000, payment_term: "Net 30" })` is called
- **THEN** the repository posts the payload and returns the created `CompanyVendorEntity`

#### Scenario: Duplicate assignment

- **WHEN** the vendor is already linked to the company
- **THEN** the POST fails with the `409 already_exists` message and the view surfaces it via `useNotification`

### Requirement: Update a company vendor

The system SHALL update an assignment via `PUT /company-vendors/:id` (`status`, `credit_term_days`, `credit_limit`, `payment_term`) and return the mapped entity. Vendor and company are fixed once assigned.

#### Scenario: Update credit terms

- **WHEN** `updateCompanyVendor(id, { credit_limit: 2000000 })` resolves
- **THEN** the repository PUTs to `/company-vendors/:id` and returns the updated `CompanyVendorEntity`

### Requirement: Unassign (soft-delete) a company vendor

The system SHALL unassign via `DELETE /company-vendors/:id` (returning `true`). The service SHALL reject if the record is missing or already unassigned. Re-assigning the same vendor later is allowed.

#### Scenario: Unassign then re-assign

- **WHEN** `deleteCompanyVendor(id)` is called and later the same vendor is assigned again
- **THEN** the DELETE returns `true` and a subsequent `POST /company-vendors` creates a fresh active link

### Requirement: Company vendor entity invariants

The `CompanyVendorEntity` SHALL hold private fields `companyId`, `vendorId`, `vendorName`, `companyName` (display), `status`, `creditTermDays` (number, default 0), `creditLimit` (number, default 0), and `paymentTerm` (string|null); format dates with `formatDate()`; expose `isDeleted()`, `delete()`/`restore()`, `updateStatus()`, and a static `create()` factory. IDs are carried as strings (coerced via `id?.toString()`).

#### Scenario: Credit-term defaults

- **WHEN** an entity is constructed from an API row missing `credit_term_days`/`credit_limit`
- **THEN** `getCreditTermDays()` and `getCreditLimit()` return `0`
