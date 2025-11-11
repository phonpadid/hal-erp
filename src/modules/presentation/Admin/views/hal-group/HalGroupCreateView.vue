<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";

const { t } = useI18n();
const router = useRouter();
const { success, warning } = useNotification();

// State
const submitLoading = ref<boolean>(false);
const formRef = ref();

// Form state
const formState = ref({
  name: "",
  description: "",
});

// Form rules
const formRules = computed(() => ({
  name: [
    { required: true, message: t("halGroup.validation.nameRequired"), trigger: "blur" },
    { min: 2, message: t("halGroup.validation.nameMin"), trigger: "blur" },
    { max: 100, message: t("halGroup.validation.nameMax"), trigger: "blur" },
  ],
  description: [
    { max: 500, message: t("halGroup.validation.descriptionMax"), trigger: "blur" },
  ],
}));

const handleCancel = () => {
  router.push("/hal-groups");
};

const handleFormSubmit = async (formData: any) => {
  try {
    submitLoading.value = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    success(t("halGroup.success.title"), t("halGroup.success.created"));
    router.push("/hal-groups");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("halGroup.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const submitForm = () => {
  formRef.value?.submitForm();
};
</script>

<template>
  <div class="hal-group-create-container">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <UiButton
            type="default"
            @click="handleCancel"
            icon="ant-design:arrow-left-outlined"
          >
            {{ t("button.back") }}
          </UiButton>
          <div>
            <h1 class="text-2xl font-semibold">{{ t("halGroup.modal.create") }}</h1>
            <p class="text-gray-600">{{ t("halGroup.createDescription") }}</p>
          </div>
        </div>
      </div>

      <!-- Create Form -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <UiForm ref="formRef" :model="formState" :rules="formRules">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Name -->
            <UiFormItem :label="t('halGroup.form.name')" name="name" required>
              <UiInput
                v-model="formState.name"
                :placeholder="t('halGroup.form.namePlaceholder')"
                :disabled="submitLoading"
              />
            </UiFormItem>

            <!-- Description -->
            <UiFormItem :label="t('halGroup.form.description')" name="description">
              <UiInput
                v-model="formState.description"
                :placeholder="t('halGroup.form.descriptionPlaceholder')"
                :disabled="submitLoading"
              />
            </UiFormItem>
          </div>
        </UiForm>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 mt-6">
        <UiButton
          type="default"
          @click="handleCancel"
          :disabled="submitLoading"
        >
          {{ t("button.cancel") }}
        </UiButton>
        <UiButton
          type="primary"
          @click="submitForm"
          :loading="submitLoading"
          icon="ant-design:plus-outlined"
          color-class="flex items-center gap-2"
        >
          {{ t("halGroup.button.create") }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hal-group-create-container {
  min-height: calc(100vh - 120px);
  background-color: #f8f9fa;
}
</style>