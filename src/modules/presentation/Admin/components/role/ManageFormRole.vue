<script setup lang="ts">
import { reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const props = defineProps<{
  initialData?: {
    name?: string;
  };
  isEdit?: boolean;
}>();
const { t } = useI18n();
const emit = defineEmits<{
  (event: "submit", value: { name: string }): void;
}>();

interface FormState {
  name: string;
}

// Form state
const formState = reactive<FormState>({
  name: props.initialData?.name || "",
});

// Watch for initial data changes
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      formState.name = newVal.name || "";
    }
  },
  { immediate: true }
);

// Form submission
const handleSubmit = () => {
  emit("submit", {
    name: formState.name,
  });
};
</script>

<template>
  <div class="user-form">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="flex gap-4 mb-4 form-grid">
        <div class="w-full">
          <span><span class="text-red-600">*</span>{{ t("role.form.name") }}</span>
          <UiInput
            v-model="formState.name"
            label="Role Name"
            placeholder="Enter role name"
            required
          />
        </div>
      </div>

      <div class="form-actions">
        <UiButton type="primary" colorClass="flex items-center" htmlType="submit">
          {{ props.isEdit ? t("role.form.update") : t("role.form.create") }}
        </UiButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.user-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
