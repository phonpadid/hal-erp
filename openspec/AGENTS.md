# OpenSpec Working Guide — HAL-ERP

> Read this first before opening a new change. It tells you:
> 1. What this codebase is.
> 2. How OpenSpec is wired here and which artifacts you must produce.
> 3. The conventions that any new code MUST follow.
> 4. Pitfalls and patterns you'll only learn from reading lots of files — recorded here so you don't have to.

If you need a file-by-file walkthrough, open `openspec/project-structure.md`. The audit of duplicated patterns and refactor roadmap lives in `docs/shared-components-audit.md`.

---

## 1. What this codebase is

- **HAL-ERP front-end** — a Vue 3 + TypeScript SPA (Vite, Pinia, Ant Design Vue 4) that talks to a remote REST API. No back-end source lives here.
- Despite the parent company being logistics, **this app is a Procurement ERP**: Purchase Request → Purchase Order → Receipt → Disbursement, each gated by a multi-step approval workflow.
- Languages: English, Lao, Chinese (default fallback English; user messages from the Axios interceptor are hard-coded in Lao).
- Tooling: pnpm, Vite 6, TypeScript 5.8, Vue 3.5, Pinia 3, Vue Router 4, Ant Design Vue 4, Tailwind 3, dayjs.

For the longer narrative (business flow, modules in/out of scope, build modes), read `docs/project-overview.md` and `docs/system-architecture.md`.

---

## 2. OpenSpec workflow in this repo

This repo uses **OpenSpec spec-driven flow** (`openspec/config.yaml` schema = `spec-driven`).

```
openspec/
├── AGENTS.md             ← you are here
├── project-structure.md  ← file/folder walkthrough
├── config.yaml           ← schema + project context (auto-fed to artifact creation)
├── specs/                ← canonical specs (source of truth for what the system DOES)
│   └── <capability>/spec.md
└── changes/              ← in-flight change proposals
    ├── <change-name>/
    │   ├── proposal.md   ← WHY + WHAT + impact + new/modified capabilities
    │   ├── design.md     ← HOW + decisions + risks + rollback
    │   ├── specs/<cap>/spec.md  ← ADDED / MODIFIED / REMOVED requirements
    │   └── tasks.md      ← numbered, checkbox-tracked implementation steps
    └── archive/          ← completed changes (archived after merge)
```

### The four artifacts

| Artifact     | What goes in it                                                                               | Required to apply?       |
| ------------ | --------------------------------------------------------------------------------------------- | ------------------------ |
| `proposal.md`| Motivation, what changes, capabilities new/modified, impact                                   | yes (parent of all)      |
| `design.md`  | Context, decisions with rationale + alternatives, risks/trade-offs, migration/rollback        | recommended for non-trivial |
| `specs/<cap>/spec.md` | Requirements (SHALL/MUST) + Scenarios (WHEN/THEN) under `## ADDED / MODIFIED / REMOVED` | yes if proposal names a capability |
| `tasks.md`   | `## <Group>` headings, `- [ ] N.M task` checkboxes                                             | **yes — `applyRequires`** |

### Skill commands

| Goal                          | Slash command                                |
| ----------------------------- | -------------------------------------------- |
| Brainstorm before committing  | `/openspec-explore` (or `/opsx:explore`)     |
| Create a full proposal now    | `/openspec-propose` (or `/opsx:propose`)     |
| Implement the tasks list      | `/openspec-apply-change` (or `/opsx:apply`)  |
| Close a finished change       | `/openspec-archive-change` (or `/opsx:archive`) |

### The unbreakable rule for tasks

`tasks.md` is parsed for `- [ ] N.M` checkboxes. Anything that isn't in that format is invisible to the apply phase. If a task is too vague to tick off, split it.

### Spec file rule

Scenarios use **exactly four hashtags** (`#### Scenario: …`) and Requirements use exactly three (`### Requirement: …`). The OpenSpec parser silently drops anything else.

---

## 3. Architecture rules (Clean / Hexagonal)

Dependency direction is enforced by convention, not tooling. Don't break it.

```
presentation ──▶ stores ──▶ services ──▶ repository interfaces
                                              ▲
                                              │ implemented by
                                              │
                                       infrastructure (HTTP adapters)
                                              │
                                              ▼
                                          domain entities
```

| Layer            | May import from                                       | May NOT import from              |
| ---------------- | ----------------------------------------------------- | -------------------------------- |
| `domain/`        | nothing (pure types/classes)                          | anything else                    |
| `application/`   | `domain/`                                             | `infrastructure/`, `presentation/` |
| `infrastructure/`| `domain/`, `application/`                             | `presentation/`                  |
| `presentation/`  | `application/`, `domain/`, `infrastructure/`, `common/`| —                                |
| `common/`        | nothing (utility/shell)                               | anything in `modules/`           |

If a new file would force a forbidden import, **rethink the design** — don't just suppress the lint.

---

## 4. File-naming conventions

Match these exactly when generating new code:

| Concern                  | Path & filename                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Domain entity            | `src/modules/domain/entities/<feature>.entity.ts` (or `<feature>/<sub>.entity.ts` for sub-modules)|
| Repository interface     | `src/modules/domain/repository/<feature>.repository.ts`                                          |
| DTO                      | `src/modules/application/dtos/<feature>.dto.ts`                                                  |
| Service interface (port) | `src/modules/application/ports/input/<feature>.service.ts`                                       |
| Use case                 | `src/modules/application/useCases/<feature>/<verb>-<feature>.usecase.ts`                         |
| Service implementation   | `src/modules/application/services/<feature>.service.ts`                                          |
| HTTP repository          | `src/modules/infrastructure/<feature>/api-<feature>.repository.ts`                               |
| Pinia store              | `src/modules/presentation/Admin/stores/<feature>.store.ts`                                       |
| Routed view              | `src/modules/presentation/Admin/views/<feature>/<Feature>ListView.vue` (+ Create/Edit/Detail)    |
| Feature component        | `src/modules/presentation/Admin/components/<feature>/<Something>.vue`                             |
| Routes module            | `src/modules/presentation/Admin/router/<feature>Routes.ts` (or `<feature>.routers.ts` legacy)    |
| i18n key                 | `src/common/locales/{en,la,cn}/<feature>.json`                                                   |

Permission strings: `<verb>-<resource>` where verb ∈ `{create, update, delete, view}`. The `useResourcePermissions("<resource>")` composable (introduced by the `extract-list-view-globals` change) returns the matching `can*` refs.

---

## 5. Patterns to follow

### Pinia store skeleton (setup-style)

```ts
export const useFooStore = defineStore("foo", () => {
  const service = createFooService();        // factory wires repo+service
  const items   = ref<FooEntity[]>([]);
  const loading = ref(false);
  const error   = ref<Error | null>(null);

  // UI state lives here too: modalVisible, deleteModalVisible, isEditMode, etc.

  async function fetchAll(params) {
    loading.value = true;
    try { items.value = await service.list(params); }
    catch (e) { error.value = e as Error; throw e; }
    finally { loading.value = false; }
  }

  return { items, loading, error, fetchAll };
});
```

### Service factory pattern

There is no DI container. Every store wires its repo + service itself:

```ts
const createFooService = () => {
  const repo = new ApiFooRepository();
  return new FooServiceImpl(repo);
};
```

### Where things already are global (don't re-invent)

- Notifications → `modules/shared/utils/useNotification.ts` (`success/error/warning/info`).
- HTTP error modals (401/403/500) → handled inside `common/config/axios/axios.ts` interceptor. Don't show your own.
- Pagination types → `modules/shared/pagination.ts`.
- API envelope types → `modules/shared/repondata.ts`, `messageApi.ts`.
- Date formatting → `modules/shared/formatdate.ts`.
- Permission gating → `common/shared/store/usePermissions.ts` (canonical) + `useResourcePermissions("<r>")`.
- Global search keyword → `stores/global-search.store.ts` (auto-cleared per route).

### Pre-built UI components — under `common/shared/components/`

Look here first before authoring a new component:
`UiModal`, `UiForm`, `UiFormItem`, `UiInput`, `UiInputPassword`, `UiButton`, `UibuttonDropdown`, `UiActionGroup`, `Table`, `UiTable`, `UiTag`, `UiCheckbox`, `Radio`/`UiRadio`, `Switch`, `Dropdown`, `InputSearch`, `InputSelect`, `LoadingSpinner`, `Upload*`, `HeaderComponent`, `ProgressStepsComponent`.

**After `extract-list-view-globals` is applied**, also: `ConfirmDeleteModal`, `RowActionButtons`.

---

## 6. Pitfalls

These are real footguns from this codebase. Memorize them.

1. **Two `usePermissions` exist.** Canonical: `common/shared/store/usePermissions.ts`. The duplicate at `modules/shared/utils/usePermissions.ts` is being deprecated by the `extract-list-view-globals` change — once that lands, treat the canonical path as the only valid import.
2. **Hard-coded permission patch on login.** `useAuthStore.login()` force-appends `"write-purchase-request"` to every user. Don't replicate this; remove it when the back-end is ready.
3. **IDs cross the wire as numbers but become strings.** Many entities accept `id: string` and the repo does `.toString()`. Keep doing this until a coordinated cleanup.
4. **Folder names mix kebab-case and snake_case** — e.g. `vendors/vendor_bank_accounts/`, `purchase_requests/` next to `purchase-requests/`. Don't try to fix in-flight; pick the existing name in the folder you're touching.
5. **Some router file names have typos** — `purchase-reques.router.ts` (missing `t`), `Darwer/` (Drawer), `UploadFIlePDF.vue` (FI vs Fi). Don't rename in unrelated PRs.
6. **`deleteModalVisible` triple is duplicated 31×.** Use `ConfirmDeleteModal` going forward (see `docs/shared-components-audit.md`).
7. **Upload components emit `message.success/error` directly** instead of going through `useNotification`. Use `useNotification` in new code.
8. **i18n keys are not 100% covered** — strings like `"ບໍ່ມີຂໍ້ມູນ"` (= "no data") are hard-coded in a few views. Always add the matching key to all three locale folders.
9. **No automated tests in repo.** Smoke-test in the browser. Make small, easily-reverted changes.
10. **`auth` data lives in `localStorage` AND in the store.** `useAuthStore.initializeUser()` rehydrates from storage on init. Anything you mutate in memory must also be written to storage to survive refresh.

---

## 7. Build & quality gates

```bash
pnpm install
pnpm dev              # local dev
pnpm type-check       # vue-tsc (must pass)
pnpm lint             # eslint --fix
pnpm build            # type-check + production build
pnpm build:halgroup   # HAL Group tenant
pnpm build:logistics  # HAL Logistics tenant
pnpm deploy           # scp dist/ to prod (production-affecting; ask first)
```

Before marking a change task as done: `pnpm type-check && pnpm lint` clean **and** a quick browser smoke-test of the touched view.

---

## 8. When to write a new spec vs extend an existing one

- **New module** (e.g. adding "Asset Management") → propose new capability in proposal.md, write `specs/asset-management/spec.md`.
- **Changing how an existing capability behaves** → use `## MODIFIED Requirements` in the change's delta spec, copy the entire requirement block before editing.
- **Cross-cutting infra change** (axios, notifications, permissions) → still goes through OpenSpec; it usually modifies multiple capabilities.
- **Pure refactor with no behavior change** → can be done outside OpenSpec, but if it's wide enough to affect contributors (like introducing a new shared component), write a proposal so the new pattern is documented in specs.

---

## 9. Style — for what you write

- Match the file-naming conventions in §4. The repo is large; consistency beats cleverness.
- Vue components: `<script setup lang="ts">` Composition API only.
- Pinia stores: setup style only (`defineStore('name', () => { ... })`).
- Prefer `computed()` over methods for derived state.
- All API calls go through the appropriate `api-*.repository.ts` adapter — never `axios.get` directly from a component or store.
- Don't add comments that just narrate the code. Add a comment only when the *why* would surprise the next reader.
- Add i18n keys to all three locales (`en`, `la`, `cn`) in the same PR.

---

## 10. If you're stuck

- File you can't find → `openspec/project-structure.md` has a directory map.
- Duplication concerns → `docs/shared-components-audit.md`.
- "Which permission string?" → `<verb>-<resource>` with verbs `create / update / delete / view`. Anything else, search for an existing example in the codebase.
- API envelope shape → `src/modules/shared/messageApi.ts` and `repondata.ts`.
- Auth state in dev → check `localStorage` for `accessToken`, `userData`, `userPermissions`, `userRoles`, `userType`, `userCompany`, `locale`.
