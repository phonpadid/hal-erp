<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { FormInstance } from "ant-design-vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";
import { useVendorProductStore } from "@/modules/presentation/Admin/stores/vendor-products/vendor-product.store";
import { useQuotaStore } from "@/modules/presentation/Admin/stores/quotas/quota.store";
import axios from "axios";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";

interface Props {
  visible: boolean;
  loading?: boolean;
  quota?: any | null;
  isEditMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  loading: false,
});

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}>();

const { t } = useI18n();
const { error, success } = useNotification();

// Stores
const vendorStore = useVendorStore();
const vendorProductStore = useVendorProductStore();
const quotaStore = useQuotaStore();

// Form reference
const formRef = ref<FormInstance>();

// Form state
const formData = ref({
  vendor_id: null as number | null,
  vendor_product_id: null as string | null,
  qty: "" as string | number,
  year: new Date().getFullYear().toString(),
});

// Loading states
const submitLoading = ref(false);
const loadingProducts = ref(false);

// Computed properties
const vendorOptions = computed(() => {
  return vendorStore.activeVendors.map((vendor) => ({
    value: Number(vendor.getId()),
    label: vendor.getname(),
  }));
});

const vendorProductOptions = computed(() => {
  return vendorProductStore.vendorProducts.map((product) => ({
    value: product.getId(),
    label: `${product.getProductName()}`,
    entity: product,
  }));
});

const selectedVendorProduct = computed(() => {
  if (!formData.value.vendor_product_id) return null;
  return vendorProductStore.vendorProducts.find(
    (product) => product.getId() === formData.value.vendor_product_id
  );
});

const isLoading = computed(() => vendorStore.loading || loadingProducts.value);

// Validation rules
const rules = computed(() => ({
  vendor_id: [
    { required: true, message: "ກະລຸນາເລືອກຮ້ານຄ້າ", trigger: "change" },
  ],
  vendor_product_id: [
    { required: true, message: "ກະລຸນາເລືອກສິນค้า", trigger: "change" },
  ],
  qty: [
    { required: true, message: "ກະລຸນາປ້ອນຈຳນວນ", trigger: "blur" },
    {
      validator: (_rule: any, value: any) => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 1) {
          return Promise.reject("ຈຳນວນຕ້ອງມາກກວ່າ 0");
        }
        return Promise.resolve();
      },
      trigger: "blur",
    },
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

// Watch for modal visibility
watch(
  () => props.visible,
  async (newVisible) => {
    if (newVisible) {
      await initializeForm();
    }
  },
  { immediate: true }
);

// Watch for vendor selection change
watch(
  () => formData.value.vendor_id,
  async (newVendorId) => {
    if (newVendorId) {
      await loadVendorProducts(newVendorId);
      // Reset product selection when vendor changes
      formData.value.vendor_product_id = null;
    } else {
      // Clear products when no vendor is selected
      vendorProductStore.vendorProducts = [];
      formData.value.vendor_product_id = null;
    }
  }
);

// Initialize form
const initializeForm = async () => {
  try {
    // Load vendors
    await vendorStore.fetchVendors({ page: 1, limit: 1000 });

    // Reset form
    if (props.isEditMode && props.quota) {
      // Load form data for edit mode
      formData.value = {
        vendor_id: props.quota.vendor_id ?? null,
        vendor_product_id: props.quota.vendor_product_id ?? null,
        qty: props.quota.qty ?? "",
        year: props.quota.year ?? new Date().getFullYear().toString(),
      };
    } else {
      // Reset for create mode
      formData.value = {
        vendor_id: null,
        vendor_product_id: null,
        qty: "",
        year: new Date().getFullYear().toString(),
      };
    }
  } catch (err) {
    console.error("Failed to initialize form:", err);
    error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້", "");
  }
};

// Load vendor products for specific vendor
const loadVendorProducts = async (vendorId: number) => {
  try {
    loadingProducts.value = true;
    await vendorProductStore.fetchVendorProducts({
      vendor_id: vendorId,
      page: 1,
      limit: 1000,
    });
  } catch (err) {
    console.error("Failed to load vendor products:", err);
    error("ບໍ່ສາມາດໂຫຼດສິນค้าຂອງຮ້ານຄ້ານີ້ໄດ້", "");
  } finally {
    loadingProducts.value = false;
  }
};

// Form submission
const submitForm = async () => {
  try {
    submitLoading.value = true;
    const valid = await formRef.value?.validate();
    if (!valid) return;

    if (!formData.value.vendor_product_id || !formData.value.qty || !formData.value.year) {
      error("ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ", "");
      return;
    }

    // Prepare data for API
    const submitData = {
      qty: Number(formData.value.qty),
      vendor_product_id: Number(formData.value.vendor_product_id),
      year: formData.value.year,
    };

    console.log("Form submission - Submitting quota data:", submitData);

    // Call API based on mode
    if (props.isEditMode && props.quota?.id) {
      // Update existing quota
      console.log("Form submission - Update mode for quota ID:", props.quota.id);
      const updateData = {
        id: props.quota.id.toString(),
        ...submitData,
      };
      console.log("Form submission - Update data:", updateData);
      const updatedQuota = await quotaStore.updateQuota(props.quota.id.toString(), updateData);
      console.log("Form submission - Updated quota successfully:", updatedQuota);
      success("ອັບເດດສຳເລັດ");
    } else {
      // Create new quota
      console.log("Form submission - Create mode with data:", submitData);
      const newQuota = await quotaStore.createQuota(submitData);
      console.log("Form submission - Created quota successfully:", newQuota);
      success("ສ້າງສຳເລັດ");
    }

    // Close modal and emit success
    emit("update:visible", false);
    emit("success");
  } catch (err) {
    console.error("Form submission failed:", err);
  } finally {
    submitLoading.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  emit("update:visible", false);
};


onMounted(async () => {
  // Preload vendors when component mounts
  await vendorStore.fetchVendors({ page: 1, limit: 1000 });
});
</script>

<template>
  <UiModal
    :visible="visible"
    :title="isEditMode ? 'ແກ້ໄຂ Quota' : 'ສ້າງ Quota ໃຫມ່'"
    width="700px"
    @update:visible="emit('update:visible', $event)"
  >
    <UiForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
    >
      <div class="space-y-4">
        <!-- Vendor Selection -->
        <UiFormItem
          label="ເລືອກຮ້ານຄ້າ"
          name="vendor_id"
          required
        >
          <InputSelect
            v-model="formData.vendor_id"
            :options="vendorOptions"
            :loading="isLoading"
            placeholder="ເລືອກຮ້ານຄ້າ..."
            size="large"
            style="width: 100%"
          />
        </UiFormItem>

        <!-- Product Selection -->
        <UiFormItem
          label="ເລືອກສິນຄ້າ"
          name="vendor_product_id"
          required
        >
          <InputSelect
            v-model="formData.vendor_product_id"
            :options="vendorProductOptions"
            :loading="loadingProducts"
            :disabled="!formData.vendor_id"
            :placeholder="!formData.vendor_id ? 'ກະລຸນາເລືອກຮ້ານຄ້າກ່ອນ' : 'ເລືອກສິນຄ້າ...'"
            size="large"
            style="width: 100%"
          />
        </UiFormItem>

        <!-- Product Details -->
        <div v-if="selectedVendorProduct" class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">ລາຍລະອຽດສິນค้า:</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-blue-700">ຮ້ານຄ້າ:</span>
              <span class="text-blue-900">{{ selectedVendorProduct.getVendorName() || '-' }}</span>
            </div>
            <div>
              <span class="font-medium text-blue-700">ສິນค้า:</span>
              <span class="text-blue-900">{{ selectedVendorProduct.getProductName() || '-' }}</span>
            </div>
            <div v-if="selectedVendorProduct.getVendorId()">
              <span class="font-medium text-blue-700">Vendor ID:</span>
              <span class="text-blue-900">{{ selectedVendorProduct.getVendorId() }}</span>
            </div>
            <div v-if="selectedVendorProduct.getProductId()">
              <span class="font-medium text-blue-700">Product ID:</span>
              <span class="text-blue-900">{{ selectedVendorProduct.getProductId() }}</span>
            </div>
          </div>
        </div>

        <!-- Quantity -->
        <UiFormItem
          label="ຈຳນວນ"
          name="qty"
          required
        >
          <UiInput
            v-model="formData.qty"
            type="number"
            :min="1"
            placeholder="ປ້ອນຈຳນວນ..."
            size="large"
          />
        </UiFormItem>

        <!-- Year -->
        <UiFormItem
          label="ປີ"
          name="year"
          required
        >
          <UiInput
            v-model="formData.year"
            placeholder="ປ້ອນປີ..."
            size="large"
          />
        </UiFormItem>
      </div>
    </UiForm>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UiButton @click="handleCancel">
          {{ t("button.cancel") }}
        </UiButton>
        <UiButton
          type="primary"
          :loading="submitLoading"
          :disabled="!formData.vendor_id || !formData.vendor_product_id"
          @click="submitForm"
        >
          {{ isEditMode ? t("button.update") : t("button.save") }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}
</style>