<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  visible: boolean;
  title?: string;
  message?: string;
  description?: string;
  actionType?: 'approve' | 'reject' | undefined;
}>();

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "close"): void;
  (e: "confirm"): void;
}>();

const { t } = useI18n();

const modalConfig = computed(() => {
  const isApprove = props.actionType === 'approve';
  const isReject = props.actionType === 'reject';

  // Default to approve if actionType is undefined (fallback)
  const useApproveStyle = isApprove || (!isApprove && !isReject);

  return {
    title: props.title || (useApproveStyle ? 'ການອະນຸມັດສຳເລັດ!' : 'ການປະຕິເສດສຳເລັດ!'),
    message: props.message || (useApproveStyle ? 'ອະນຸມັດເອກະສານສຳເລັດແລ້ວ' : 'ປະຕິເສດເອກະສານສຳເລັດແລ້ວ'),
    description: props.description || (useApproveStyle
      ? 'ເອກະສານນີ້ຖືກອະນຸມັດໂດຍລາຍເຊັນດິຈິຕອລຂອງທ່ານແລ້ວ ຂັ້ນຕອນຕໍ່ໄປຈະດຳເນີນຕາມຂັ້ນຕອນຕໍ່ໄປ'
      : 'ເອກະສານນີ້ຖືກປະຕິເສດແລ້ວ ຂໍ້ມູນຈະຖືກສົ່ງໃຫ້ຜູ້ທີ່ກ່ຽວພວກຂ້າມະຊາດຮູ້'
    ),
    bgColor: useApproveStyle ? 'bg-green-50' : 'bg-red-50',
    borderColor: useApproveStyle ? 'border-green-200' : 'border-red-200',
    textColor: useApproveStyle ? 'text-green-800' : 'text-red-800',
    icon: useApproveStyle ? 'ant-design:check-circle-outlined' : 'ant-design:close-circle-outlined',
    iconColor: useApproveStyle ? 'text-green-500' : 'text-red-500'
  };
});

const handleConfirm = () => {
  emit("confirm");
  emit("update:visible", false);
};
</script>

<template>
  <UiModal
    :visible="visible"
    :width="500"
    :centered="true"
    :title-icon="modalConfig.icon"
    :icon-color="modalConfig.iconColor"
    :title="modalConfig.title"
    :ok-text="'ສຳເລັດ'"
    :cancel-text="'ດຳເນີນຕໍ່'"
    :ok-type="actionType === 'approve' ? 'primary' : 'default'"
    class="success-modal"
    @ok="handleConfirm"
    @cancel="emit('update:visible', false)"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="text-center py-6 px-4">
      <!-- Success Icon -->
      <div class="flex justify-center mb-6">
        <div
          :class="[
            'w-20 h-20 rounded-full flex items-center justify-center',
            modalConfig.bgColor,
            modalConfig.borderColor,
            'border-2'
          ]"
        >
          <Icon
            :icon="modalConfig.icon"
            :class="['text-4xl', modalConfig.iconColor]"
          />
        </div>
      </div>

      <!-- Success Message -->
      <p class="text-lg font-medium mb-3 text-gray-700">
        {{ modalConfig.message }}
      </p>

      <!-- Description -->
      <p class="text-sm text-gray-600 leading-relaxed">
        {{ modalConfig.description }}
      </p>
    </div>
  </UiModal>
</template>

<style scoped>
.success-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

.success-modal :deep(.ant-modal-body) {
  padding: 0;
}
</style>