<script setup lang="ts" name="VendorSelectionModal.vue">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";

const { t } = useI18n();
const vendorStore = useVendorStore();
const { success, warning } = useNotification();

const props = defineProps<{
  visible: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "vendor-selected", vendor: { id: number; name: string }): void;
}>();

const selectedVendorId = ref<number | null>(null);
const submitLoading = ref(false);

// Computed properties for vendor options
const vendorOptions = computed(() => {
  return vendorStore.activeVendors.map((vendor) => ({
    value: Number(vendor.getId()),
    label: vendor.getname(),
  }));
});

const isLoading = computed(() => vendorStore.loading);

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      resetForm();
      loadVendors();
    }
  },
  { immediate: true }
);

const resetForm = () => {
  selectedVendorId.value = null;
};

const handleCancel = () => {
  emit("update:visible", false);
  resetForm();
};

const loadVendors = async () => {
  try {
    await vendorStore.fetchVendors({ page: 1, limit: 1000 });
  } catch (err) {
    console.error("Failed to load vendors:", err);
    warning("ຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຮ້ານຄ້າໄດ້");
  }
};

const selectVendor = () => {
  if (!selectedVendorId.value) {
    warning("ຂໍ້ຜິດພາດ", "ກະລຸນາເລືອກຮ້ານຄ້າ");
    return;
  }

  const selectedVendor = vendorStore.activeVendors.find(
    (vendor) => Number(vendor.getId()) === selectedVendorId.value
  );

  if (selectedVendor) {
    emit("vendor-selected", {
      id: Number(selectedVendor.getId()),
      name: selectedVendor.getname(),
    });
    emit("update:visible", false);
    resetForm();
  }
};

onMounted(async () => {
  // Preload vendors when component is created
  await loadVendors();
});
</script>

<template>
  <UiModal
    :visible="visible"
    title="ເລືອກຮ້ານຄ້າ"
    width="500px"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <div class="mb-4">
        <p class="text-gray-600 mb-2">
          ກະລຸນາເລືອກຮ້ານຄ້າເພື່ອສະແດງສິນຄ້າທີ່ມີໃນຮ້ານຄ້ານັ້ນ
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          ເລືອກຮ້ານຄ້າ <span class="text-red-500">*</span>
        </label>
        <InputSelect
          v-model="selectedVendorId"
          :options="vendorOptions"
          :loading="isLoading"
          placeholder="ເລືອກຮ້ານຄ້າ..."
          size="large"
          style="width: 100%"
        />
      </div>

      <div v-if="selectedVendorId" class="mt-4 p-4 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-800">
          <strong>ຮ້ານຄ້າທີ່ເລືອກ:</strong>
          {{
            vendorOptions.find((option) => option.value === selectedVendorId)?.label ||
            "-"
          }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton @click="handleCancel">
          {{ t("button.cancel") }}
        </UiButton>
        <UiButton
          type="primary"
          :loading="submitLoading"
          :disabled="!selectedVendorId"
          @click="selectVendor"
        >
          ເລືອກຮ້ານຄ້າ
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>