# Role Management

> Canonical spec — describes what the **role** capability currently DOES. Source of truth for listing, creating, updating, and deleting roles, and how a role carries a set of permissions that can be granted to users.

## Purpose

Manage roles — named groupings of permissions scoped to a department/company — that are assigned to users. Roles are listed with pagination and search, can be created/updated/deleted, and each role exposes a `permissions` array of permission IDs. The store mediates between the view and the `ApiRoleRepository`.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/role/RoleView.vue`, `Role.vue` |
| Component (form) | `src/modules/presentation/Admin/components/role/ManageFormRole.vue`, `RoleForm.vue` |
| Store | `src/modules/presentation/Admin/stores/role.store.ts` |
| Service | `src/modules/application/services/role.service.ts` (and `role-user.service.ts`) |
| Use cases | `src/modules/application/useCases/role/{create,update,delete,get-all,get-role-by-id,get-company-users}.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-role.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/role.repository.ts` |
| Entity | `src/modules/domain/entities/role.entities.ts` |
| Interface | `src/modules/interfaces/role.interface.ts` |
| Validation | `src/modules/presentation/Admin/views/role/validation/role.validate.ts` |
| Route | `src/modules/presentation/Admin/router/roleRoutes.ts` |

API base path: `/roles`. Endpoints: `GET /roles` (list, also reused for company-users), `GET /roles/:id`, `POST /roles`, `PUT /roles/:id`, `DELETE /roles/:id`.

## ADDED Requirements

### Requirement: Paginated role listing with filters

The system SHALL fetch roles from `GET /roles` supporting `page`, `limit`, `search`, `department_id`, `company_id`, and `type` query params, plus a `status` param set to `"active"` when deleted roles are excluded. The repository MUST compute `totalPages` from the API `pagination` block (falling back to `Math.ceil(total/limit)`).

#### Scenario: Loading roles

- **WHEN** `fetchAllRoles({ page, limit })` is called
- **THEN** the repository requests `GET /roles` with `status: "active"` (unless `includeDeleted`), maps each row to a `Role` entity, and the store sets both `roles` (entities) and `rawRoles` (a deep-cloned plain copy) plus `pagination`

#### Scenario: Company-users variant

- **WHEN** `fetchCompanyUsers(params)` is called
- **THEN** the repository hits the same `GET /roles` endpoint with `page`/`limit`/`search` only and the store overwrites `roles`/`rawRoles` with the result

### Requirement: A role groups permissions

The `Role` entity SHALL hold a `permissions: number[]` array (permission IDs), a `department_id`/`department_name`, and a `display_name`. This permission set is what a role contributes when assigned to a user.

#### Scenario: Reading a role's permissions

- **WHEN** `role.getPermissions()` is called
- **THEN** it returns the numeric array of permission IDs the role grants

#### Scenario: Mapping from API

- **WHEN** `toDomainModel` runs
- **THEN** it constructs `Role` from `id.toString()`, `name`, `display_name`, `department_id`, `department_name` (defaulting `""`), and `permissions`

### Requirement: Create a role

The system SHALL create a role via `POST /roles`. The `CreateRole` payload currently carries only `{ name }`.

#### Scenario: Successful creation

- **WHEN** `createRole({ name })` is called
- **THEN** the repository posts to `/roles`, returns the new `Role`, and the store prepends it to `roles` and `rawRoles`

#### Scenario: Name validation

- **WHEN** the role form is submitted
- **THEN** `roleRules` requires `name`, enforces min length 2, max length 100, and pattern `^[a-zA-Z0-9_\-\s]+$`

### Requirement: Update a role

The system SHALL update a role via `PUT /roles/:id`. The repository MUST send only `{ name }` in the update payload.

#### Scenario: Editing a role

- **WHEN** `updateRole(id, { name })` succeeds
- **THEN** the store replaces the entity (and its `rawRoles` clone) at the matching index and refreshes `currentRole` when its id matches

### Requirement: Delete a role

The system SHALL delete a role via `DELETE /roles/:id`. On success the store MUST remove the role from both `roles` and `rawRoles` (a hard removal from the in-memory arrays).

#### Scenario: Deleting a role

- **WHEN** `deleteRole(id)` returns `true`
- **THEN** the store splices the role out of `roles` and `rawRoles` and clears `currentRole` if it matched

### Requirement: Lookup helpers and not-found handling

The system SHALL support `findById` and `findByName`. A 404 on `findById` MUST resolve to `null` rather than throwing.

#### Scenario: Missing role by id

- **WHEN** `GET /roles/:id` returns HTTP 404
- **THEN** the repository returns `null`

### Requirement: Normalized error handling

The repository SHALL convert API failures via `handleApiError`, throwing `API Error (<status>): <message>` for HTTP responses, a network-error message when no response was received, and a generic message otherwise.

#### Scenario: Server error during create

- **WHEN** `POST /roles` fails with an HTTP status
- **THEN** the repository throws `API Error (<status>): <server message or default>` and the store records it in `error` and re-throws
