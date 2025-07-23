<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { columns } from "./column";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import { dataDpmUser } from "@/modules/shared/utils/data.department";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useRouter } from "vue-router";
import { departmenUsertStore } from "../../../stores/departments/department-user.store";
import type { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import type { DepartmentUserApiModel } from "@/modules/interfaces/departments/department-user.interface";
const { t } = useI18n();
const dpmUserStore = departmenUsertStore();
const department = ref<DepartmentUserApiModel[]>([]);
const useRealApi = ref<boolean>(true); // Toggle between mock and real API
const search = ref<string>("");
// Form related
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedDpm = ref<DepartmentUserApiModel | null>(null);
// Load data on component mount
onMounted(async () => {
  await departmentUser();
});

const departmentUser = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await dpmUserStore.fetchDepartmentUser({
        page: dpmUserStore.pagination.page,
        limit: dpmUserStore.pagination.limit,
      });

      department.value = result.data.map((dpmUser: DepartmentUserEntity) => {
        const user = dpmUser.getUser();
        const position = dpmUser.getPostion();
        const dept = dpmUser.getDepartment();

        return {
          id: dpmUser?.getId() || undefined,
          position_id: dpmUser.getPosition_id() || undefined,
          signature_file: dpmUser.getSignature_file() || undefined,
          department_id: dpmUser.getDepartmentId() || undefined,
          user: user
            ? {
                id: user.getId() || undefined,
                username: user.getUsername() || undefined,
                email: user.getEmail() || undefined,
                tel: user.getTel() || undefined,
                created_at: user.getCreatedAt() ?? "",
                updated_at: user.getUpdatedAt() ?? "",
              }
            : undefined,
          department: dept
            ? {
                id: dept.getId() || undefined,
                name: dept.getName() || undefined,
                code: dept.getCode() || undefined,
                created_at: dept.getCreatedAt() ?? "",
                updated_at: dept.getUpdatedAt() ?? "",
              }
            : undefined,
          position: position
            ? {
                id: position.getId() || undefined,
                name: position.getName() || undefined,
                created_at: position.getCreatedAt() ?? "",
                updated_at: position.getUpdatedAt() ?? "",
              }
            : undefined,
          created_at: user?.getCreatedAt() ?? "",
          updated_at: user?.getUpdatedAt() ?? "",
        };
      }) as unknown as DepartmentUserApiModel[];

      console.log("Department data loaded:", department.value);
    } catch (error) {
      console.error("Failed to fetch department from API:", error);
      // department.value = [...dataDpm.value];
    } finally {
      loading.value = false;
    }
  } else {
    department.value = [...dataDpmUser.value];
  }
};
//search
const handleSearch = async () => {
  try {
    loading.value = true;
    const result = await dpmUserStore.fetchDepartmentUser({
      page: dpmUserStore.pagination.page,
      limit: dpmUserStore.pagination.limit,
      search: search.value,
    });

    department.value = result.data.map((dpmUser: DepartmentUserEntity) => {
      const user = dpmUser.getUser();
      const position = dpmUser.getPostion();
      const dept = dpmUser.getDepartment();

      return {
        id: dpmUser?.getId() || undefined,
        position_id: dpmUser.getPosition_id() || undefined,
        signature_file: dpmUser.getSignature_file() || undefined,
        department_id: dpmUser.getDepartmentId() || undefined,
        user: user
          ? {
              id: user.getId() || undefined,
              username: user.getUsername() || undefined,
              email: user.getEmail() || undefined,
              tel: user.getTel() || undefined,
              created_at: user.getCreatedAt() ?? "",
              updated_at: user.getUpdatedAt() ?? "",
            }
          : undefined,
        department: dept
          ? {
              id: dept.getId() || undefined,
              name: dept.getName() || undefined,
              code: dept.getCode() || undefined,
              created_at: dept.getCreatedAt() ?? "",
              updated_at: dept.getUpdatedAt() ?? "",
            }
          : undefined,
        position: position
          ? {
              id: position.getId() || undefined,
              name: position.getName() || undefined,
              created_at: position.getCreatedAt() ?? "",
              updated_at: position.getUpdatedAt() ?? "",
            }
          : undefined,
        created_at: user?.getCreatedAt() ?? "",
        updated_at: user?.getUpdatedAt() ?? "",
      };
    }) as unknown as DepartmentUserApiModel[];
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    loading.value = false;
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleTableChange = async (pagination: any) => {
  dpmUserStore.setPagination({
    page: pagination.current | 1,
    limit: pagination.pageSize,
    total: pagination.total,
  });
  await departmentUser();
};
const router = useRouter();
// CRUD operations
const creation = (): void => {
  router.push({ name: "add_department_user.index" });
};

const update = (record: DepartmentUserApiModel): void => {
  router.push({
    name: "edit_department_user.index",
    params: { id: record.id },
  });
};

const showDeleteModal = (record: DepartmentUserApiModel): void => {
  selectedDpm.value = record;
  deleteModalVisible.value = true;
};

const handleDelete = async (): Promise<void> => {
  if (!selectedDpm.value) return;

  loading.value = true;

  if (useRealApi.value) {
    try {
      // Use API to delete
      const id = selectedDpm.value.id ?? "";
      await dpmUserStore.deleteDepartmentUser(id);

      await departmentUser(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
watch(search, async(load) => {
  if(load === '') {
    await departmentUser()
  }
})
</script>

<template>
  <div class="list-container p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold">
        {{ $t("departments.dpm_user.title") }}
      </h1>
      <div class="flex items-center justify-between">
        <div class="w-[20rem]">
          <InputSearch
            v-model="search"
            @keyup.enter="handleSearch"
            :placeholder="t('departments.dpm_user.placeholder.search')"
          />
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
      <div class="mt-4 text-slate-700 space-y-2">
        <span
          :loading="dpmUserStore.loading"
          class="block text-lg font-semibold"
          v-if="department.length > 0 && department[0].department"
        >
          {{ department[0].department?.name }}
        </span></div>
      <!-- <div class="total-item mt-4 text-slate-700">
        <a-tag color="red"
          >{{
            t("departments.dpm_user.total", {
              count: dpmUserStore.pagination.total,
            })
          }}
        </a-tag>
      </div> -->
    </div>

    <!-- Table -->
    <Table
      :columns="columns(t)"
      :dataSource="department"
      :pagination="{
        current: dpmUserStore.pagination.page,
        pageSize: dpmUserStore.pagination.limit,
        total: dpmUserStore.pagination.total,
      }"
      @change="handleTableChange"
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
      :title="t('departments.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      okType="primary"
      :okText="t('button.ok')"
      :cancel-text="t('button.cancel')"
    >
      <p>
        {{ t("departments.alert.message") }}: "{{
          selectedDpm?.user?.username
        }}"?
      </p>
      <p class="text-red-500">
        {{ t("departments.alert.remark") }}
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap");
.list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.total-item .ant-tag {
  font-family: "Noto Sans Lao", sans-serif;
  font-size: 14px;
}
</style>
