// src/composables/usePermissions.ts
import { computed } from "vue";
import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";
import { useCompanyStore } from "@/modules/presentation/Admin/stores/company.store";

export function usePermissions() {
    const authStore = useAuthStore();
    const companyStore = useCompanyStore();

    // Make sure permissions are reactive to both auth and company state changes
    // Add fallback to localStorage for permissions to ensure they work on page load
    const userPermissions = computed(() => {
        // Try to get from store first (reactive)
        if (authStore.userPermissions && authStore.userPermissions.length > 0) {
            return authStore.userPermissions;
        }

        // Fallback to localStorage if store is empty
        try {
            const storedPermissions = localStorage.getItem("userPermissions");
            if (storedPermissions) {
                return JSON.parse(storedPermissions);
            }
        } catch (error) {
            console.warn("Failed to parse permissions from localStorage:", error);
        }

        return [];
    });

    const isSuperAdmin = computed(() => authStore.isSuperAdmin); // ✅ ดึง getter isSuperAdmin
    const isAdmin = computed(() => authStore.isAdmin); // ✅ ดึง getter isAdmin
    const isCompanyAdmin = computed(() => authStore.isCompanyAdmin); // ✅ ดึง getter isAdmin
    const isUserTypeCompanyAdmin = computed(() => authStore.isUserTypeCompanyAdmin); // ✅ ดึง getter isAdmin

    // Add reactive dependency to current company state
    const currentCompany = computed(() => companyStore.currentCompany);

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
        // Access currentCompany to establish reactive dependency
        const company = currentCompany.value;

        // Debug logging to track permission checks

        // Super admin, admin, ແລະ company admin ສາມາດເຫັນທຸກໆຢ່າງ
        if (isSuperAdmin.value || isAdmin.value || isCompanyAdmin.value) {
            return true;
        }

        // ຖ້າບໍ່ມີບໍລິສັດທີ່ເລືອກ, ບໍ່ສະແດງ menu ຂອງບໍລິສັດ (ສຳລັບຜູ້ໃຊ້ທົ່ວໄປ)
        if (!company) {
            return false;
        }

        // ຖ້າເປັນຜູ້ໃຊ້ປະເພດບໍລິສັດ ແຕ່ບໍ່ແມ່ນ admin, ຕ້ອງກວດສອບ permission
        if (isUserTypeCompanyAdmin.value) {
            // ຖ້າບໍ່ແມ່ນ admin, ຕ້ອງກວດສອບ permission
            if (userPermissions.value && userPermissions.value.length > 0) {
                const hasPermission = userPermissions.value.includes(permissionName);
                return hasPermission;
            }
            return false;
        }

        // ຖ້າບໍ່ມີ permissions ແລະບໍ່ແມ່ນຜູ້ໃຊ້ປະເພດບໍລິສັດ
        if (!userPermissions.value || userPermissions.value.length === 0) {
            return false;
        }

        // ກວດສອບ permission ສຳລັບຜູ້ໃຊ້ທົ່ວໄປ
        const hasPermission = userPermissions.value.includes(permissionName);
        return hasPermission;
    };

    return {
        hasPermission,
        hasCompanyPermission
    };
}
