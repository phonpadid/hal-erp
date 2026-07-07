## Why

The current procurement pipeline forces every purchase through three separately-created documents — Purchase Request → Purchase Order → Disbursement/Receipt — each with its own approval chain. Some departments do not do vendor-based procurement; they only need a single expense/disbursement to be requested, approved down a chain, and have its budget deducted. Making them create three linked documents is unnecessary overhead and does not match how they actually work.

This change adds a **single document** — "ໃບສະເໜີເບີກຈ່າຍດ່ວນ" (Express Disbursement Request) — that a user creates once and that flows through a full, per-department-configurable approval chain (dept head → budget → president → finance/slip → accounting → budget deducted). No PO and no Receipt are ever spawned.

## What Changes

- **New, fully isolated `express-disbursement-request` module** (8 Clean-Architecture layers + its own menu, routes, list view, create view, and a step-aware approval detail view) following the canonical `bank`/`purchase-request` patterns. Nothing in the existing PR/PO/Receipt code is edited.
- **One step-aware approval detail view** that composes the correct widget for whichever approval step is currently pending, driven solely by that step's capability flags (not by user role or document type — because the same kind of step, e.g. finance, may repeat within one chain).
- **New in-module widgets** (budget-item picker, transfer-slip upload, account-code input) written fresh inside the express module — no refactor/extraction of the existing PO or Finance-DPM views (additive-first over DRY).
- **Progressive data capture along the chain** via the existing generic `POST /approve-step/{id}` endpoint: budget selection, slip files, and account code are attached at their respective steps — not at creation. At creation the document carries only line items + purpose (like a PR).
- **Budget deduction remains backend-authoritative** and fires once, at the final approval step. The front-end never mutates budget amounts.
- **New capability flags on approval steps** — `requires_budget_selection` and `requires_account_code` — added alongside the existing `is_otp` and `requires_file_upload`, so a step can declare which widget it needs.
- **Reuse of central mechanisms only**: the generic `/approve-step` endpoint (with a new document `type`, e.g. `"ex"`) and the existing approval-workflow admin screens (to configure each department's chain). No new admin UI.
- **i18n**: new keys added to all three locales (`en`, `la`, `cn`); menu label in Lao = "ໃບສະເໜີເບີກຈ່າຍດ່ວນ".
- **Backend contract (to be built — the API does not support this yet)** is documented as explicit requirements so the backend team knows exactly what to implement.

### Non-goals

- **NOT** modifying, refactoring, or re-routing any existing Purchase Request, Purchase Order, Receipt, or Disbursement code, views, stores, or routes.
- **NOT** extracting the existing PO budget-picker or Finance-DPM slip/account-code widgets into shared components in this change.
- **NOT** building any new approval-workflow *admin* UI — existing screens are reused to configure the express chains.
- **NOT** implementing budget-deduction arithmetic on the client — it stays server-side.
- **NOT** collapsing or auto-approving the approval chain from the client (each step is actioned by its real approver).

## Capabilities

### New Capabilities

- `express-disbursement-request`: A standalone single-document expense/disbursement flow — create (line items + purpose), paginated list with status summary, read-only detail, and a step-aware approval detail that captures budget selection, transfer-slip upload, and account code progressively along a per-department-configurable approval chain, culminating in backend budget deduction. No PO/Receipt is created.

### Modified Capabilities

- `approval-step`: Accept a new document `type` (e.g. `"ex"`) on `POST /approve-step/{id}`; the per-step payload for express carries budget-item selection, account code, slip files, and OTP as applicable. Per-document `approval_step[]` entries returned by the API additionally expose the two new capability flags.
- `approval-workflow-steps`: Step definitions additionally carry `requires_budget_selection` and `requires_account_code` boolean flags so an express chain step can declare the widget/data it requires.

## Impact

- **New front-end code** under `src/modules/{domain,application,infrastructure,presentation}` for the `express-disbursement-request` feature; new route registered by appending to `src/common/shared/router/index.ts`; new menu entry appended to the sidebar; new i18n files in `src/common/locales/{en,la,cn}/`.
- **New permission strings**: `create-express-disbursement-request`, `view-express-disbursement-request`, `update-express-disbursement-request` (and approval action gating).
- **Reused, unchanged**: `POST /approve-step/{id}`, the approval-workflow admin screens, `useNotification`, canonical `usePermissions`, shared UI components, pagination/date helpers.
- **Backend (external, not in this repo — must be built)**: new `/express-disbursement-requests` CRUD endpoints; new `"ex"` type + new step flags on the approve-step and workflow-step APIs; final-step budget deduction (idempotent); per-department workflow attachment on creation.
- **No breaking changes** to existing capabilities — all changes are additive.
