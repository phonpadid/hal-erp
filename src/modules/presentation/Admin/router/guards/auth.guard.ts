// src/modules/presentation/Admin/router/guards/auth.guard.ts
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";
import { useNotification } from "@/modules/shared/utils/useNotification";

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  const { error: showError } = useNotification();
  const token = localStorage.getItem("accessToken");
  const currentTime = new Date().getTime();
  const lastLoginTime = localStorage.getItem("lastLoginTime");

  // ตรวจสอบ session timeout
  if (lastLoginTime && currentTime - parseInt(lastLoginTime) > 8 * 60 * 60 * 1000) {
    authStore.logout();
    showError("ແຈ້ງເຕືອນ", "ເຊສຊັນໝົດອາຍຸແລ້ວ, ກະລຸນາເຂົ້າສູ່ລະບົບອີກຄັ້ງ");
    next({
      name: "login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  // หน้าที่ต้องการการ authenticate
  if (to.matched.some((record) => record.meta.requiresAuth !== false)) {
    if (!token) {
      next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  }
  // หน้า login
  else if (to.name === "login") {
    if (token && authStore.checkSession()) {
      next({ name: "dashboard" });
    } else {
      next();
    }
  } else {
    next();
  }
};
