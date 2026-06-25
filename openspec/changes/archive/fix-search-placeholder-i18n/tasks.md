# Tasks

## 1. Add i18n keys (all three locales)

- [x] 1.1 Add `placeholder.search` to `src/common/locales/{en,la,cn}/vendors.json`
- [x] 1.2 Add `placeholder.search` to `src/common/locales/{en,la,cn}/vendors_bank.json`
- [x] 1.3 Add `placeholder.search` to `src/common/locales/{en,la,cn}/documentType.json`

## 2. Repoint the views

- [x] 2.1 `views/vendors/vendor/VendorView.vue` — change placeholder to `t('vendors.placeholder.search')`
- [x] 2.2 `views/vendors/vendor_bank_accounts/VendorBank.vue` — change placeholder to `t('vendors_bank.placeholder.search')`
- [x] 2.3 `views/document-types/DocumentType.vue` — change placeholder to `t('documentType.placeholder.search')`

## 3. Verify

- [x] 3.1 `pnpm type-check` passes
- [ ] 3.2 `pnpm lint` clean (auto-run by PostToolUse hook on edited files)
- [ ] 3.3 Browser smoke-test: open Vendors, Vendor Bank Accounts, Document Types — confirm placeholder no longer says "currency"
