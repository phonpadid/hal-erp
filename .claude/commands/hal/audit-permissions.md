---
description: Audit permission coverage - find routes without permission checks, naming inconsistencies (create-X vs write-X), and inline/route gaps
---

Use the `permission-audit` agent to audit all permission coverage in the hal-erp project.

Steps:
1. Launch the `permission-audit` agent with no arguments
2. Present its report verbatim to the user
3. If the user wants to fix issues, ask which ones (highest impact first) and offer to either:
   - Add `permission:` to specific route meta blocks
   - Standardize verb usage (e.g. migrate `write-X` → `create-X`)
4. NEVER auto-fix — always confirm with the user before editing routes
