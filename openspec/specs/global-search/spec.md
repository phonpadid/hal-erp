# Global Search

> Canonical spec — describes what the **global-search** capability currently DOES. A small cross-cutting Pinia store that holds the single keyword typed into the top-bar search box and a submit `trigger`, shared by list views that opt in. Source of truth for how the keyword propagates to list views and is auto-cleared on navigation.

## Purpose

Provide one shared search keyword across the app's top bar so that a user can type a query once and have the currently-displayed list view filter against it on submit, without each view owning its own search input. The keyword is intentionally reset on every route change so each page loads its own data fresh.

## Implementation Map

| Layer | File |
| ----- | ---- |
| Store | `src/modules/presentation/Admin/stores/global-search.store.ts` |
| Producer (top bar input) | `src/common/shared/layouts/BaseTopbar.vue` |
| Auto-clear hook | `src/common/shared/router/index.ts` (`router.beforeEach`) |
| Consumers (list views, opt-in) | `src/modules/presentation/Admin/components/purchase-requests/approval-purchase-requests/ApprovalPuchaseRq.vue`, `src/modules/presentation/Admin/components/approval-department/ApprovalDepartmentTable.vue`, `src/modules/presentation/Admin/views/disbursement-slip/ApprovalByFinanceDepartment.vue` |

No API, repository, service, entity, or route belongs to this capability — it is purely client-side shared state. The store (`defineStore("globalSearch")`) exposes `keyword`, `trigger`, `trimmedKeyword`, `setKeyword(value)`, and `clear()`.

## ADDED Requirements

### Requirement: Single shared keyword set from the top bar

The store SHALL hold one reactive `keyword` string. The top bar's search box SHALL be the producer: on search submit it calls `setKeyword(value)`, which assigns the keyword (coercing `null`/`undefined` to `""`) and increments `trigger`. The store also exposes `trimmedKeyword` (the keyword with surrounding whitespace removed).

#### Scenario: User submits a search from the top bar

- **WHEN** the user submits the top-bar search via `handleGlobalSearch(value)`
- **THEN** `setKeyword(value)` sets `keyword` and increments `trigger`, and the top bar's local `searchInput` stays in sync through a watcher on `keyword`

#### Scenario: Null-safe assignment

- **WHEN** `setKeyword` receives `null` or `undefined`
- **THEN** `keyword` is set to the empty string `""`

### Requirement: Submit-only trigger drives refetch

The store SHALL expose a numeric `trigger` that increments ONLY on `setKeyword` (i.e. an explicit submit). Consuming list views watch `trigger` to refetch, reading `trimmedKeyword` to build their `search` param. Clearing the keyword MUST NOT bump `trigger`, so navigation-time clears never cause a stale refetch.

#### Scenario: List view refetches on submit

- **WHEN** a consumer (e.g. `ApprovalPuchaseRq.vue`) watches `trigger` and it increments
- **THEN** the view rebuilds its API params, setting `apiParams.search = globalSearchKeyword.value` when the keyword is non-empty, and refetches

#### Scenario: Clearing does not trigger refetch

- **WHEN** `clear()` is called
- **THEN** `keyword` is reset to `""` but `trigger` is left unchanged, so watchers on `trigger` do not fire

### Requirement: Keyword auto-cleared on navigation

The router SHALL clear the global-search keyword on every route change so that each page starts with an empty search. This runs in a `router.beforeEach` guard that calls `useGlobalSearchStore().clear()` when the destination path differs from the previous path.

#### Scenario: Navigating to a different page

- **WHEN** the router navigates and `to.path !== from.path`
- **THEN** `useGlobalSearchStore().clear()` is invoked before `next()`, resetting `keyword` to `""` without bumping `trigger`

#### Scenario: Same-path navigation does not clear

- **WHEN** navigation resolves to the same path (`to.path === from.path`)
- **THEN** `clear()` is NOT called and the keyword is preserved
