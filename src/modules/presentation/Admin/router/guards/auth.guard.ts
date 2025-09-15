
// import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
// import { useAuthStore } from "../../stores/authentication/auth.store";

// export const authGuard = async (
//   to: RouteLocationNormalized,
//   from: RouteLocationNormalized,
//   next: NavigationGuardNext
// ) => {
//   const authStore = useAuthStore();

//   const isAuthenticated = authStore.checkSession();
//   if (!isAuthenticated && to.name !== "login" && to.meta.requiresAuth !== false) {
//     return next({ name: "login" });
//   }

//   if (isAuthenticated && to.name === "login") {
//     return next({ name: "dashboard" });
//   }
//   next();
// };
// src/modules/presentation/Admin/router/guards/auth.guard.ts
import type { NavigationGuard } from "vue-router"; // ใช้ NavigationGuard ที่ถูกต้อง
import { useAuthStore } from "../../stores/authentication/auth.store";

export const authGuard: NavigationGuard = (to, from, next) => { // ✅ เปลี่ยนเป็น NavigationGuard
    const authStore = useAuthStore();
    const isAuthenticated = authStore.checkSession();

    if (!isAuthenticated && to.name !== "login" && to.meta.requiresAuth !== false) {
        next({ name: "login" });
    } else {
        next(); // ✅ เรียก next() เพื่อให้ flow ไปยัง guard ถัดไป
    }
};
