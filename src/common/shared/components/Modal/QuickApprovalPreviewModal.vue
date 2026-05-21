<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Modal, Spin } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";

interface Props {
  visible: boolean;
  loading?: boolean;
  submitting?: boolean;
  title?: string;
  docNumber?: string;
  docNumberLabel?: string;
  purpose?: string;
  total?: number;
  currencyCode?: string;
  canApprove?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  submitting: false,
  title: "ລາຍລະອຽດເອກະສານ",
  docNumber: "",
  docNumberLabel: "ເລກທີເອກະສານ",
  purpose: "",
  total: 0,
  currencyCode: "₭",
  canApprove: false,
});

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "approve"): void;
  (e: "reject", reason: string): void;
  (e: "details"): void;
}>();

const authStore = useAuthStore();
const showRejectForm = ref(false);
const showSignatureConfirm = ref(false);
const rejectReason = ref("");

const userSignature = computed(() => {
  if (authStore.user?.getSignature?.()) {
    return authStore.user.getSignature();
  }
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.signature) return parsed.signature;
    }
  } catch {
    // ignore
  }
  return "/2.png";
});

watch(
  () => props.visible,
  (v) => {
    if (!v) {
      showRejectForm.value = false;
      showSignatureConfirm.value = false;
      rejectReason.value = "";
    }
  }
);

const handleClose = () => {
  if (props.submitting) return;
  emit("update:visible", false);
};

const openSignatureConfirm = () => {
  if (props.loading || props.submitting || !props.canApprove) return;
  showSignatureConfirm.value = true;
};

const cancelSignatureConfirm = () => {
  if (props.submitting) return;
  showSignatureConfirm.value = false;
};

const confirmApprove = () => {
  if (props.loading || props.submitting || !props.canApprove) return;
  emit("approve");
};

const openRejectForm = () => {
  if (props.loading || props.submitting || !props.canApprove) return;
  showRejectForm.value = true;
};

const confirmReject = () => {
  if (props.loading || props.submitting || !props.canApprove) return;
  emit("reject", rejectReason.value.trim());
};

const cancelRejectForm = () => {
  if (props.submitting) return;
  showRejectForm.value = false;
  rejectReason.value = "";
};

const handleDetails = () => {
  if (props.loading || props.submitting) return;
  emit("details");
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/2.png";
};
</script>

<template>
  <Modal
    :open="visible"
    :centered="true"
    :closable="!submitting"
    :mask-closable="!submitting"
    :width="520"
    :destroy-on-close="true"
    :footer="null"
    @cancel="handleClose"
  >
    <template #title>
      <div class="flex items-center gap-2 text-base font-medium">
        <Icon icon="solar:document-text-bold" :width="22" :height="22" />
        <span v-if="showSignatureConfirm">ຢືນຢັນລາຍເຊັນ</span>
        <span v-else-if="showRejectForm">ປະຕິເສດເອກະສານ</span>
        <span v-else>{{ title }}</span>
      </div>
    </template>

    <div v-if="loading" class="flex justify-center items-center py-10">
      <Spin size="large" />
    </div>

    <div v-else>
      <!-- Signature confirmation -->
      <div v-if="showSignatureConfirm" class="mb-2">
        <p class="text-start mb-2 font-bold">ລາຍເຊັນຂອງທ່ານ</p>
        <p class="text-start text-sm text-gray-600 mb-3">
          ກະລຸນາກວດສອບລາຍເຊັນຂອງທ່ານກ່ອນຢືນຢັນການອະນຸມັດ
        </p>
        <div
          class="flex justify-center bg-gray-100 rounded-md ring-1 ring-gray-300 p-4 cursor-pointer hover:bg-gray-200 transition-colors"
          @click="confirmApprove"
          title="Click to confirm signature"
        >
          <img
            :src="userSignature"
            alt="Digital Signature"
            class="max-w-[270px] max-h-[120px] object-contain pointer-events-none"
            @error="handleImageError"
          />
        </div>
        <div class="flex gap-2 mt-4">
          <button
            type="button"
            class="flex-1 px-3 py-2 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
            :disabled="submitting"
            @click="cancelSignatureConfirm"
          >
            ກັບຄືນ
          </button>
          <button
            type="button"
            class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            :disabled="submitting"
            @click="confirmApprove"
          >
            <Icon icon="ant-design:check-circle-outlined" :width="16" />
            <span v-if="submitting">ກຳລັງສົ່ງ...</span>
            <span v-else>ຢືນຢັນອະນຸມັດ</span>
          </button>
        </div>
      </div>

      <template v-else>
        <div class="space-y-3 py-2">
          <div v-if="docNumber" class="flex items-start gap-2">
            <Icon icon="mdi:identifier" class="text-gray-400 mt-1 flex-shrink-0" :width="18" />
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500">{{ docNumberLabel }}</p>
              <p class="text-sm font-semibold text-blue-600 break-all">{{ docNumber }}</p>
            </div>
          </div>

          <div class="flex items-start gap-2">
            <Icon icon="mdi:target" class="text-gray-400 mt-1 flex-shrink-0" :width="18" />
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500">ຈຸດປະສົງ</p>
              <p class="text-sm text-gray-800 whitespace-pre-wrap break-words">
                {{ purpose || "-" }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-2">
            <Icon icon="mdi:cash-multiple" class="text-gray-400 mt-1 flex-shrink-0" :width="18" />
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500">ຈຳນວນເງິນລວມ</p>
              <p class="text-base font-semibold text-red-600">
                {{ formatPrice(total) }} {{ currencyCode }}
              </p>
            </div>
          </div>
        </div>

        <!-- Reject reason form -->
        <div v-if="showRejectForm" class="mt-3 p-3 bg-red-50 rounded border border-red-100">
          <p class="text-xs text-gray-700 mb-1">ເຫດຜົນໃນການປະຕິເສດ</p>
          <Textarea
            v-model="rejectReason"
            placeholder="ກະລຸນາລະບຸເຫດຜົນ..."
            :rows="2"
            :maxlength="500"
          />
          <div class="flex gap-2 mt-2">
            <button
              type="button"
              class="flex-1 px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
              :disabled="submitting"
              @click="cancelRejectForm"
            >
              ຍົກເລີກ
            </button>
            <button
              type="button"
              class="flex-1 px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
              :disabled="submitting"
              @click="confirmReject"
            >
              <span v-if="submitting">ກຳລັງສົ່ງ...</span>
              <span v-else>ຢືນຢັນປະຕິເສດ</span>
            </button>
          </div>
        </div>

        <div v-else class="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            v-if="canApprove"
            type="button"
            class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="submitting"
            @click="openRejectForm"
          >
            <Icon icon="ant-design:close-circle-outlined" :width="16" />
            ປະຕິເສດ
          </button>
          <button
            v-if="canApprove"
            type="button"
            class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="submitting"
            @click="openSignatureConfirm"
          >
            <Icon icon="ant-design:check-circle-outlined" :width="16" />
            ອະນຸມັດ
          </button>
          <button
            type="button"
            class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded border border-blue-300 text-blue-600 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="submitting"
            @click="handleDetails"
          >
            <Icon icon="ant-design:eye-outlined" :width="16" />
            ລາຍລະອຽດເພີ່ມເຕີມ
          </button>
        </div>
      </template>
    </div>
  </Modal>
</template>
