---
description: Scaffold a complete CRUD feature across all 8 layers (entity, repo, DTO, service, infra, store, view, route) + i18n in en/la/cn
argument-hint: <feature-name> (e.g., department)
---

Use the `feature-scaffolder` agent to scaffold a new feature in the hal-erp project.

The feature name to scaffold is: **$ARGUMENTS**

Steps:
1. If the user did not specify the feature name in $ARGUMENTS, ask for it
2. Ask the user to provide the field list (name + type) and the API endpoint (default `/<feature-plural>`)
3. Launch the `feature-scaffolder` agent with all gathered context
4. After the agent finishes, run `pnpm type-check` to verify the scaffold compiles
5. Print the route registration snippet for the user to add to `src/common/shared/router/index.ts`
