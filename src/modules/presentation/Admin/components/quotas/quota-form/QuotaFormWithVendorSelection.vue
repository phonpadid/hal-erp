<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { FormInstance } from "ant-design-vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useVendorProductStore } from "@/modules/presentation/Admin/stores/vendor-products/vendor-product.store";
import VendorSelectionModal from "../vendor-selection/VendorSelectionModal.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quota?: any | null;
  isEditMode?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  loading: false,
});

const emit = defineEmits<{
  submit: [data: {
    qty: number;
    vendor_product_id: number;
    year: string;
  }];
  cancel: [];
}>();

const { t } = useI18n();
const { error } = useNotification();

// Stores
const vendorProductStore = useVendorProductStore();

// Form reference
const formRef = ref<FormInstance>();

// Form state
const formData = ref({
  vendor_product_id: null as number | null,
  qty: null as number | null,
  year: new Date().getFullYear().toString(),
});

// Vendor selection state
const showVendorSelectionModal = ref(false);
const selectedVendor = ref<{ id: number; name: string } | null>(null);

// Computed properties
const vendorProductOptions = computed(() => {
  return vendorProductStore.vendorProductOptions.map((option) => ({
    value: option.value,
    label: `${option.entity.getProductName()}`, // Show only product name since vendor is already selected
  }));
});

const isLoading = computed(() => vendorProductStore.loading);

// Validation rules
const rules = computed(() => ({
  vendor_product_id: [
    { required: true, message: "ກະລຸນາເລືອກ Vendor Product", trigger: "change" },
  ],
  qty: [
    { required: true, message: "ກະລຸນາປ້ອນຈຳນວນ", trigger: "blur" },
    { type: "number", min: 1, message: "ຈຳນວນຕ້ອງມາກກວ່າ 0", trigger: "blur" },
  ],
  year: [
    { required: true, message: "ກະລຸນາປ້ອນປີ", trigger: "blur" },
    {
      pattern: /^(19|20)\d{2}$/,
      message: "ຮູບແບບປີບໍ່ຖືກຕ້ອງ",
      trigger: "blur",
    },
  ],
}));

// Watch for changes in props
watch(
  () => props.quota,
  (newQuota) => {
    if (newQuota) {
      formData.value = {
        vendor_product_id: newQuota.vendor_product_id,
        qty: newQuota.qty,
        year: newQuota.year,
      };
      // Note: In edit mode, you might want to load the vendor info based on the vendor_product_id
    }
  },
  { immediate: true }
);

// Watch for selected vendor changes
watch(
  selectedVendor,
  async (newVendor) => {
    if (newVendor) {
      // Load vendor products for the selected vendor
      await loadVendorProducts(newVendor.id);
      // Reset the vendor_product_id selection when vendor changes
      formData.value.vendor_product_id = null;
    }
  }
);

// Load vendor products for specific vendor
const loadVendorProducts = async (vendorId: number) => {
  try {
    await vendorProductStore.fetchVendorProducts({
      vendor_id: vendorId,
      page: 1,
      limit: 1000, // Load all products for this vendor
    });
  } catch (err) {
    console.error("Failed to load vendor products:", err);
    error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສິນค้าໄด้", "");
  }
};

// Show vendor selection modal
const showVendorModal = () => {
  showVendorSelectionModal.value = true;
};

// Handle vendor selection
const handleVendorSelected = (vendor: { id: number; name: string }) => {
  selectedVendor.value = vendor;
};

// Clear vendor selection
const clearVendorSelection = () => {
  selectedVendor.value = null;
  formData.value.vendor_product_id = null;
  vendorProductStore.vendorProducts = []; // Clear vendor products
};

// Form methods
const submitForm = async () => {
  try {
    await formRef.value?.validate();

    if (!formData.value.vendor_product_id || !formData.value.qty || !formData.value.year) {
      error("ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ", "");
      return;
    }

    emit("submit", {
      qty: formData.value.qty,
      vendor_product_id: formData.value.vendor_product_id,
      year: formData.value.year,
    });
  } catch (err) {
    console.error("Form validation failed:", err);
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  if (props.quota) {
    formData.value = {
      vendor_product_id: props.quota.vendor_product_id,
      qty: props.quota.qty,
      year: props.quota.year,
    };
  } else {
    formData.value = {
      vendor_product_id: null,
      qty: null,
      year: new Date().getFullYear().toString(),
    };
  }
  selectedVendor.value = null;
};

const handleCancel = () => {
  resetForm();
  emit("cancel");
};

// Initialize
onMounted(async () => {
  // Don't load all vendor products on mount, wait for vendor selection
});
</script>

<template>
  <a-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    layout="vertical"
    @finish="submitForm"
  >
    <!-- Vendor Selection -->
    <a-form-item label="ຮ້ານຄ້າ" required>
      <div class="space-y-2">
        <a-button
          type="default"
          @click="showVendorModal"
          :style="{ width: '100%' }"
        >
          {{ selectedVendor ? `ຮ້ານ: ${selectedVendor.name}` : 'ເລືອກຮ້ານຄ້າ...' }}
        </a-button>

        <div v-if="selectedVendor" class="flex items-center justify-between p-2 bg-green-50 rounded">
          <span class="text-green-700">
            <strong>ຮ້ານຄ້າ:</strong> {{ selectedVendor.name }}
          </span>
          <a-button type="text" size="small" danger @click="clearVendorSelection">
            ລຶບ
          </a-button>
        </div>
      </div>
    </a-form-item>

    <!-- Vendor Product Selection -->
    <a-form-item label="ສິນค้า" name="vendor_product_id">
      <InputSelect
        v-model="formData.vendor_product_id"
        :options="vendorProductOptions"
        :loading="isLoading"
        :disabled="!selectedVendor"
        placeholder="ກະລຸນາເລືອກຮ້ານຄ້າກ່ອນ"
        size="large"
        style="width: 100%"
      />
      <div v-if="selectedVendor" class="text-sm text-gray-500 mt-1">
        ສະແດງສິນค้าຂອງ: {{ selectedVendor.name }}
      </div>
    </a-form-item>

    <!-- Quantity -->
    <a-form-item :label="t('quota.form.quantity')" name="qty">
      <a-input-number
        v-model:value="formData.qty"
        :placeholder="t('quota.placeholder.enterQuantity')"
        :min="1"
        style="width: 100%"
      />
    </a-form-item>

    <!-- Year -->
    <a-form-item :label="t('quota.form.year')" name="year">
      <a-input
        v-model:value="formData.year"
        :placeholder="t('quota.placeholder.enterYear')"
        :maxlength="4"
      />
    </a-form-item>

    <!-- Form Actions -->
    <a-form-item class="mb-0">
      <div class="flex justify-end gap-2">
        <a-button @click="handleCancel">
          {{ t("button.cancel") }}
        </a-button>
        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
          :disabled="!selectedVendor"
        >
          {{ isEditMode ? t("button.update") : t("button.create") }}
        </a-button>
      </div>
    </a-form-item>
  </a-form>

  <!-- Vendor Selection Modal -->
  <VendorSelectionModal
    v-model:visible="showVendorSelectionModal"
    @vendor-selected="handleVendorSelected"
  />
</template>

<style scoped>
.ant-form-item {
  margin-bottom: 16px;
}

.ant-form-item.mb-0 {
  margin-bottom: 0;
}
</style>