<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ManageFormRole from './ManageFormRole.vue';
import { departmentStore } from '../../stores/departments/department.store';
import { useRoleStore } from '../../stores/role.store';
import { useNotification } from '@/modules/shared/utils/useNotification';

const route = useRoute();
const router = useRouter();
const { error,success } = useNotification();
const dpmStore = departmentStore();
const roleStore = useRoleStore();
const loading = ref(false);
const isEditMode = computed(() => !!route.params.id);

// เพิ่ม interface สำหรับการแสดงผล
interface DisplayFormData {
  department_id: number;
  department_name: string;
  name: string;
  permissions: number[];
}

const formattedInitialData = computed<DisplayFormData | undefined>(() => {
  if (!roleStore.currentRole) return undefined;
  
  return {
    department_id: roleStore.currentRole.getDepartmentId(), 
    department_name: roleStore.currentRole.getDepartmentName(), 
    name: roleStore.currentRole.getName(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    permissions: roleStore.currentRole.getPermissions().map((p:any) => p.id)
  };
});


onMounted(async () => {
  try {
    loading.value = true;
    await dpmStore.fetchDepartment({ page: 1, limit: 10000 }, false);
    if (isEditMode.value) {
      const role = await roleStore.fetchRoleById(route.params.id as string);
      if (!role) {
        error(
           'error',
           'ບໍ່ພົບຂໍ້ມູນ Role ທີຕ້ອງການແກ້ໄຂ'
        );
        router.push({ name: 'roleList' });
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
  roleStore.resetState(); 
});
const handleFormSubmit = async (formData: { 
  department_id?: number; 
  name: string; 
  permissions: number[] 
}) => {
  try {
    loading.value = true;
    
    if (isEditMode.value) {
    
      await roleStore.updateRole(route.params.id as string, formData);
      success(
         'success',
         'ອັບເດດຂໍ້ມູນສໍາເລັດ'
      );
    } else {
     
      await roleStore.createRole(formData);
      success(
         'success',
         'ບັນທຶກຂໍ້ມູນສໍາເລັດ'
      );
    }
    router.push({ name: 'roleList' });
  } catch (err) {
    error(
      'error',
      `เกิดข้อผิดพลาด: ${(err as Error).message}`
    );
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="mt-4">
    <h1>{{ isEditMode ? 'ແກ້ໄຂ Role' : 'ຟອມສ້າງ Role' }}</h1>
    <div v-if="loading" class="text-center py-2">
      <span class="loading loading-spinner loading-md"></span>
    </div> 
    <template v-else>
      <ManageFormRole 
        :initial-data="formattedInitialData" 
        :is-edit="isEditMode"
        @submit="handleFormSubmit" 
      />
    </template>
  </div>
</template>