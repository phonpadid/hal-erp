# Exchange Rate Management

> Canonical spec — describes what the **exchange-rate** capability currently DOES. Source of truth for listing, batch-creating, updating, and deleting currency exchange rates.

## Purpose

Maintain conversion rates between currencies. Each exchange rate links a `from_currency_id` and `to_currency_id` with a numeric `rate` and an `is_active` flag, and embeds the related `from_currency`/`to_currency` records. The capability supports filtered/paginated listing, batch create of multiple rows in one request, single-record update, and delete. It is structured with explicit use cases per operation.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/exchange-rates/ExchangeRateView.vue` |
| Validation | `src/modules/presentation/Admin/views/exchange-rates/validation/*.ts` |
| Store | `src/modules/presentation/Admin/stores/exchange-rate.store.ts` |
| Service | `src/modules/application/services/exchange-rate.service.ts` |
| Use cases | `src/modules/application/useCases/exchange-rates/{create,update,delete,get-one,get-all}.use-case.ts` |
| Repository (impl) | `src/modules/infrastructure/api-exchange-rate.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/exchange-rate.repository.ts` |
| Entity | `src/modules/domain/entities/exchange-rate.entities.ts` |
| DTO / Interface | `src/modules/application/dtos/exchange-rate.dto.ts`, `src/modules/interfaces/exchange-rate.interface.ts` |
| Route | `src/modules/presentation/Admin/router/exchange-rate.routers.ts` |

API base path: `/exchange-rates`. Endpoints: `GET /exchange-rates` (list, optional `from_currency_id`/`to_currency_id` filter), `GET /exchange-rates/{id}`, `POST /exchange-rates` (batch JSON `{ exchange_rate: [...] }`), `PUT /exchange-rates/{id}` (JSON), `DELETE /exchange-rates/{id}`. No restore endpoint.

## ADDED Requirements

### Requirement: List exchange rates with pagination and currency filter

The system SHALL fetch exchange rates from `GET /exchange-rates` passing `page`, `limit`, `includeDeleted`, and — when `params.filter` is present — `from_currency_id` and `to_currency_id`. It MUST map each record to an `ExchangeRateEntity` (including embedded `from_currency`/`to_currency`) and normalize the server pagination.

#### Scenario: Load list

- **WHEN** the view loads and the service calls `getAll(params)`
- **THEN** the repository returns mapped `ExchangeRateEntity[]` plus pagination metadata

#### Scenario: Filter by currency pair

- **WHEN** `params.filter` carries `from_currency_id`/`to_currency_id`
- **THEN** the repository sends them as query params and only matching rates are returned

### Requirement: Batch-create exchange rates

The system SHALL create one or more exchange rates in a single request by POSTing `{ exchange_rate: [...] }` to `POST /exchange-rates`, each element carrying `from_currency_id`, `to_currency_id`, `rate`, and `is_active`. The response MAY be a single object or array; both MUST be mapped to `ExchangeRateEntity`.

#### Scenario: Add multiple rows

- **WHEN** the user fills the multi-row "add more" form and submits
- **THEN** the repository posts a `{ exchange_rate: [...] }` payload and maps the returned array to `ExchangeRateEntity[]`

#### Scenario: Empty response

- **WHEN** the create response contains no `data`
- **THEN** the repository throws `No data returned from create API`

### Requirement: Form validation rules

The exchange-rate form SHALL require `from_currency_id`, `to_currency_id`, and `rate` for every row before submission.

#### Scenario: Missing rate

- **WHEN** a row is submitted without a `rate`
- **THEN** the form shows `exchange-rate.error.rate` and blocks submission

#### Scenario: Missing currency

- **WHEN** a row is missing `from_currency_id` or `to_currency_id`
- **THEN** the form shows `exchange-rate.error.from_currency` / `exchange-rate.error.to_currency`

### Requirement: Update an exchange rate

The system SHALL update a single exchange rate by PUTting the API model (`from_currency_id`, `to_currency_id`, `rate`, `is_active`, timestamps) to `PUT /exchange-rates/{id}` and mapping the response.

#### Scenario: Update rate

- **WHEN** the user edits a rate and submits
- **THEN** the update use case calls the repository, which PUTs to `/exchange-rates/{id}` and returns the updated entity

### Requirement: Delete an exchange rate

The system SHALL delete an exchange rate via `DELETE /exchange-rates/{id}`.

#### Scenario: Delete

- **WHEN** the delete use case runs
- **THEN** the repository calls `DELETE /exchange-rates/{id}` and resolves `true`

### Requirement: is_active coercion and entity normalization

The `ExchangeRateEntity` constructor SHALL coerce `is_active` from string `"true"`/`"false"` or boolean into a strict boolean (defaulting to `false`), format `created_at`/`updated_at`/`deleted_at` via `formatDate()`, and map embedded currencies into `CurrencyEntity` instances. `isDeleted()` returns true when `deletedAt !== null`.

> PITFALL: `UpdateExchangeRateDTO.is_active` is typed as `string` while the entity stores a boolean; the constructor handles both. `handleApiError` normalizes errors to `API Error ({status}): {message}`. No restore operation exists.

#### Scenario: String is_active

- **WHEN** `toDomainModel` receives `is_active` as the string `"true"`
- **THEN** the entity's `getIsActive()` returns boolean `true`
