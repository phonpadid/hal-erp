// src/modules/presentation/Admin/router/guards/permission.guard.ts
import type { NavigationGuard } from "vue-router";
import { usePermissions } from "../store/usePermissions";

export const permissionGuard: NavigationGuard = (to, from, next) => {
    const { hasPermission } = usePermissions();

    if (to.meta.permission) {
        if (hasPermission(to.meta.permission as string)) {
            next();
        } else {
            next({ name: "unauthorized" });
        }
    } else {
        next();
    }
};
