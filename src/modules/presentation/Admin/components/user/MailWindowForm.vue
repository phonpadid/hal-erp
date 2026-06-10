<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs, { type Dayjs } from "dayjs";
import { TimePicker } from "ant-design-vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import Switch from "@/common/shared/components/Switch/Switch.vue";
import type { MailPreference } from "@/modules/infrastructure/api-mail-preference.repository";

const { t } = useI18n();

const props = defineProps<{
  loading?: boolean;
  initial?: MailPreference | null;
}>();

const emit = defineEmits<{
  (e: "submit", data: MailPreference): void;
}>();

const TIME_FORMAT = "HH:mm";


const formRef = ref();
const formState = reactive<{
  is_enabled: boolean;
  start_time: Dayjs | undefined;
  end_time: Dayjs | undefined;
}>({
  is_enabled: false,
  start_time: undefined,
  end_time: undefined
});

const parseTime = (value: string | undefined | null): Dayjs | undefined => {
  if (!value) return undefined;
  const d = dayjs(value, TIME_FORMAT);
  return d.isValid() ? d : undefined;
};

const applyInitial = (pref: MailPreference | null | undefined) => {
  if (pref && pref.is_enabled) {
    formState.is_enabled = true;
    formState.start_time = parseTime(pref.start_time) ?? dayjs("08:00", TIME_FORMAT);
    formState.end_time = parseTime(pref.end_time) ?? dayjs("17:00", TIME_FORMAT);
  } else {
    formState.is_enabled = false;
    formState.start_time = parseTime(pref?.start_time);
    formState.end_time = parseTime(pref?.end_time);
  }
};

applyInitial(props.initial);

watch(
  () => props.initial,
  (val) => applyInitial(val),
  { deep: true }
);

watch(
  () => formState.is_enabled,
  (enabled) => {
    if (enabled) {
      if (!formState.start_time) formState.start_time = dayjs("08:00", TIME_FORMAT);
      if (!formState.end_time) formState.end_time = dayjs("17:00", TIME_FORMAT);
    }
  }
);

const rules = {
  start_time: [
    {
      validator: async () => {
        if (!formState.is_enabled) return;
        if (!formState.start_time) {
          throw new Error(t("user.mailWindow.validation.startRequired"));
        }
      },
      trigger: "change",
    },
  ],
  end_time: [
    {
      validator: async () => {
        if (!formState.is_enabled) return;
        if (!formState.end_time) {
          throw new Error(t("user.mailWindow.validation.endRequired"));
        }
        if (
          formState.start_time &&
          formState.end_time.isBefore(formState.start_time)
        ) {
          throw new Error(t("user.mailWindow.validation.endAfterStart"));
        }
      },
      trigger: "change",
    },
  ],
};
const submitForm = async () => {
  try {
    await formRef.value?.submitForm()

    const payload: MailPreference = formState.is_enabled
      ? {
          is_enabled: true,
          start_time: formState.start_time?.format(TIME_FORMAT) ?? "",
          end_time: formState.end_time?.format(TIME_FORMAT) ?? "",
         
        }
      : {
          is_enabled: false,
          start_time: "",
          end_time: "",
        };

    emit("submit", payload);
  } catch (error) {
    console.error("MailWindowForm validation failed:", error);
  }
};

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>

<template>
  <UiForm ref="formRef" :model="formState" :rules="rules">
    <UiFormItem :label="t('user.mailWindow.enableLabel')" name="is_enabled">
      <Switch v-model:modelValue="formState.is_enabled" />
      <p class="text-xs text-gray-500 mt-1">
        {{ t("user.mailWindow.help") }}
      </p>
    </UiFormItem>

    <div v-if="formState.is_enabled">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <UiFormItem
          :label="t('user.mailWindow.startLabel')"
          name="start_time"
          required
        >
          <TimePicker
            v-model:value="formState.start_time"
            :format="TIME_FORMAT"
            :minute-step="5"
            :placeholder="t('user.mailWindow.startPlaceholder')"
            :disabled="loading"
            style="width: 100%"
            allow-clear
          />
        </UiFormItem>

        <UiFormItem
          :label="t('user.mailWindow.endLabel')"
          name="end_time"
          required
        >
          <TimePicker
            v-model:value="formState.end_time"
            :format="TIME_FORMAT"
            :minute-step="5"
            :placeholder="t('user.mailWindow.endPlaceholder')"
            :disabled="loading"
            style="width: 100%"
            allow-clear
          />
        </UiFormItem>
      </div>
    </div>

    <p class="text-xs text-gray-400 mt-2">
      {{ t("user.mailWindow.timezoneNote") }}
    </p>
  </UiForm>
</template>
