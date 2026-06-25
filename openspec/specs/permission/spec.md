# Permission Management

> Canonical spec — describes what the **permission** capability currently DOES. Source of truth for listing the permission catalog and for the permission-string convention used to gate routes, menus, and UI actions across the app.

## Purpose

Expose the catalog of permissions (grouped by `type`) so they can be assigned to users and roles, and define how a permission string of the form `<verb>-<resource>` is checked at runtime to authorize routes and UI elements. The permission catalog is read-only from the client (list-only); assignment happens through the user and role features.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/permission/Permission.vue` |
| Component | `src/modules/presentation/Admin/components/permission/{PermissionManager,PermissionSelector,PermissionTest}.vue` |
| Store | `src/modules/presentation/Admin/stores/permission.store.ts` |
| Service | `src/modules/application/services/permission.service.ts` |
| Use case | `src/modules/application/useCases/permission/get-all-permission.usecase.ts` |
| Repository (impl) | `src/modules/infrastructure/api-permission.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/permsision.repository.ts` |
| Entity | `src/modules/domain/entities/permission.entities.ts` |
| Interface | `src/modules/interfaces/permission.interface.ts` |
| Route | `src/modules/presentation/Admin/router/permissionRoutes.ts` |
| Runtime check (canonical) | `src/common/shared/store/usePermissions.ts` |
| Runtime check (duplicate) | `src/modules/shared/utils/usePermissions.ts` + `jsonPermission.ts` |
| Route guard | `src/common/shared/guards/permission.guard.ts` |

API base path: `/permissions`. Endpoint: `GET /permissions` (list only — no create/update/delete from the client).

## ADDED Requirements

### Requirement: List the permission catalog

The system SHALL fetch permissions from `GET /permissions` with `page`, `limit`, `search`, and a `status` param set to `"active"` when deleted entries are excluded. Each row MUST map to a `Permission` entity carrying `id`, `name`, `display_name`, `display_name_lo`, `type`, and a nested `permissions` group array.

#### Scenario: Loading permissions

- **WHEN** `fetchPermission({ page, limit })` is called (default `limit` is large, e.g. 1000, to load the whole catalog)
- **THEN** the repository requests `GET /permissions`, maps each row via `toDomainModel`, and the store builds `Permission` entities and sets `pagination`

#### Scenario: Grouped permissions

- **WHEN** a permission row contains a nested `permissions` array
- **THEN** the entity exposes them via `getPermissions()` for use by the permission selector when assigning to users/roles

### Requirement: Permission-string convention

Permissions SHALL be identified by string keys of the form `<verb>-<resource>` (e.g. `create-user`, `view-budget`, `approve-purchase-request`). Route meta and inline checks MUST use these strings to authorize.

> NOTE: naming is not fully consistent across the codebase — both `create-*` and `write-*`/`edit-*` verbs exist (see `usePermissions.ts` PERMISSIONS map). New code SHOULD prefer the `<verb>-<resource>` form with verbs `create`/`update`/`delete`/`view`.

#### Scenario: Route-level gate

- **WHEN** a route declares `meta.permission = "<verb>-<resource>"`
- **THEN** `permissionGuard` calls `hasPermission(meta.permission)`; if it returns `false` it redirects to the `unauthorized` route, otherwise it calls `next()`

#### Scenario: Inline UI gate

- **WHEN** a view caches `const canX = ref(hasPermission('<verb>-<resource>'))`
- **THEN** elements bound with `v-if="canX"` render only when the permission is present

### Requirement: Runtime permission resolution

The system SHALL resolve a permission check (`hasPermission`) by (1) granting everything to special roles, (2) checking the user's direct permission list, and (3) — in the duplicate util — checking role-derived permissions from a JSON config.

#### Scenario: Special-role bypass

- **WHEN** the user's roles include `super-admin`, `admin`, or `company-admin`
- **THEN** `hasPermission(...)` returns `true` for any permission string regardless of the explicit permission list

#### Scenario: Explicit permission match

- **WHEN** the user has no special role
- **THEN** `hasPermission(name)` returns `true` only if `name` is in `authStore.userPermissions` (or, in the duplicate util, in `getPermissionsForRole(role)` for one of the user's roles)

#### Scenario: localStorage fallback

- **WHEN** the auth store's `userPermissions` is empty on page load
- **THEN** the canonical `usePermissions` reads `userPermissions` from `localStorage` and uses it as the source for checks

### Requirement: Two usePermissions implementations exist

The codebase SHALL be understood to contain two `usePermissions` composables with different signatures. The canonical one is `common/shared/store/usePermissions.ts` (exposes `hasPermission`, `hasCompanyPermission`); the duplicate `modules/shared/utils/usePermissions.ts` adds role-config helpers and is being deprecated.

> NOTE: When editing existing code, match the import the surrounding file already uses; do not migrate in unrelated PRs (pitfall #1).

#### Scenario: Choosing the right import

- **WHEN** adding a permission check to an existing view
- **THEN** the same `usePermissions` module already imported by that file is used, not the other one

### Requirement: Default purchase-request permission patch

On login the auth store SHALL force-append `"write-purchase-request"` to the user's permission list. Permission-gated purchase-request features therefore evaluate as reachable even when the back-end omits this permission.

> NOTE: temporary patch (pitfall #2); MUST be removed once the back-end issues the permission, and MUST NOT be replicated in new code.

#### Scenario: User lacking the permission at login

- **WHEN** the API login response omits `write-purchase-request`
- **THEN** the store appends it to `userPermissions` before persisting, so `hasPermission('write-purchase-request')` is satisfied
