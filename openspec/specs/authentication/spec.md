# Authentication & Session

> Canonical spec — describes what the **authentication** capability currently DOES. Source of truth for login, logout, forgot/reset password, and session rehydration.

## Purpose

Authenticate a user against the remote REST API, persist the resulting session (token + identity + permissions) in both the Pinia store and `localStorage`, and gate every routed page behind a valid session.

## Implementation Map

| Layer | File |
| ----- | ---- |
| View | `src/modules/presentation/Admin/views/authentication/Login.vue`, `ResetPassword.vue` |
| Component | `src/modules/presentation/Admin/components/login/FormLogin.vue`, `ForgotPasswordModal.vue` |
| Store | `src/modules/presentation/Admin/stores/authentication/auth.store.ts` |
| Service | `src/modules/application/services/auth/auth.service.ts` |
| Repository (impl) | `src/modules/infrastructure/auth/api-auth.repository.ts` |
| Repository (interface) | `src/modules/domain/repository/auth/auth.repository.ts` |
| Entity | `src/modules/domain/entities/auth/auth.entity.ts` |
| DTO | `src/modules/application/dtos/auth/auth.dto.ts` |
| Route guard | `src/modules/presentation/Admin/router/guards/auth.guard.ts` |

API base path: `/users`. Endpoints: `POST /users/login`, `POST /users/logout`, `POST /users/forgot-password`, `POST /users/reset-password`.

## ADDED Requirements

### Requirement: User login with username and password

The system SHALL authenticate a user by sending `{ username, password }` to `POST /users/login`. The login form MUST validate that `username` is at least 3 characters and `password` is at least 6 characters before submitting. On success the system MUST hydrate the auth store and `localStorage`, then redirect to `/approval-purchase-requests`.

#### Scenario: Successful login

- **WHEN** a user submits valid credentials and the API returns `status_code === 201`
- **THEN** the system maps the response into an `AuthEntity`, sets `user`, `userPermissions`, `userRoles`, and `userType` in the store, writes `accessToken`, `userData`, `userPermissions`, `userRoles`, `userType`, and (if present) `userCompany` to `localStorage`, shows a success notification, and navigates to `/approval-purchase-requests`

#### Scenario: Client-side validation failure

- **WHEN** the user submits a username shorter than 3 characters or a password shorter than 6 characters
- **THEN** the `UiForm` validation blocks submission, shows the Lao validation message, and no API request is made

#### Scenario: Invalid credentials

- **WHEN** the API returns a non-201 status or an error response
- **THEN** the repository throws a normalized `Error` (`API Error (<status>): <message>`), the store records it in `error`, re-throws so the form's catch logs it, and the user remains on the login page

#### Scenario: Double-submit guard

- **WHEN** a login request is already in flight (`isLoading` is true)
- **THEN** the submit handler returns immediately and does not issue a second request

### Requirement: Default purchase-request permission patch

On successful login the system SHALL force-append `"write-purchase-request"` to the user's permission list if it is not already present, before persisting permissions to `localStorage`.

> NOTE: This is a known temporary patch (see `openspec/AGENTS.md` pitfall #2). It MUST be removed once the back-end issues this permission. New code MUST NOT replicate this pattern.

#### Scenario: User lacking the permission

- **WHEN** the API response omits `write-purchase-request` from `user.permission`
- **THEN** the store appends it to `userPermissions` so the purchase-request features are reachable

### Requirement: Session persistence and rehydration

The system SHALL keep the session in `localStorage` in addition to the store, and MUST rehydrate the store from `localStorage` on construction so a page refresh preserves the session.

#### Scenario: Refresh restores session

- **WHEN** the store is initialized and `localStorage` contains `accessToken`, `userData`, `userPermissions`, and `userRoles`
- **THEN** `initializeUser()` reconstructs the `AuthEntity` and repopulates `userPermissions`, `userRoles`, and `userType` (defaulting `userType` to `[]` for backward compatibility)

#### Scenario: Session check

- **WHEN** any code calls `checkSession()`
- **THEN** it returns `true` if and only if an `accessToken` exists in `localStorage`

### Requirement: Route guarding for authenticated pages

The router SHALL run `authGuard` so that an unauthenticated user cannot reach any route except `login` and routes that explicitly set `meta.requiresAuth === false`.

#### Scenario: Unauthenticated access redirected

- **WHEN** a user without an `accessToken` navigates to a route other than `login` whose `meta.requiresAuth` is not `false`
- **THEN** the guard redirects to the `login` route

#### Scenario: Authenticated navigation passes through

- **WHEN** a user with a valid `accessToken` navigates to any route
- **THEN** the guard calls `next()` and allows navigation

### Requirement: Logout clears session

The system SHALL call `POST /users/logout`, then clear all in-memory auth state and all auth-related `localStorage` keys, and redirect to `/login`.

#### Scenario: User logs out

- **WHEN** `logout()` is invoked
- **THEN** the store clears `user`, `userPermissions`, `userRoles`, `userType`, removes `accessToken`, `userData`, `userCompany`, `userPermissions`, `userRoles`, `userType` from `localStorage`, and navigates to `/login`

### Requirement: Forgot password request

The system SHALL accept an email address and send it to `POST /users/forgot-password` to trigger a reset link.

#### Scenario: User requests a reset link

- **WHEN** the user opens the forgot-password modal and submits a valid email
- **THEN** the system posts `{ email }` and returns the API `message`; on error it throws an `Error` carrying the API `errorKey`

### Requirement: Reset password with token

The system SHALL accept `{ token, new_password, confirm_password }` and send them to `POST /users/reset-password`.

#### Scenario: User submits a new password

- **WHEN** the user submits the reset form with a valid token and matching passwords
- **THEN** the system posts the payload and returns the API `message`; on error it throws an `Error` carrying both `errorKey` and `statusCode`

### Requirement: Role and user-type helpers

The store SHALL expose computed flags derived from roles/user-type for use across the app: `isSuperAdmin`, `isAdmin`, `isCompanyAdmin`, `isCompanyUser`, `isUserTypeCompanyAdmin`, plus `userCompany`, `getCompanyId`, and `getCompanyName`.

#### Scenario: Super-admin detection

- **WHEN** `userRoles` contains `"super-admin"`
- **THEN** `isSuperAdmin` computed evaluates to `true`

#### Scenario: Company context resolution

- **WHEN** `userCompany` was persisted at login
- **THEN** `getCompanyId` and `getCompanyName` read it from `localStorage` and expose the company `id` and `name`
