# Backend Contract — Express Disbursement Request

> Hand this to the backend team. The front-end (this change) is built against the
> shapes below. Nothing here exists on the API yet. Where a decision was needed,
> the front-end already picked a default (noted **[FE default]**); confirm or change.

## 1. New CRUD endpoints — base path `/express-disbursement-requests`

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/express-disbursement-requests` | Create (body below) |
| `GET`  | `/express-disbursement-requests` | Paginated list + status summary |
| `GET`  | `/express-disbursement-requests/:id` | Full detail incl. `user_approval` |
| `PUT`  | `/express-disbursement-requests/:id` | Update while non-terminal |

**Create/Update request body** (files are uploaded separately via `POST /upload`, so only `file_name` strings are sent — same as Purchase Request):

```json
{
  "purpose": "string",
  "total": 0,
  "express_disbursement_request_items": [
    { "title": "string", "file_name": "string|null", "quantity": 1, "unit_id": 1, "price": 0, "total_price": 0, "remark": "string" }
  ]
}
```

**List response**: same envelope as `/purchase-requests` — `{ data: [...], pagination: { total, total_pages, limit, page }, status: [{ name, count }] }` where `status` powers the PENDING/APPROVED/REJECTED summary cards.

**Detail response** (`data`): must include `id`, `edr_number`, `purpose`, `total`, `status`, `document_type`, `department`, `requester`, `position`, `company`, `express_disbursement_request_items[]` (each may carry `budget_item_id` once assigned), and `user_approval` (below).

## 2. `user_approval.approval_step[]` — same shape as PR/PO/Receipt + 2 new flags

Each step MUST return:

```json
{
  "id": 1, "user_approval_id": 1, "step_number": 0, "approver_id": 1,
  "status_id": 1,                      // 1=pending, 2=approved, 3=rejected
  "remark": "", "approved_at": null,
  "is_otp": false,
  "requires_file_upload": false,
  "requires_budget_selection": false,  // NEW
  "requires_account_code": false,      // NEW
  "doc_approver": [ { "user": { "username": "..." }, "department": { "name": "..." } } ]
}
```

- **NEW flags** `requires_budget_selection` and `requires_account_code` must also be configurable on **approval-workflow step definitions** (admin screens) and echoed onto the per-document steps. The front-end shows the budget picker / account-code input based ONLY on these flags — never on role — so the same kind of step (e.g. finance) may appear more than once with different flags.
- When a flag is absent the front-end treats it as `false`.

## 3. Approve-step — reuse `POST /approve-step/{approvalStepId}` with new `type: "ex"`

The front-end sends the existing approve-step payload with `type: "ex"`:

```json
{
  "type": "ex",
  "statusId": 2,
  "approvalStepId": 10,
  "approval_id": 5,
  "is_otp": false,
  "otp": "",
  "remark": "Approved",
  "purchase_order_items": [ { "id": 1, "budget_item_id": 7 } ],
  "account_code": "string",
  "files": [ { "file_name": "string" } ]
}
```

- **[FE default]** Budget selection reuses the existing `purchase_order_items: [{ id, budget_item_id }]` field (where `id` is the express line-item id), to avoid changing the shared approve-step machinery. If the backend prefers a dedicated `express_items` field, tell us and we'll adjust one mapper (`store.submitExpressApproval`).
- `account_code` sent only on `requires_account_code` steps; `files` only on `requires_file_upload` steps; `purchase_order_items` only on `requires_budget_selection` steps.
- OTP steps reuse the existing `POST /send-otp/{approvalStepId}` flow unchanged.

## 4. Final-step behaviour — budget deduction

- On approval of the **last** step, the backend deducts budget from the assigned `budget_item(s)` and closes the document (terminal status).
- Deduction MUST be **idempotent / exactly once** (no double-deduction on retry).
- This flow spawns **no** Purchase Order and **no** Receipt.

## 5. Workflow attachment on creation

- On create, attach the correct **per-department** approval workflow (bound to the express document type) as `user_approval.approval_step[]` — same mechanism used for PR/PO today.

## 6. Permissions

New permission strings the front-end checks: `view-express-disbursement-request`, `create-express-disbursement-request`, `update-express-disbursement-request`. The sidebar menu item and routes are gated on these.

---

### Open questions for the backend team
1. Budget-selection payload key: keep `purchase_order_items` **[FE default]** or introduce `express_items`?
2. Is the express document editable after submission (before first approval), or immutable once submitted?
3. Are per-line-item attachments required or optional at creation? (FE currently treats them as optional.)
