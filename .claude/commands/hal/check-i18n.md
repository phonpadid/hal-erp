---
description: Verify i18n key coverage across all three locales (en/la/cn) and find hard-coded strings
---

Use the `i18n-checker` agent to audit i18n coverage in the hal-erp project.

Steps:
1. Launch the `i18n-checker` agent with no arguments — it will scan everything
2. Present the agent's report to the user
3. If there are missing translations, offer to:
   - Add placeholder keys to the missing locale files (clearly marked `TODO: translate`)
   - OR generate suggested translations using context from the English key
4. Ask the user before making any file modifications
