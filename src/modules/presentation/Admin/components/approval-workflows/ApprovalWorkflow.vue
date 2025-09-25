<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { NumberOnly } from "@/modules/shared/utils/format-price";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { computed, onMounted, ref, watchEffect } from "vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { departmentStore } from "../../stores/departments/department.store";
import InputNumber from "@/common/shared/components/Input/InputNumber.vue";
import Radio from "@/common/shared/components/Input/Radio.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import { useUserStore } from "../../stores/user.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import {
  approvalWorkflowStore,
  formState,
  moreFunction,
  resetForm,
} from "../../stores/approval-workflow.store";
import { apvStepRules } from "../../views/approval-workflows/validation/approval-workflow.validate";
import { useRouter } from "vue-router";
const { success, warning } = useNotification();
const { push } = useRouter();
const { t } = useI18n();
const dpmStore = departmentStore();
const docTypeStore = useDocumentTypeStore();
const userStore = useUserStore();
const apvWorkflowStore = approvalWorkflowStore();
const loading = ref<boolean>(false);
const formRef = ref();
const departmentItems = computed(() =>
  dpmStore.departments.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  }))
);
const docTypeItems = computed(() =>
  docTypeStore.documentTypes.map((item) => ({
    value: item.getId(),
    label: item.getname(),
  }))
);
const userOption = computed(() =>
  userStore.users.map((user) => ({
    value: user.getId() ?? "",
    label: user.getUsername(),
  }))
);
const typeEnum = [
  {
    label: t("approval-workflow-step.enum.department_head"),
    value: "department_head",
  },
  { label: t("approval-workflow-step.enum.department"), value: "department" },
  {
    label: t("approval-workflow-step.enum.specific_user"),
    value: "specific_user",
  },
  {
    label: t("approval-workflow-step.enum.line_manager"),
    value: "line_manager",
  },
  { label: t("approval-workflow-step.enum.condition"), value: "condition" },
];
const typeOption = computed(() =>
  typeEnum.map((item) => ({
    value: item.value ?? "",
    label: item.label ?? "",
  }))
);
const rateOptions = computed(() => [
  { label: t("approval-workflow-step.yes"), value: "true" },
  { label: t("approval-workflow-step.no"), value: "false" },
]);

onMounted(async () => {
  resetForm();
  await dpmStore.fetchDepartment({ limit: 1000, page: 1 });
  await userStore.fetchUsers({ limit: 1000, page: 1 });
  await docTypeStore.fetchdocumentType({ limit: 1000, page: 1 });
});

//romove
const removeMore = (index: number) => {
  formState.addMore.splice(index, 1);
};
const handleSubmit = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();
    const item = formState.addMore.map((item) => ({
      approval_workflow_id: item.approval_workflow_id,
      department_id: item.department_id,
      step_number: item.step_number,
      step_name: item.step_name,
      type: item.type,
      user_id: item.user_id,
      requires_file: item.requires_file,
      is_otp: item.is_otp,
    }));
    await apvWorkflowStore.create({
      name: formState.name,
      document_type_id: formState.document_type_id,
      steps: item,
    });
    formRef.value?.resetFields();
    resetForm();
    success(t("approval-workflow-step.notify.created"));
    push({ name: "approval_workflows.index" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("documentType.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};
watchEffect(() => {
  formState.addMore.forEach((item, index) => {
    item.step_number = index + 1;
  });
});
</script>
<template>
  <div class="mt-4 p-6">
    <h4 class="text-3xl font-extrabold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2">
      {{ t("approval-workflow-step.header_form.add") }}
    </h4>
    <UiForm ref="formRef" :model="formState" :rules="apvStepRules(t)" layout="vertical">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <UiFormItem :label="t('approval-workflow.field.form_name')" name="name" required>
          <UiInput
            v-model="formState.name"
            :placeholder="t('approval-workflow.placeholder.name')"
          />
        </UiFormItem>

        <UiFormItem :label="t('approval-workflow.field.doc_type')" name="document_type_id" required>
          <InputSelect
            v-model="formState.document_type_id"
            :options="docTypeItems"
            :placeholder="t('approval-workflow.placeholder.doc_type')"
          />
        </UiFormItem>
      </div>

      <div
        v-for="(value, index) in formState.addMore"
        :key="index"
        class="mb-8 p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl md:text-2xl font-bold text-gray-700">
            {{ $t("approval-workflow-step.title") }}
            <span class="text-base font-medium text-gray-500">
              ({{ t("approval-workflow-step.field.step") }} {{ index + 1 }})
            </span>
          </h2>
          <UiButton
            v-if="formState.addMore.length > 1"
            size="small"
            icon="ant-design:delete-outlined"
            @click="removeMore(index)"
            class="text-red-500 hover:text-red-700"
            type="text"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
          <UiFormItem
            :label="t('approval-workflow-step.field.step_number')"
            :name="['addMore', index.toString(), 'step_number']"
            @keypress="NumberOnly"
            required
          >
            <InputNumber
              v-model="value.step_number"
              :placeholder="t('approval-workflow-step.placeholder.step_number')"
              class="w-full"
            />
          </UiFormItem>

          <UiFormItem
            :label="t('approval-workflow-step.field.step_name')"
            :name="['addMore', index.toString(), 'step_name']"
            required
          >
            <UiInput
              v-model="value.step_name"
              :placeholder="t('approval-workflow-step.placeholder.step_name')"
              class="w-full"
            />
          </UiFormItem>

          <UiFormItem
            :label="t('approval-workflow-step.field.type')"
            :name="['addMore', index.toString(), 'type']"
            required
          >
            <InputSelect
              v-model="value.type"
              :options="typeOption"
              :placeholder="t('approval-workflow-step.placeholder.approval_workflow')"
            />
          </UiFormItem>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
          <UiFormItem
            v-if="value.type === 'department'"
            :label="t('approval-workflow-step.field.department')"
            :name="['addMore', index.toString(), 'department_id']"
            required
            class="col-span-1"
          >
            <InputSelect
              v-model="value.department_id"
              :options="departmentItems"
              :placeholder="t('approval-workflow-step.placeholder.department')"
            />
          </UiFormItem>

          <UiFormItem
            v-if="value.type === 'specific_user'"
            :label="t('approval-workflow-step.field.user')"
            :name="['addMore', index.toString(), 'user_id']"
            required
            class="col-span-1"
          >
            <InputSelect
              v-model="value.user_id"
              :options="userOption"
              :placeholder="t('approval-workflow-step.placeholder.user')"
            />
          </UiFormItem>
        </div>

        <div class="flex flex-wrap gap-x-8 gap-y-4 items-center">
          <UiFormItem
            :label="t('approval-workflow-step.field.requires_file')"
            :name="['addMore', index.toString(), 'requires_file']"
          >
            <Radio v-model="value.requires_file" :options="rateOptions" />
          </UiFormItem>
          <UiFormItem
            :label="t('approval-workflow-step.field.is_otp')"
            :name="['addMore', index.toString(), 'is_otp']"
          >
            <Radio v-model="value.is_otp" :options="rateOptions" />
          </UiFormItem>
        </div>
      </div>

      <div class="flex gap-4 mt-8 justify-end">
        <UiButton type="default" @click="push({ name: 'approval_workflows.index' })">
          {{ t("button.cancel") }}
        </UiButton>
        <UiButton type="primary" @click="handleSubmit">
          {{ t("button.save") }}
        </UiButton>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="moreFunction"
          class="flex items-center"
        />
      </div>
    </UiForm>
  </div>
</template>
