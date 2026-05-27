<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInputPassword from "@/common/shared/components/Input/UiInputPassword.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const token = computed(() => {
  const raw = route.query.token;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return "";
});

type ViewState = "form" | "success" | "invalid";

const initialState: ViewState = token.value ? "form" : "invalid";
const viewState = ref<ViewState>(initialState);
const submitting = ref(false);
const formRef = ref<InstanceType<typeof UiForm>>();

const formState = reactive({
  new_password: "",
  confirm_password: "",
});

const rules = {
  new_password: [
    { required: true, message: t("menu-sidebar.reset_password.required") },
    { min: 6, message: t("menu-sidebar.reset_password.min_length") },
    { max: 255, message: t("menu-sidebar.reset_password.max_length") },
  ],
  confirm_password: [
    { required: true, message: t("menu-sidebar.reset_password.required") },
    {
      validator: async (_rule: unknown, value: string) => {
        if (value !== formState.new_password) {
          throw new Error(t("menu-sidebar.reset_password.mismatch"));
        }
      },
    },
  ],
};

const invalidTitle = computed(() =>
  token.value
    ? t("menu-sidebar.reset_password.invalid_token_title")
    : t("menu-sidebar.reset_password.missing_token_title")
);
const invalidDescription = computed(() =>
  token.value
    ? t("menu-sidebar.reset_password.invalid_token_description")
    : t("menu-sidebar.reset_password.missing_token_description")
);

const errorMessage = ref<string>("");

const errorMessageFor = (err: unknown): string => {
  const e = err as { errorKey?: string; statusCode?: number; message?: string };
  if (e?.statusCode === 401 || e?.errorKey === "errors.invalid_or_expired_token") {
    return t("menu-sidebar.reset_password.invalid_token_description");
  }
  if (e?.errorKey === "validation.PASSWORD_MISMATCH") {
    return t("menu-sidebar.reset_password.mismatch");
  }
  if (e?.errorKey === "validation.PASSWORD_LENGTH") {
    return t("menu-sidebar.reset_password.min_length");
  }
  return e?.message || t("menu-sidebar.reset_password.failed");
};

const handleSubmit = async () => {
  errorMessage.value = "";

  try {
    await formRef.value?.submitForm();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    await authStore.resetPassword({
      token: token.value,
      new_password: formState.new_password,
      confirm_password: formState.confirm_password,
    });
    viewState.value = "success";
  } catch (err) {
    const e = err as { statusCode?: number; errorKey?: string };
    if (e?.statusCode === 401 || e?.errorKey === "errors.invalid_or_expired_token") {
      viewState.value = "invalid";
    } else {
      errorMessage.value = errorMessageFor(err);
    }
  } finally {
    submitting.value = false;
  }
};

const goToLogin = () => {
  router.push({ name: "login" });
};
</script>

<template>
  <section class="bg-gray-50 min-h-screen">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a class="flex flex-col items-center mb-6 text-2xl font-semibold">
        <img
          class="w-16 h-16 mr-2 mb-2 object-contain rounded-full"
          src="/src/common/shared/assets/images/log-hallogictic.jpeg"
          alt="logo"
        />
        <span>HAL ERP</span>
      </a>

      <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <!-- Form state -->
          <template v-if="viewState === 'form'">
            <div>
              <h3 class="text-2xl font-bold mb-2">
                {{ t("menu-sidebar.reset_password.title") }}
              </h3>
              <p class="text-[14px] text-slate-600">
                {{ t("menu-sidebar.reset_password.description") }}
              </p>
            </div>

            <UiForm ref="formRef" :model="formState" :rules="rules">
              <UiFormItem
                :label="t('menu-sidebar.reset_password.new_password')"
                name="new_password"
                required
              >
                <UiInputPassword
                  v-model="formState.new_password"
                  :placeholder="t('menu-sidebar.reset_password.placeholder_new')"
                  :disabled="submitting"
                />
              </UiFormItem>

              <UiFormItem
                :label="t('menu-sidebar.reset_password.confirm_password')"
                name="confirm_password"
                required
              >
                <UiInputPassword
                  v-model="formState.confirm_password"
                  :placeholder="t('menu-sidebar.reset_password.placeholder_confirm')"
                  :disabled="submitting"
                />
              </UiFormItem>

              <div
                v-if="errorMessage"
                class="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md p-2 mb-3"
              >
                {{ errorMessage }}
              </div>

              <UiFormItem>
                <UiButton
                  type="primary"
                  size="large"
                  :disabled="submitting"
                  colorClass="!bg-red-600 hover:!bg-red-800 text-white w-full"
                  @click="handleSubmit"
                >
                  {{
                    submitting
                      ? t("menu-sidebar.reset_password.submit") + "..."
                      : t("menu-sidebar.reset_password.submit")
                  }}
                </UiButton>
              </UiFormItem>
            </UiForm>

            <div class="text-center">
              <button
                type="button"
                class="text-[13px] text-slate-600 hover:text-slate-900 hover:underline"
                @click="goToLogin"
              >
                {{ t("menu-sidebar.reset_password.back_to_login") }}
              </button>
            </div>
          </template>

          <!-- Success state -->
          <template v-else-if="viewState === 'success'">
            <div class="flex flex-col items-center text-center gap-3">
              <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl">
                ✓
              </div>
              <h3 class="text-xl font-bold">
                {{ t("menu-sidebar.reset_password.success_title") }}
              </h3>
              <p class="text-[14px] text-slate-600">
                {{ t("menu-sidebar.reset_password.success_description") }}
              </p>
            </div>
            <UiButton
              type="primary"
              size="large"
              colorClass="!bg-red-600 hover:!bg-red-800 text-white w-full"
              @click="goToLogin"
            >
              {{ t("menu-sidebar.reset_password.go_to_login") }}
            </UiButton>
          </template>

          <!-- Invalid / missing token state -->
          <template v-else>
            <div class="flex flex-col items-center text-center gap-3">
              <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-3xl">
                !
              </div>
              <h3 class="text-xl font-bold">{{ invalidTitle }}</h3>
              <p class="text-[14px] text-slate-600">{{ invalidDescription }}</p>
            </div>
            <UiButton
              type="primary"
              size="large"
              colorClass="!bg-red-600 hover:!bg-red-800 text-white w-full"
              @click="goToLogin"
            >
              {{ t("menu-sidebar.reset_password.request_new_link") }}
            </UiButton>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
