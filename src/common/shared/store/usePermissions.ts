// src/composables/usePermissions.ts
import { computed } from "vue";
import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";

export function usePermissions() {
    const authStore = useAuthStore();
    const userPermissions = computed(() => authStore.userPermissions);
    const isSuperAdmin = computed(() => authStore.isSuperAdmin); // ✅ ดึง getter isSuperAdmin
    const isAdmin = computed(() => authStore.isAdmin); // ✅ ดึง getter isAdmin
    const isCompanyAdmin = computed(() => authStore.isCompanyAdmin); // ✅ ดึง getter isAdmin
    const isUserTypeCompanyAdmin = computed(() => authStore.isUserTypeCompanyAdmin); // ✅ ดึง getter isAdmin

    const hasPermission = (permissionName: string): boolean => {
        // ✅ ถ้าเป็น super-admin หรือ admin ให้คืนค่า true เสมอ
        if (isSuperAdmin.value || isAdmin.value) {
            return true;
        }

        // สำหรับ user ปกติ, ตรวจสอบจาก permissions ที่ได้รับ
        if (!userPermissions.value) {
            return false;
        }
        return userPermissions.value.includes(permissionName);
    };

    const hasCompanyPermission = (permissionName: string): boolean => {
        if (isSuperAdmin.value || isAdmin.value) {
            return false;
        }

        if (isUserTypeCompanyAdmin.value) {
            // return true;
            if(isCompanyAdmin.value) return true
            return userPermissions.value.includes(permissionName);
        }
        if (!userPermissions.value) {
            return false;
        }
        return false
    };

    return {
        hasPermission,
        hasCompanyPermission
    };
}
