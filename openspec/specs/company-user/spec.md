# Company User Management

> Canonical spec — describes what the **company-user** capability currently DOES. Source of truth for listing, creating, updating, and soft-deleting users that belong to a company, plus role/permission assignment and uniqueness checks.

## Purpose

Manage the users that belong to a given company. Each company user links an identity (username, email, tel, optional signature) to a `company_id` and carries assigned roles and permissions. The capability supports paginated listing (filtered by company), create, update, soft-delete, fetching available roles/permissions for the assignment UI, and server-side uniqueness checks for username/email/tel scoped to a company.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/company-user/CompanyUserList.vue`, `CompanyUserCreateView.vue`, `CompanyUserEditView.vue` |
| Component | `src/modules/presentation/Admin/components/company-user/ManageCompanyUserForm.vue` |
| Validation | `src/modules/presentation/Admin/views/company-user/validation/company-user.validate.ts` |
| Store | `src/modules/presentation/Admin/stores/company-user.store.ts` |
| Repository (impl) | `src/modules/infrastructure/api-company-user.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/company-user.repository.ts` |
| Entity | `src/modules/domain/entities/company-user.entity.ts` |
| Interface/DTO | `src/modules/interfaces/company-user.interface.ts` |
| Route | `src/modules/presentation/Admin/router/company-user.routes.ts` |

API base path: `/company-users`. Endpoints: `GET /company-users`, `GET /company-users/:id`, `POST /company-users`, `PUT /company-users/:id`, `DELETE /company-users/:id`, `GET /company-users/roles`, `GET /company-users/permissions`, `GET /company-users/check-username`, `GET /company-users/check-email`, `GET /company-users/check-tel`.

## ADDED Requirements

### Requirement: List company users with pagination, search, and company filter

The system SHALL fetch company users from `GET /company-users` passing `page`, `limit`, `search`, and optional `company_id`. It MUST read the list from `response.data.data` and pagination from `response.data.pagination`.

#### Scenario: Fetch users for a company

- **WHEN** `fetchCompanyUsers({ page, limit, search, company_id })` is called
- **THEN** the store requests `GET /company-users` with those params, stores `result.data` in `companyUsers`, and updates `pagination`

#### Scenario: Pagination total fallback

- **WHEN** the API returns `total: 0` but the page still contains rows
- **THEN** the store derives an estimated `total` from `totalPages × limit` or from `(currentPage − 1) × limit + dataLength` so paging controls still work

> NOTE: This total-estimation heuristic is a client-side workaround for an inconsistent API and should be removed once the back-end always returns a correct `pagination.total`.

### Requirement: Create a company user with roles and permissions

The system SHALL create a company user by sending a `CompanyUserCreatePayload` (`username`, `email`, `tel`, `firstName`, `lastName`, `password`, `confirm_password`, optional `signature`, `roleIds`, `permissionIds`, optional `company_id`) to `POST /company-users`. The created record MUST be unshifted onto `companyUsers` and `pagination.total` incremented.

#### Scenario: Successful create

- **WHEN** the create form passes validation and the API succeeds
- **THEN** the new user is prepended to `companyUsers`, `pagination.total` is incremented, and a success notification is shown via `useNotification`

#### Scenario: Server validation errors flattened

- **WHEN** the API responds with an `errors` object
- **THEN** the repository flattens all error arrays into a single comma-joined message and throws it as an `Error`

### Requirement: Update a company user

The system SHALL update a company user by sending `{ id, ...data }` (partial `CompanyUserUpdatePayload`) to `PUT /company-users/:id`, replacing the matching entry in `companyUsers` and updating `currentCompanyUser` when ids match.

#### Scenario: Successful update

- **WHEN** `updateCompanyUser(id, data)` resolves
- **THEN** the store replaces the user at the matching index and refreshes `currentCompanyUser` if it has the same id

### Requirement: Soft-delete a company user

The system SHALL delete a company user via `DELETE /company-users/:id`. On success the store MUST remove it from the in-memory list and decrement `pagination.total` (floored at 0).

#### Scenario: Delete succeeds

- **WHEN** `deleteCompanyUser(id)` resolves
- **THEN** the store splices the user out of `companyUsers`, decrements `pagination.total` (never below 0), clears `currentCompanyUser` if it matched, and shows a success notification

### Requirement: Provide available roles and permissions for assignment

The system SHALL fetch assignable roles from `GET /company-users/roles` and permissions from `GET /company-users/permissions`, exposing them as `roleOptions`/`permissionOptions` (`{ label: name, value: id }`).

#### Scenario: Load assignment options

- **WHEN** `fetchAvailableRoles()` / `fetchAvailablePermissions()` are called
- **THEN** the store stores the raw lists and the getters map each to `{ label, value }` for select inputs

### Requirement: Uniqueness checks scoped to a company

The system SHALL check username, email, and tel availability within a company via `GET /company-users/check-username`, `check-email`, and `check-tel`, each passing the value plus `company_id` and an optional `exclude_id`, returning the boolean `response.data.exists`.

#### Scenario: Username already taken

- **WHEN** `checkUsernameExists(username, companyId, excludeId)` is called
- **THEN** the repository requests the check endpoint and returns `exists`; if the request fails the store swallows the error and returns `false`

### Requirement: Company-user form validation

The form SHALL require `username` (2–50 chars), a valid `email`, a `tel` matching `^\d{8,15}$`, `firstName` and `lastName` (letters only, max 50), and — in create mode only — a `password` (min 6) with a matching `confirm_password`.

#### Scenario: Password confirmation mismatch

- **WHEN** in create mode `confirm_password` does not equal `password`
- **THEN** the validator rejects with the `passwordMismatch` message and submission is blocked

#### Scenario: Password optional in edit mode

- **WHEN** the form is in edit mode (`isEditMode` true)
- **THEN** `password` and `confirm_password` are not required

### Requirement: Company-user entity invariants and relationship

The `CompanyUserEntity` SHALL carry a numeric `id` and `company_id` linking the user to its company, hold `roles`/`permissions` arrays, expose `isDeleted()`/`delete()`/`restore()` for soft-delete, and provide `hasRole()`, `hasPermission()`, `getRoleNames()`, `getPermissionNames()`, plus `toInterface()`/`fromAPI()` mappers. Setters refresh `updated_at`.

#### Scenario: Role lookup

- **WHEN** `hasRole(name)` is called
- **THEN** it returns `true` if any assigned role's `name` matches

> NOTE: Unlike the string-id entities elsewhere in this codebase, `CompanyUserEntity` uses numeric `id`/`company_id`. The interface keeps both flat (`username`) and nested (`user.username`) shapes for backward compatibility, and the constructor falls back from the flat to the nested values.
