# User Management

> Canonical spec — describes what the **user** capability currently DOES. Source of truth for listing, creating, editing, deleting users, assigning their roles/permissions, and password changes.

## Purpose

Manage the system's user accounts: paginated listing with search, create/update/soft-delete, assignment of roles and direct permissions to each user, and both admin-driven and self-service password changes. All access goes through the Pinia store → service → use case → `ApiUserRepository` chain against the REST API.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/user/UserList.vue` |
| Component (form) | `src/modules/presentation/Admin/components/user/ManageUserForm.vue`, `UserForm.vue`, `ResetPasswordForm.vue` |
| Store | `src/modules/presentation/Admin/stores/user.store.ts` |
| Service | `src/modules/application/services/user.service.ts` |
| Use cases | `src/modules/application/useCases/user/{create,update,delete,get-all,get-user-by-id,change-password}-user.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-user.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/user.repository.ts` |
| Entity | `src/modules/domain/entities/user.entities.ts` |
| Interface/payloads | `src/modules/interfaces/user.interface.ts` |
| DTO | `src/modules/application/dtos/user.dto.ts` |
| Validation | `src/modules/presentation/Admin/views/user/validation/user.validate.ts` |
| Route | `src/modules/presentation/Admin/router/userRoutes.ts` |

API base path: `/users`. Endpoints: `GET /users` (list), `GET /users/:id`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`, `PUT /users/change-password/:id` (admin reset), `PUT /users/change-password` (self).

## ADDED Requirements

### Requirement: Paginated user listing with search

The system SHALL fetch users from `GET /users` with `page`, `limit`, `search`, `sort_by`, `sortDirection`, and `include_deleted` query parameters, and MUST map the API `pagination` block into the store's `pagination` state (`page`, `limit`, `total`, `totalPages`).

#### Scenario: Loading the list

- **WHEN** `fetchUsers({ page, limit })` is called
- **THEN** the repository requests `GET /users` with the supplied params (defaulting `page=1`, `limit=10`, `search=""`, `include_deleted=false`), maps each row to a `UserEntity` via `toDomainModel`, and the store sets `users` and `pagination`

#### Scenario: Search by username or email helpers

- **WHEN** `findByUsername(username)` or `findByEmail(email)` is invoked
- **THEN** the repository queries `GET /users` with `{ username | email, limit: 1 }` and returns the first matching `UserEntity`, or `null` if the result set is empty

### Requirement: Create a user with roles and permissions

The system SHALL create a user via `POST /users`. The payload MUST include `username`, `email`, `password`, `tel`, `roleIds`, and `permissionIds`; the repository MUST split `first_name`/`last_name` into `firstName`/`lastName` keys for the API.

#### Scenario: Successful creation

- **WHEN** `createUser(payload)` is called with valid data
- **THEN** the repository posts to `/users` with `firstName`/`lastName` and the rest of the payload, returns the created `UserEntity`, and the store prepends it to `users`

#### Scenario: Validation gates submission

- **WHEN** the form is submitted
- **THEN** `createUserValidation` requires `username` (min 3, pattern `^[a-zA-Z0-9_]+$`), `first_name`, `last_name`, a valid `email`, `password` (min 6, required only when not in edit mode), a matching `confirmPassword`, and `tel` matching `^[0-9]+$`

### Requirement: Assign roles and direct permissions to a user

The system SHALL let an editor select one or more roles and zero or more individual permissions for a user. `ManageUserForm.vue` MUST load selectable roles from the role store and permission groups from `permissionStore.fetchPermission()`, and submit the chosen IDs as numeric `roleIds` and `permissionIds`.

#### Scenario: Selecting roles and permissions

- **WHEN** the editor picks roles and permissions in the form
- **THEN** `formState.roleIds` and `formState.permissionIds` are coerced to numbers (`.map(Number)`) before submission

#### Scenario: Mapping to the API on update

- **WHEN** `update(id, payload)` runs
- **THEN** the repository sends `roles: payload.roleIds` and `permissions: payload.permissionIds` (alongside `firstName`/`lastName`) to `PUT /users/:id`

### Requirement: Update an existing user

The system SHALL update a user via `PUT /users/:id` and MUST refresh the matching entry in the store's `users` array and `currentUser` if it is the loaded user.

#### Scenario: Editing a user

- **WHEN** `updateUser(id, payload)` succeeds
- **THEN** the store replaces the user at the matching index and updates `currentUser` when its id matches

### Requirement: Soft-delete a user

The system SHALL delete a user via `DELETE /users/:id`. On success the store MUST mark the in-memory entity deleted by calling `entity.delete()` (setting `deleted_at`) rather than removing it from the array.

#### Scenario: Deleting a user

- **WHEN** `deleteUser(id)` returns `true`
- **THEN** the store finds the user by id and calls `.delete()` on it, so `isDeleted()` becomes `true` and it falls into the `inactiveUsers` computed group

### Requirement: Admin password reset for another user

The system SHALL reset a target user's password via `PUT /users/change-password/:id` sending `{ old_password, new_password, confirm_password }` (defaulting `confirm_password` to `new_password`).

#### Scenario: Reset succeeds

- **WHEN** `resetPassword(id, old, new, confirm?)` is called
- **THEN** the repository puts to `/users/change-password/:id`; on HTTP 400/401/403/404 it throws a specific message ("Invalid password format" / "Current password is incorrect" / "Not authorized to change password" / "User with id … not found")

### Requirement: Self-service password change

The system SHALL let the logged-in user change their own password via `PUT /users/change-password` (no id; identity from JWT) sending `{ old_password, new_password, confirm_password }`.

#### Scenario: Own password change with error key

- **WHEN** `changeMyPassword(payload)` fails with an API `errorKey`
- **THEN** the repository throws an `Error` whose `message` is the API message (or the `errorKey`) and which carries the `errorKey` property for the caller

### Requirement: User entity identity and date handling

The `UserEntity` SHALL accept `id` as a string and expose it via `getId()` while also exposing a numeric `id`. Dates MUST be normalized with `formatDate()` in the constructor, and `isDeleted()` MUST return `true` only when `deleted_at` is non-null.

#### Scenario: ID coercion across the wire

- **WHEN** the API returns a numeric `id`
- **THEN** `toDomainModel` calls `id.toString()` and the entity stores the string id (private) plus `parseInt(id)` as the public numeric `id`

#### Scenario: Signature normalization

- **WHEN** the API returns a `user_signature` object with a `signature_url`
- **THEN** the entity sets both `user_signature` and the convenience `signature` field; otherwise both default to `null`/`""`
