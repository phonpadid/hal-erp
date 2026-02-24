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
- Two languages: English (`en`) and Lao (`la`)
- Locale files in `src/common/locales/{en,la}/`
- Loaded dynamically with `import.meta.glob`
- Access via `$t('key')` in components or `t()` in scripts
- Locale stored in localStorage as "locale"

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
11. Add i18n keys in `common/locales/{en,la}/`

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
