## MODIFIED Requirements

### Requirement: Document type list search

The Document Types list page SHALL provide a search input whose placeholder describes document-type data. The placeholder MUST resolve from `documentType.placeholder.search`, NOT from the `currency` namespace.

#### Scenario: Document type search placeholder

- **WHEN** the user opens the Document Types list page in any locale
- **THEN** the search input placeholder reads the document-type-specific text (e.g. "ຄົ້ນຫາຂໍ້ມູນປະເພດເອກະສານ" / "Search document type information" / "搜索文档类型信息") and never references currency

#### Scenario: Typing filters by keyword

- **WHEN** the user types a keyword and presses Enter
- **THEN** the list refetches with `search` set to the keyword (behavior unchanged by this fix)
