<script setup lang="ts">
import { ref, onMounted } from "vue";
import { columns } from "./column";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { currencyRules } from "./validation/currency.validate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { currencyStore, formState } from "../../stores/currency.store";
import type { CurrencyEntity } from "@/modules/domain/entities/currency.entity";
import type { CurrencyApiModel } from "@/modules/interfaces/currency.interface";
import { CurrencyValidate } from "./validation/create.validate";
const { t } = useI18n();
// Initialize the unit store
const store = currencyStore();
// currency data that will be displayed (from API or mock)
const currencies = ref<CurrencyApiModel[]>([]);
const notify = useNotification();
// Form related
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedCurrency = ref<CurrencyApiModel | null>(null);
const search = ref<string>("");

// Form model
const formModel = store.currencyFormModel;

// Load data on component mount
onMounted(async () => {
  await currenciesList();
});

const currenciesList = async (): Promise<void> => {
  try {
    loading.value = true;
    const result = await store.fetchCurrencies({
      page: store.pagination.page,
      limit: store.pagination.limit,
    });
    currencies.value = result.data.map((currency: CurrencyEntity) => {
      return {
        id: currency.getId() ?? "",
        name: currency.getName(),
        code: currency.getCode(),
        createdAt: currency.getCreatedAt(),
        updatedAt: currency.getUpdatedAt(),
      };
    });
  } catch (error: any) {
    // currencies.value = [...dat.value];
  } finally {
    loading.value = false;
  }
};

//search
const handleSearch = async () => {
  try {
    loading.value = true;
    const result = await store.fetchCurrencies({
      page: 1,
      limit: store.pagination.limit,
      search: search.value,
    });

    currencies.value = result.data.map((currency: CurrencyEntity) => ({
      id: currency.getId() ?? "",
      name: currency.getName(),
      code: currency.getCode(),
      createdAt: currency.getCreatedAt(),
      updatedAt: currency.getUpdatedAt(),
    }));

    // Optional: Update pagination
    store.setPagination({
      page: 1,
      limit: store.pagination.limit,
      total: store.pagination.total,
    });
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    loading.value = false;
  }
};

// CRUD operations
const showCreateModal = (): void => {
  formModel.name = "";
  formModel.code = "";
  createModalVisible.value = true;
};

const showEditModal = (record: CurrencyApiModel): void => {
  selectedCurrency.value = record;
  formModel.name = record.name;
  formModel.code = record.code || "";
  editModalVisible.value = true;
};

const showDeleteModal = (record: CurrencyApiModel): void => {
  selectedCurrency.value = record;
  deleteModalVisible.value = true;
};
//add more

//add
const moreFunction = () => {
  formState.value.addMore.push({
    name: "",
    code: "",
  });
};
//romove
const removeMore = (index: number) => {
  formState.value.addMore.splice(index, 1);
};

//end
const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    const input = formState.value.addMore
      .filter((item) => item.name && item.code)
      .map((item) => ({
        name: item.name,
        code: item.code,
      }));
    await store.createCurrency(input);

    notify.success(t("currency.notify.created")); // ✅ This line should now run
    await currenciesList(); // ✅ Refresh list
    createModalVisible.value = false; // ✅ Close modal
    formModel.name = "";
    formModel.code = "";
  } catch (error) {
    console.log(error);

  } finally {
    loading.value = false;
  }
};

const handleEdit = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (selectedCurrency.value) {
      const id = selectedCurrency.value.id.toString();
      await store.updateCurrency(id, {
        id,
        name: formModel.name,
        code: formModel.code,
      });
      notify.success(t("currency.notify.update"));
      await currenciesList();
    }

    editModalVisible.value = false;
  } catch (error) {
    console.error("Edit form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectedCurrency.value) return;

  loading.value = true;
  try {
    // Use API to delete
    const id = selectedCurrency.value.id.toString();
    await store.deleteCurrency(id);
    notify.success(t("currency.notify.delete"));
    await currenciesList(); // Refresh the list
  } catch (error) {
    console.error("Delete failed:", error);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleTableChange = async (pagination: any) => {
  store.setPagination({
    page: pagination.current,
    limit: pagination.pageSize,
    total: pagination.total,
  });
  await currenciesList();
};
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="mb-4 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ $t("currency.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch
            v-model:value="search"
            @change="handleSearch"
            :placeholder="t('currency.placeholder.search')"
          />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ $t("currency.add") }}
        </UiButton>
      </div>
      <div class="total-item mt-2 text-slate-700">
        <a-tag color="red"
          >{{ t('currency.total') }}: {{ store.pagination.total }} {{ t('currency.currency') }}</a-tag
        >
      </div>
    </div>

    <!--  Table -->
    <Table
      :columns="columns(t)"
      :dataSource="currencies"
      :pagination="{
        current: store.pagination.page,
        pageSize: store.pagination.limit,
        total: store.pagination.total,
      }"
      row-key="id"
      :loading="store.loading"
      @change="handleTableChange"
    >
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
          >
          </UiButton>
          <UiButton
            type=""
            danger
            icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="showDeleteModal(record)"
          >
          </UiButton>
        </div>
      </template>
    </Table>

    <!-- Create Modal -->
    <UiModal
      :title="t('currency.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :okText="t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formState" :rules="CurrencyValidate(t)">
        <div
          class="group"
          v-for="(input, index) in formState.addMore"
          :key="index"
        >
          <p v-if="index !== 0" class="text-slate-600 text-sm">
            {{ t("currency.header_form.add") }} {{ index }}
          </p>

          <UiFormItem
            :label="t('currency.field.code')"
            :name="['addMore', index.toString(), 'code']"
            required
          >
            <UiInput
              v-model="input.code"
              :placeholder="t('currency.placeholder.code')"
            />
          </UiFormItem>

          <UiFormItem
            :label="t('currency.field.name')"
            :name="['addMore', index.toString(), 'name']"
            required
          >
            <UiInput
              v-model="input.name"
              :placeholder="t('currency.placeholder.name')"
            />
          </UiFormItem>

          <div class="add -mt-5 mb-4 flex gap-2">
            <UiButton
              size="small"
              icon="ant-design:plus-outlined"
              @click="moreFunction"
              colorClass="flex items-center"
            />
            <UiButton
              type="primary"
              size="small"
              icon="ant-design:minus-outlined"
              v-if="index !== 0"
              @click="removeMore(index)"
              colorClass="flex items-center"
            />
          </div>
        </div>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('currency.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :okText="t('button.edit')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="currencyRules(t)">
        <UiFormItem
          :label="t('currency.field.code')"
          name="code"
          required
        >
          <UiInput
            v-model="formModel.code"
            :placeholder="t('currency.placeholder.code')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('currency.field.name')"
          name="name"
          required
        >
          <UiInput
            v-model="formModel.name"
            :placeholder="t('currency.placeholder.name')"
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('currency.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      :okText="t('button.ok')"
      :cancelText="t('button.cancel')"
      okType="primary"
    >
      <p>
        {{ $t("currency.alert.message") }}: "{{ selectedCurrency?.name }}"?
      </p>
      <p class="text-red-500">
        {{ t("currency.alert.remark") }}
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap");
.unit-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.total-item .ant-tag {
  font-family: "Noto Sans Lao", sans-serif;
  font-size: 14px;
}
</style>
