# OpenSpec Design — Document HAL-ERP Existing System

This is a documentation-only change. The "design" here is about how the docs are produced and structured so they stay accurate.

## 1. Sourcing rule

Every fact in the documentation must come from one of three authoritative sources, in this priority order:

1. **`src/modules/domain/entities/**/*.entity.ts`** for data shapes and business invariants.
2. **`src/modules/infrastructure/**/*.repository.ts`** for HTTP endpoints, query params and payload shapes.
3. **`src/common/shared/router/index.ts`** + per-feature route modules for module surface area.

If a fact cannot be traced back to one of these, it is removed. The user-supplied `CLAUDE.md` is treated as context, not as ground truth — where it conflicts with the source, the source wins.

## 2. Module-naming policy

The original request listed eight modules. Some do not exist. To avoid future confusion we use a single, repeated table in `project-overview.md`, `api-documentation.md`, and this `design.md`:

| Requested name      | Implemented as                                                  | Status                  |
| ------------------- | --------------------------------------------------------------- | ----------------------- |
| Authentication      | `auth` (login, logout, forgot, reset)                            | ✅ Present              |
| Branch              | `companies` (HAL Group) + `departments` (in/out-the-office)     | ⚠️ Closest match        |
| Warehouse           | —                                                               | ❌ Not implemented      |
| Inbound             | `receipts` (PO fulfilment)                                      | ⚠️ Closest match        |
| Outbound            | Disbursement views driving `approve-step` flow                  | ⚠️ Closest match        |
| Vendor              | `vendors` + `vendor_bank_accounts`                              | ✅ Present              |
| Vendor Product      | `vendor-products` (vendor × product × price × currency)         | ✅ Present              |
| Freight calculation | —                                                               | ❌ Not implemented      |

The "Closest match" rows are documented but **not renamed** to the requested names — that would falsely imply the back-end exposes warehouse/inbound/outbound semantics.

## 3. Document boundaries (what goes where)

| Doc                       | Lives at                                                          | Owns                                                                                                  |
| ------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `project-overview.md`     | `/docs/project-overview.md`                                      | Business flow narrative, module audit table, tech stack at a glance, build/deploy commands, languages, "is **not**" disclaimer. |
| `system-architecture.md`  | `/docs/system-architecture.md`                                   | Layer structure, dependency rules, feature skeleton, Pinia store pattern, HTTP/Axios layer behaviour, router & guards, permission model, i18n, approval engine, build modes, observed trade-offs. |
| `database-design.md`      | `/docs/database-design.md`                                       | Entity diagram, per-table column lists (TypeScript types from entities), conventions (soft-delete, pagination envelope), tables that don't exist. |
| `api-documentation.md`    | `/docs/api-documentation.md`                                     | Base URL, auth headers, envelope, list query params, per-module endpoint tables (with payload examples for the procurement flow), token-based approval, endpoints that don't exist. |
| `openspec/proposal.md`    | `/openspec/proposal.md`                                          | Why, what, non-goals, success criteria.                                                               |
| `openspec/design.md`      | `/openspec/design.md`                                            | This file — sourcing rule, naming policy, doc boundaries, validation procedure.                       |
| `openspec/tasks.md`       | `/openspec/tasks.md`                                             | Execution checklist for producing the docs.                                                            |

Architecture detail lives in **one** doc (`system-architecture.md`) and is referenced — not duplicated — by the others.

## 4. Diagrams

Diagrams are ASCII-art so they render in any editor and version-control diff cleanly. No external diagram tools, no PNG assets, no Mermaid dependency.

## 5. Validation procedure

Before declaring the docs done, each must pass:

1. **Endpoint reality check.** Every endpoint in `api-documentation.md` is verified with:
   ```bash
   grep -rh "api\.\(get\|post\|put\|delete\)" src/modules/infrastructure/ \
     | grep -oE "['\"][/a-zA-Z0-9_{}-]+['\"]"
   ```
   Plus the `private readonly baseUrl` survey:
   ```bash
   grep -rh "private readonly baseUrl" src/modules/infrastructure/
   ```
2. **Entity reality check.** Every entity in `database-design.md` corresponds to a file under `src/modules/domain/entities/`.
3. **Module reality check.** The module audit table is cross-referenced against `src/common/shared/router/index.ts` imports.
4. **No-invention rule.** Any field, endpoint, or behaviour that does not appear in source is removed before merge.

## 6. Trade-offs accepted

1. **Snapshot, not living doc.** The docs capture state at the time of writing. Without a CI check that re-runs the validation procedure on each PR, drift is possible. We accept this for v1 because automating it is a separate change.
2. **Field types are TS, not SQL.** `database-design.md` lists TypeScript types from entities, not actual DB column types. This is honest: we don't have the back-end schema.
3. **One canonical module audit table is duplicated across three files.** Keeping it in sync is a small ongoing cost in exchange for each doc being readable standalone.
4. **No coverage of the unauthenticated approval-on-phone pages beyond endpoints.** Their UI flow is small and can be added in a follow-up if needed.

## 7. What this change explicitly does **not** touch

- No source-code edits.
- No `CLAUDE.md` rewrites.
- No `openspec/specs/` capability specs (no behavioural change to record).
- No `openspec/changes/` per-change folder — this is a single repo-wide documentation pass, not a feature change.
