---
description: Find existing shared components before building a new one - prevents duplicate modals/tables/forms
argument-hint: <description of the component you want to build>
---

Use the `shared-component-finder` agent to search for existing components in the hal-erp project that match the user's need.

The component description is: **$ARGUMENTS**

Steps:
1. If $ARGUMENTS is empty, ask the user to describe what they want to build
2. Launch the `shared-component-finder` agent with the description
3. Present the agent's findings
4. If a shared component exists, give the user the import + usage snippet
5. If nothing fits, suggest the closest pattern to follow when building new
