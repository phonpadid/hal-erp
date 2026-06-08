# HAL-ERP — System Architecture

## 1. Architectural Style

The codebase follows **Clean / Hexagonal Architecture** with strict layer separation. Each business feature has the same skeleton repeated under four top-level folders in `src/modules/`:

```
src/
├── App.vue
├── main.ts
├── common/                       # cross-cutting infrastructure
│   ├── config/axios/axios.ts     # single Axios instance
│   ├── config/i18n/              # vue-i18n setup
│   ├── locales/{en,la,cn}/*.json # translations
│   ├── middlewares/              # auth.guard, permission.guard
│   └── shared/                   # router, layouts, components, styles
│
└── modules/
    ├── domain/                   # pure business types — no I/O
    │   ├── entities/             # rich classes (private fields + getters)
    │   └── repository/           # repository INTERFACES (ports)
    │
    ├── application/              # use-cases and DTOs
    │   ├── dtos/                 # plain shapes that cross the wire
    │   ├── ports/                # input/output ports
    │   ├── useCases/             # business operations
    │   └── services/             # service implementations
    │
    ├── infrastructure/           # adapters to the outside world
    │   ├── api-*.repository.ts   # HTTP implementations of repository ports
    │   └── auth/, vendors/, ...  # subfolders for grouped features
    │
    ├── interfaces/               # shared TS shapes used by infra+presentation
    │
    └── presentation/
        └── Admin/
            ├── views/            # routed page components
            ├── components/       # feature components
            ├── stores/           # Pinia stores (one per feature)
            ├── router/           # feature route modules
            └── dashboard/
```

`shared/` (inside `modules/`) holds cross-feature utilities (`formatdate`, `pagination`, `messageApi`, `repondata`).

## 2. Dependency Direction

```
presentation ──▶ stores ──▶ services ──▶ repositories (interfaces)
                                              ▲
                                              │ implemented by
                                              │
                                       infrastructure (HTTP adapters)
                                              │
                                              ▼
                                          domain entities
```

Rules enforced by convention:

- `domain/` has **no** imports from any other module layer.
- `application/` may import from `domain/` only.
- `infrastructure/` may import from `domain/` and `application/` only.
- `presentation/` may import from `application/`, `domain/`, `infrastructure/` (to wire concrete repos into stores), and `common/`.

## 3. Feature Skeleton (concrete example: Auth)

| Layer                       | File                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| Entity                      | `domain/entities/auth/auth.entity.ts` (`AuthEntity`)                     |
| Repository contract         | `domain/repository/auth/auth.repository.ts` (`AuthRepository` interface) |
| DTO                         | `application/dtos/auth/auth.dto.ts` (`LoginDTO`, `ForgotPasswordDTO`, `ResetPasswordDTO`, `AuthResponseDTO`) |
| Service                     | `application/services/auth/auth.service.ts` (`AuthServiceImpl`)          |
| HTTP adapter                | `infrastructure/auth/api-auth.repository.ts` (`ApiAuthRepository`)        |
| Store                       | `presentation/Admin/stores/authentication/auth.store.ts` (`useAuthStore`) |
| Views                       | `presentation/Admin/views/authentication/Login.vue`, `ResetPassword.vue` |
| Routes                      | `presentation/Admin/router/loginRoutes.ts`                                |

The store **internally** instantiates the concrete repository:

```ts
const createAuthService = () => {
  const authRepository = new ApiAuthRepository();
  return new AuthServiceImpl(authRepository);
};
```

This is a deliberate trade-off: there is no DI container, so the wiring lives in the Pinia store. Swapping repositories (e.g. for tests) requires editing the store factory.

## 4. The Pinia Store Pattern

Every feature store is a **setup-style** store with the same shape:

```ts
export const useFooStore = defineStore("foo", () => {
  const service = createFooService();   // factory wires repo+service
  const items   = ref<FooEntity[]>([]);
  const loading = ref(false);
  const error   = ref<Error | null>(null);
  // pagination, modal flags, filters live here too

  async function fetchAll(params) { /* try / loading / error pattern */ }
  async function create(dto)      { /* ... */ }
  // computed: filteredItems, totalPages, etc.

  return { items, loading, error, fetchAll, create };
});
```

UI state (modal open flags, current page, search keyword) lives **inside the same store** as data state — the codebase does not split them.

`useAuthStore` does extra work on init: `initializeUser()` reads `accessToken`, `userData`, `userPermissions`, `userRoles`, `userType` and `userCompany` from `localStorage` and rehydrates an `AuthEntity` so refreshes survive.

## 5. HTTP Layer

Single instance in `common/config/axios/axios.ts`. Exported as `api` (with `Bearer` token attached) and `authApi` (same instance, kept as a named alias).

### Request interceptor

- Pulls `accessToken` from `localStorage`, sets `Authorization: Bearer <token>`.
- Reads `locale` from `localStorage` (mapping `la` → `lo`) and sets `Accept-Language`.
- Picks `Content-Type` based on payload type: `application/json` for plain objects, `multipart/form-data` for `FormData`.

### Response interceptor

| Status | Action                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------- |
| 400/401 on `/users/login` | Show a Lao "Login Failed" modal, reject so the login store catches.                              |
| 401 on `/users/forgot-password` or `/users/reset-password` | Pass through — page handles its own errors.                                                      |
| 401 (general)         | Show "Session expired" modal, clear `accessToken`, redirect to `/login`.                          |
| 403                   | Show "You don't have permission" modal.                                                           |
| 404                   | Log to console, propagate (e.g. `findById` returns `null` in repos).                              |
| 500                   | Show "Server error" modal.                                                                        |
| other                 | Log to console.                                                                                   |

All errors are re-thrown so feature stores can surface a meaningful state.

### `api` wrapper

Methods `get`, `post`, `put`, `delete` ensure the URL always begins with `/` and forward `AxiosRequestConfig`. There is no retry, no abort-controller, no offline queue.

## 6. Routing & Guards

`src/common/shared/router/index.ts` is the single composition point:

- Imports every feature's route module (departments, vendors, purchase-requests, purchase-orders, disbursement, budget, reports, ...).
- All admin routes are nested under `path: "/admin"` with `BaseLayout.vue`.
- Public auth routes (`/login`, `/reset-password/:token`) live outside `/admin`.
- Special unauthenticated approval-on-phone routes: `/approval-rc/:token`, `/approval-pr/:token`, `/approval-po/:token`, `/approve` — these consume tokens emitted by the back-end so approvers can act without logging in.

Two guards run globally:

1. **`authGuard`** — bounces unauthenticated users to `/login` for routes with `requiresAuth: true`.
2. **`permissionGuard`** — checks `route.meta.permission` against `useAuthStore().userPermissions`.

A third `beforeEach` hook resets `useGlobalSearchStore()` whenever the path changes so each page starts with a fresh search keyword. An `afterEach` hook sets `document.title` from `route.meta.title`.

## 7. Permission & Role Model

| Concept       | Where stored                                                                              |
| ------------- | ----------------------------------------------------------------------------------------- |
| Permissions   | `userPermissions: string[]` in store + `localStorage.userPermissions`                     |
| Roles         | `userRoles: string[]` + `localStorage.userRoles` — special roles checked: `super-admin`, `admin`, `company-admin`, `company-user` |
| User types    | `userType: string[]` + `localStorage.userType` — e.g. `company_user`                       |
| Company scope | `localStorage.userCompany` → `{ id, name }`, surfaced as `getCompanyId`, `getCompanyName` computed |

`useAuthStore.login()` **mutates the permission list** after fetch: it appends `"write-purchase-request"` to every user. This is hard-coded and a known migration target.

## 8. Internationalisation

- `i18n.config.ts` loads JSON files from `src/common/locales/{en,la,cn}/*.json` with Vite `import.meta.glob`.
- Active locale persists in `localStorage.locale`.
- Components use `$t('key.path')`; scripts use `t()` from `useI18n`.
- The Axios interceptor sends the locale to the back-end via `Accept-Language`.

## 9. Approval Workflow Engine

Approval is a **first-class cross-cutting concern**, not a per-module afterthought:

- `approval-workflows` defines a named workflow (e.g. "PR approval", "PO approval").
- `approval-workflow-steps` defines ordered steps with conditions (`is_otp`, `requires_file_upload`).
- `user-approvals` is the runtime instance: a workflow attached to a document with current `status_id` and an array of `approval_step` entries that record `approver_id`, `step_number`, `remark`.
- Stepping an approval: `POST /approve-step/{user_approval_step_id}` with `{ statusId, otp?, files?, remark, rate?, account_code? }`.
- Mobile/email approval is supported via signed-token routes (`/approval-pr/:token`, `/approval-po/:token`, `/approval-rc/:token`).
- `budget-approval-rules` decides which workflow applies for a given budget amount and currency.

`PurchaseRequestEntity`, `PurchaseOrderEntity` and `ReceiptEntity` all carry a `user_approval` object directly — they are never standalone.

## 10. Build Modes & Deployment

- `vite.config.ts` is plain.
- `pnpm build:halgroup` runs `vite build --mode halgroup`; `pnpm build:logistics` runs `--mode logistics`. Mode affects Vite env file resolution.
- `pnpm deploy` is a one-liner: `scp -r dist/ root@134.209.101.30:/var/www/admin/`. There is no CI pipeline in the repo.

## 11. Cross-cutting Concerns

| Concern              | Location                                                                  |
| -------------------- | ------------------------------------------------------------------------- |
| Date formatting      | `modules/shared/formatdate.ts` — every entity's constructor passes ISO strings through `formatDate()` |
| Pagination types     | `modules/shared/pagination.ts` (`PaginationParams`, `PaginatedResult<T>`) |
| API envelope         | `modules/shared/repondata.ts` (`ApiListResponse`), `messageApi.ts` (`ApiResponse`) — back-end wraps every response in `{ status_code, message, data, pagination? }` |
| Notifications        | `modules/shared/utils/useNotification.ts` — wraps Ant Design's notification |
| Global search        | `stores/global-search.store.ts` — cleared on every route change           |
| File uploads         | `services/upload.service.ts` plus FormData detection in `axios.ts`        |

## 12. Architectural Trade-offs Observed

1. **No DI container** — repository wiring lives in store factories. Easy to read, harder to swap.
2. **Entities mix mapping and behaviour** — many entities expose both rich domain methods (`delete`, `restore`, `update*`) and constructor-side date formatting. The line between entity and DTO is sometimes blurred (`ReceiptEntity` has both).
3. **Auth state duplicated in `localStorage`** — `useAuthStore` re-derives `AuthEntity` from `localStorage` on init; truth lives in storage, not memory.
4. **Hard-coded permission patch** — `"write-purchase-request"` is forced onto every user at login.
5. **Numeric IDs as strings** — many entities (`VendorsEntity`, `CompanyEntity`) take an `id: string` even though the API returns numbers; a `.toString()` happens in the repo.
6. **No automated tests** in the repository.
7. **Approval flow data lives on the document** — easier to render UI, but couples documents to workflow shape changes.
