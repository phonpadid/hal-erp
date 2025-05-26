import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { RoleServiceImpl } from "@/modules/application/services/role.service";
import { ApiRoleRepository } from "@/modules/infrastructure/api-role.repository";
import type { Role } from "@/modules/domain/entities/role.entities";
import type { PaginationParams } from "@/modules/shared/pagination";

// เพิ่ม interface สำหรับข้อมูลดิบ
interface RawRole {
  id: number | string;
  name: string;
  display_name?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

//  role service
const createRoleService = () => {
  const roleRepository = new ApiRoleRepository();
  return new RoleServiceImpl(roleRepository);
};

export const useRoleStore = defineStore("roles", () => {
  // create service
  const roleService = createRoleService();
  // State
  const roles: Ref<Role[]> = ref([]);
  // เพิ่ม state ใหม่สำหรับเก็บข้อมูลดิบจาก API
  const rawRoles: Ref<RawRole[]> = ref([]);
  const currentRole: Ref<Role | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeRoles = computed(() => roles.value.filter((role) => !role.isDeleted()));
  const deletedRoles = computed(() => roles.value.filter((role) => role.isDeleted()));
  const totalActiveRoles = computed(() => activeRoles.value.length);
  const totalDeletedRoles = computed(() => deletedRoles.value.length);

  // Get All Roles
  const fetchRoles = async (
    // fetchRoles
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await roleService.getAllRoles(params, includeDeleted);

      // เก็บข้อมูลดิบจาก API ก่อนที่จะถูกแปลงเป็น Entity
      // เพิ่มบรรทัดนี้เพื่อเก็บข้อมูลดิบ
      rawRoles.value = JSON.parse(JSON.stringify(result.data));
      console.log("Raw roles data:", rawRoles.value);

      roles.value = result.data;
      console.log("Roles fetched successfully:", roles.value);

      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };

      // ส่งคืนข้อมูลดิบ
      return {
        ...result,
        raw_data: rawRoles.value,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Reset state
  const resetState = () => {
    roles.value = [];
    rawRoles.value = [];
    currentRole.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  };

  return {
    // State
    roles,
    rawRoles, // เพิ่มการ export rawRoles
    fetchRoles,
    currentRole,
    loading,
    error,
    pagination,

    // Getters
    activeRoles,
    deletedRoles,
    totalActiveRoles,
    totalDeletedRoles,
    resetState,
  };
});
