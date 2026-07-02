# Bank Management

> Canonical spec — describes what the **bank** capability currently DOES. Source of truth for listing, creating, updating, soft-deleting, and restoring banks (including logo upload).

## Purpose

Maintain the catalog of banks used across the ERP. A bank carries a `name`, a `short_name`, and an optional `logo` image. The capability supports paginated/searchable listing, create and update via multipart form upload, and soft-delete with restore.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/bank/BankListView.vue` |
| Column / Validation | `src/modules/presentation/Admin/views/bank/column.ts`, `src/modules/presentation/Admin/views/bank/validation/bank.validate.ts` |
| Component (form) | `src/modules/presentation/Admin/components/bank/FormBank.vue` |
| Store | `src/modules/presentation/Admin/stores/bank.store.ts` |
| Service | `src/modules/application/services/bank.service.ts` |
| Repository (impl) | `src/modules/infrastructure/api-bank.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/bank.repository.ts` |
| Entity | `src/modules/domain/entities/bank.entity.ts` |
| DTO / Interface | `src/modules/application/dtos/bank.dto.ts`, `src/modules/interfaces/bank.interface.ts` |
| Route | `src/modules/presentation/Admin/router/bankRoutes.ts` |

API base path: `/banks`. Endpoints: `GET /banks` (list + `findByName`/`findByShortName` filtered queries), `GET /banks/{id}`, `POST /banks` (multipart), `PUT /banks/{id}?_method=PUT` (multipart), `DELETE /banks/{id}`, `POST /banks/{id}/restore`.

## ADDED Requirements

### Requirement: List banks with pagination and search

The system SHALL fetch a paginated list of banks from `GET /banks`, passing `page`, `limit`, `search`, `sort_by`, `sortDirection`, and `include_deleted`. It MUST map each API record to a `BankEntity` and normalize the server `pagination` (`total`, `page`, `limit`, `total_pages`) into the store's pagination state.

#### Scenario: Load first page

- **WHEN** the list view mounts and calls `fetchBanks({ page: 1, limit: 10 })`
- **THEN** the store stores the returned `BankEntity[]` in `banks` and updates `pagination` with `page`, `limit`, `total`, and `totalPages`

#### Scenario: Search by keyword

- **WHEN** `fetchBanks` is called with a `search` value
- **THEN** the repository sends it as the `search` query param and only matching banks are returned

### Requirement: Create a bank with optional logo upload

The system SHALL create a bank by POSTing a `FormData` body containing `name`, `short_name`, and (if present) `logo` to `POST /banks` with `Content-Type: multipart/form-data`. The `logo` MUST be appended when it is a `File` instance, or appended as a string when a non-empty string is provided.

#### Scenario: Create with logo file

- **WHEN** the user submits the create form with a valid name, short_name, and a selected logo file
- **THEN** the repository builds `FormData`, appends `logo` as the `File`, posts to `/banks`, maps the response to a `BankEntity`, and the store prepends it to `banks`

#### Scenario: Create without logo

- **WHEN** the user submits without selecting a logo
- **THEN** no `logo` field (or an empty value) is appended and the bank is created with `logo === null`

### Requirement: Form validation rules

The bank form SHALL require `name` (2–100 characters) and `short_name` (1–20 characters) before submission, blocking the API request when invalid.

#### Scenario: Missing required name

- **WHEN** the user submits with an empty `name`
- **THEN** the form shows `banks.validation.nameRequired` and no request is made

#### Scenario: Short name too long

- **WHEN** `short_name` exceeds 20 characters
- **THEN** the form shows `banks.validation.shortNameMax` and submission is blocked

### Requirement: Update a bank

The system SHALL update a bank by PUTting `FormData` to `PUT /banks/{id}?_method=PUT` with multipart headers. Only defined `name`/`short_name` fields are appended; the `logo` field is always appended — the new file, a non-empty string URL, or an empty string to clear it.

#### Scenario: Update name and keep logo

- **WHEN** the user edits a bank's name and submits without changing the logo
- **THEN** the repository appends `name` and an empty `logo`, sends the multipart PUT, and the store replaces the matching entry in `banks`

### Requirement: Soft-delete a bank with guard

The system SHALL delete a bank via `DELETE /banks/{id}`. The service MUST first load the bank and throw if it does not exist or is already deleted.

#### Scenario: Delete an active bank

- **WHEN** `deleteBank(id)` runs on an existing, non-deleted bank
- **THEN** the service calls the repository delete, the store marks the in-memory entity deleted via `entity.delete()`, and the list is refetched

#### Scenario: Delete already-deleted bank

- **WHEN** `deleteBank(id)` targets a bank whose `isDeleted()` is true
- **THEN** the service throws `Bank with id {id} is already deleted` and no DELETE request is made

### Requirement: Restore a deleted bank

The repository SHALL restore a soft-deleted bank via `POST /banks/{id}/restore`.

#### Scenario: Restore

- **WHEN** restore is invoked for a deleted bank
- **THEN** the repository posts to `/banks/{id}/restore` and resolves `true`

### Requirement: Entity normalization and ID coercion

The repository SHALL coerce the numeric server `id` to a string (`bank.id.toString()`) and the `BankEntity` constructor MUST format `created_at`, `updated_at`, and `deleted_at` via `formatDate()`. `isDeleted()` returns true when `deletedAt !== null`.

> PITFALL: IDs cross the wire as numbers but become strings client-side; the store's `BankEntityToInterface` converts back with `parseInt`. Logo uploads use `FormData` and the `?_method=PUT` override on update.

#### Scenario: Map API record

- **WHEN** `toDomainModel` receives an API bank with numeric `id`
- **THEN** it constructs a `BankEntity` with `id.toString()`, `short_name`, `logo`, `logoUrl`, formatted dates, and `deleted_at || null`
