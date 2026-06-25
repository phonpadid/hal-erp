# Company Management

> Canonical spec — describes what the **company** capability currently DOES. Source of truth for listing, creating, updating, soft-deleting, and restoring companies (the tenant/organisation records of the ERP).

## Purpose

Manage the set of companies (organisations) in the system through a paginated CRUD UI backed by the REST API. A company carries identity (name, logo), contact details (tel, email, address), and lifecycle timestamps. Companies support soft-delete and restore. On creation the API can also provision an initial company-admin user from a nested `user` payload.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/company/CompanyListView.vue`, `CompanyCreateView.vue`, `CompanyEditView.vue` |
| Component | `src/modules/presentation/Admin/components/company/FormCompany.vue` |
| Validation | `src/modules/presentation/Admin/views/company/validation/company.vallidate.ts` |
| Store | `src/modules/presentation/Admin/stores/company.store.ts` |
| Service (impl) | `src/modules/application/services/company.service.ts` |
| Service (port) | `src/modules/application/ports/input/company.service.ts` |
| Use cases | `src/modules/application/useCases/company/{create,get,get-all,update,delete,restore}-company.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-company.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/company.repository.ts` |
| Entity | `src/modules/domain/entities/company.entity.ts` |
| DTO | `src/modules/application/dtos/company.dto.ts` |
| Route | `src/modules/presentation/Admin/router/companyRoutes.ts` |

API base path: `/companies`. Endpoints: `GET /companies`, `GET /companies/:id`, `POST /companies`, `PUT /companies/:id`, `DELETE /companies/:id`, `POST /companies/:id/restore`.

## ADDED Requirements

### Requirement: List companies with pagination and search

The system SHALL fetch companies from `GET /companies`, passing `page`, `limit`, `search`, `sort_by`, `sortDirection`, and `include_deleted` query params. It MUST map each response row into a `CompanyEntity` and expose pagination as `{ page, limit, total, totalPages }` (read from `response.data.pagination`, with `totalPages` taken from `total_pages`).

#### Scenario: Fetch first page

- **WHEN** `fetchCompanies({ page: 1, limit: 10 })` is called
- **THEN** the store sets `loading` true, requests `GET /companies?page=1&limit=10&include_deleted=false`, stores the mapped `CompanyEntity[]` in `companies`, updates `pagination`, and clears `loading` in `finally`

#### Scenario: Fetch failure

- **WHEN** the request throws
- **THEN** the repository normalises the error via `handleApiError` (server `message`, network error, or `<defaultMessage>: <message>`), the store records it in `error` and re-throws

### Requirement: Create a company

The system SHALL create a company by sending a `CreateCompanyDTO` (`name`, `tel`, `email`, `address`, optional `logo`, and an optional nested `user` object with `username`, `email`, `tel`, `password`, `confirm_password`, optional `signature`) as JSON to `POST /companies`. The new entity MUST be prepended to the in-memory `companies` list.

#### Scenario: Successful create

- **WHEN** the create form passes validation and the API returns the created record
- **THEN** the repository maps `response.data.data` to a `CompanyEntity`, the store prepends it to `companies`, and returns the entity converted to `CompanyInterface`

#### Scenario: Create with bootstrap company-admin user

- **WHEN** the `CreateCompanyDTO` includes a nested `user` object
- **THEN** the payload is posted as-is so the back-end provisions the initial company-admin user alongside the company

### Requirement: Create-form validation

The create/edit form SHALL validate company fields before submit: `name` required, 2–200 chars; `tel` required and matching `^[0-9]{8,15}$`; `email` required and a valid email; `address` required, 5–500 chars. In create mode ONLY, the nested user fields (`username`, `email`, `tel`, `firstName`, `lastName`, `password`, `confirm_password`) are also validated; `confirm_password` MUST equal `password`.

#### Scenario: Invalid company fields

- **WHEN** the user submits an out-of-range name, a malformed tel, or an invalid email
- **THEN** validation blocks submission and shows the corresponding Lao/i18n message; no request is made

#### Scenario: User block skipped in edit mode

- **WHEN** the form is opened in edit mode (`isEditMode` true)
- **THEN** the nested-user validators are not registered, so only the company fields are validated

### Requirement: Update a company

The system SHALL update a company by sending an `UpdateCompanyDTO` (partial `name`, `logo`, `tel`, `email`, `address`) to `PUT /companies/:id`, and MUST replace the matching entity in `companies` (and `currentCompany` when it points at the same id).

#### Scenario: Successful update

- **WHEN** `updateCompany(id, data)` resolves
- **THEN** the store replaces the entity at the matching index and, if `currentCompany.getId() === id`, updates `currentCompany`

### Requirement: Soft-delete a company

The system SHALL delete a company via `DELETE /companies/:id`. On success the store MUST mark the in-memory entity deleted by calling its `delete()` method rather than removing it from the list.

#### Scenario: Delete succeeds

- **WHEN** `deleteCompany(id)` returns `true`
- **THEN** the store finds the entity by id and calls `entity.delete()`, setting its `deletedAt`/`updatedAt` so `isDeleted()` becomes `true`

### Requirement: Restore a soft-deleted company

The repository SHALL restore a company via `POST /companies/:id/restore`, returning `true` on success, exposed through `CompanyServiceImpl.restoreCompany` / `RestoreCompanyUseCase`.

#### Scenario: Restore call

- **WHEN** `restoreCompany(id)` is invoked
- **THEN** the repository posts to `/companies/:id/restore` and returns `true`

### Requirement: Company entity invariants

The `CompanyEntity` SHALL hold private fields with public getters, format `createdAt`/`updatedAt`/`deletedAt` via `formatDate()` in its constructor, expose `isDeleted()` (true when `deletedAt !== null`), and provide `delete()`/`restore()` plus per-field `updateX()` mutators that refresh `updatedAt`. IDs MUST be carried as strings (coerced with `id?.toString()` in `toDomainModel`/`fromAPI`).

#### Scenario: Deleted detection

- **WHEN** an entity is constructed with a non-null `deleted_at`
- **THEN** `isDeleted()` returns `true` and `getDeletedAt()` returns the formatted timestamp

> NOTE: Entity `delete()`/`restore()`/`updateX()` build timestamps with `replace("T", "")` (no space) — a pre-existing formatting quirk; do not "fix" it in unrelated work. The store-to-interface mapper does `parseInt(company.getId())`, so non-numeric ids would become `NaN`.
