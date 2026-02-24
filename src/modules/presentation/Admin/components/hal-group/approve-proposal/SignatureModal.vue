<script setup lang="ts">
import { computed } from "vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";

const props = defineProps<{
  visible: boolean;
  loading?: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "close"): void;
}>();

const { t } = useI18n();
const authStore = useAuthStore();

// Get user signature from auth store or localStorage
const userSignature = computed(() => {
  // Try to get signature from auth store user data first
  if (authStore.user?.getSignature()) {
    return authStore.user.getSignature();
  }

  // Fallback to localStorage directly
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.signature;
    }
  } catch (error) {
    console.error('Error parsing userData from localStorage:', error);
  }

  // Fallback to default signature image if no signature found
  return '/2.png';
});

// Get user name for display
const displayUserName = computed(() => {
  if (authStore.user?.getUsername()) {
    return authStore.user.getUsername();
  }
  // Fallback to localStorage
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.username || parsedData.name || "ບໍ່ພົບຜູ້ໃຊ້";
    }
  } catch (error) {
    console.error('Error parsing userData from localStorage:', error);
  }
  return "ບໍ່ພົບຜູ້ໃຊ້";
});

const handleConfirm = () => {
  emit("confirm");
};

const handleClose = () => {
  emit("close");
};

// Handle signature image error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Fallback to default signature image if user signature fails to load
  img.src = '/2.png';
};
</script>

<template>
  <UiModal
    :title="title || 'ຢືນຢັນລາຍເຊັນ'"
    :visible="visible"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="mt-4 px-2">
      <!-- User Info Header -->
      <div class="text-center text-sm flex items-center justify-start gap-2 mb-4">
        <p class="font-medium">{{ displayUserName }}</p>
        <span class="-mt-3 ml-1 text-bold">•</span>
        <p>ອຳນວຍການ</p>
      </div>

      <!-- Signature Confirmation Section -->
      <div class="mb-6">
        <p class="text-start mb-2 font-bold">{{ t("purchase-rq.signature") }}</p>
        <p class="text-start text-sm text-gray-600 mb-4">
          {{ t("purchase-rq.message") }}
        </p>

        <!-- Signature Display - Clickable -->
        <div
          class="flex justify-center gap-2 bg-gray-100 rounded-md ring-1 ring-gray-300 p-4 cursor-pointer hover:bg-gray-200 transition-colors"
          @click="handleConfirm"
          title="Click to confirm signature"
        >
          <img
            :src="userSignature"
            alt="Digital Signature"
            class="max-w-[270px] max-h-[120px] object-contain pointer-events-none"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <!-- Back/Cancel Button -->
        <button
          @click="handleClose"
          :disabled="props.loading"
          class="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t("purchase-rq.btn.cancel") }}
        </button>

        <!-- Confirm Button -->
        <button
          @click="handleConfirm"
          :disabled="props.loading"
          :class="[
            'flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center',
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
