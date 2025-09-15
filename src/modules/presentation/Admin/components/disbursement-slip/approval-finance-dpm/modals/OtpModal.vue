<script setup lang="ts">
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import { nextTick, ref, computed, watch, defineProps, defineEmits } from "vue";
import { useI18n } from "vue-i18n";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useApprovalStepStore } from "@/modules/presentation/Admin/stores/approval-step.store";

const { t } = useI18n();
const { error } = useNotification();
const approvalStepStore = useApprovalStepStore();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const otpInputRefs = ref<any[]>([]);
const otpValue = ref<string[]>(Array(6).fill(""));
const confirmOTP = ref(false); // controls if we are on signature step
const resendLoading = ref(false);
const resendCooldown = ref(false);
const cooldownTime = ref(60);

const props = defineProps<{
  visible: boolean;
  title: string;
  approvalStepId?: number | null;
  loading?: boolean;
  is_otp?: boolean; // <-- added prop
}>();

const emit = defineEmits<{
  (e: "confirm", otpValue: string): void;
  (e: "close"): void;
  (e: "resend"): void;
}>();

const phoneNumber = computed(() => {
  if (approvalStepStore.otpResponse?.approver?.tel) {
    const tel = approvalStepStore.otpResponse.approver.tel;
    return `+856 ${tel}`;
  }
  return "+856 20 502 221 02";
});

const isOtpComplete = computed(() => {
  return otpValue.value.every((digit) => digit !== "") && otpValue.value.length === 6;
});

// When modal opens, decide whether to skip OTP step
watch(
  () => props.visible,
  (newVisible) => {
    if (!newVisible) {
      confirmOTP.value = false;
      otpValue.value = Array(6).fill("");
      resendCooldown.value = false;
    } else {
      // ✅ Skip OTP if not required
      confirmOTP.value = props.is_otp === false;

      // If OTP step is required, focus first input
      if (props.is_otp && !confirmOTP.value) {
        nextTick(() => {
          const firstInput = otpInputRefs.value[0];
          if (firstInput) {
            const inputElement = firstInput.$el.querySelector("input") || firstInput.$el;
            inputElement?.focus();
          }
        });
      }
    }
  }
);

const handleOtpInputEvent = async (value: string, index: number) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (numericValue) {
    otpValue.value[index] = numericValue[0];
    if (index < 5) {
      nextTick(() => {
        const nextInput = otpInputRefs.value[index + 1];
        if (nextInput) {
          const inputElement = nextInput.$el.querySelector("input") || nextInput.$el;
          inputElement?.focus();
        }
      });
    }
  } else {
    otpValue.value[index] = "";
  }
};

const handleOtpKeydownEvent = async (event: KeyboardEvent, index: number) => {
  const key = event.key;
  if (key === "Enter") {
    if (!confirmOTP.value && isOtpComplete.value) {
      event.preventDefault();
      confirmOtpStep();
    } else if (confirmOTP.value) {
      event.preventDefault();
      finalConfirm();
    }
    return;
  }
  if (key === "Backspace") {
    if (otpValue.value[index]) {
      otpValue.value[index] = "";
    } else if (index > 0) {
      otpValue.value[index - 1] = "";
      await nextTick();
      const prevInput = otpInputRefs.value[index - 1];
      const antInput = prevInput?.$el?.querySelector("input") || prevInput?.$el;
      antInput?.focus();
      antInput?.select();
    }
    return;
  }
  if (key === "ArrowLeft" && index > 0) {
    event.preventDefault();
    const prevInput = otpInputRefs.value[index - 1];
    const antInput = prevInput?.$el?.querySelector("input") || prevInput?.$el;
    antInput?.focus();
  }
  if (key === "ArrowRight" && index < 5) {
    event.preventDefault();
    const nextInput = otpInputRefs.value[index + 1];
    const antInput = nextInput?.$el?.querySelector("input") || nextInput?.$el;
    antInput?.focus();
  }
  if (!/^\d$|Backspace|Delete|Tab|Enter|ArrowLeft|ArrowRight/.test(key)) {
    event.preventDefault();
  }
};

const confirmOtpStep = () => {
  if (isOtpComplete.value) {
    confirmOTP.value = true;
  }
};

const finalConfirm = () => {
  const otp = otpValue.value.join("");
  emit("confirm", otp);
};

const closeModal = () => {
  emit("close");
};

const resendOtp = async () => {
  if (resendCooldown.value || !props.approvalStepId || resendLoading.value) {
    return;
  }
  try {
    resendLoading.value = true;
    emit("resend");
    otpValue.value = Array(6).fill("");
    confirmOTP.value = false;
    nextTick(() => {
      const firstInput = otpInputRefs.value[0];
      if (firstInput) {
        const antInput = firstInput.$el?.querySelector("input") || firstInput.$el;
        antInput?.focus();
      }
    });
  } catch (err) {
    console.error("Error resending OTP:", err);
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງ OTP ໄດ້");
  } finally {
    resendLoading.value = false;
  }
};

const setOtpInputElement = (el: unknown, index: number) => {
  if (el) {
    otpInputRefs.value[index] = el;
  }
};
</script>


<template>
  <UiModal
    :title="confirmOTP ? t('purchase-rq.confirm_signature') : title"
    :visible="visible"
    :footer="null"
    @cancel="closeModal"
  >
    <div class="mt-4 px-2">
      <!-- User Info Header -->
      <div class="text-center text-sm flex items-center justify-start gap-2">
        <p>{{ approvalStepStore.otpResponse?.approver?.name || "ສຸກີ້ ວົງພະຈັນ" }}</p> fff: {{ props.is_otp }}
        <span class="-mt-3 ml-1 text-bold">•</span>
        <p>ບໍລິຫານ</p>
      </div>

      <!-- OTP Input Step -->
      <div v-if="!confirmOTP" class="mb-6">
        <p class="text-start mb-2 font-medium">{{ t("purchase-rq.check_message") }}</p>
        <p class="text-start text-sm text-gray-600 mb-4">
          {{ t("purchase-rq.content") }} {{ phoneNumber }}
        </p>

        <!-- OTP Input Fields -->
        <div class="flex justify-center gap-2 mb-4">
          <template v-for="i in 6" :key="i">
            <UiInput
              :ref="(el) => setOtpInputElement(el, i - 1)"
              v-model="otpValue[i - 1]"
              class="w-12 h-12 text-center text-xl font-medium border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-200"
              :maxlength="1"
              type="text"
              autocomplete="off"
              @input="handleOtpInputEvent($event, i - 1)"
              @keydown="handleOtpKeydownEvent($event, i - 1)"
            />
          </template>
        </div>

        <!-- Resend Link with Cooldown -->
        <div class="text-center mb-4">
          <p class="text-sm text-gray-500">
            {{ t("purchase-rq.no_code") }}
            <button
              type="button"
              @click="resendOtp"
              :disabled="resendCooldown || resendLoading"
              class="text-red-600 hover:text-red-700 underline ml-1 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="resendCooldown"
                >{{ t("purchase-rq.send_again") }} ({{ cooldownTime }}s)</span
              >
              <span v-else-if="resendLoading">{{ t("purchase-rq.sending") }}...</span>
              <span v-else>{{ t("purchase-rq.send_again") }}</span>
            </button>
          </p>
        </div>
      </div>

      <!-- Signature Confirmation Step -->
      <div v-else class="mb-6">
        <p class="text-start mb-2 font-bold">{{ t("purchase-rq.signature") }}</p>
        <p class="text-start text-sm text-gray-600 mb-4">
          {{ t("purchase-rq.message") }}
        </p>
        <!-- Signature Display - Clickable -->
        <div
          class="flex justify-center gap-2 bg-gray-100 rounded-md ring-1 ring-gray-300 p-4 cursor-pointer hover:bg-gray-200 transition-colors"
          @click="finalConfirm"
          title="Click to confirm signature"
        >
          <img
            src="/2.png"
            alt="Digital Signature"
            class="max-w-[270px] max-h-[120px] object-contain pointer-events-none"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center">
        <!-- Confirm Button for OTP Step -->
        <button
          v-if="!confirmOTP"
          @click="confirmOtpStep"
          :disabled="!isOtpComplete || props.loading"
          :class="[
            'px-4 py-2 w-full rounded-lg transition-colors flex items-center justify-center',
            isOtpComplete && !props.loading
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ]"
        >
          <span v-if="props.loading" class="mr-2">
            <svg
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
          {{ t("purchase-rq.btn.confirm") }}
        </button>

        <!-- Final Confirm Button for Signature Step -->
        <button
          v-else
          @click="finalConfirm"
          :disabled="props.loading"
          :class="[
            'px-4 py-2 w-full rounded-lg transition-colors flex items-center justify-center',
            !props.loading
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-red-400 text-white cursor-not-allowed',
          ]"
        >
          <span v-if="props.loading" class="mr-2">
            <svg
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
          {{ t("purchase-rq.btn.confirm") }}
        </button>
      </div>
    </div>
  </UiModal>
</template>
