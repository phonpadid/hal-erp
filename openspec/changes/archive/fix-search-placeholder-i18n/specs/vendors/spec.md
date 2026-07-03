## MODIFIED Requirements

### Requirement: Vendor list search

The Vendors list page and the Vendor Bank Accounts list page SHALL each provide a search input whose placeholder describes the data on that page. The placeholder MUST resolve from the page's own i18n namespace (`vendors.placeholder.search` and `vendors_bank.placeholder.search` respectively), NOT from the `currency` namespace.

#### Scenario: Vendor search placeholder

- **WHEN** the user opens the Vendors list page in any locale
- **THEN** the search input placeholder reads the vendor-specific text (e.g. "ຄົ້ນຫາຂໍ້ມູນຜູ້ຈັດຊື້" / "Search vendor information" / "搜索供应商信息") and never references currency

#### Scenario: Vendor bank account search placeholder

- **WHEN** the user opens the Vendor Bank Accounts list page in any locale
- **THEN** the search input placeholder reads the bank-account-specific text from `vendors_bank.placeholder.search` and never references currency

#### Scenario: Typing filters by keyword

- **WHEN** the user types a keyword and presses Enter (or the watched `searchKeyword` updates)
- **THEN** the list refetches with `search` set to the keyword (behavior unchanged by this fix)
