<script setup lang="ts">
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import { Icon } from "@iconify/vue";
import { ref } from "vue";

const confirmLoading = ref(false);

const props = defineProps<{
  visible: boolean;
  title?: string;
  message?: string;
  description?: string;
  iconName?: string;
  iconColor?: string;
  buttonText?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  confirm: [];
  cancel: [];
}>();

// Default values
const defaultTitle = props.title || "";
const defaultMessage = props.message || "ອະນຸມັດສຳເລັດ1";
const defaultDescription = props.description || "ອະນຸມັດຄຳຂໍຈັດຊື້ຂອງທ່ານສຳເລັດ ຂໍ້ມູນຈະຖືກສົ່ງໄປຫາພະແນກການເງິນເພື່ອອະນຸມັດຂໍ້ມູນ";
const defaultIconName = props.iconName || "mdi:check-decagram";
const defaultIconColor = props.iconColor || "text-green-500";
const defaultButtonText = props.buttonText || "ຢືນຢັນ111";

const handleSuccessConfirm = async () => {
  confirmLoading.value = true;
  try {
    emit('confirm');
  } finally {
    confirmLoading.value = false;
  }
};

const handleModalCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};

const handleVisibilityUpdate = (value: boolean) => {
  emit('update:visible', value);
};
</script>

<template>
  <UiModal
    :title="defaultTitle"
    :visible="visible"
    :confirm-loading="confirmLoading || loading"
    @update:visible="handleVisibilityUpdate"
    @ok="handleSuccessConfirm"
    @cancel="handleModalCancel"
  >
    <div class="text-center py-6">
      <div class="mb-6">
        <Icon
          :icon="defaultIconName"
          :class="[defaultIconColor, 'text-6xl mx-auto mb-4']"
        />
        <h3 class="text-lg font-semibold mb-3 text-gray-800">
          {{ defaultMessage }}
        </h3>
        <p class="text-sm text-gray-600 leading-relaxed px-4">
          {{ defaultDescription }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-center w-full">
        <UiButton
          @click="handleSuccessConfirm"
          type="primary"
          :loading="confirmLoading || loading"
          class="w-full"
        >
          {{ defaultButtonText }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
