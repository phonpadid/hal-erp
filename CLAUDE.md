# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `pnpm install` - Install dependencies (uses pnpm as package manager)
- `pnpm dev` - Start development server with hot-reload
- `pnpm build` - Type-check and build for production
- `pnpm build-only` - Build without type-checking
- `pnpm build:halgroup` - Build for halgroup environment
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm preview` - Preview production build locally

### Deployment
- `pnpm deploy` - Deploy dist/ to production server via SCP

## Change Safety Principle — Additive-First (READ FIRST)

**Adding a new file or feature MUST NEVER break existing, working code.** This is a hard rule, not a preference.

- **New code is additive.** Prefer creating new files/components/keys over editing shared ones. A new feature should be isolated enough that deleting its files removes it cleanly.
- **When you MUST touch a shared file** (e.g. register a route in `common/shared/router/index.ts`, add a locale key, extend a barrel/index), only **append**. Do not rename, reorder, change signatures, or alter existing entries that other code depends on.
- **Never repurpose an existing symbol.** Don't change what an existing function/prop/key/route does to fit a new need — add a new one beside it.
- **Backward compatible by default.** Existing imports, props, store return shapes, route names, and i18n keys must keep working unchanged. If a breaking change is truly unavoidable, STOP and ask the user first; do it as its own OpenSpec change with a migration note.
- **Verify you didn't regress.** After adding code, confirm `pnpm type-check` still passes and search for usages of anything you touched. If a shared edit forces changes in unrelated files, that's a red flag — rethink the design.

When in doubt: add, don't modify.

## Architecture Overview

This is a **Vue 3 + TypeScript ERP system** following **Clean Architecture/Hexagonal Architecture** principles with strict layer separation.

### Layer Structure

```
src/modules/
├── domain/                    # Core business logic (no external dependencies)
│   ├── entities/             # Domain entities with business rules
│   └── repository/           # Repository interfaces (contracts)
├── application/              # Application business logic
│   ├── dtos/                 # Data Transfer Objects
│   ├── ports/                # Input/output ports (interfaces)
│   ├── useCases/             # Business use cases
│   └── services/             # Service implementations
├── infrastructure/           # External concerns (API, DB, etc.)
│   └── api-*.repository.ts   # HTTP API repository implementations
└── presentation/             # UI layer (Vue components)
    └── Admin/
        ├── views/            # Page components
        ├── components/       # Reusable components
        ├── stores/           # Pinia stores
        └── router/           # Route definitions
```

### Key Architectural Patterns

**1. Repository Pattern**
- Infrastructure layer implements repository interfaces from domain
- Example: `ApiBankRepository` implements `BankRepository` interface
- All API calls go through repositories, never directly from components

**2. Service Layer**
- Services orchestrate use cases and repositories
- Located in `application/services/`
- Stores in `presentation/` call services, not repositories directly

**3. Pinia Store Pattern**
Each feature typically has:
- Store in `presentation/Admin/stores/[feature].store.ts`
- Creates service instance: `const [name]Service = create[Name]Service()`
- Manages UI state (loading, error, modals, pagination)
- Calls service methods, not repositories directly

**4. Routing Structure**
- All routes in `src/common/shared/router/index.ts`
- Uses feature-based route modules from `presentation/Admin/router/`
- Guards: `authGuard` (authentication) and `permissionGuard` (authorization)
- Route meta can include `permission` key for permission checks

**5. Internationalization (i18n)**
- Three languages: English (`en`), Lao (`la`), and Chinese (`cn`)
- Default fallback: English. User-facing messages from the Axios interceptor are hard-coded in Lao.
- Locale files in `src/common/locales/{en,la,cn}/`
- Loaded dynamically with `import.meta.glob`
- Access via `$t('key')` in components or `t()` in scripts
- Locale stored in localStorage as "locale"
- **Add new keys to all 3 locale folders in the same PR** (i18n coverage is incomplete; some views still hard-code Lao strings)

**6. API Configuration**
- Base URL from env var `VITE_BASE_API_URL`
- Axios instance in `src/common/config/axios/axios.ts`
- Auto-includes: Authorization header, Accept-Language header
- Error handling with user-friendly Modals
- Special handling for FormData uploads

### Technology Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **State Management**: Pinia
- **UI Library**: Ant Design Vue 4.x
- **Styling**: Tailwind CSS + SCSS
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Language**: TypeScript 5.8
- **Build Tool**: Vite 6
- **Icons**: @iconify/vue, @ant-design/icons-vue
- **Date Handling**: dayjs

### Code Conventions

**Entity Pattern**
- Entities in `domain/entities/` use getters/setters
- Private fields with public getters: `getId()`, `getName()`
- Business logic methods: `delete()`, `restore()`, `isDeleted()`
- Constructor formats dates using `formatDate()` helper

**Store Pattern**
- Use Composition API style stores (setup stores)
- Include both data state and UI state (modals, loading)
- Expose computed properties for derived state
- Handle errors at store level
- Create service instances internally with factory function

**Component Organization**
- Views in `presentation/Admin/views/{feature}/`
- Feature components in `presentation/Admin/components/{feature}/`
- Shared components in `common/shared/components/`

**File Naming**
- Repository: `api-[feature].repository.ts`
- Service: `[feature].service.ts`
- Store: `[feature].store.ts`
- Entity: `[feature].entity.ts`
- DTO: `[feature].dto.ts`

### Environment Configuration

Environment variables defined in `.env`:
- `VITE_BASE_API_URL` - Backend API base URL
- `VITE_IMG_URL` - Image server URL

Multiple environment configurations available (comment/uncomment as needed).

### Permission System

- Permissions checked via `permissionGuard` in router
- Route meta includes `permission` key
- Store `usePermissions()` provides `hasPermission()` utility
- Permission store at `common/shared/store/usePermissions.ts`

### Common Patterns

**Adding a New Feature:**
1. Create entity in `domain/entities/`
2. Create repository interface in `domain/repository/`
3. Create DTO in `application/dtos/`
4. Create service interface in `application/ports/input/`
5. Create use cases in `application/useCases/`
6. Create repository implementation in `infrastructure/`
7. Create service implementation in `application/services/`
8. Create Pinia store in `presentation/Admin/stores/`
9. Create views/components in `presentation/Admin/`
10. Add routes in `presentation/Admin/router/`
11. Add i18n keys in `common/locales/{en,la,cn}/` (all three)

**API Error Handling:**
- 401: Auto-logout and redirect to login
- 403: Permission denied modal
- 404: Logged to console
- 500: Server error modal
- All errors: Re-thrown for component-level handling

**TypeScript Configuration:**
- Project references setup with `tsconfig.json`
- Node config in `tsconfig.node.json`
- App config in `tsconfig.app.json`
- Strict type checking enabled

## Code Examples (Real Patterns from `bank` Feature)

The `bank` feature is the canonical reference. When generating new code, match these structures exactly.

### Entity (`src/modules/domain/entities/bank.entity.ts`)

```ts
import { formatDate } from "@/modules/shared/formatdate";

export class BankEntity {
  private id: string;
  private name: string;
  // ... other private fields
  private createdAt: string;
  private deletedAt: string | null;

  constructor(id: string, name: string, /* ... */ createdAt: string, deletedAt: string | null = null) {
    this.id = id;
    this.name = name;
    this.createdAt = formatDate(createdAt);
    this.deletedAt = deletedAt !== null ? formatDate(deletedAt) : null;
  }

  public getId(): string { return this.id; }
  public getName(): string { return this.name; }
  public isDeleted(): boolean { return this.deletedAt !== null; }
  public delete(): void { this.deletedAt = new Date().toISOString().replace("T", " ").substring(0, 19); }
  public restore(): void { this.deletedAt = null; }
  public static create(id: string, name: string, /* ... */): BankEntity { /* ... */ }
}
```

**Key points:** private fields, public getters, soft-delete via `delete()`/`restore()`/`isDeleted()`, dates formatted with `formatDate()` in constructor, static `create()` factory.

### Repository Interface (`src/modules/domain/repository/bank.repository.ts`)

```ts
export interface BankRepository {
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<BankEntity>>;
  findById(id: string): Promise<BankEntity | null>;
  create(data: BankCreate): Promise<BankEntity>;
  update(id: string, data: BankUpdate): Promise<BankEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
```

### DTO (`src/modules/application/dtos/bank.dto.ts`)

```ts
export interface CreateBankDTO { name: string; short_name: string; logo?: string | null }
export interface UpdateBankDTO { name?: string; short_name?: string; logo?: string | null }
export interface BankDTO { id: string; name: string; /* ... */ createdAt: string; deletedAt: string | null }
```

**Key points:** snake_case for API fields (`short_name`), camelCase only for client-only fields.

### Service (`src/modules/application/services/bank.service.ts`)

```ts
export interface BankServices {
  getAllBanks(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<BankEntity>>;
  // ... other methods
}

export class BankServiceImpl implements BankServices {
  constructor(private readonly bankRepository: BankRepository) {}

  async deleteBank(id: string): Promise<boolean> {
    const bank = await this.bankRepository.findById(id);
    if (!bank) throw new Error(`Bank with id ${id} not found`);
    if (bank.isDeleted()) throw new Error(`Bank with id ${id} is already deleted`);
    return await this.bankRepository.delete(id);
  }
}
```

**Key points:** interface + Impl class, constructor takes repository, business invariants checked here (not in store).

### Infrastructure Repository (`src/modules/infrastructure/api-bank.repository.ts`)

```ts
export class ApiBankRepository implements BankRepository {
  private readonly baseUrl = "/banks";

  async findAll(params: PaginationParams, includeDeleted = false): Promise<PaginatedResult<BankEntity>> {
    try {
      const response = await api.get(this.baseUrl, { params: { page: params.page, limit: params.limit, /* ... */ } });
      return {
        data: response.data.data.map((b: unknown) => this.toDomainModel(b)),
        total: response.data.pagination.total,
        // ...
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch banks list");
    }
  }

  async create(bankData: BankCreate): Promise<BankEntity> {
    const formData = new FormData();
    formData.append("name", bankData.name || "");
    if (bankData.logo instanceof File) formData.append("logo", bankData.logo);
    const response = await api.post(this.baseUrl, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return this.toDomainModel(response.data.data);
  }

  private toDomainModel(bank: any): BankEntity {
    return new BankEntity(bank.id.toString(), bank.name, /* ... */, bank.deleted_at || null);
  }

  private handleApiError(error: unknown, defaultMessage: string): never { /* throws normalized Error */ }
}
```

**Key points:** `baseUrl` const, `toDomainModel` private mapper, `handleApiError` private normalizer, FormData for file uploads, `id.toString()` coercion (see Pitfalls).

### Pinia Store (`src/modules/presentation/Admin/stores/bank.store.ts`)

```ts
const createBankService = () => {
  const bankRepository = new ApiBankRepository();
  return new BankServiceImpl(bankRepository);
};

export const useBankStore = defineStore("bank", () => {
  const bankService = createBankService();
  const banks = ref<BankEntity[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // UI state lives here too
  const modalVisible = ref(false);
  const deleteModalVisible = ref(false);
  const isEditMode = ref(false);
  const selectedBankId = ref<string | null>(null);

  const activeBanks = computed(() => banks.value.filter(b => !b.isDeleted()));

  const fetchBanks = async (params) => {
    loading.value = true;
    try { /* call service, update state */ }
    catch (err) { error.value = err as Error; throw err; }
    finally { loading.value = false; }
  };

  const showCreateModal = () => { resetForm(); isEditMode.value = false; modalVisible.value = true; };
  const showEditModal = (record) => { /* populate form, modalVisible.value = true */ };
  const handleDeleteConfirm = async () => { /* call deleteBank, refetch */ };

  return { banks, loading, error, /* ... */ fetchBanks, showCreateModal, /* ... */ };
});
```

**Key points:** setup-style store, factory `createXService()` inside store, data state + UI state in same store, computed for derived state, modal handlers expose `showCreateModal`/`showEditModal`/`showDeleteModal`/`handleDeleteConfirm`.

### View (`src/modules/presentation/Admin/views/bank/BankListView.vue`)

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBankStore } from "@/modules/presentation/Admin/stores/bank.store";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import { useNotification } from "@/modules/shared/utils/useNotification";

const { t } = useI18n();
const { hasPermission } = usePermissions();
const { success, warning } = useNotification();
const bankStore = useBankStore();

const canCreateBank = ref(hasPermission('create-bank'));

onMounted(async () => { await bankStore.fetchBanks({ page: 1, limit: 10 }); });
onUnmounted(() => { bankStore.resetState(); });
</script>

<template>
  <div class="p-6">
    <h1>{{ t("banks.title") }}</h1>
    <UiButton v-if="canCreateBank" @click="bankStore.showCreateModal">{{ t("banks.add") }}</UiButton>
    <Table :columns="getColumns(t)" :dataSource="bankStore.mappedBanks" :pagination="bankStore.tablePagination" />
    <UiModal :visible="bankStore.modalVisible" @ok="bankStore.handleModalOk(bankFormRef)" @cancel="bankStore.handleModalCancel">
      <FormBank ref="bankFormRef" v-model="bankStore.bankFormModel" @submit="handleFormSubmit" />
    </UiModal>
  </div>
</template>
```

**Key points:** `<script setup lang="ts">`, store-only (never service/repo directly), `useI18n()` + `useNotification()` + `usePermissions()`, `onUnmounted` calls `bankStore.resetState()`, permissions cached in refs.

### Route (`src/modules/presentation/Admin/router/bankRoutes.ts`)

```ts
export const banksRoutes: RouteRecordRaw[] = [
  {
    path: "/banks",
    name: "bank.index",
    component: BankListView,
    meta: { Title: "banks", requiredAuth: true /* , permission: "view-bank" if gated */ },
  },
];
```

**Key points:** `requiredAuth: true` for auth guard, `permission: "<verb>-<resource>"` for permission guard, route names use `<feature>.<action>` dot-notation.

## OpenSpec Workflow

This project uses **OpenSpec spec-driven development**. Use it for any non-trivial change.

| When you want to... | Use this command |
|---------------------|-------------------|
| Brainstorm before committing to a design | `/opsx:explore` |
| Create a complete proposal (proposal + design + specs + tasks) | `/opsx:propose` |
| Implement tasks from an approved proposal | `/opsx:apply` |
| Archive a finished change after merge | `/opsx:archive` |

**Workflow:**
1. `/opsx:explore` to investigate the problem (no artifacts created yet)
2. `/opsx:propose` to generate `openspec/changes/<change-name>/{proposal.md, design.md, specs/, tasks.md}`
3. Manually review/edit the change folder
4. `/opsx:apply` to work through `tasks.md` checkboxes
5. `/opsx:archive` after merge to move into `openspec/changes/archive/`

**Strict rules:**
- `tasks.md` MUST use `- [ ] N.M task` checkbox format (anything else is invisible to the parser)
- Spec scenarios use exactly four hashtags (`#### Scenario:`), requirements use exactly three (`### Requirement:`)
- Specs go under `## ADDED Requirements / ## MODIFIED Requirements / ## REMOVED Requirements` in delta specs

**For full workflow rules, read `openspec/AGENTS.md` (the authoritative guide).**

## Known Pitfalls

Real footguns in this codebase — be aware of these before generating code.

1. **Two `usePermissions` exist.** Canonical: `common/shared/store/usePermissions.ts`. Duplicate at `modules/shared/utils/usePermissions.ts` is being deprecated by the `extract-list-view-globals` change. Existing code (e.g. `BankListView.vue`) still imports the duplicate — match the surrounding file's import when editing.
2. **Hard-coded permission patch on login.** `useAuthStore.login()` force-appends `"write-purchase-request"` to every user. Don't replicate.
3. **IDs cross the wire as numbers but become strings client-side.** Entities accept `id: string`; repos do `.toString()`. Keep this convention.
4. **Folder names mix kebab-case and snake_case** (e.g. `vendors/vendor_bank_accounts/`, `purchase_requests/` next to `purchase-requests/`). Pick the existing name in the folder you're touching — don't normalize in-flight.
5. **Some router file names have typos** (`purchase-reques.router.ts`, `Darwer/` instead of `Drawer/`, `UploadFIlePDF.vue`). Don't rename in unrelated PRs.
6. **`deleteModalVisible` triple is duplicated 31×.** Use the new `ConfirmDeleteModal` after `extract-list-view-globals` lands.
7. **Upload components emit `message.success/error` directly** instead of going through `useNotification`. New code should use `useNotification` from `@/modules/shared/utils/useNotification`.
8. **i18n keys are not 100% covered** — strings like `"ບໍ່ມີຂໍ້ມູນ"` are hard-coded in some views. **Always add new keys to all three locales (`en`, `la`, `cn`).**
9. **No automated tests in repo.** Smoke-test in the browser (`pnpm dev`). Make small, easily-reverted changes.
10. **Auth state lives in both `localStorage` AND the Pinia store.** `useAuthStore.initializeUser()` rehydrates from storage. Anything mutated in memory must also be persisted to survive refresh.
11. **Routes module file naming is inconsistent** — some end in `Routes.ts`, others in `.routers.ts` (typo) or `.routes.ts`. Match the existing convention in the surrounding folder.

## Common Tasks Recipes

### Add a new field to entity `X`

Touch these files in order:
1. `src/modules/domain/entities/X.entity.ts` — add private field, getter, constructor param
2. `src/modules/application/dtos/X.dto.ts` — add to Create/Update/X DTO (snake_case if API field)
3. `src/modules/interfaces/X.interface.ts` — add to `XCreate` / `XUpdate` / `XInterface` (snake_case)
4. `src/modules/infrastructure/api-X.repository.ts` — append to FormData in `create()`/`update()`, map in `toDomainModel()`
5. `src/modules/presentation/Admin/stores/X.store.ts` — add to `bankFormModel`/`resetForm`/`showEditModal`
6. `src/modules/presentation/Admin/components/X/FormX.vue` — add form field with i18n label
7. `src/modules/presentation/Admin/views/X/column.ts` — add table column if displayed
8. `src/common/locales/{en,la,cn}/X.json` — add 3 i18n keys (label, placeholder, validation)

### Add a new permission

1. Apply it in the route: `meta: { permission: "<verb>-<resource>" }` (verbs: `create`/`update`/`delete`/`view`)
2. Inline check in view: `hasPermission('<verb>-<resource>')` → cache in `const canX = ref(...)`
3. Conditional render: `v-if="canX"` on buttons/menu items
4. No backend wiring needed — the permission string is matched against the user's `userPermissions` list from `localStorage`

### Add a new route

1. Create `src/modules/presentation/Admin/router/<feature>Routes.ts` exporting `RouteRecordRaw[]`
2. Register it in `src/common/shared/router/index.ts` by spreading into the routes array
3. Add `meta: { Title: "<key>", requiredAuth: true, permission: "view-<resource>" }`
4. Route name uses dot-notation: `<feature>.<action>` (e.g. `bank.index`, `bank.detail`)
5. Add i18n key for the title in `menu-sidebar.json` if it appears in the sidebar

### Add a new locale string

ALWAYS in 3 files at the same time:
- `src/common/locales/en/<feature>.json`
- `src/common/locales/la/<feature>.json`
- `src/common/locales/cn/<feature>.json`

Use nested keys: `{ "<feature>": { "title": "...", "placeholder": { "search": "..." }, "error": { "title": "..." } } }`. Access via `t("<feature>.title")`.

## Quality Gates

Before marking work as done:

```bash
pnpm type-check    # vue-tsc — MUST pass
pnpm lint          # eslint --fix — MUST be clean
pnpm dev           # smoke-test the touched view in the browser
```

There are **no automated tests** in this repo. Browser smoke testing is the only validation. Keep changes small and easily revertable.

## Specialist Agents (`.claude/agents/`)

This project has 5 custom Claude Code agents. Use them when the task matches.

| Agent | When to use |
|-------|------------|
| `feature-scaffolder` | Creating a complete CRUD feature (all 8 layers + i18n). Slash: `/hal:scaffold <name>` |
| `i18n-checker` | Verifying key coverage across en/la/cn, finding hard-coded strings. Slash: `/hal:check-i18n` |
| `purchase-flow-helper` | Tasks touching PR/PO/Receipt/Disbursement/Approval workflow. Slash: `/hal:purchase-flow <task>` |
| `permission-audit` | Auditing permission coverage and naming inconsistencies. Slash: `/hal:audit-permissions` |
| `shared-component-finder` | BEFORE building a new component — find reusable existing ones. Slash: `/hal:find-component <description>` |

**Project slash commands** (`.claude/commands/hal/`): `/hal:scaffold`, `/hal:check-i18n`, `/hal:pre-commit`, `/hal:audit-permissions`, `/hal:find-component`, `/hal:purchase-flow`.

**OpenSpec slash commands**: `/opsx:explore`, `/opsx:propose`, `/opsx:apply`, `/opsx:archive` (see `openspec/AGENTS.md`).

## Automatic Hooks

`.claude/settings.json` configures:
- **PostToolUse** (Edit/Write/MultiEdit) — auto-runs `npx eslint --fix` on edited `.vue/.ts/.tsx` files
- **SessionStart** — prints branch + uncommitted file count at session start

Disable hooks temporarily by renaming `.claude/settings.json` → `.claude/settings.json.bak`.
