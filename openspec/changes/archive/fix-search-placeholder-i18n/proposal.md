# Fix wrong search-input placeholder on Vendors and Document Types

## Why

The search inputs on the **Vendors**, **Vendor Bank Accounts**, and **Document Types** list pages all bind their placeholder to `t('currency.placeholder.search')`. That key renders "ຄົ້ນຫາຂໍ້ມູນສະກຸນເງິນ" / "Search for Currencies information" / "搜索货币信息" — i.e. it tells the user they are searching **currency** data, which is wrong on these pages. It is a copy-paste leak from the `currency` feature.

This confuses users and is visible in all three locales.

## What changes

- Add a descriptive `placeholder.search` key to the `vendors`, `vendors_bank`, and `documentType` i18n bundles in all three locales (`en`, `la`, `cn`).
- Repoint the three search inputs to their own namespace's `placeholder.search` key instead of `currency.placeholder.search`:
  - `views/vendors/vendor/VendorView.vue`
  - `views/vendors/vendor_bank_accounts/VendorBank.vue`
  - `views/document-types/DocumentType.vue`

Out of scope: the same wrong key also appears on `currencies`, `user`, and several `budget` views — those are tracked separately and NOT touched here (this change is scoped to Vendors + Document Types as requested).

## Impact

- Affected capabilities: `vendors`, `document-type`
- Affected code: 3 Vue views + 9 locale files (3 namespaces × 3 locales)
- No API, store, or routing change. Pure UI-string fix.
- Risk: very low — only changes displayed placeholder text. Smoke-test in browser.
