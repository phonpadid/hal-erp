# Make vendor detail page resilient to empty/slow responses

## Why

Opening a vendor via the eye icon navigates to `/vendors/:id`. Intermittently the page shows a load error and bounces back to the list; the user must do a full browser refresh before the detail UI appears. Three frontend defects cause this:

1. **`ApiVendorsRepository.findById` does not validate the response envelope.** Unlike `findAll`, it calls `this.toDomainModel(response.data.data)` directly. When the API returns `200` with `data` null/undefined/missing, `toDomainModel` throws `TypeError: Cannot read properties of undefined (reading 'toString')` at `vendors.id.toString()`. The thrown TypeError is not a 404, so it propagates as a generic error.
2. **`VendorDetailView.loadVendor` redirects to the vendor list on any error or not-found**, so the in-page error state with its button is never shown and the user has no way to retry except a full refresh.
3. **Broken i18n keys** in the view script (`vendorProduct.error.*`, `vendor.error.loadFailed`) do not match the real roots (`vendor-product`, `vendors`), so the error notifications render raw keys.

## What changes

- Guard `findById` to return `null` when `response.data?.data` is absent (mirror the `findAll` envelope check) so an empty payload degrades to "not found" instead of crashing.
- Stop redirecting away on error in `VendorDetailView`; render the existing error state and add a **Retry** button that re-runs `loadVendor`, so the user recovers without a full refresh.
- Fix the three wrong i18n keys in the view script and add `common.retry` to `en`, `la`, `cn`.

## Impact

- Affected capability: `vendors`
- Affected code: `infrastructure/vendors/api-vendor.repository.ts`, `views/vendors/vendor_product/VendorDetailView.vue`, `common/locales/{en,la,cn}/common.json`
- No API or routing change. Behavior-only hardening. Risk: low.
