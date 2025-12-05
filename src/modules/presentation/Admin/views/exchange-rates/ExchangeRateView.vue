<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useExchangeRateStore } from "../../stores/exchange-rate.store";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { currencyStore } from "../../stores/currency.store";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { Icon } from "@iconify/vue";
import FormExchangeRate from "../../components/exchange-rates/FormExchangeRate.vue";
import type { ExchangeRateApiModel } from "@/modules/interfaces/exchange-rate.interface";
import { usePermissions } from "@/modules/shared/utils/usePermissions";

const { t } = useI18n();
const { hasCompanyPermission, hasRole } = usePermissions();
const exchangeRateStore = useExchangeRateStore();
const { success, error, warning } = useNotification();

// Permission checks - Company-admin ไม่สามารถจัดการ Exchange Rate ได้
const canCreateExchangeRate = !hasRole('company-admin') && hasCompanyPermission('write-exchange-rate');
const canEditExchangeRate = !hasRole('company-admin') && hasCompanyPermission('update-exchange-rate');
const canDeleteExchangeRate = !hasRole('company-admin') && hasCompanyPermission('delete-exchange-rate');

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");
const currencyStory = currencyStore();

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedExchangeRate = ref<ExchangeRateApiModel | null>(null);
const isEditMode = ref<boolean>(false);
const exchangeRateFormRef = ref();

// Search filters - Using search object structure
const search = ref({
  from_currency_id: undefined as number | undefined,
  to_currency_id: undefined as number | undefined,
});

const currencyItem = computed(() =>
  currencyStory.currencies.map((item) => ({
    value: item?.getId() ?? "",
    label: item ? `${item.getName()} (${item.getCode()})` : "",
  }))
);

// Table pagination
const tablePagination = computed(() => ({
  current: exchangeRateStore.pagination.page,
  pageSize: exchangeRateStore.pagination.limit,
  total: exchangeRateStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadExchangeRates();
  await currencyStory.fetchCurrencies();
});

const loadExchangeRates = async () => {
  loading.value = true;

  try {
    await exchangeRateStore.fetchAll({
      page: exchangeRateStore.pagination.page,
      limit: exchangeRateStore.pagination.limit,
      search: searchKeyword.value,
      filter: {
        from_currency_id: search.value.from_currency_id?.toString(),
        to_currency_id: search.value.to_currency_id?.toString(),
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("documentType.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (pagination: TablePaginationType) => {
  exchangeRateStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  });
  loadExchangeRates();
};

// Watch for changes in search keyword
watch(searchKeyword, async (newVal: string) => {
  if (newVal === "") {
    exchangeRateStore.setPagination({
      page: 1,
      limit: exchangeRateStore.pagination.limit,
      total: exchangeRateStore.pagination.total,
    });
    await loadExchangeRates();
  }
});

// Watch for changes in to_currency_id - Load API when selected
watch(
  () => search.value.to_currency_id,
  async (newVal) => {
    if (newVal) {
      exchangeRateStore.setPagination({
        page: 1,
        limit: exchangeRateStore.pagination.limit,
        total: exchangeRateStore.pagination.total,
      });
      await loadExchangeRates();
    }
  }
);

watch(
  search,
  async (val) => {
    if (!val.from_currency_id && !val.to_currency_id) {
      // Load API when both currencies are cleared
      await loadExchangeRates();
    }
  },
  { deep: true }
);

// Modal handlers
const showCreateModal = () => {
  selectedExchangeRate.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (exchange_rate: ExchangeRateApiModel) => {
  selectedExchangeRate.value = { ...exchange_rate };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (exchange_rate: ExchangeRateApiModel) => {
  selectedExchangeRate.value = exchange_rate;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  exchangeRateFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

// Fixed: Updated to handle array of exchange rate data
const handleFormSubmit = async (
  formDataArray: {
    from_currency_id: number;
    to_currency_id: number;
    rate: number;
    is_active?: string;
  }[]
) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedExchangeRate.value) {
      // For edit mode, update the single exchange rate (use first item from array)
      const formData = formDataArray[0];
      const input = {
        id: selectedExchangeRate.value.id.toString(),
        from_currency_id: formData.from_currency_id,
        to_currency_id: formData.to_currency_id,
        rate: formData.rate,
        is_active: formData.is_active === "true" ? "true" : "false",
      };
      await exchangeRateStore.updated(
        selectedExchangeRate.value.id.toString(),
        input
      );
      success(
        t("exchange-rate.message.title"),
        t("exchange-rate.message.update")
      );
    } else {
      // For create mode, handle multiple exchange rates
      const input = formDataArray
        .filter(
          (item) => item.from_currency_id && item.to_currency_id && item.rate
        )
        .map((item) => ({
          from_currency_id: item.from_currency_id,
          to_currency_id: item.to_currency_id,
          rate: item.rate,
        }));
      // const promises = formDataArray.map(formData =>
      await exchangeRateStore.created(input);
      // );
      success(t("exchange-rate.message.title"), t("exchange-rate.message.create"));
    }

    modalVisible.value = false;
    await loadExchangeRates();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("exchange-rate.message.faild"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedExchangeRate.value) return;

  try {
    submitLoading.value = true;
    await exchangeRateStore.deleted(selectedExchangeRate.value.id.toString());
    success(
      t("exchange-rate.message.title"),
      t("exchange-rate.message.delete")
    );

    deleteModalVisible.value = false;
    await loadExchangeRates();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("exchange-rate.message.faild"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const changeValue = () => {
  // Store current values
  const currentFromCurrency = search.value.from_currency_id;
  const currentToCurrency = search.value.to_currency_id;

  // Swap the values
  search.value.from_currency_id = currentToCurrency;
  search.value.to_currency_id = currentFromCurrency;

  // Optional: Reload exchange rates after swapping if both values exist
  if (currentFromCurrency && currentToCurrency) {
    loadExchangeRates();
  }
};
</script>

<template>
  <div class="document-type-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("exchange-rate.title") }}</h1>
      </div>

      <div
        class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit"
      >
        <InputSelect
          v-model="search.from_currency_id"
          :options="currencyItem"
          :placeholder="t('exchange-rate.phd.from_currency')"
          clearable
        />
        <div
          @click="changeValue"
          class="icon -space-y-[2.5rem] text-slate-500 hover:text-slate-700 cursor-pointer transition-colors duration-200"
        >
          <Icon
            icon="material-symbols:arrow-right-alt"
            :class="['text-5xl mx-auto ml-1']"
          />
          <Icon
            icon="material-symbols:arrow-left-alt"
            :class="['text-5xl mx-auto']"
          />
        </div>
        <InputSelect
          v-model="search.to_currency_id"
          :options="currencyItem"
          :placeholder="t('exchange-rate.phd.to_currency')"
          clearable
        />

        <UiButton
          v-if="canCreateExchangeRate"
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("button.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Exchange Rates Table -->
    <Table
      :columns="columns(t)"
      :dataSource="exchangeRateStore.exchangeRate"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- column -->
      <template #rate="{ record }">
        <div class="flex items-center justify-center gap-2">
          {{ formatPrice(record.rate) }}
        </div>
      </template>
      <template #from_currency="{ record }">
        <div class="flex items-start justify-start gap-2">
          {{ record?.from_currency?.name }} ({{ record?.from_currency?.code }})
        </div>
      </template>
      <template #to_currency="{ record }">
        <div class="flex items-start justify-start gap-2">
          {{ record?.to_currency?.name }} ({{ record?.to_currency?.code }})
        </div>
      </template>
      <template #is_active="{ record }">
  <div class="flex items-center justify-start gap-2">
    <div
      :class="[
        'w-2 h-2 rounded-full',
        record.is_active ? 'bg-green-500' : 'bg-red-500'
      ]"
    ></div>
    <span class="text-sm">
      {{ record.is_active ? t('exchange-rate.is_active') : t('exchange-rate.in_active') }}
    </span>
  </div>
</template>
      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            v-if="canEditExchangeRate"
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            shape="circle"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />

          <UiButton
            v-if="canDeleteExchangeRate"
            type=""
            danger
            icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            shape="circle"
            @click="showDeleteModal(record)"
          />
        </div>
      </template>
    </Table>

    <!-- Create/Edit Exchange Rate Modal -->
    <UiModal
      :title="
        isEditMode
          ? t('exchange-rate.title_from_edit')
          : t('exchange-rate.title_from_create')
      "
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
      width="600px"
    >
      <FormExchangeRate
        ref="exchangeRateFormRef"
        :exchange-rate="selectedExchangeRate"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('exchange-rate.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      :ok-text="t('button.ok')"
      :cancel-text="t('button.cancel')"
      ok-type="primary"
      :danger="true"
    >
      <p>
        {{ $t("exchange-rate.alert.message") }}
      </p>
      <p class="text-red-500">{{ $t("exchange-rate.alert.remark") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.document-type-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
