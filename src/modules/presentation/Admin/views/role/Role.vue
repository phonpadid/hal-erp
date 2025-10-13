<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { RoleResponse, Roleinterface } from "@/modules/interfaces/role.interface";
import { column } from "./column";
import { useRoleStore } from "../../stores/role.store";
import { formatDate } from "@/modules/shared/formatdate";
import { useRouter } from "vue-router";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const { t } = useI18n();

// ສ້າງ role store
const rolesStore = useRoleStore();
const roles = ref<RoleResponse[]>([]);
const loading = ref<boolean>(false);
const router = useRouter();

const addRole = (): void => {
  router.push({ name: "roleCreate" });
};
const editRole = (role: Roleinterface): void => {
  router.push({ name: "roleEdit",  params: { id: role.id.toString() } });
};

const loadRoles = async (): Promise<void> => {
  try {
    loading.value = true;
    const result = await rolesStore.fetchRoles();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    roles.value = result.data.map((role: any) => {
      if (typeof role.getId === "function") {
        return {
          id: role.getId(),
          name: role.getName(),
          created_at: formatDate(role.getCreatedAt()),
          updated_at: formatDate(role.getUpdatedAt()),
        };
      } else {
        return {
          id: role.id,
          name: role.name,
          created_at: formatDate(role.created_at),
          updated_at: formatDate(role.updated_at),
        };
      }
    });
  } catch (error) {
    console.error(t("role.error.loadFailed"), error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadRoles();
});
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("role.list.title") }}</h1>
      </div>
      <UiButton
          type="primary"
          icon="material-symbols:add"
          @click="addRole"
          colorClass="flex items-center"
        >
          {{ t("role.list.btn") }}
        </UiButton>
    </div>
    <!-- ຕາຕະລາງຂໍ້ມູນບົດບາດ -->
    <Table
      :columns="column(t)"
      :dataSource="roles"
      :pagination="{ pageSize: 10 }"
      row-key="id"
      :loading="rolesStore.loading"
    >
     <template #actions="{ record }">
        <div class="flex items-center justify-center">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            shape="circle" 
            @click="editRole(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />
          
        </div>
      </template>
      <template #empty>
        <div class="text-center py-4">
          <p>{{ t("messages.noData") }}</p>
        </div>
      </template>
      <template #header>
        <h2 class="text-lg font-semibold">{{ t("role.list.tableTitle") }}</h2>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.unit-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
