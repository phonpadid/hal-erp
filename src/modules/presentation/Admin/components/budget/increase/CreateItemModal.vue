<script setup lang="ts" name="CreateItemModal.vue">
import { ref, computed, watch, onMounted } from "vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { useI18n } from "vue-i18n";
import { useIncreaseBudgetItemStore } from "../../../stores/budget/increase/increase-budget-item.store";
import { useBudgetItemStore } from "../../../stores/budget/budget-item.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import type { IncreaseBudgetAccountDetailCreateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-detail.dto";
import { increaseBudgetItemsRules } from "../../../views/budget/increase-budget/validation/create-item.validate";
import {
  formatPrice,
  NumberOnly,
  parsePrice,
} from "@/modules/shared/utils/format-price";
import UiInput from "@/common/shared/components/Input/UiInput.vue";

const { t } = useI18n();
const increaseItemStore = useIncreaseBudgetItemStore();
const budgetItemStore = useBudgetItemStore();
const { success, warning } = useNotification();

const formState = ref({
  budget_item_id: null as number | null,
  allocated_amount: undefined as number | undefined,
});

const props = defineProps<{
  visible: boolean;
  loading?: boolean;
  isEdit?: boolean;
  itemid?: string;
  editData?: {
    id?: number;
    budget_item_id: number;
    allocated_amount: number;
  } | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}>();

const budgetItemOptions = computed(() =>
  budgetItemStore.budgetItems.map((item) => ({
    value: Number(item.getId()),
    label: item.getName(),
  }))
);

const formRef = ref();
const submitLoading = ref(false);

watch(
  [() => props.visible, () => props.editData],
  ([newVisible, newEditData]) => {
    if (newVisible) {
      if (props.isEdit && newEditData) {
        formState.value = {
          budget_item_id: newEditData.budget_item_id,
          allocated_amount: newEditData.allocated_amount,
        };
      } else {
        resetForm();
      }
    }
  },
  { immediate: true }
);

const resetForm = () => {
  formState.value = {
    budget_item_id: null,
    allocated_amount: 0 as number | undefined,
  };
  formRef.value?.resetFields();
};

const formattedPrice = computed({
  get() {
    return formatPrice(formState.value.allocated_amount);
  },
  set(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    formState.value.allocated_amount = parsePrice(digitsOnly);
  },
});

const handleCancel = () => {
  emit("update:visible", false);
  resetForm();
};

const submitForm = async () => {
  try {
    submitLoading.value = true;
    const valid = await formRef.value?.validate();
    if (!valid) return;

    const formData = {
      budget_item_id: Number(formState.value.budget_item_id),
      allocated_amount: Number(formState.value.allocated_amount),
    };

    if (props.isEdit && props.editData) {
      await increaseItemStore.updated(String(props.editData.id), {
        ...formData,
        id: props.editData.id,
      });
      success(t("increase-budget.notify.updated"));
    } else {
      await increaseItemStore.created(
        Number(props.itemid),
        formData as IncreaseBudgetAccountDetailCreateDTO
      );
      success(t("increase-budget.notify.created"));
    }

    resetForm();
    emit("update:visible", false);
    emit("success");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("increase-budget.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

onMounted(async () => {
  await budgetItemStore.fetchBudgetItems({ limit: 1000, page: 1 });
});
</script>

<template>
  <UiModal
    :visible="visible"
    :title="
      isEdit
        ? t('increase-budget.title_edit')
        : t('increase-budget.title_create')
    "
    width="600px"
    @update:visible="emit('update:visible', $event)"
  >
    <UiForm
      ref="formRef"
      :model="formState"
      :rules="increaseBudgetItemsRules(t)"
    >
      <div class="md:flex w-full gap-4 items-start">
        <UiFormItem
          class="md:w-1/2"
          :label="t('increase-budget.phd.item')"
          name="budget_item_id"
          required
        >
          <InputSelect
            v-model="formState.budget_item_id"
            :options="budgetItemOptions"
            size="large"
            :placeholder="t('increase-budget.phd.item')"
          />
        </UiFormItem>

        <UiFormItem
          class="md:w-1/2"
          :label="t('increase-budget.table.allocated_amount')"
          name="allocated_amount"
          @keypress="NumberOnly"
          required
        >
          <UiInput
            v-model="formattedPrice"
            size="large"
            :placeholder="t('increase-budget.phd.allocated_amount')"
          />
          <!-- <a-input
            v-model="formattedPrice"
            size="large"
            :placeholder="t('increase-budget.phd.allocated_amount')"
            @keypress="NumberOnly"
          >
            <template #suffix>₭</template>
          </a-input> -->
        </UiFormItem>
      </div>
    </UiForm>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton @click="handleCancel">
          {{ t("button.cancel") }}
        </UiButton>
        <UiButton type="primary" :loading="submitLoading" @click="submitForm">
          {{ isEdit ? t("button.edit") : t("button.save") }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
