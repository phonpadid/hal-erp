<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { NumberOnly } from "@/modules/shared/utils/format-price";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { computed, onMounted, ref } from "vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { departmentStore } from "../../stores/departments/department.store";
import InputNumber from "@/common/shared/components/Input/InputNumber.vue";
import Radio from "@/common/shared/components/Input/Radio.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import { useUserStore } from "../../stores/user.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { approvalWorkflowStore, formState, moreFunction } from "../../stores/approval-workflow.store";
import { apvStepRules } from "../../views/approval-workflows/validation/approval-workflow.validate";
import { useRouter } from "vue-router";
const {success, warning} = useNotification()
const {push} = useRouter()
const { t } = useI18n();
const dpmStore = departmentStore();
const docTypeStore = useDocumentTypeStore();
const userStore = useUserStore();
const apvWorkflowStore = approvalWorkflowStore()
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
    value: user.getId() ?? '',
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
    const item = formState.addMore
      .map((item) => ({
        approval_workflow_id: item.approval_workflow_id,
        department_id: item.department_id,
        step_number: item.step_number,
        step_name: item.step_name,
        type: item.type,
        user_id: item.user_id,
        requires_file: item.requires_file,
      }));
    await apvWorkflowStore.create({
        name: formState.name,
        document_type_id: formState.document_type_id,
        steps: item
      });
      success(t("approval-workflow-step.notify.created"));
      push({name: 'approval_workflows.index'})
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("documentType.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="mt-[1rem] px-6 shadow-sm p-2">
    <h4 class="text-2xl font-bold text-gray-700">
      {{ t("approval-workflow-step.header_form.add") }}
    </h4>
    <UiForm
      ref="formRef"
      :model="formState"
      :rules="apvStepRules(t)"
    >
      <div class="md:flex w-full gap-4 items-start">
        <UiFormItem
          class="md:w-1/3"
          :label="t('approval-workflow.field.form_name')"
          name="name"
          required
        >
          <UiInput
            v-model="formState.name"
            :placeholder="t('approval-workflow.placeholder.name')"
          />
        </UiFormItem>

        <UiFormItem
          class="md:w-1/3"
          :label="t('approval-workflow.field.doc_type')"
          name="document_type_id"
          required
        >
          <InputSelect
            v-model="formState.document_type_id"
            :options="docTypeItems"
            :placeholder="t('approval-workflow.placeholder.doc_type')"
          />
        </UiFormItem>
      </div>

      <div
        class="items"
        v-for="(value, index) in formState.addMore"
        :key="index"
      >
        <h1 class="md:text-lg text-md font-semibold flex md:gap-2 gap-1">
          {{ $t("approval-workflow-step.title") }} <p class="text-md font-medium">({{ t("approval-workflow-step.field.step") }} {{ index + 1 }})</p>
        </h1>
        <div class="md:flex gap-4 w-full items-start">
          <UiFormItem
            class="md:w-1/3"
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
            class="md:w-1/3"
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
        </div>
        <div class="md:flex gap-4 w-full items-start">
          <UiFormItem
            :label="t('approval-workflow-step.field.type')"
            :name="['addMore', index.toString(), 'type']"
            required
            class="md:w-1/3"
          >
            <InputSelect
              v-model="value.type"
              :options="typeOption"
              :placeholder="
                t('approval-workflow-step.placeholder.approval_workflow')
              "
            />
          </UiFormItem>
          <UiFormItem
            :label="t('approval-workflow-step.field.department')"
            :name="['addMore', index.toString(), 'department_id']"
            required
            class="md:w-1/3"
            v-if="value.type === 'department'"
          >
            <InputSelect
              v-model="value.department_id"
              :options="departmentItems"
              :placeholder="t('approval-workflow-step.placeholder.department')"
            />
          </UiFormItem>
          <UiFormItem
            :label="t('approval-workflow-step.field.user')"
            :name="['addMore', index.toString(), 'user_id']"
            required
            class="md:w-1/3"
            v-if="value.type === 'specific_user'"
          >
            <InputSelect
              v-model="value.user_id"
              :options="userOption"
              :placeholder="t('approval-workflow-step.placeholder.user')"
            />
          </UiFormItem>
        </div>
        <div class="md:flex justify-between w-1/3">
          <UiFormItem
          :label="t('approval-workflow-step.field.requires_file')"
          :name="['addMore', index.toString(), 'requires_file']"
        >
          <Radio v-model="value.requires_file" :options="rateOptions" />
        </UiFormItem>
        <UiFormItem
          :label="t('approval-workflow.addMore')"
        >
        <div class="add mb-4 flex gap-2">
          <UiButton
          type="primary"
            size="small"
            icon="ant-design:plus-outlined"
            @click="moreFunction"
            colorClass="flex items-center"
          />
          <UiButton
            size="small"
            icon="ant-design:minus-outlined"
            :disabled="formState.addMore.length <= 1"
            @click="removeMore(index)"
            colorClass="flex items-center"
          />
        </div>
        </UiFormItem>
        </div>
      </div>
      <div class="btn mb-16 flex items-center justify-start gap-3">
        <UiButton @click="push({name: 'approval_workflows.index'})" >{{ t('button.cancel') }}</UiButton>
        <UiButton @click="handleSubmit" type="primary">{{ t('button.save') }}</UiButton>
      </div>
    </UiForm>
  </div>
</template>
