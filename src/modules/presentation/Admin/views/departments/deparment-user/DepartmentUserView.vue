<script setup lang="ts">
import { ref, onMounted } from "vue";
import { columns } from "./column";
// import { departmentStore } from "../../../stores/departments/department.store";
import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import { dataDpmUser } from "@/modules/shared/utils/data.department";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useRouter } from "vue-router";
import { departmenUsertStore } from "../../../stores/departments/department-user.store";
const { t } = useI18n();
const dpmUserStore = departmenUsertStore()
// Initialize the unit store
// const dpmStore = departmentStore();
// departments data that will be displayed (from API or mock)
const department = ref<DepartmentApiModel[]>([ ]);
const useRealApi = ref<boolean>(true); // Toggle between mock and real API

// Form related
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedDpm = ref<DepartmentApiModel | null>(null);
// Load data on component mount
onMounted(async () => {
  await loadDpm();
});

const loadDpm = async (): Promise<void> => {
  // if (useRealApi.value) {
  //   try {
  //     loading.value = true;
  //     const result = await dpmStore.fetchDepartment();

  //     department.value = result.data.map((dpm: any) => {
  //       return {
  //         id: dpm.id ? parseInt(dpm.id) : 0,
  //         name: dpm.name || "",
  //         code: dpm.code || "",
  //         createdAt: dpm.createdAt || "",
  //         updatedAt: dpm.updatedAt || "",
  //       };
  //     });

  //     console.log("Department data loaded:", department.value);
  //   } catch (error) {
  //     console.error("Failed to fetch department from API:", error);
  //     department.value = [...dataDpm.value];
  //   } finally {
  //     loading.value = false;
  //   }
  // } else {
  department.value = [...dataDpmUser.value];
  // }
};
const router = useRouter()
// CRUD operations
const creation = (): void => {
  router.push({name: 'add_department_user.index'})
};

const update = (record: DepartmentApiModel): void => {
  router.push({
    name: "edit_department_user.index", params: {id: record.id}
  })
};

const showDeleteModal = (record: DepartmentApiModel): void => {
  selectedDpm.value = record;
  deleteModalVisible.value = true;
};

const handleDelete = async (): Promise<void> => {
  if (!selectedDpm.value) return;

  loading.value = true;

  if (useRealApi.value) {
    try {
      // Use API to delete
      const id = selectedDpm.value.id.toString();
      await dpmUserStore.deleteDepartmentUser(id);

      await loadDpm(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
    }
  } else {
    // Filter out the deleted unit locally
    department.value = department.value.filter(
      (u) => u.id !== selectedDpm.value!.id
    );
    // Update mock data too
    dataDpmUser.value = dataDpmUser.value.filter((u) => u.id !== selectedDpm.value!.id);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold">
        {{ $t("departments.dpm_user.title") }}
      </h1>
      <div class="flex items-center justify-between">
        <div class="w-[20rem]">
          <InputSearch :placeholder="t('departments.dpm_user.placeholder.search')" />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="creation"
          colorClass="flex items-center"
        >
          {{ $t("departments.dpm.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Table -->
    <Table
      :columns="columns(t)"
      :dataSource="department"
      :pagination="{ pageSize: 10 }"
      row-key="id"
      :loading="dpmUserStore.loading"
    >
      <!-- Named slot: signature_file -->
      <template #signature_file="{ record }">
        <a-image :src="record.signature_file" :width="60" />
      </template>

      <!-- Named slot: actions -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            icon="ant-design:edit-outlined"
            size="small"
            @click="update(record)"
            colorClass="flex items-center justify-center text-orange-400"
          />
          <UiButton
            icon="ant-design:delete-outlined"
            size="small"
            danger
            @click="showDeleteModal(record)"
            colorClass="flex items-center justify-center text-red-700"
          />
        </div>
      </template>
    </Table>

    <!-- Delete Confirmation Modal -->
    <UiModal
      title="ຢືນຢັນການລຶບ"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      okText="ຢືນຢັນ"
      okType="primary"
    >
      <p>ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບພະແພກ: "{{ selectedDpm?.name }}"?</p>
      <p class="text-red-500">
        ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້ ຫຼັງຈາກທ່ານຢືນຢັນສຳເລັດ.
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
.unit-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
