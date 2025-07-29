<script setup lang="ts">
import {
  ref,
  reactive,
  defineProps,
  defineEmits,
  watch,
  computed,
  onMounted,
} from "vue";
import { useI18n } from "vue-i18n";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import {
  formatPrice,
  NumberOnly,
  parsePrice,
} from "@/modules/shared/utils/format-price";
import { currencyStore } from "../../stores/currency.store";
import type { ExchangeRateApiModel } from "@/modules/interfaces/exchange-rate.interface";
import { formState } from "../../stores/exchange-rate.store";
import { exchangeRateValidate } from "../../views/exchange-rates/validation/exchange-rate.validation";
import Radio from "@/common/shared/components/Input/Radio.vue";

const useCurrencyStore = currencyStore();

/********************************************************************************* */
const { t } = useI18n();

const props = defineProps<{
  exchangeRate?: ExchangeRateApiModel | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    data: {
      from_currency_id: number;
      to_currency_id: number;
      rate: number;
      is_active?: string;
    }[]
  ): void;
  (e: "cancel"): void;
}>();

const formRef = ref();

// Fixed: Changed to reactive and kept array structure

const currencyItem = computed(() =>
  useCurrencyStore.currencies.map((item) => ({
    value: item?.getId() ?? "",
    label: item ? `${item.getName()} (${item.getCode()})` : "",
  }))
);

onMounted(async () => {
  await useCurrencyStore.fetchCurrencies();
});

// Create validation state
const validationState = reactive({
  isEditMode: props.isEditMode,
});

// Watch for isEditMode changes
watch(
  () => props.isEditMode,
  (newIsEditMode) => {
    validationState.isEditMode = newIsEditMode;
  }
);

// Get validation rules with validation state

// Watch for document type changes
watch(
  () => props.exchangeRate,
  (exchange_rate) => {
    if (exchange_rate && props.isEditMode) {
      // For edit mode, populate the first item with existing data
      formState.addMore[0] = {
        from_currency_id: exchange_rate.from_currency_id || "",
        to_currency_id: exchange_rate.to_currency_id || "",
        rate: exchange_rate.rate || 0,
        is_active: exchange_rate.is_active ? "true" : "false",
      };
    } else if (!props.isEditMode) {
      // For create mode, reset to default
      formState.addMore = [
        {
          from_currency_id: "",
          to_currency_id: "",
          rate: 0,
          is_active: "false",
        },
      ];
    }
  },
  { immediate: true }
);

// Add more exchange rate entries
const addMoreEntry = () => {
  formState.addMore.push({
    from_currency_id: "",
    to_currency_id: "",
    rate: 0,
    is_active: "false",
  });
};

// Remove exchange rate entry
const removeEntry = (index: number) => {
  if (formState.addMore.length > 1) {
    formState.addMore.splice(index, 1);
  }
};

const submitForm = async () => {
  try {
    await formRef.value.submitForm();

    const formData = formState.addMore.map((item) => ({
      from_currency_id: Number(item.from_currency_id),
      to_currency_id: Number(item.to_currency_id),
      rate: Number(item.rate),
      is_active: item.is_active === "true" ? "true" : "false", // 👈 cast to string
    }));

    emit("submit", formData);
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

// Fixed: Formatted price for each index
const formattedPrice = (index: number) =>
  computed({
    get() {
      return formatPrice(formState.addMore[index].rate);
    },
    set(value: string) {
      const digitsOnly = value.replace(/\D/g, "");
      formState.addMore[index].rate = parsePrice(digitsOnly);
    },
  });
defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
const rateOptions = [
  { label: t("exchange-rate.is_active"), value: "true" },
  { label: t("exchange-rate.in_active"), value: "false" },
];
</script>

<template>
  <UiForm ref="formRef" :model="formState" :rules="exchangeRateValidate(t)">
    <div
      v-for="(item, index) in formState.addMore"
      :key="index"
      class="exchange-rate-entry"
    >
      <!-- Header with remove button for multiple entries -->
      <div
        v-if="formState.addMore.length > 1"
        class="flex justify-between items-center mb-4"
      >
        <h4 v-if="index > 0" class="text-lg font-medium">
          {{ $t("exchange-rate.title_from_create") }} ({{ index }})
        </h4>
      </div>

      <UiFormItem
        :label="$t('exchange-rate.field.from_currency')"
        :name="['addMore', index.toString(), 'from_currency_id']"
        required
      >
        <InputSelect
          v-model="item.from_currency_id"
          :options="currencyItem"
          :placeholder="$t('exchange-rate.phd.from_currency')"
          :disabled="loading"
        />
      </UiFormItem>

      <UiFormItem
        :label="$t('exchange-rate.field.to_currency')"
        :name="['addMore', index.toString(), 'to_currency_id']"
        required
      >
        <InputSelect
          v-model="item.to_currency_id"
          :options="currencyItem"
          :placeholder="$t('exchange-rate.phd.to_currency')"
          :disabled="loading"
        />
      </UiFormItem>

      <UiFormItem
        :label="$t('exchange-rate.phd.rate')"
        :name="['addMore', index.toString(), 'rate']"
        required
      >
        <UiInput
          v-model="formattedPrice(index).value"
          :placeholder="$t('exchange-rate.phd.rate')"
          :disabled="loading"
          @keypress="NumberOnly"
        />
      </UiFormItem>
      <UiFormItem
        v-if="isEditMode"
        :label="$t('exchange-rate.field.is_active')"
        required
      >
        <Radio
          v-model="item.is_active"
          :options="rateOptions"
          :disabled="loading"
        />
      </UiFormItem>

      <!-- Divider between entries -->
      <hr
        v-if="index < formState.addMore.length - 1"
        class="my-6 border-gray-200"
      />
      <div v-if="!isEditMode" class="add -mt-5 mb-4 flex gap-2">
        <UiButton
          size="small"
          icon="ant-design:plus-outlined"
          @click="addMoreEntry"
          colorClass="flex items-center"
        />
        <UiButton
          type="primary"
          size="small"
          icon="ant-design:minus-outlined"
          :disabled="index === 0"
          @click="removeEntry(index)"
          colorClass="flex items-center"
        />
      </div>
    </div>
  </UiForm>
</template>

<style scoped>
.exchange-rate-entry {
  margin-bottom: 1rem;
}
</style>
