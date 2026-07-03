## 1. Domain layer

- [x] 1.1 Create `src/modules/domain/entities/express-disbursement-request/express-disbursement-request.entity.ts` — private fields (id, purpose, total, status default "PENDING", user_approval, createdAt, deletedAt), public getters, `formatDate()` in constructor, `id.toString()` convention, static `create()` and `createWithItems()` factories; no client-side budget mutators
- [x] 1.2 Create `src/modules/domain/entities/express-disbursement-request/express-disbursement-request-item.entity.ts` — line item (title, quantity, unit_id, price, total_price, remark, file_name, file_name_url); expose captured `budget_item_id` as read-only getter
- [x] 1.3 Create `src/modules/domain/repository/express-disbursement-request/express-disbursement-request.repository.ts` — interface: `findAll(params, status_id?)`, `findById(id)`, `create(data)`, `update(id, data)`
- [x] 1.4 Run `pnpm type-check && pnpm lint` before marking this phase done

## 2. Application layer

- [x] 2.1 Create `src/modules/application/dtos/express-disbursement-request/express-disbursement-request.dto.ts` — Create/Update/Read DTOs; snake_case API fields (`express_disbursement_request_items`, `unit_id`, `total_price`)
- [x] 2.2 Create `src/modules/interfaces/express-disbursement-request/express-disbursement-request.interface.ts` — API model types (Create/Update/Interface), snake_case
- [x] 2.3 Create service port `src/modules/application/ports/input/express-disbursement-request.service.ts` — interface with list/detail/create/update methods
- [x] 2.4 Create service impl `src/modules/application/services/express-disbursement-request.service.ts` — `ExpressDisbursementRequestServiceImpl` taking the repository in its constructor; enforce invariants (e.g. reject empty items)
- [~] 2.5 (Optional) Use cases skipped — the `bank`/PR features call services directly from the store; keeping parity (additive, no new pattern)
- [x] 2.6 Run `pnpm type-check && pnpm lint` before marking this phase done

## 3. Infrastructure layer

- [x] 3.1 Create `src/modules/infrastructure/express-disbursement-request/api-express-disbursement-request.repository.ts` implementing the interface with `baseUrl = "/express-disbursement-requests"`, `toDomainModel()` private mapper, `handleApiError()` normalizer; map status from `user_approval.document_status.name` (fallback "pending"). NOTE: files are uploaded separately via the shared uploadFile util and sent as `file_name` strings (matches PR pattern), so create/update send JSON not FormData
- [x] 3.2 Added a clearly-marked BACKEND CONTRACT comment block at the top of the repository (endpoints not yet implemented — see task group 9)
- [x] 3.3 Run `pnpm type-check && pnpm lint` before marking this phase done

## 4. Store layer

- [x] 4.1 Create `src/modules/presentation/Admin/stores/express-disbursement-request/express-disbursement-request.store.ts` — setup-style store with `createExpressDisbursementRequestService()` factory; data state (records, pagination, loading, error) + UI state (form model, modal flags, double-submit guard, selectedId); computed total; `fetchAll`, `fetchById`, `create`, `update`, `resetState`, `resetForm`, `addItem`, `removeItem`
- [x] 4.2 Added `submitExpressApproval()` delegating to the shared `useApprovalStepStore.submitApproval` with `type: "ex"`; budget selection reuses the existing `purchase_order_items` `[{id, budget_item_id}]` shape. Shared approve-step type unions/whitelist extended additively with `"ex"` (existing `pr/po/r` untouched)
- [x] 4.3 Run `pnpm type-check && pnpm lint` before marking this phase done

## 5. Create + List + Detail views

- [x] 5.1 Create list view `src/modules/presentation/Admin/views/express-disbursement-requests/ExpressDisbursementRequestListView.vue` — table + status summary cards + status filter + pagination; store-only; `useI18n`/`useNotification`/canonical `usePermissions`; `onUnmounted` → `resetState()`; edit disabled for terminal statuses; create button gated by `create-express-disbursement-request`
- [x] 5.2 Create `column.ts` for the list view
- [x] 5.3 Create create view + form component under `views/express-disbursement-requests/` and `components/express-disbursement-request/` — line items (title/quantity/unit/price/remark + optional attachment) + purpose; validation file rejecting empty required fields; double-submit guard
- [x] 5.4 Create read-only detail view `ExpressDisbursementRequestDetailView.vue` (route `:id`) — header, items table + totals, ordered approval steps showing captured budget/slip/account-code read-only, print button; NO approve/reject
- [x] 5.5 Run `pnpm type-check && pnpm lint` before marking this phase done

## 6. Step-aware approval detail + in-module widgets

- [x] 6.1 Create in-module widget `components/express-disbursement-request/widgets/BudgetItemPicker.vue` — assigns `budget_item_id` per line item (reads budget items via existing budget store/service; no budget mutation)
- [x] 6.2 Create in-module widget `components/express-disbursement-request/widgets/SlipUpload.vue` — file/slip upload via existing `uploadFile`; block approve until a file exists
- [x] 6.3 Create in-module widget `components/express-disbursement-request/widgets/AccountCodeInput.vue` — text input; block approve until non-empty
- [x] 6.4 Create `ExpressApprovalDetail.vue` — reads the earliest pending step's capability flags (`requires_budget_selection`, `requires_file_upload`, `requires_account_code`, `is_otp`) and composes the correct widget(s); approver-authorization check via `doc_approver[]`; Reject-with-reason; sequential gating by `step_number`; reuse the shared OTP modal
- [x] 6.5 Wire approve/reject submission through the store → `POST /approve-step/{id}` with `type: "ex"`; re-fetch on success; ensure no "Create PO"/"Create Receipt" action exists
- [x] 6.6 Verify no widget is gated by role/document type — only by step flags (support repeated step kinds, e.g. finance twice)
- [x] 6.7 Run `pnpm type-check && pnpm lint` before marking this phase done

## 7. Routing, menu, permissions

- [x] 7.1 Create `src/modules/presentation/Admin/router/expressDisbursementRequestRoutes.ts` exporting `RouteRecordRaw[]` (list, create, edit, detail, approval); each `requiredAuth: true`, dot-notation names. NOTE: intentionally NO `permission` meta — the global `permissionGuard` redirects to an unregistered `"unauthorized"` route (pre-existing bug), throwing "No match". Access is gated the canonical PR/bank way instead: sidebar menu (`hasCompanyPermission`) + inline `hasPermission()` in views
- [x] 7.2 Append-register the routes in `src/common/shared/router/index.ts` (append only — do not reorder existing entries)
- [x] 7.3 Append a sidebar menu entry for the feature (Lao label "ໃບສະເໜີເບີກຈ່າຍດ່ວນ"), gated by `view-express-disbursement-request`
- [x] 7.4 Run `pnpm type-check && pnpm lint` before marking this phase done

## 8. i18n (en / la / cn together)

- [x] 8.1 Create `src/common/locales/en/expressDisbursementRequest.json` with all feature keys. NOTE: filename must be camelCase `expressDisbursementRequest.json` because the i18n loader (`i18n.config.ts`) uses the filename as the namespace, and the code accesses `t("expressDisbursementRequest.*")` (matches existing `documentType.json`)
- [x] 8.2 Create `src/common/locales/la/expressDisbursementRequest.json` (title = "ໃບສະເໜີເບີກຈ່າຍດ່ວນ")
- [x] 8.3 Create `src/common/locales/cn/expressDisbursementRequest.json`
- [x] 8.4 Add the menu-label key to the sidebar menu locale files in all three locales
- [ ] 8.5 Run the i18n checker (`/hal:check-i18n`) and confirm no missing keys across en/la/cn

## 9. Backend contract coordination (external — API does not exist yet)

- [x] 9.1 Backend requirements captured in `BACKEND-CONTRACT.md` (this change folder) — `/express-disbursement-requests` CRUD, list envelope, detail + `user_approval.approval_step[]` shape. Hand to backend team
- [ ] 9.2 (Backend) Confirm `POST /approve-step/{id}` accepts `type: "ex"` — FE already sends it (see BACKEND-CONTRACT.md §3)
- [ ] 9.3 (Backend) Confirm new step flags `requires_budget_selection` / `requires_account_code` on workflow-step defs + returned steps — FE reads them (§2)
- [ ] 9.4 (Backend) Confirm final-step budget deduction server-side, idempotent, no PO/Receipt spawned (§4)
- [ ] 9.5 (Backend) Confirm per-department workflow attachment on creation (§5)
- [x] 9.6 FE default chosen + implemented: budget selection reuses the existing `purchase_order_items [{id, budget_item_id}]` shape (no change to shared approve-step machinery). Backend to confirm or request `express_items` (BACKEND-CONTRACT.md open question 1)

## 10. Verification

- [ ] 10.1 (Blocked on backend) Configure a test express workflow (varying step counts/order, incl. a repeated finance step) via the existing approval-workflow admin
- [ ] 10.2 (Blocked on backend) Browser smoke test: create → advance through each step (budget/slip/account-code/OTP/plain) → final approval → confirm backend reports terminal status and budget deducted once
- [ ] 10.3 (Do at smoke-test time) Regression smoke test: verify existing PR/PO/Receipt/Disbursement flows are unchanged
- [x] 10.4 Isolation verified structurally: the entire feature lives in new files; the only shared-file touches are append-only (router register, sidebar menu, 3 i18n menu keys, and additive `"ex"` in the approve-step type unions). Reverting those + deleting the module removes the feature cleanly
- [x] 10.5 Final `pnpm type-check && pnpm lint` clean (both pass)
