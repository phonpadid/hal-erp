<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ManageFormDepartmentRole from './ManageFormDepartmentRole.vue';
import { departmentStore } from '../../../stores/departments/department.store';
import { useRoleStore } from '../../../stores/role.store';
import { useDepartmentRoleStore } from '../../../stores/departments/department-role.store';
import { useNotification } from '@/modules/shared/utils/useNotification';
import type { UpdateDepartmentRoleDTO } from '@/modules/application/dtos/departments/department-role.dto';

const route = useRoute();
const router = useRouter();
const { error, success } = useNotification();
const dpmStore = departmentStore();
const roleStore = useRoleStore();
const departmentRoleStore = useDepartmentRoleStore();
const loading = ref(false);
const isEditMode = computed(() => !!route.params.id);

// Interface for display form data
interface DisplayFormData {
  role_id: number;
  role_name?: string;
  name?: string; // Department role name from API response
  department_id: number;
  department_name?: string;
  permissions: number[];
}

const formattedInitialData = computed<DisplayFormData | undefined>(() => {
  if (!roleStore.currentRole) return undefined;

  const departmentRole = roleStore.currentRole;
  const role_id = Number(departmentRole.getId());

  // Look up role name from roles store
  const foundRole = roleStore.roles.find(role => role.getId() === role_id.toString());
  const roleDisplayName = foundRole ? foundRole.getDisplayname() || foundRole.getName() : '';

  return {
    role_id: role_id,
    role_name: roleDisplayName, // Role name from lookup
    name: roleDisplayName, // Use role name as department role display name
    department_id: departmentRole.getDepartmentId(),
    department_name: '', // Would need to be populated from department store
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    permissions: departmentRole.getPermissions().map((per: any) => {
      // Extract ID from permission object or return as-is if it's already an ID
      if (typeof per === 'object' && per.id) {
        return per.id;
      }
      return per;
    }),
  };
} );

onMounted(async () => {
  try {
    loading.value = true;

    // Load departments and roles data
    await Promise.all([
      dpmStore.fetchDepartment({ page: 1, limit: 10000 }, false),
      roleStore.fetchAllRoles({ page: 1, limit: 10000 })
    ]);

    if (isEditMode.value) {
      const departmentRole = await roleStore.fetchRoleById(route.params.id as string);
      console.log('tou:', departmentRole);
      if (!departmentRole) {
        error(
          'error',
          'ບໍ່ພົບຂໍ້ມູນ Department Role ທີ່ຕ້ອງການແກ້ໄຂ'
        );
        router.push({ name: 'department_role.index' });
      }
    }
  } catch (err) {
    error(
      'error',
      'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
    );
    console.error(err);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  // departmentRoleStore.clearCurrentDepartmentRole();
});

const handleFormSubmit = async (formData: {
  role_id: number;
  department_id: number;
  permissions: number[]
}) => {
  try {
    loading.value = true;

    if (isEditMode.value) {
      await departmentRoleStore.updateDepartmentRole(route.params.id as string, formData as UpdateDepartmentRoleDTO);
      success(
        'success',
        'ອັບເດດຂໍ້ມູນສໍາເລັດ'
      );
    } else {
      await departmentRoleStore.createDepartmentRole(formData);
      success(
        'success',
        'ບັນທຶກຂໍ້ມູນສໍາເລັດ'
      );
    }
    router.push({ name: 'department_role.index' });
  } catch (err) {
    error(
      'error',
      `ເກີດຂໍ້ຜິດພາດ: ${(err as Error).message}`
    );
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="mt-4">
    <h1>{{ isEditMode ? 'ແກ້ໄຂ Department Role' : 'ຟອມສ້າງ Department Role' }}</h1>
    <div v-if="loading" class="text-center py-2">
      <span class="loading loading-spinner loading-md"></span>
    </div>
    <template v-else>
      <ManageFormDepartmentRole
        :initial-data="formattedInitialData"
        :is-edit="isEditMode"
        @submit="handleFormSubmit"
      />
    </template>
  </div>
</template>
