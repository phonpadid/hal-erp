# VAT Configuration

> Canonical spec — describes what the **vat** capability currently DOES. Source of truth for reading and updating the single VAT-rate configuration.

## Purpose

Manage the system-wide Value Added Tax (VAT) rate, stored as a single `amount` (a percentage). Unlike the other catalog capabilities, VAT is a singleton: there is no create, delete, restore, or list — only fetch-one and update.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/vat/VatListView.vue` |
| Validation | `src/modules/presentation/Admin/views/vat/validation/*.ts` |
| Store | `src/modules/presentation/Admin/stores/vat.store.ts` |
| Service | `src/modules/application/services/vat.service.ts` |
| Use cases | `src/modules/application/useCases/vat/{get,update}-vat.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-vat.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/vat.repository.ts` |
| Entity | `src/modules/domain/entities/vat.entity.ts` |
| DTO / Interface | `src/modules/application/dtos/vat.dto.ts`, `src/modules/interfaces/vat.interface.ts` |
| Route | `src/modules/presentation/Admin/router/vatRoutes.ts` |

API base path: `/vat`. Endpoints: `GET /vat` (`findOne`), `GET /vat/{id}` (`findById`), `PUT /vat/{id}` (JSON update). No create, delete, or restore endpoints.

## ADDED Requirements

### Requirement: Fetch the current VAT setting

The system SHALL fetch the single VAT record via `GET /vat` (`findOne`). It MUST map the response to a `VatEntity` carrying `amount`, or return `null` when the API returns no `data`.

#### Scenario: VAT exists

- **WHEN** the view loads and the service calls `getVat()`
- **THEN** the repository maps the response to a `VatEntity` exposing `getAmount()`

#### Scenario: No VAT configured

- **WHEN** `GET /vat` returns an empty `data`
- **THEN** the repository returns `null`

### Requirement: Fetch a VAT record by id

The system SHALL fetch a VAT record via `GET /vat/{id}`, returning `null` on a 404.

#### Scenario: Found by id

- **WHEN** `getVatById(id)` is called with an existing id
- **THEN** the repository returns the mapped `VatEntity`

#### Scenario: Not found

- **WHEN** the API responds 404
- **THEN** the repository returns `null`

### Requirement: Update the VAT amount

The system SHALL update VAT by PUTting the `UpdateVatDTO` (`{ amount }`) as JSON to `PUT /vat/{id}` and mapping the response to a `VatEntity`.

#### Scenario: Change the rate

- **WHEN** the user submits a new amount
- **THEN** the update use case calls the repository, which PUTs JSON to `/vat/{id}` and returns the updated entity

### Requirement: Amount validation rules

The VAT form SHALL require `amount`, reject non-numeric values, reject values above 100, and (when not editing) reject negative values.

#### Scenario: Required amount

- **WHEN** the user submits with an empty amount
- **THEN** the form shows `vats.validation.amountRequired` and blocks submission

#### Scenario: Out of range

- **WHEN** the amount exceeds 100
- **THEN** the form rejects with `vats.validation.amountMax`

#### Scenario: Negative on create

- **WHEN** not in edit mode and the amount is negative
- **THEN** the form rejects with `vats.validation.amountMin`

### Requirement: Entity model

The `VatEntity` SHALL store `id` (coerced to string via `vat.id?.toString() ?? ""`), a numeric `amount` (defaulting to `0`), and dates formatted via `formatDate()`. `updateAmount()` mutates the amount in memory.

> NOTE: VAT is the only catalog capability in this group with no `isDeleted()`/soft-delete behavior — the entity exposes a `deletedAt` getter but no `delete()`/`restore()` methods.

#### Scenario: Map API record

- **WHEN** `toDomainModel` receives an API VAT record
- **THEN** it constructs a `VatEntity` with `id.toString()`, `amount ?? 0`, and formatted dates
