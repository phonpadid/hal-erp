## ADDED Requirements

### Requirement: Provide a reusable row-actions component

The system SHALL expose a `RowActionButtons` component under `src/common/shared/components/table/` for use inside the `#actions` slot of `Table.vue` / `UiTable.vue`. The component MUST encapsulate the Edit / Delete button pair currently duplicated across ~31 list views, including icon, color, shape, size, and accessibility attributes, so that consumers no longer hand-write `<UiButton icon="ant-design:edit-outlined" ...>` for these standard actions.

#### Scenario: Default Edit and Delete buttons render

- **WHEN** a caller uses `<RowActionButtons :record="record" :can-edit="true" :can-delete="true" @edit="..." @delete="..." />`
- **THEN** two circular icon buttons render — the Edit button uses `ant-design:edit-outlined` in the orange theme, the Delete button uses `ant-design:delete-outlined` in red with the `danger` flag, both sized `small`

#### Scenario: Permission flags hide actions

- **WHEN** `:can-edit="false"` is passed (and `:can-delete="true"`)
- **THEN** the Edit button is NOT rendered (not merely hidden via CSS); the Delete button still renders

#### Scenario: Soft-deleted records disable Edit

- **WHEN** the caller passes `:disabled="(record) => !!record.deleted_at"` and the row record has a non-null `deleted_at`
- **THEN** the Edit button renders with `disabled` attribute set, while the Delete button remains interactive

#### Scenario: Click events emit the record

- **WHEN** the user clicks the Edit button
- **THEN** the component emits `edit` with the `record` object as the payload (single argument). The same applies for `delete` → `delete` event.

### Requirement: Support optional View and Restore actions

The component SHALL render an optional View button (eye icon) and Restore button (rotate icon) when corresponding `can-view` / `can-restore` props are truthy, and emit `view` / `restore` events with the record. These two MUST be off by default to keep the common case (Edit + Delete) unconfigured.

#### Scenario: View enabled

- **WHEN** the caller passes `:can-view="true"`
- **THEN** a View button renders before the Edit button using `ant-design:eye-outlined`, and clicking it emits `view` with the record

### Requirement: Extensibility via slot

The component SHALL expose a named slot `extra` (with `record` as slot prop) where callers can drop additional buttons specific to their feature without forking the component.

#### Scenario: Caller injects a custom approve button

- **WHEN** the caller writes `<template #extra="{ record }"><UiButton ... @click="approve(record)" /></template>`
- **THEN** the custom button renders after the built-in buttons in the same flex container with consistent spacing
