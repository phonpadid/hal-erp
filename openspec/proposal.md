# OpenSpec Proposal — Document HAL-ERP Existing System

## Why

The HAL-ERP front-end has grown for over a year without any contributor-facing documentation. Onboarding a new developer currently requires reading hundreds of files across `domain/`, `application/`, `infrastructure/`, and `presentation/` to even map out what the system does. Recent confusion about which modules exist (the team has been asked about *Warehouse*, *Inbound*, *Outbound*, *Branch*, and *Freight* — none of which are implemented in the SPA today) makes it clear we need a written baseline before any new module proposal can be evaluated.

This proposal captures the **existing** system in OpenSpec form so that future change proposals have a stable foundation to diff against.

## What

Produce documentation that reflects the **actual implementation** in `src/`, not aspirational architecture:

1. `docs/project-overview.md` — what the system is, its real module list, what it is **not**.
2. `docs/system-architecture.md` — Clean Architecture layout, dependency direction, Pinia store pattern, HTTP layer, guards, approval engine.
3. `docs/database-design.md` — entity relationships and field lists reverse-engineered from domain entities and DTOs.
4. `docs/api-documentation.md` — every endpoint consumed by any `*.repository.ts`, grouped by module.
5. `openspec/proposal.md`, `openspec/design.md`, `openspec/tasks.md` — this OpenSpec change record.

Each document must call out modules that the team has **asked about but that do not exist** in the code so future planning meetings start from facts.

### Module audit (in scope of the docs)

| Asked-about module | Implementation status |
| ------------------ | --------------------- |
| Authentication     | Present (`auth`)      |
| Branch             | Absent — closest are `companies` (HAL Group) and `departments` |
| Warehouse          | Absent                |
| Inbound            | Absent — closest is `receipts` (PO fulfilment) |
| Outbound           | Absent — closest is the disbursement approval flow |
| Vendor             | Present (`vendors`)   |
| Vendor Product     | Present (`vendor-products`) |
| Freight calc       | Absent                |

The docs make the gap explicit. They **do not** propose to build any of the missing modules — that is out of scope for this change.

## Non-goals

- Do **not** add or modify any TypeScript / Vue source code.
- Do **not** invent fields or endpoints that the code does not already use.
- Do **not** redesign any module.
- Do **not** specify back-end (Node/DB) implementations; this is a front-end repository.
- Do **not** create CLAUDE.md additions (project already has one).

## Success criteria

- A new contributor can open the four `docs/*.md` files and, without reading source code, understand the layered architecture, the procurement flow (PR → PO → Receipt → Disbursement), the approval engine, and the actual HTTP surface.
- Every endpoint listed in `docs/api-documentation.md` is grep-verifiable in `src/modules/infrastructure/`.
- Every entity / field listed in `docs/database-design.md` is grep-verifiable in `src/modules/domain/entities/`.
- Anyone asking about Warehouse / Inbound / Outbound / Branch / Freight gets a single document to point at that confirms the status.

## Out of scope (explicit)

- Building the missing modules.
- Documenting the back-end internals.
- Writing tests.
- Refactoring stores or repositories.
