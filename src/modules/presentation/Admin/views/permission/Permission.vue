<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { usePermissionStore } from "../../stores/permission.store";
import { useI18n } from "vue-i18n";
import { columns } from "./column";
import Table from "@/common/shared/components/table/Table.vue";
// import PermissionSelector from "@/modules/presentation/Admin/components/permission/PermissionSelector.vue";

const { t } = useI18n();
const permissionStore = usePermissionStore();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const permissionData = ref<any[]>([]);
const loading = ref(false);
// const selectedPermissionIds = ref<(string | number)[]>([]);

const loadPermissions = async () => {
  try {
    loading.value = true;
    const result = await permissionStore.fetchPermission();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    permissionData.value = result.data as any[];
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  } finally {
    loading.value = false;
  }
};

// const handlePermissionSelect = (values: (string | number)[]) => {
//   selectedPermissionIds.value = values;
//   console.log("Selected permissions:", selectedPermissionIds.value);
// };

onMounted(async () => {
  await loadPermissions();
});
</script>

<template>
  <div class="permission-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("permissions.list.title") }}</h1>
      </div>
    </div>
    <!-- Permissions Table -->
    <Table
      :columns="columns(t)"
      :dataSource="permissionData"
      :pagination="{ pageSize: 10 }"
      :loading="loading"
      row-key="id"
    />

    <!-- Permission Selection Section -->
    <!-- <div class="mb-6 p-4 border rounded-lg bg-white">
      <h2 class="text-xl font-medium mb-4">ເລືອກສິດທີທີຕ້ອງການ</h2>

      <a-spin :spinning="loading">
        <PermissionSelector
          v-model="selectedPermissionIds"
          :permissionData="permissionData"
          @update:modelValue="handlePermissionSelect"
        />
      </a-spin>

      <div class="mt-4">
        <p>ເລືອກສິດທິທັງໝົດ {{ selectedPermissionIds.length }} ສິດທິ</p>
        <a-button type="primary" class="mt-2" :disabled="selectedPermissionIds.length === 0">
          ບັນທຶກສິດທິ
        </a-button>
      </div>
    </div> -->
  </div>
</template>
