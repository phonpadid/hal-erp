## ADDED Requirements

### Requirement: Provide a per-resource permission helper

The system SHALL expose a composable `useResourcePermissions(resource: string)` under `src/common/shared/composables/` that returns an object `{ canCreate, canEdit, canDelete, canView }` of `ComputedRef<boolean>` values, each bound to a canonical permission string derived from the resource name.

#### Scenario: Composable returns four computed refs

- **WHEN** a caller invokes `useResourcePermissions("unit")`
- **THEN** the returned object contains exactly the keys `canCreate`, `canEdit`, `canDelete`, `canView`, each of type `ComputedRef<boolean>`

#### Scenario: Permission strings follow the verb-resource convention

- **WHEN** `useResourcePermissions("unit")` is invoked
- **THEN** `canCreate.value` reflects `hasPermission("create-unit")`, `canEdit.value` reflects `hasPermission("update-unit")`, `canDelete.value` reflects `hasPermission("delete-unit")`, and `canView.value` reflects `hasPermission("view-unit")`

#### Scenario: Reactivity follows the underlying store

- **WHEN** the authenticated user's permission list changes (e.g. after login or company switch) such that `update-unit` is added or removed
- **THEN** the previously-returned `canEdit` ref's `.value` reflects the new state on the next read without the caller re-invoking the composable

### Requirement: Canonical usePermissions location

The system SHALL designate `src/common/shared/store/usePermissions.ts` as the single source of truth for the `usePermissions()` composable. The previous duplicate at `src/modules/shared/utils/usePermissions.ts` SHALL be replaced with a deprecation-marked re-export of the canonical implementation so existing imports continue to resolve while new code is steered toward the canonical path.

#### Scenario: Importing from the deprecated path still works

- **WHEN** existing code imports `import { usePermissions } from "@/modules/shared/utils/usePermissions"`
- **THEN** the import resolves and returns the same composable instance as the canonical path; TypeScript and IDEs surface a `@deprecated` JSDoc warning pointing to `@/common/shared/store/usePermissions`

#### Scenario: Canonical path is the recommended import

- **WHEN** a developer authoring a new file invokes the IDE's auto-import for `usePermissions`
- **THEN** the deprecated module's `@deprecated` tag causes editors to deprioritize that path, so the canonical `@/common/shared/store/usePermissions` is suggested first
