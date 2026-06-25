## MODIFIED Requirements

### Requirement: Vendor detail loads by id and degrades gracefully

The vendor detail page SHALL load a single vendor via `GET /vendors/:id` through `useVendorStore.fetchVendorById`. The repository's `findById` MUST validate the response envelope and return `null` when `response.data.data` is absent, exactly as `findAll` validates its envelope — it MUST NOT pass an undefined payload into `toDomainModel`. On a failed or empty load the page MUST keep the user on the detail route and offer an in-page retry instead of forcing a browser refresh.

#### Scenario: Vendor found

- **WHEN** the user opens `/vendors/:id` and the API returns `200` with a vendor object in `data`
- **THEN** the page maps it to a vendor interface, hides the loading state, and renders the vendor product list

#### Scenario: Empty or missing payload does not crash

- **WHEN** the API returns `200` but `response.data.data` is null/undefined/missing
- **THEN** `findById` returns `null` (no `toString` TypeError), the page shows the error/not-found state, and the user remains on the detail route

#### Scenario: User retries without a full refresh

- **WHEN** the load failed and the error state is shown
- **THEN** a Retry button is visible that re-runs `loadVendor`, and a subsequent successful response renders the detail without a browser refresh

#### Scenario: Genuine 404

- **WHEN** the API responds `404` for the id
- **THEN** `findById` returns `null` and the page shows the not-found state
