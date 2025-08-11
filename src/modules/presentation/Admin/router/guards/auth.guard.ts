// src/modules/presentation/Admin/router/guards/auth.guard.ts
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "../../stores/authentication/auth.store";

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  const isAuthenticated = authStore.checkSession();
  if (!isAuthenticated && to.name !== "login" && to.meta.requiresAuth !== false) {
    return next({ name: "login" });
  }

  if (isAuthenticated && to.name === "login") {
    return next({ name: "dashboard" });
  }
  next();
};
