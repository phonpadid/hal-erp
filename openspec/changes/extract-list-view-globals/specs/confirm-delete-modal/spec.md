## ADDED Requirements

### Requirement: Provide a reusable delete-confirmation modal

The system SHALL expose a `ConfirmDeleteModal` component under `src/common/shared/components/Modal/` that any feature page can use to confirm a single-item delete action. The component MUST own its OK/Cancel buttons, loading state, and i18n strings so that callers only supply the target item and a confirm handler.

#### Scenario: Caller opens modal with default copy

- **WHEN** a caller binds `:visible="true"` and passes `:item-name="record.name"` without overriding `title` or `body`
- **THEN** the modal renders with i18n key `common.confirmDelete.title` as title, `common.confirmDelete.body` (interpolated with `itemName`) as body, `common.confirmDelete.ok` as the OK label, and `common.confirmDelete.cancel` as the Cancel label

#### Scenario: User confirms deletion

- **WHEN** the user clicks the OK button while `loading` is `false`
- **THEN** the component emits `confirm` (with no payload) and does NOT auto-close — the caller is responsible for closing via `v-model:visible`

#### Scenario: Loading state during async delete

- **WHEN** the caller sets `:loading="true"` after `confirm` is emitted
- **THEN** the OK button shows a spinner, both OK and Cancel become non-interactive, and the modal cannot be dismissed by clicking the backdrop or pressing Escape

#### Scenario: User cancels

- **WHEN** the user clicks Cancel, the close (×) button, the backdrop, or presses Escape while `loading` is `false`
- **THEN** the component emits `update:visible` with `false` and emits `cancel` — no `confirm` event is emitted

### Requirement: Support custom copy and severity overrides

The component SHALL accept optional props to override the title, body, OK label, and a `danger` flag for cases where the default "delete" wording does not fit (e.g. "Revoke access", "Cancel order").

#### Scenario: Caller overrides title and body

- **WHEN** a caller passes `:title="t('orders.cancelConfirm.title')"` and `:body="t('orders.cancelConfirm.body')"`
- **THEN** the modal uses those strings verbatim instead of the default `common.confirmDelete.*` keys

#### Scenario: Caller marks action as non-destructive

- **WHEN** a caller passes `:danger="false"`
- **THEN** the OK button uses the primary (non-danger) styling

### Requirement: i18n bundle additions

The locales `en`, `la`, and `cn` under `src/common/locales/` MUST each provide the keys `common.confirmDelete.title`, `common.confirmDelete.body`, `common.confirmDelete.ok`, and `common.confirmDelete.cancel`. The `body` key MUST support an `{itemName}` placeholder.

#### Scenario: Locale renders body with item name

- **WHEN** the active locale is `la` and the caller passes `:item-name="'ສະກຸນເງິນ USD'"`
- **THEN** the body renders the Lao confirmation sentence with `ສະກຸນເງິນ USD` interpolated into the `{itemName}` slot
