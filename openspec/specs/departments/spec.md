# Departments

> Canonical spec — describes what the **departments** capability currently DOES. Source of truth for the department aggregate and its three sub-entities: department-approvers, department-roles, and department-users.

## Purpose

Manage organizational departments and the people/roles attached to them. A `department` is the root entity (name + code + type + optional head). Three child entities hang off it: **department-approvers** link users who may approve for a department, **department-roles** bind a role + a set of permissions to a department, and **department-users** assign a user (with position, signature, roles, permissions, and user-type) to a department. Each entity is independently CRUD-able through its own store, route, and API base path, but all share `department_id` as the linking key.

## Implementation Map

| Layer | Department | Department-approver | Department-role | Department-user |
| ----- | ---------- | ------------------- | --------------- | --------------- |
| View | `views/departments/departments/DepartmentView.vue` | `views/departments/department-approvers/DepartmentApvView.vue` | `views/departments/department-roles/DepartmentRoleView.vue` | `views/departments/deparment-user/DepartmentUserView.vue` |
| Component | `components/departments/departments/DepartmentForm.vue` | — | `components/departments/department-role/DepartmentRoleForm.vue`, `ManageFormDepartmentRole.vue` | `components/departments/department-user/DepartmentUser.vue`, `PermissionCard.vue` |
| Store | `stores/departments/department.store.ts` | `stores/departments/department-approver.store.ts` | `stores/departments/department-role.store.ts` | `stores/departments/department-user.store.ts` |
| Service | `application/services/departments/department.service.ts` | `.../department-approver.service.ts` | `.../department-role.service.ts` | `.../department-user.service.ts` |
| Repository (impl) | `infrastructure/departments/api-department.repository.ts` | `.../api-department-approver.repository.ts` | `.../api-department-role.repository.ts` | `.../api-department-user.repository.ts` |
| Repository (interface) | `domain/repository/departments/department.repository.ts` | `.../department-approver.repository.ts` | `.../department-role.repository.ts` | `.../department-user.repository.ts` |
| Entity | `domain/entities/departments/department.entity.ts` | `.../department-approver.entity.ts` | `.../department-role.entity.ts` | `.../department-user.entity.ts` |
| DTO | `application/dtos/departments/department.dto.ts` | `.../department-approver.dto.ts` | `.../department-role.dto.ts` | `.../department-user.dto.ts` |
| Route | `router/departments/department.routers.ts` | `.../department-approver.routers.ts` | `.../department-role.routers.ts` | `.../department-user.routers.ts` |
| Validation | `views/departments/departments/validation/department.validate.ts` | `views/departments/department-approvers/validation/department.validate.ts` | `views/departments/department-roles/validation/department-role.validate.ts` | `views/departments/deparment-user/validation/department-user.validate.ts` |

API base paths (one per sub-entity):
- Department → `/department` (`POST /department`, `GET /department`, `GET /department/{id}`, `PUT /department/{id}`, `DELETE /department/{id}`)
- Department-approver → `/department-approvers` (`POST /department-approvers`, `POST /department-approvers/by/user`, `GET /department-approvers`, `GET /department-approvers/{id}`, `PUT /department-approvers/{id}`, `PUT /department-approvers/by/user/{id}`, `DELETE /department-approvers/{id}`)
- Department-role → `/roles` + `/role` + `/department-role` (`POST /roles/department`, `GET /roles/{id}`, `GET /role/company`, `GET /roles/company`, `GET /department-role/department/{departmentId}`, `GET /department-role/role/{roleId}`, `PUT /roles/department/{id}`, `DELETE /roles/{id}`, `POST /department-role/{id}/restore`)
- Department-user → `/department-users` (`POST /department-users`, `GET /department-users`, `GET /department-users/{id}`, `GET /department-users/by/department/{id}`, `GET /department-users/approvers`, `PUT /department-users/{userId}`, `DELETE /department-users/{id}`)

## ADDED Requirements

### Requirement: Department CRUD

The system SHALL manage departments with `name`, `code`, `type` (`in_the_office` | `outside_the_office`), and an optional `department_head_id`. All persistence MUST go through `/department` as JSON. Entities are soft-deletable via a `deleted_at` flag.

#### Scenario: Create a department

- **WHEN** the user submits the department form with a `name`, `code`, and `type`
- **THEN** the system `POST`s `{ name, code, type }` to `/department`, maps the response into a `DepartmentEntity` (with `department_head_id` defaulting to null), and prepends it to the list

#### Scenario: List departments with pagination and search

- **WHEN** the list view loads or the user searches
- **THEN** the system `GET`s `/department` with query params `page`, `limit`, `includeDeleted`, and `search`, and renders the paginated `DepartmentEntity[]`

#### Scenario: Update a department

- **WHEN** the user edits a department and submits
- **THEN** the system `PUT`s `{ id, name, code, department_head_id, type }` to `/department/{id}` and updates the entity via `updateDpm()`

#### Scenario: Delete a department

- **WHEN** the user confirms deletion
- **THEN** the system `DELETE`s `/department/{id}` (soft-delete) and refetches the list

### Requirement: Department field validation

The department form SHALL require `name` and `code`. `name` MUST be at most 255 characters and `code` MUST be at most 150 characters before submission.

#### Scenario: Missing required fields

- **WHEN** the user submits with an empty `name` or `code`
- **THEN** the `UiForm` blocks submission and shows the i18n validation messages (`departments.dpm.error.name`, `departments.dpm.error.code`) and no request is made

#### Scenario: Field exceeds max length

- **WHEN** `name` exceeds 255 characters or `code` exceeds 150 characters
- **THEN** validation fails with the `*_max` i18n message and no request is made

### Requirement: Department-approver assignment

The system SHALL link one or more users to a department as approvers. `user_id` is stored internally as `string[]` but crosses the wire as `number[]`. The system MUST support two creation/update flows: a user-initiated flow (`/department-approvers`) and an admin-initiated flow that also sets the department (`/department-approvers/by/user`).

#### Scenario: User-initiated approver create

- **WHEN** a non-admin assigns approver users
- **THEN** the system `POST`s `{ user_id: number[] }` to `/department-approvers` and maps the response into a `DepartmentApproverEntity`

#### Scenario: Admin-initiated approver create

- **WHEN** an admin assigns approvers to a specific department
- **THEN** the system `POST`s `{ user_id: number[], department_id }` to `/department-approvers/by/user`

#### Scenario: Filter approvers by department

- **WHEN** the list is filtered by department
- **THEN** the system `GET`s `/department-approvers` with `department_id` (plus `page`, `limit`, `includeDeleted`, `search`)

#### Scenario: Update approver users

- **WHEN** a non-admin edits the approver's user list, it `PUT`s to `/department-approvers/{id}` via `updated(user_id)`; **WHEN** an admin edits both department and users, it `PUT`s to `/department-approvers/by/user/{id}` via `updatedByAdmin(department_id, user_id)`
- **THEN** the matching endpoint is called and the entity is mutated accordingly

#### Scenario: Approver required fields

- **WHEN** the approver form is submitted without `user_id` or `department_id`
- **THEN** validation fails with `departments.dpm_user.error.user` / `departments.dpm_user.error.dpm` and no request is made

### Requirement: Department-role binds role and permissions to a department

The system SHALL bind a `role_id` and a `department_id` to a set of `permissions: number[]` within a department context. Create uses `POST /roles/department`; update uses `PUT /roles/department/{id}`. Each field mutation also bumps `updated_at`.

#### Scenario: Create a department-role

- **WHEN** the user selects a role, a department, and at least one permission and submits
- **THEN** the system `POST`s `{ role_id, department_id, permissions }` to `/roles/department` and maps the response into a `DepartmentRole`

#### Scenario: Department-role validation

- **WHEN** the form is submitted with `role_id <= 0`, `department_id <= 0`, or an empty `permissions` array
- **THEN** validation fails ("Role is required" / "Department is required" / "At least one permission is required") and no request is made

#### Scenario: List with display details

- **WHEN** the list view needs human-readable names
- **THEN** the system `GET`s `/roles/company` and maps each row to a `DepartmentRoleWithDetailsDTO` carrying `name`, `role_display_name`, `department_name`, and `department_code`

#### Scenario: Find roles scoped by department or by role

- **WHEN** code calls `getDepartmentRolesByDepartment(departmentId)` or `getDepartmentRolesByRole(roleId)`
- **THEN** the system `GET`s `/department-role/department/{departmentId}` or `/department-role/role/{roleId}` respectively

#### Scenario: Restore a soft-deleted department-role

- **WHEN** `restoreDepartmentRole(id)` is invoked
- **THEN** the system `POST`s `/department-role/{id}/restore`, the entity's `restore()` clears `deletedAt`, and a restored `DepartmentRole` is returned

### Requirement: Department-user assignment with signature upload

The system SHALL assign a user to a department with a `position_id`, a `signature_file` (a `File` or an existing URL string), `permissionIds`, `roleIds`, and a `user_type` (defaulting to `["department"]`). Create and update MUST be sent as `multipart/form-data` to support the signature file upload.

#### Scenario: Create a department-user

- **WHEN** the user submits the department-user form with a signature file
- **THEN** the system `POST`s a `FormData` body to `/department-users` containing `username`, `email`, `firstName`, `lastName`, `positionId`, `departmentId`, `signatureFile`, JSON-stringified `permissionIds` and `roleIds`, and indexed `user_type[i]` entries, then maps the response into a `DepartmentUserEntity`

#### Scenario: Update a department-user

- **WHEN** the user edits a department-user
- **THEN** the system `PUT`s the same `FormData` shape to `/department-users/{userId}`; the signature field may carry either a new `File` or the existing URL string

#### Scenario: Department-user validation

- **WHEN** the form is submitted
- **THEN** validation requires `username` (max 255), `first_name`, `last_name`, `departmentId`, `position_id`, `email` (type email, max 100), `tel` (max 50), `roleIds`, `permissionIds`, `password` (min 6, max 100), `confirm_password` (min 6, max 100, must match `password`), and `signature_file` (non-null); any failure blocks submission

#### Scenario: List approvers / users by department

- **WHEN** the system needs department members
- **THEN** `getAllDepartmentUserByDmp(id)` `GET`s `/department-users/by/department/{id}`, and `getAllDepartmentUserApproversByDmp(params)` `GET`s `/department-users/approvers` with `page`, `limit`, `sort_order`, `search`, and `department_id`

#### Scenario: Cache-busting on list fetch

- **WHEN** the department-user list is fetched
- **THEN** the request appends a `_t` timestamp param to bypass caching, and rows whose `user` is falsy are filtered out

### Requirement: Soft-delete across all sub-entities

Every department sub-entity SHALL be soft-deletable via a `deleted_at`/`deletedAt` flag exposed through `isDeleted()`. Department-approver, department-role, and department-user additionally expose `restore()`.

#### Scenario: Soft-deleted records are filterable

- **WHEN** a record's `deleted_at` is set
- **THEN** `isDeleted()` returns `true`, and stores expose only active records unless `includeDeleted` is requested in the list query

### Requirement: Routes and authentication

Each sub-entity SHALL be reachable through its own authenticated route. All routes set `requiredAuth: true`.

#### Scenario: Department-role create/edit routing

- **WHEN** the user navigates the department-role feature
- **THEN** `/department-role` (`department_role.index`) lists, `/department-role/create` (`department_role.create`) creates, and `/department-role/edit/:id` (`department_role.edit`) edits via `DepartmentRoleForm`

#### Scenario: Department-user create/edit routing

- **WHEN** the user navigates the department-user feature
- **THEN** `/department-user` (`department_user.index`) lists, `/add/department-user` (`add_department_user.index`) creates, and `/edit/department-user/:id` (`edit_department_user.index`) edits

#### Scenario: Department and approver routing

- **WHEN** the user navigates these features
- **THEN** `/department` (`department.index`) and `/department-approver` (`department_approver.index`) render their respective list views behind the auth guard
