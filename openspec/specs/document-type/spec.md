# Document Types, Categories & Statuses

> Canonical spec — describes what the **document-type** capability currently DOES, together with its related read-only **document-category** and **document-status** lookups. Source of truth for the document classification reference data used across the document/approval workflow.

## Purpose

Provide the reference data that classifies documents: editable **document types** (full CRUD, each optionally linked to a category), read-only **document categories** (a flat lookup used to populate the type's `categoryId`), and read-only **document statuses** (a paginated lookup of workflow states). Document types support pagination, search, create/update/soft-delete; categories and statuses are list-only from the client.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/document-types/DocumentType.vue` |
| Validation | `src/modules/presentation/Admin/views/document-types/validation/document-type.validate.ts` |
| Store (type) | `src/modules/presentation/Admin/stores/document-type.store.ts` |
| Store (category) | `src/modules/presentation/Admin/stores/document-category.store.ts` |
| Store (status) | `src/modules/presentation/Admin/stores/document-status.store.ts` |
| Service (type) | `src/modules/application/services/document-type.service.ts` |
| Service (category) | `src/modules/application/services/document-category.service.ts` |
| Service (status) | `src/modules/application/services/document-status.service.ts` |
| Use cases (type) | `src/modules/application/useCases/document_types/{create,update,delete,get-all,get-details}-document-types.usecase.ts` |
| Use case (status) | `src/modules/application/useCases/document-status/get-all-document-status.usecase.ts` |
| Repository (type) | `src/modules/infrastructure/api-document-type.repository.ts` |
| Repository (category) | `src/modules/infrastructure/api-document-category.repository.ts` |
| Repository (status) | `src/common/infrastructure/api-document-status.repository.ts` |
| Entities | `src/modules/domain/entities/document-type.entities.ts`, `document-category.entity.ts`, `document-status.entity.ts` |
| Interface (type) | `src/modules/interfaces/documenet-type.interface.ts` |
| Route | `src/modules/presentation/Admin/router/documentTypeRoutes.ts` |

API base paths: `/document-types`, `/document-categories`, `/document-status`.
Endpoints: `GET/POST /document-types`, `GET/PUT/DELETE /document-types/:id`; `GET /document-categories`; `GET /document-status`.

## ADDED Requirements

### Requirement: Paginated document-type listing with search and filters

The system SHALL fetch document types from `GET /document-types` supporting `page`, `limit`, `column` (default `id`), `sort_order` (default `DESC`), `search`, `sort_by`, `sortDirection`, `include_deleted`, `company_id`, and `category`. The store MUST populate `pagination` from the API `pagination` block (`total`, `page`, `limit`, `total_pages`).

#### Scenario: Loading document types

- **WHEN** `fetchdocumentType({ page, limit })` is called
- **THEN** the repository requests `GET /document-types` with the params above (defaulting `page=1`, `limit=10`, `column="id"`, `sort_order="DESC"`), maps each row to a `DocumentTypeEntity`, and the store sets `documentTypes` and `pagination`

#### Scenario: Lookup by code

- **WHEN** `findByCode(code)` is called
- **THEN** the repository queries `GET /document-types` with `{ code, limit: 1 }` and returns the first matching entity, or `null` if empty

#### Scenario: Search input placeholder is document-type-specific

- **WHEN** the Document Types list page renders its `InputSearch` in any locale
- **THEN** the placeholder resolves from `documentType.placeholder.search` and never reuses the `currency` namespace

### Requirement: Create a document type linked to a category

The system SHALL create a document type via `POST /document-types`. The `DocumentTypeCreate` payload MUST include `name` and `code` and MAY include `categoryId`.

#### Scenario: Successful creation

- **WHEN** `createDocumentType({ name, code, categoryId? })` is called
- **THEN** the repository posts the payload, returns the new `DocumentTypeEntity`, and the store prepends it to `documentTypes`

#### Scenario: Name and code validation

- **WHEN** the form is submitted
- **THEN** validation requires `name` (min 2, max 100) and `code` (min 2, max 50); on create, `code` MUST NOT contain any of `& * $ # ( ) @ ! ~ + .`

### Requirement: Update a document type

The system SHALL update a document type via `PUT /document-types/:id`. The store MUST replace the matching entity in `documentTypes` and refresh `currentDocumentType` when its id matches.

#### Scenario: Editing a document type

- **WHEN** `updateDocumentType(id, payload)` succeeds
- **THEN** the store updates the entity at the matching index and `currentDocumentType` if it is the loaded record

### Requirement: Soft-delete a document type

The system SHALL delete a document type via `DELETE /document-types/:id`. On success the store MUST mark the in-memory entity deleted via `entity.delete()` (setting `deletedAt`) rather than removing it.

#### Scenario: Deleting a document type

- **WHEN** `deleteDocument(id)` returns `true`
- **THEN** the store finds the entity by id and calls `.delete()`, so `isDeleted()` becomes `true` and it moves into the `inactivedocumentType` group

### Requirement: Document-type entity mapping and dates

The `DocumentTypeEntity` SHALL store `id` as a string, normalize `createdAt`/`updatedAt`/`deletedAt` with `formatDate()`, accept a nullable `categoryId`, and report `isDeleted()` from `deletedAt`. The mapper MUST accept either `category_id` or `categoryId` from the API.

#### Scenario: Category id coercion from API

- **WHEN** `toDomainModel` runs on an API row
- **THEN** it reads `category_id ?? categoryId ?? null` and coerces `id` via `id.toString()`

### Requirement: Read-only document categories lookup

The system SHALL fetch document categories from `GET /document-categories` as a flat (non-paginated) list and expose only a read path; there is no create/update/delete from the client.

#### Scenario: Loading categories

- **WHEN** `fetchDocumentCategories()` is called
- **THEN** the repository requests `GET /document-categories`, maps each row to a `DocumentCategoryEntity`, and the store exposes `documentCategories` plus an `activeCategories()` filter excluding soft-deleted entries

### Requirement: Read-only paginated document statuses lookup

The system SHALL fetch document statuses from `GET /document-status` with `page`, `limit`, `search`, `sort_by`, `sortDirection`, and `include_deleted` params, exposing only a read path.

#### Scenario: Loading statuses

- **WHEN** `fetctDocumentStatus({ page, limit })` is called
- **THEN** the repository requests `GET /document-status`, maps each row to a `DocumentStatusEntity`, and the store sets `document_Status` and `pagination` (with `totalPages` from the API `total_pages`)

### Requirement: Normalized error handling for document reference data

The document-type, document-category, and document-status repositories SHALL normalize API failures via `handleApiError`, throwing the server `message` (or a default) for HTTP errors and a connection message when no response was received. A 404 on document-type `findById` MUST resolve to `null`.

#### Scenario: Missing document type by id

- **WHEN** `GET /document-types/:id` returns HTTP 404
- **THEN** the repository returns `null` instead of throwing
