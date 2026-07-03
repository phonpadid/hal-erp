# Tasks

## 1. Harden the repository

- [x] 1.1 In `api-vendor.repository.ts` `findById`, return `null` when `response.data?.data` is missing, before calling `toDomainModel`

## 2. Fix the detail view

- [x] 2.1 Remove the two `router.push({ name: "vendors.index" })` redirects from `loadVendor`; set `vendor.value = null` so the error state renders
- [x] 2.2 Correct the i18n keys: `vendorProduct.error.notFound` → `vendor-product.error.notFound`, `vendorProduct.error.notFoundMessage` → `vendor-product.error.notFoundMessage`, `vendor.error.loadFailed` → `vendors.error.loadFailed`
- [x] 2.3 Add a Retry button to the error state that calls `loadVendor`

## 3. i18n

- [x] 3.1 Add `common.retry` to `src/common/locales/{en,la,cn}/common.json`

## 4. Verify

- [x] 4.1 `pnpm type-check` passes
- [ ] 4.2 Browser smoke-test: open a vendor with the eye icon repeatedly; on a failed load the page shows a Retry button (no forced refresh), and a successful load shows the product list
