# Currency Management

> Canonical spec — describes what the **currency** capability currently DOES. Source of truth for listing, batch-creating, updating, and deleting currencies.

## Purpose

Maintain the catalog of currencies (each with `name` and `code`) used by exchange rates and monetary fields across the ERP. The capability supports paginated/searchable listing, batch create of multiple rows in one request, single-record update, and delete. Currencies are structured with explicit use cases per operation.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/currencies/CurrencyView.vue` |
| Validation | `src/modules/presentation/Admin/views/currencies/validation/*.ts` |
| Store | `src/modules/presentation/Admin/stores/currency.store.ts` |
| Service | `src/modules/application/services/currency.service.ts` |
| Use cases | `src/modules/application/useCases/currencies/{create,update,delete,get-one,get-all}.use-case.ts` |
| Repository (impl) | `src/modules/infrastructure/api-currency.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/currency.repository.ts` |
| Entity | `src/modules/domain/entities/currency.entity.ts` |
| DTO / Interface | `src/modules/application/dtos/currency.dto.ts`, `src/modules/interfaces/currency.interface.ts` |
| Route | `src/modules/presentation/Admin/router/currencies.routers.ts` |

API base path: `/currencies`. Endpoints: `GET /currencies` (list), `GET /currencies/{id}`, `POST /currencies` (batch JSON `{ currency: [...] }`), `PUT /currencies/{id}` (JSON), `DELETE /currencies/{id}`. No restore endpoint.

## ADDED Requirements

### Requirement: List currencies with pagination and search

The system SHALL fetch currencies from `GET /currencies` passing `page`, `limit`, `includeDeleted`, and (when present) `search`, then map each record to a `CurrencyEntity` and normalize the server pagination (`total`, `page`, `limit`, `total_pages`).

#### Scenario: Load list

- **WHEN** the view loads and the service calls `getAll(params)`
- **THEN** the repository returns mapped `CurrencyEntity[]` plus pagination metadata

### Requirement: Batch-create currencies

The system SHALL create one or more currencies in a single request by POSTing `{ currency: [...] }` to `POST /currencies`, where each element carries `name` and `code`. The response MAY be a single object or an array; both MUST be mapped to `CurrencyEntity`.

#### Scenario: Add multiple rows

- **WHEN** the user fills the multi-row "add more" form with several `{ name, code }` pairs and submits
- **THEN** the repository posts a `{ currency: [...] }` payload and maps the returned array to `CurrencyEntity[]`

#### Scenario: Empty response

- **WHEN** the create response contains no `data`
- **THEN** the repository throws `No data returned from create API`

### Requirement: Form validation rules

The currency form SHALL require both `name` and `code` for every row before submission.

#### Scenario: Missing code

- **WHEN** a row is submitted without a `code`
- **THEN** the form shows `currency.error.code` and blocks submission

#### Scenario: Missing name

- **WHEN** a row is submitted without a `name`
- **THEN** the form shows `currency.error.name` and blocks submission

### Requirement: Update a currency

The system SHALL update a single currency by PUTting the API model (`{ id, name, code, created_at, updated_at }`) to `PUT /currencies/{id}` and mapping the response to a `CurrencyEntity`.

#### Scenario: Update name and code

- **WHEN** the user edits a currency and submits
- **THEN** the update use case calls the repository, which PUTs to `/currencies/{id}` and returns the updated entity

### Requirement: Delete a currency with guard

The delete use case SHALL load the currency first and throw if it does not exist (`currency with id {id} not found`) or is already deleted (`currency with id {id} is already deleted`) before calling `DELETE /currencies/{id}`.

#### Scenario: Delete existing currency

- **WHEN** deleting an existing, non-deleted currency
- **THEN** the use case calls the repository delete and resolves `true`

#### Scenario: Delete already-deleted currency

- **WHEN** the targeted currency's `isDeleted()` is true
- **THEN** the use case throws and no DELETE request is made

### Requirement: Entity model

The `CurrencyEntity` SHALL hold a nullable `id`, `name`, `code`, and nullable `createdAt`/`updatedAt`/`deletedAt`. `isDeleted()` returns true when `deletedAt !== null`; `static create(name, code)` builds an entity with a null id for new rows.

> PITFALL: The repository's `handleApiError` normalizes server errors to `API Error ({status}): {message}`. The entity does NOT pass dates through `formatDate()` (unlike bank/category/unit), so raw timestamps are surfaced. There is no restore operation for currencies.

#### Scenario: Map API record

- **WHEN** `toDomainModel` receives an API currency
- **THEN** it constructs a `CurrencyEntity` with `id`, `name`, `code || ""`, and raw `created_at`/`updated_at`
