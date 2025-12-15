<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useI18n } from "vue-i18n";
import { getUserApv } from "@/modules/shared/utils/get-user.login";

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
const user = computed(() => getUserApv());

// Get signature from localStorage
const userSignature = ref<string>("");
const signatureError = ref<string>("");

onMounted(() => {
  // Get signature from localStorage
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      userSignature.value = parsedUser.signature || "";
    }
  } catch (error) {
    console.error("Error loading signature from localStorage:", error);
    signatureError.value = "ບໍ່ສາມາດໂຫຼດລາຍເຊັນຈາກລະບົບ";
  }
});

const handleConfirm = () => {
  emit("confirm");
};

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <UiModal
    :title="title || 'ຢືນຢັນລາຍເຊັນ'"
    :visible="visible"
    :confirm-loading="loading"
    @update:visible="handleClose"
    @ok="handleConfirm"
  >
    <div class="space-y-6">
      <!-- User Info -->
      <div class="text-center text-sm flex items-center justify-center gap-2">
        <p class="font-medium">{{ user?.username || "ຜູ້ໃຊ້ລະບົບ" }}</p>
        <span class="text-gray-400">•</span>
        <p class="text-gray-600">{{ user?.department_name || "" }}</p>
      </div>

      <!-- Signature Display -->
      <div class="space-y-3">
        <p class="text-start font-medium text-gray-900">
          ລາຍເຊັນດິຈິຕອລ
        </p>

        <!-- Error State -->
        <div v-if="signatureError" class="text-center text-red-500 p-4 border border-red-200 rounded-lg bg-red-50">
          {{ signatureError }}
        </div>

        <!-- No Signature State -->
        <div v-else-if="!userSignature" class="text-center text-gray-500 p-4 border border-gray-200 rounded-lg bg-gray-50">
          ບໍ່ພົບລາຍເຊັນ ກະລຸນາຕັ້ງລາຍເຊັນໃນລະບົບ
        </div>

        <!-- Signature Display -->
        <div v-else class="flex justify-center">
          <div
            class="bg-gray-100 rounded-md ring-1 ring-gray-300 p-4 hover:bg-gray-200 transition-colors cursor-pointer"
            @click="handleConfirm"
          >
            <img
              :src="userSignature"
              alt="Digital Signature"
              class="max-w-[270px] max-h-[120px] object-contain"
            />
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="text-center text-sm text-gray-600">
        <p>ກະລຸນາກົດທີ່ລາຍເຊັນ ຫຼື ປຸ່ມ "ຢືນຢັນ" ເພື່ອອະນຸມັດເອກະສານນີ້</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-3 pt-4">
        <button
          @click="handleClose"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Icon icon="ant-design:close-outlined" class="text-lg" />
          ຍົກເລີກ
        </button>

        <button
          :disabled="!userSignature || loading"
          @click="handleConfirm"
          :class="[
            'px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg',
            userSignature && !loading
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <span v-if="loading" class="mr-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <Icon v-if="!loading" icon="ant-design:check-circle-outlined" class="text-lg" />
          ຢືນຢັນການ{{ (title || '').includes('ປະຕິເສດ') ? 'ປະຕິເສດ' : 'ອະນຸມັດ' }}
        </button>
      </div>
    </div>
  </UiModal>
</template>