<script setup lang="ts">
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import { nextTick, ref, computed, watch } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const otpInputRefs = ref<any[]>([]);
const otpValue = ref<string[]>(Array(6).fill(""));
const confirmOTP = ref(false);

const props = defineProps<{
  visible: boolean;
  title: string;
}>();

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();

// Computed property to check if OTP is complete
const isOtpComplete = computed(() => {
  return (
    otpValue.value.every((digit) => digit !== "") && otpValue.value.length === 6
  );
});

watch(
  () => props.visible,
  (newVisible) => {
    if (!newVisible) {
      // Reset state when modal closes
      confirmOTP.value = false;
      otpValue.value = Array(6).fill("");
    }
  }
);

const handleOtpInputEvent = async (e: Event, index: number) => {
  const input = e.target as HTMLInputElement;
  const value = input.value.trim();

  // If user pastes full OTP (length >= 6)
  if (value.length >= 6 && /^\d{6}$/.test(value)) {
    for (let i = 0; i < 6; i++) {
      otpValue.value[i] = value[i];
    }

    await nextTick();
    const lastInput = otpInputRefs.value[5];
    const antInput = lastInput?.$el?.querySelector("input") || lastInput?.$el;
    antInput?.focus();
    antInput?.select();
    return;
  }

  // Only allow one digit per field
  if (!/^\d$/.test(value)) return;

  otpValue.value[index] = value;

  // Auto-focus next input if not last
  if (index < 5) {
    await nextTick();
    const nextInput = otpInputRefs.value[index + 1];
    const antInput = nextInput?.$el?.querySelector("input") || nextInput?.$el;
    antInput?.focus();
    antInput?.select();
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
  emit("confirm");
};

const closeModal = () => {
  emit("close");
};

const resendOtp = () => {
  // Reset OTP values and focus first input
  otpValue.value = Array(6).fill("");
  nextTick(() => {
    const firstInput = otpInputRefs.value[0];
    if (firstInput) {
      const antInput = firstInput.$el?.querySelector("input") || firstInput.$el;
      if (antInput && typeof antInput.focus === "function") {
        antInput.focus();
      }
    }
  });
  // Here you would typically call an API to resend OTP
  console.log("Resending OTP...");
};
const setOtpInputElement = (el: unknown, index: number) => {
  if (el) {
    otpInputRefs.value[index] = el;
  }
};
</script>

<template>
  <UiModal
    :title="title"
    :visible="visible"
    :footer="null"
    @cancel="closeModal"
  >
    <div class="mt-4 px-2">
      <!-- User Info Header -->
      <div
        class="text-center text-sm flex items-center justify-start gap-2"
      >
        <p>ສຸກີ້ ວົງພະຈັນ</p>
        <span class="-mt-3 ml-1 text-bold">•</span>
        <p>ບໍລິຫານ</p>
      </div>

      <!-- OTP Input Step -->
      <div v-if="!confirmOTP" class="mb-6">
        <p class="text-start mb-2 font-medium">ກວດສອບ OTP ໃນຂໍ້ຄວາມ</p>
        <p class="text-start text-sm text-gray-600 mb-4">
          ສົ່ງລະຫັດຢືນຢັນ 6 ຕົວໄປທີ່ເບີໂທລະສັບ +856 20 502 221 02
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

        <!-- Resend Link -->
        <div class="text-center mb-4">
          <p class="text-sm text-gray-500">
            ບໍ່ໄດ້ຮັບລະຫັດ?
            <button
              type="button"
              @click="resendOtp"
              class="text-red-600 hover:text-red-700 underline ml-1"
            >
              ສົ່ງອີກຄັ້ງ
            </button>
          </p>
        </div>
      </div>

      <!-- Signature Confirmation Step -->
      <div v-else class="mb-6">
        <p class="text-start mb-2 font-bold">ລາຍເຊັນ</p>
        <p class="text-start text-sm text-gray-600 mb-4">
          ລາຍເຊັນຂອງທ່ານຈະຖືກນຳໃຊ້ໃນການຢືນຢັນເອກະສານ
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
          :disabled="!isOtpComplete"
          :class="[
            'px-4 py-2 w-full rounded-lg transition-colors',
            isOtpComplete
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ]"
        >
          ຢືນຢັນ OTP
        </button>

        <!-- Final Confirm Button for Signature Step -->
        <button
          v-else
          @click="finalConfirm"
          class="px-4 py-2 w-full bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          ຢືນຢັນລາຍເຊັນ
        </button>
      </div>
    </div>
  </UiModal>
</template>
