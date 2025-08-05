<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { BudgetItemInterface } from "@/modules/interfaces/budget/budget-item.interface";
import {
  createBudgetItemValidation,
  // createItemDetailRules,
} from "../../views/budget/budget_item/validation/bud-get-item.validation";
import { useBudgetAccountStore } from "@/modules/presentation/Admin/stores/budget/bud-get-account.store";
import { useProvinceStore } from "@/modules/presentation/Admin/stores/province.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiTextArea from "@/common/shared/components/Input/Textarea.vue";
// import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiInputNumber from '@/common/shared/components/Input/InputNumber.vue';

const { t } = useI18n();
const budgetAccountStore = useBudgetAccountStore();
const provinceStore = useProvinceStore();
const { error } = useNotification();

const props = defineProps<{
  budgetItem?: BudgetItemInterface | null;
  isEditMode: boolean;
  loading?: boolean;
  preselectedBudgetAccountId?: string;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    data: {
      budget_accountId: number;
      name: string;
      allocated_amount: number;
      description: string;
      // budget_item_details: Array<{
      //   name: string;
      //   provinceId: number;
      //   allocated_amount: number;
      //   description: string;
      // }>;
    }
  ): void;
  (e: "cancel"): void;
}>();

// แยก formState เป็นสองส่วน: ข้อมูลหลักและข้อมูลรายละเอียด
const formRef = ref();
const formState = reactive({
  budget_account_id: "",
  name: "",
  allocated_amount: 0,
  description: "",
});


// const itemDetails = ref([
//   {
//     name: "",
//     province_id: "",
//     allocated_amount: 0,
//     description: "",
//   },
// ]);

// Loading states
const loadingBudgetAccounts = ref(false);
const loadingProvinces = ref(false);

// Options for select inputs
const budgetAccountOptions = ref<{ label: string; value: string }[]>([]);
const provinceOptions = ref<{ label: string; value: string }[]>([]);

// Load initial data
onMounted(async () => {
  try {
    loadingBudgetAccounts.value = true;
    loadingProvinces.value = true;

    await Promise.all([loadBudgetAccounts(), loadProvinces()]);

    // ตั้งค่า budget_account_id จาก props หากมีการระบุมา
    if (props.preselectedBudgetAccountId && !props.isEditMode) {
      formState.budget_account_id = props.preselectedBudgetAccountId;
    }
  } catch (err) {
    console.error("Failed to load initial data:", err);
    error(t("budget_items.error.loadDataFailed"));
  } finally {
    loadingBudgetAccounts.value = false;
    loadingProvinces.value = false;
  }
});

// Load budget accounts
const loadBudgetAccounts = async () => {
  try {
    await budgetAccountStore.fetchBudgetAccounts({
      page: 1,
      limit: 100,
    });

    budgetAccountOptions.value = budgetAccountStore.budgetAccounts.map((account) => ({
      label: `${account.getCode()} - ${account.getName()} - ${account.getFormattedAllocatedAmount()}`,
      value: account.getId().toString(),
    }));
  } catch (err) {
    console.error("Failed to load budget accounts:", err);
    throw err;
  }
};

// Load provinces
const loadProvinces = async () => {
  try {
    const result = await provinceStore.fetchProvinces({
      page: 1,
      limit: 100,
    });

    provinceOptions.value = result.data.map((province) => ({
      label: province.name,
      value: province.id.toString(),
    }));
  } catch (err) {
    console.error("Failed to load provinces:", err);
    throw err;
  }
};

// Watch for budget item changes
watch(
  () => props.budgetItem,
  (newBudgetItem) => {
    if (newBudgetItem) {
      Object.assign(formState, {
        budget_account_id: newBudgetItem.budget_account_id || "",
        name: newBudgetItem.name || "",
        allocated_amount: newBudgetItem.allocated_amount || 0,
        description: newBudgetItem.description || "",
      });
    } else {
      Object.assign(formState, {
        budget_account_id: props.preselectedBudgetAccountId || "",
        name: "",
        allocated_amount: 0,
        description: "",
      });

      // itemDetails.value = [
      //   {
      //     name: "",
      //     province_id: "",
      //     allocated_amount: 0,
      //     description: "",
      //   },
      // ];
    }
  },
  { immediate: true }
);

// const addDetailItem = () => {
//   itemDetails.value.push({
//     name: formState.name,
//     province_id: "",
//     allocated_amount: 0,
//     description: "",
//   });

//   nextTick(() => {});
// };

// const removeDetailItem = (index: number) => {
//   if (itemDetails.value.length > 1) {
//     itemDetails.value.splice(index, 1);
//     if (!props.isEditMode) {
//       nextTick(() => {
//         formRef.value?.validateFields();
//       });
//     }
//   } else {
//     itemDetails.value[0] = {
//       name: formState.name,
//       province_id: "",
//       allocated_amount: 0,
//       description: "",
//     };

//     // Only validate these fields if not in edit mode
//     if (!props.isEditMode) {
//       formRef.value?.validateFields([`province_0`, `allocatedAmount_0`]);
//     }
//   }
// };


// watch(
//   () => formState.name,
//   (newName) => {
//     itemDetails.value.forEach((item) => {
//       item.name = newName;
//     });
//   }
// );

// Validation rules
const baseRules = createBudgetItemValidation(t);
const formValidationError = ref<string | undefined>(undefined);

// Create only the rules we actually need based on edit mode
const rules = computed(() => {
  // In edit mode, only include validation for the name field
  if (props.isEditMode) {
    return {
      name: baseRules.name,
    };
  }

  // In create mode, include all validations
  const allRules = { ...baseRules };

  // itemDetails.value.forEach((_, index) => {
  //   const detailRules = createItemDetailRules(t, index);
  //   Object.assign(allRules, detailRules);
  // });

  return allRules;
});

// const formatAllocatedAmount = (index: number) => {
//   const value = itemDetails.value[index].allocated_amount;
//   if (value) {
//     try {
//       // ลบอักขระที่ไม่ใช่ตัวเลขและจุดทศนิยม
//       const cleanValue = value.toString().replace(/[^\d.]/g, "");
//       const numValue = parseFloat(cleanValue);

//       if (!isNaN(numValue)) {
//         itemDetails.value[index].allocated_amount = parseFloat(numValue.toFixed(2));
//       }
//     } catch (err) {
//       console.error("Error formatting amount:", err);
//     }
//   }
// };

const submitForm = async () => {
  try {
    formValidationError.value = undefined;

    // Format amounts
    // itemDetails.value.forEach((_, index) => formatAllocatedAmount(index));

    // In edit mode, only validate the name field
    if (props.isEditMode) {
      await formRef.value.validate(["name"]);
    } else {
      await formRef.value.validate();
    }

    // const details = itemDetails.value.map((item) => ({
    //   name: item.name || formState.name,
    //   provinceId: parseInt(item.province_id) || 0, // Add fallback to prevent NaN
    //   allocated_amount: typeof item.allocated_amount === 'string'
    //     ? parseFloat(item.allocated_amount) || 0
    //     : item.allocated_amount || 0, // Add fallback to prevent NaN
    //   description: item.description || "",
    // }));

    emit("submit", {
      budget_accountId: parseInt(formState.budget_account_id) || 0, // Add fallback
      name: formState.name,
      allocated_amount: formState.allocated_amount || 0,
      description: formState.description || "",
      // budget_item_details: details,
    });
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

defineExpose({
  submitForm,
  resetForm: () => {
    formRef.value?.resetFields();
    formValidationError.value = undefined;
  },
});
</script>

<template>
  <UiForm ref="formRef" :model="formState" :rules="rules">
    <!-- ฟอร์มหลัก -->
    <UiFormItem
      :label="$t('budget_items.form.budgetAccount')"
      name="budget_account_id"
      required
      v-if="!props.isEditMode"
    >
      <UiInputSelect
        v-model="formState.budget_account_id"
        :options="budgetAccountOptions"
        :placeholder="$t('budget_items.form.budgetAccountPlaceholder')"
        :loading="loadingBudgetAccounts"
        :disabled="loading || !!props.preselectedBudgetAccountId"
      />
    </UiFormItem>

    <UiFormItem :label="$t('budget_items.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('budget_items.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('budget_items.form.allocatedAmount')" name="allocated_amount" required>
      <UiInputNumber
        v-model="formState.allocated_amount"
        :placeholder="$t('budget_accounts.form.allocatedAmountPlaceholder')"
        :disabled="loading"
        :formatter="(value: string | number) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
        :parser="(value: string) => value.replace(/\$\s?|(,*)/g, '')"
      />
    </UiFormItem>

    <UiFormItem :label="$t('budget_items.form.description')" name="description">
      <UiTextArea
        v-model="formState.description"
        :placeholder="$t('budget_items.form.descriptionPlaceholder')"
        :disabled="loading"
        :rows="3"
      />
    </UiFormItem>

    <!-- Details -->
    <!-- <div class="mt-4" v-if="!props.isEditMode">
      <h3 class="text-lg font-medium mb-2">{{ $t("budget_items.form.detailsTitle") }}</h3>

      <div v-if="formValidationError" class="mb-3 text-red-500">
        {{ formValidationError }}
      </div> -->

    <!-- <div
        v-for="(item, index) in itemDetails"
        :key="index"
        class="border rounded p-4 mb-4 bg-gray-50"
      >
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-md font-medium">
            {{ $t("budget_items.form.detailItem") }} {{ index + 1 }}
          </h4>
          <UiButton
            v-if="itemDetails.length > 1"
            type="default"
            danger
            size="small"
            @click="removeDetailItem(index)"
            icon="ant-design:delete-outlined"
          />
        </div>


        <div class="gap-3">
          <span class="text-red-600">*</span>{{ $t("budget_items.form.province") }}
        </div>
        <UiFormItem>
          <UiInputSelect
            v-model="item.province_id"
            :options="provinceOptions"
            :placeholder="$t('budget_items.form.provincePlaceholder')"
            :loading="loadingProvinces"
            :disabled="loading"
          />
        </UiFormItem>


        <div class="gap-3">
          <span class="text-red-600">*</span>{{ $t("budget_items.form.allocatedAmount") }}
        </div>
        <UiFormItem>
          <UiInputNumber
            v-model="item.allocated_amount"
            :placeholder="$t('budget_accounts.form.allocatedAmountPlaceholder')"
            :disabled="loading"
            :formatter="(value: string | number) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value: string) => value.replace(/\$\s?|(,*)/g, '')"
          />
        </UiFormItem>


        <UiFormItem :label="$t('budget_items.form.description')" :name="`description_${index}`">
          <UiTextArea
            v-model="item.description"
            :placeholder="$t('budget_items.form.descriptionPlaceholder')"
            :disabled="loading"
            :rows="3"
          />
        </UiFormItem>
    </div>

    <div class="mt-3 flex justify-center">
        <UiButton
          type="dashed"
          block
          @click="addDetailItem"
          icon="ant-design:plus-outlined"
          class="flex items-center justify-center"
        >
          <span>{{ $t("budget_items.form.addDetail") }}</span>
        </UiButton>
      </div> -->
    <!-- </div> -->

  </UiForm>
</template>
