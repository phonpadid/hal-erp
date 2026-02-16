<script setup lang="ts">
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getUserApv } from "@/modules/shared/utils/get-user.login";

const user = computed(() => getUserApv());
const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  title: string;
  isReject?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "confirm", remark?: string): void;
  (e: "close"): void;
}>();

// Ref for reject remark
const rejectRemark = ref("");

const handleConfirm = () => {
  if (props.isReject) {
    emit("confirm", rejectRemark.value);
  } else {
    emit("confirm");
  }
};

const handleClose = () => {
  emit("close");
};

// Reset remark when modal opens/closes
const resetForm = () => {
  rejectRemark.value = "";
};
</script>

<template>
  <UiModal
    :title="title"
    :visible="visible"
    :footer="null"
    @cancel="handleClose"
    @after-visible-change="resetForm"
  >
    <div class="mt-4 px-2">
      <!-- User Info Header -->
      <!-- <div class="text-center text-sm flex items-center justify-start gap-2">
        <p>{{ user?.username || "ສຸກີ້ ວົງພະຈັນ" }}</p>
        <span class="-mt-3 ml-1 text-bold">•</span>
        <p>{{ user?.department_name }}</p>
      </div> -->

      <!-- Signature Confirmation (for approve) -->
      <div v-if="!isReject" class="mb-6">
        <p class="text-start mb-2 font-bold">
          {{ t("purchase-rq.signature") }}
        </p>
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
            :src="user?.signature ?? ''"
            alt="Digital Signature"
            class="max-w-[270px] max-h-[120px] object-contain pointer-events-none"
          />
        </div>
      </div>

      <!-- Reject Remark (for reject) -->
      <div v-else class="mb-6">
        <p class="text-start mb-2 font-bold">
          ເຫດຜົນປະຕິເສດ
        </p>
        <p class="text-start text-sm text-gray-600 mb-4">
          ປ້ອນເຫດຜົນໃນການປະຕິເສດ
        </p>

        <!-- Remark Textarea -->
        <textarea
          v-model="rejectRemark"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          placeholder="ປ້ອນເຫດຜົນປະຕິເສດ..."
        ></textarea>
      </div>

      <!-- Action Button -->
      <div class="flex justify-center">
        <button
          @click="handleConfirm"
          :disabled="props.loading || (props.isReject && !rejectRemark.trim())"
          :class="[
            'px-4 py-2 w-full rounded-lg transition-colors flex items-center justify-center',
            props.isReject
              ? !props.loading && rejectRemark.trim()
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-400 text-white cursor-not-allowed'
              : !props.loading
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-400 text-white cursor-not-allowed',
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
