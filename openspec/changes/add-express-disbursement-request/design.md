## Context

HAL-ERP's procurement pipeline requires three separately-created documents (Purchase Request → Purchase Order → Receipt/Disbursement), each with its own approval chain, and budget is committed at PO approval while money moves at the Finance-DPM disbursement step. Some departments do non-vendor expense disbursements and only need a single document that is requested once, approved down a per-department chain, and has its budget deducted — no PO, no Receipt.

Key facts established during exploration:
- Approval is one **generic** mechanism: `POST /approve-step/{id}` with a document `type` (`"pr"|"po"|"r"`), consumed by all three document kinds. Steps are an ordered list (`step_number`, `status_id` 1=pending/2=approved/3=rejected, `is_otp`, `requires_file_upload`, `doc_approver[]`), attached by the backend from an admin-configured `approval-workflow` bound to a `document_type`.
- Data captured mid-chain (budget `budget_item_id`, slip files, `account_code`) is sent through the approve-step payload — not at document creation.
- **Budget deduction is entirely backend-side.** `BudGetItemEntity` has no client-side mutators; the client only reads amounts. The PO-approval budget picker merely *assigns* `budget_item_id`; the backend deducts.
- The existing approval detail views are specialized per document type and contain hard-coded branch logic (e.g. PR detail shows a "Create PO" button, redirects by `step_number`). They cannot be safely reused for express.

Constraints: additive-first (CLAUDE.md hard rule — new code must not alter/break existing working code); no automated tests (browser smoke-test only); Clean/Hexagonal layering; i18n in en/la/cn; Ant Design Vue + Pinia setup-stores.

## Goals / Non-Goals

**Goals:**
- Deliver a single-document express disbursement flow that flows through a full, per-department-configurable approval chain and deducts budget at the end.
- Reuse the generic approve-step mechanism and the existing approval-workflow admin, adding only additive capability flags.
- Keep the feature fully isolated: deletable without touching existing procurement code.
- Support chains that differ per department in length, order, and repeated step kinds (e.g. finance twice).

**Non-Goals:**
- No changes to PR/PO/Receipt/Disbursement views, stores, or routes.
- No extraction/refactor of the existing PO budget-picker or Finance-DPM widgets into shared components (this change).
- No new approval-workflow admin UI.
- No client-side budget arithmetic; no client-driven auto-approval of steps.

## Decisions

### Decision 1: A brand-new isolated module, not a Purchase Request variant

Model express as a fresh capability (`express-disbursement-request`) across all 8 layers with its own entity, repository, service, store, views, routes, and menu — separate `/express-disbursement-requests` endpoints.

- **Rationale:** Maximizes additive-first safety; the PR approval detail's hard-coded "Create PO"/`step_number` branching makes reuse hazardous. A separate module is deletable as a unit.
- **Rejected — express as a PR document-type flag (reuse PR entity/endpoint):** Less new code, but forces conditional edits into existing PR views/stores (risking regressions) and couples express to PR's lifecycle flags (`is_created_po`). Rejected per additive-first.
- **Rejected — express as extra document type reusing PO/Receipt approval views:** Those views assume vendor/quotation/exchange-rate context express does not have; conditionals would proliferate. Rejected.

### Decision 2: Capability-per-step flags drive the UI, never role or document type

Each approval step declares what it needs via booleans: existing `is_otp`, `requires_file_upload`, plus NEW `requires_budget_selection` and `requires_account_code`. The single step-aware detail view reads the active pending step's flags and composes widgets accordingly.

- **Rationale:** Chains differ per department and the same kind of step can repeat (finance twice, one uploading a slip, one just confirming). Role/type-based gating cannot distinguish repeated steps; flags can. Also keeps the frontend agnostic of the department taxonomy.
- **Rejected — gate widgets by approver role/department (today's Finance-DPM approach):** Breaks when the same role appears twice with different responsibilities, and hard-codes the org structure into the client. Rejected.
- **Rejected — encode step kind as a single enum (`kind: "budget"|"finance"|...`):** Less composable than orthogonal booleans (a step could need both a slip and OTP); the codebase already uses independent booleans (`is_otp`, `requires_file_upload`). Rejected for consistency.

### Decision 3: One step-aware approval detail view with in-module widgets

Build a single `ExpressApprovalDetail` view plus fresh in-module widget components (budget-item picker, slip upload, account-code input). Standalone shared modals that already exist (OTP modal, generic Upload) MAY be imported; the PO/Finance-DPM embedded widgets are NOT extracted.

- **Rationale:** Additive-first favored over DRY for a first cut; the widgets are small and their host views are not safely reusable. Extraction can happen later as its own change if reuse proves valuable.
- **Rejected — extract shared widgets from PO/Finance-DPM now:** Requires editing existing views (regression risk, and the repo already flags a 31× modal-duplication cleanup in flight). Rejected for this change.

### Decision 4: Progressive capture via the generic approve-step endpoint with a new `"ex"` type

Creation posts only `{ purpose, total, items }`. Budget/slip/account-code are attached at their steps via `POST /approve-step/{id}` with `type: "ex"`, mirroring PO/Receipt payload shapes.

- **Rationale:** Matches the established pattern; keeps the create form simple; lets the backend own sequencing and deduction.
- **Rejected — capture everything at creation:** Wrong actor captures budget/slip/code, and contradicts the chained-approval model. Rejected.

### Decision 5: Reuse the existing approval-workflow admin to configure chains

Express chains are configured by binding a workflow (with the new step flags) to the express document type in the existing admin screens.

- **Rationale:** No new admin UI; per-department flexibility is a data/config concern, not code.
- **Rejected — a bespoke express-only workflow editor:** Duplicates existing admin functionality. Rejected.

## Risks / Trade-offs

- **Backend does not yet support any of this** → The proposal/specs document the backend contract explicitly (new `/express-disbursement-requests` endpoints, `"ex"` type, two new step flags, idempotent final-step deduction, workflow attachment). Frontend work should proceed against a stubbed/mock repository until the API lands, and be smoke-tested end-to-end once it does.
- **Widget duplication (in-module vs shared)** → Accepted trade-off; isolate widgets in the express folder so a later extraction change is mechanical. Note the duplication in code comments.
- **Capability-flag defaults** → If the API omits the new flags on some steps, the client MUST default them to `false` (specified) to avoid rendering wrong widgets.
- **Budget deduction correctness/idempotency** → Owned by backend; specified as "exactly once at final step." Client must not retry approve-step in a way that double-submits (reuse the existing double-submit guards).
- **i18n drift** → New keys must land in en/la/cn together; run the i18n checker before done.
- **Menu/route registration touches shared files** → `common/shared/router/index.ts` and the sidebar are append-only edits (allowed by additive-first); do not reorder existing entries.

## Migration Plan

- **Deploy:** Additive only — no data migration on the frontend. Ship behind the new menu entry; the feature is invisible until a user has `view/create-express-disbursement-request` permission and a department has an express workflow configured. Backend endpoints + step flags must be deployed for the flow to complete; until then the UI can create/list against a mock or show the create form only.
- **Rollback:** Delete the `express-disbursement-request` module files and revert the three append-only edits (route registration, sidebar entry, i18n keys). Because nothing existing was modified, rollback removes the feature cleanly with zero impact on PR/PO/Receipt. Verify with `pnpm type-check`, `pnpm lint`, and a browser smoke test of an existing procurement flow.

## Open Questions

- Exact express approve-step payload key for per-item budget selection (`express_items` vs reusing `purchase_order_items` shape) — to be confirmed with the backend team when the API is designed.
- Whether an express request needs edit/update before its first approval, or is immutable once submitted (spec allows edit for non-terminal status; confirm with the requesting departments).
- Whether attachments at creation (per line item) are required or optional for express (assumed optional; PR requires them — confirm domain need).
