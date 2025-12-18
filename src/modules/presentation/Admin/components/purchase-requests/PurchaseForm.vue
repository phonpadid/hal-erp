<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
// --- IMPORTS ---
import { computed, onMounted, ref } from "vue";
import type { Ref } from "vue";
import { DatePicker, message, Select as ASelect } from "ant-design-vue";
import dayjs from "dayjs";

// --- YOUR SHARED COMPONENTS ---
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UploadModal from "./modal/UploadModal.vue";

// --- HELPERS, STATE, & VALIDATION ---
import { formatPrice, NumberOnly, parsePrice } from "@/modules/shared/utils/format-price";
import { formState, moreFunction } from "./formstate";
import { CreatePRValidate } from "../../views/purchase-requests/validation/create-purchase-request";
import { useI18n } from "vue-i18n";
import { uploadFile } from "@/modules/application/services/upload.service";

// --- ENTITY & DTO TYPES ---
import type { UnitEntity } from "@/modules/domain/entities/unit.entity";
import type {
  CreatePurchaseRequestDTO,
  UpdatePurchaseRequestDTO,
} from "@/modules/application/dtos/purchase-requests/purchase-request.dto";

// --- STORES ---
import { useUnitStore } from "../../stores/unit.store";
import { usePurchaseRequestsStore } from "../../stores/purchase_requests/purchase-requests.store";
import { departmenUsertStore } from "../../stores/departments/department-user.store";
import { useQuotaStore } from "../../stores/quotas/quota.store";
import { useVendorStore } from "../../stores/vendors/vendor.store";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { Icon } from "@iconify/vue";

// --- SCRIPT LOGIC ---
const { t } = useI18n();
const formRef = ref();
const loading = ref<boolean>(false);
const uploadLoading = ref<boolean>(false);
const createModalVisible = ref(false);
const currentUploadIndex = ref<number>(0);
const props = defineProps<{
  documentTypeId?: number | string;
  isEditing?: boolean;
  requestId?: string;
}>();

const purchaseRequestStore = usePurchaseRequestsStore();
const unitStore = useUnitStore();
const userLocal = departmenUsertStore();
const quotaStore = useQuotaStore();
const vendorStore = useVendorStore();

const units: Ref<UnitEntity[]> = ref([]);
const selectedQuotaId = ref<string>("");
const selectedVendorId = ref<string>("");
const vendors = computed(() => vendorStore.activeVendors);

// Store quota selections for each item
const itemQuotaSelections = ref<Record<number, string>>({});

// Helper function to extract year from date string
const extractYear = (dateString: string): string => {
  if (!dateString) return "N/A";
  // Handle formats like "2025-01-01" or full datetime
  const yearMatch = dateString.match(/(\d{4})/);
  return yearMatch ? yearMatch[1] : dateString;
};

// Computed property for quota options showing quota info with product details
const quotaOptions = computed(() => {
  const quotas = quotaStore.quotas;
  return quotas.map(quota => {
    const quotaEntity = quota as any;
    const quotaId = quota.getId();
    const qty = quota.getQty();
    const year = extractYear(quota.getYear());

    // Get product info from the enhanced quota entity
    const vendorProduct = quotaEntity.vendor_product;
    const product = quotaEntity.product || vendorProduct?.product;
    const productName = product?.name || `ສິນຄ້າ #${quota.getVendorProductId()}`;
    const price = vendorProduct?.price || "0";

    // console.log("Processing quota:", {
    //   id: quotaId,
    //   productName,
    //   qty,
    //   year,
    //   price
    // });

    return {
      value: quotaId,
      label: `${productName} - ${year} (${qty} ຊຸດ) - ${parseInt(price).toLocaleString()} ກີບ`,
    };
  });
});

// Computed property for selected quota details
const selectedQuotaDetails = computed(() => {
  if (!selectedQuotaId.value) return null;

  const quota = quotaStore.quotas.find(q => q.getId() === selectedQuotaId.value);
  if (!quota) return null;

  const quotaEntity = quota as any;
  const vendorProduct = quotaEntity.vendor_product;
  const product = quotaEntity.product || vendorProduct?.product;

  return {
    id: quota.getId(),
    productName: product?.name || "N/A",
    productDescription: product?.description || "",
    qty: quota.getQty(),
    year: extractYear(quota.getYear()),
    price: vendorProduct?.price || "0",
    productType: product?.product_type?.name || "",
  };
});

// Handle quota selection for specific item
const handleItemQuotaChange = (index: number, quotaId: string) => {
  itemQuotaSelections.value[index] = quotaId;

  if (quotaId) {
    const quota = quotaStore.quotas.find(q => q.getId() === quotaId);
    if (quota) {
      const quotaEntity = quota as any;
      const vendorProduct = quotaEntity.vendor_product;
      const product = quotaEntity.product || vendorProduct?.product;

      // Auto-fill item data from quota
      const item = formState.value.addMore[index];
      item.title = product?.name || "";
      item.unit_id = product?.unit_id || "";
      // Convert price from string to number for validation
      const priceString = vendorProduct?.price || "0";
      const cleanedPrice = priceString.replace(/,/g, ''); // Remove commas if any
      item.price = parseFloat(cleanedPrice) || 0;

      // console.log(`Auto-filled item ${index} with quota data:`, {
      //   title: item.title,
      //   unit_id: item.unit_id,
      //   price: item.price
      // });
    }
  }
};

// Get quota details for specific item
const getItemQuotaDetails = (index: number) => {
  const quotaId = itemQuotaSelections.value[index];
  if (!quotaId) return null;

  const quota = quotaStore.quotas.find(q => q.getId() === quotaId);
  if (!quota) return null;

  const quotaEntity = quota as any;
  const vendorProduct = quotaEntity.vendor_product;
  const product = quotaEntity.product || vendorProduct?.product;

  return {
    id: quota.getId(),
    productName: product?.name || "N/A",
    productDescription: product?.description || "",
    qty: quota.getQty(),
    year: extractYear(quota.getYear()),
    price: vendorProduct?.price || "0",
    productType: product?.product_type?.name || "",
  };
};

// Check if item has quota selected
const hasItemQuota = (index: number) => {
  return !!itemQuotaSelections.value[index];
};

const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const departmentUser = userLocal.currentDpmUser;

onMounted(async () => {
  // console.log("PurchaseForm: Starting data fetch...");
  await unitStore.fetchUnits({ page: 1, limit: 1000 });

  // Fetch vendors
  await vendorStore.fetchVendors({ page: 1, limit: 1000 });

  // console.log("PurchaseForm: Fetching quotas...");
  try {
    await quotaStore.fetchQuotas({ page: 1, limit: 1000 });
    // console.log("PurchaseForm: Quotas fetched successfully:", quotaStore.quotas.length);
  } catch (error) {
    console.error("PurchaseForm: Failed to fetch quotas:", error);
  }

  units.value = unitStore.activeUnits;

  if (props.isEditing && props.requestId) {
    const existingData = await purchaseRequestStore.fetchById(props.requestId);
    if (existingData) {
      populateForm(existingData);
    }
  }
});

const populateForm = (entity: PurchaseRequestEntity) => {
  const dateString = entity.getExpiredDate();
  if (dateString) {
    formState.value.expired_date = dayjs(dateString, "DD-MM-YYYY HH:mm:ss");
  }

  formState.value.purpose = entity.getPurposes();
  formState.value.addMore = entity.getItems().map((item) => ({
    id: item.getId(),
    title: item.getTitle(),
    count: item.getQuantity().toString(),
    unit_id: Number(item.getUnitId()),
    price: item.getPrice(),
    totalPrice: item.getTotalPrice(),
    remark: item.getRemark(),
    file_name: item.getFileName() || "",
    images: item.file_name_url ? [item.file_name_url] : [],
  }));
};

const removeMore = (index: number) => {
  if (formState.value.addMore.length > 1) {
    formState.value.addMore[index].images.forEach((imageUrl) => {
      if (imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    });
    formState.value.addMore.splice(index, 1);
  }
};

const modalUpload = (index: number) => {
  currentUploadIndex.value = index;
  createModalVisible.value = true;
};

const handleImageUpload = async (files: File[]) => {
  if (files.length === 0) return;
  const file = files[0];
  const uploadData = new FormData();
  uploadData.append("image", file);

  uploadLoading.value = true;
  try {
    const response = await uploadFile(uploadData);
    const filename = response.fileName;

    if (filename) {
      const currentItem = formState.value.addMore[currentUploadIndex.value];
      currentItem.file_name = filename;
      const url = URL.createObjectURL(file);
      currentItem.images.push(url);
      createModalVisible.value = false;
    } else {
      throw new Error("Filename not found in API response.");
    }
  } catch (error) {
    console.error("File upload failed:", error);
    message.error("ອັບໂຫລດຮູບພາບບໍ່ສຳເລັດ");
  } finally {
    uploadLoading.value = false;
  }
};

const deleteImage = (itemIndex: number, imageIndex: number) => {
  const item = formState.value.addMore[itemIndex];
  const imageUrl = item.images[imageIndex];
  if (imageUrl.startsWith("blob:")) {
    URL.revokeObjectURL(imageUrl);
  }
  item.images.splice(imageIndex, 1);
  item.file_name = "";
};

function validateForm(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!formRef.value) return resolve(false);
    formRef.value
      .validate()
      .then(() => resolve(true))
      .catch((err: any) => {
        console.error("Validation errors:", err);
        resolve(false);
      });
  });
}

function getFormData() {
  return formState.value;
}


// Fetch quotas by selected vendor
const fetchQuotasByVendor = async (vendorId: string) => {
  if (!vendorId) {
    // If no vendor selected, fetch all quotas
    await quotaStore.fetchQuotas({ page: 1, limit: 1000 });
    return;
  }

  try {
    // console.log("Fetching quotas for vendor:", vendorId);
    await quotaStore.fetchQuotas({
      page: 1,
      limit: 1000,
      vendor_id: Number(vendorId)
    });
    // console.log("Quotas fetched for vendor:", quotaStore.quotas.length);
  } catch (error) {
    console.error("Error fetching quotas for vendor:", error);
    message.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນ Quota ຕາມຮ້ານຄ້ານີ້ໄດ້");
  }
};

// Handle vendor selection change
const handleVendorChange = (vendorId: string) => {
  selectedVendorId.value = vendorId;
  selectedQuotaId.value = ""; // Reset quota selection when vendor changes
  fetchQuotasByVendor(vendorId);
};

async function handleSave(): Promise<any | null> {
  loading.value = true;
  const isValid = await validateForm();
  if (!isValid) {
    message.error(t("purchase-rq.msg.validate_fail"));
    loading.value = false;
    return null;
  }

  const formData = getFormData();
  if (!formData.expired_date) {
    message.error("Expired Date is required.");
    loading.value = false;
    return null;
  }

  // Validate per-item quota selection
  if (!props.isEditing) {
    const itemsWithoutQuota = formData.addMore
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => !itemQuotaSelections.value[index]);

    if (itemsWithoutQuota.length > 0) {
      message.error("ກະລຸນາເລືອກ Quota ສິນຄ້າ ສຳລັບທຸກລາຍການ");
      loading.value = false;
      return null;
    }
  }

  // console.log("Creating itemsPayload with per-item quota selections");

  const itemsPayload = formData.addMore.map((item, index) => ({
    ...(item.id && { id: item.id }),
    title: item.title,
    file_name: item.file_name || "",
    quantity: item.count ? parseInt(item.count, 10) : 0,
    price: item.price || 0,
    remark: item.remark,
    unit_id: item.unit_id!,
    quota_company_id: parseInt(itemQuotaSelections.value[index]) || 0,
  }));

  // console.log("Final itemsPayload:", itemsPayload);

  try {
    let result;
    if (props.isEditing && props.requestId) {
      // --- UPDATE LOGIC ---
      const updatePayload: UpdatePurchaseRequestDTO = {
        expired_date: dayjs(formData.expired_date).format("YYYY-MM-DD"),
        purposes: formData.purpose,
        purchase_request_items: itemsPayload,
      };
      result = await purchaseRequestStore.update(props.requestId, updatePayload);
    } else {
      // --- CREATE LOGIC ---
      if (!props.documentTypeId) {
        message.error("Document Type is required.");
        loading.value = false;
        return null;
      }
      const createPayload: CreatePurchaseRequestDTO = {
        expired_date: dayjs(formData.expired_date).format("YYYY-MM-DD"),
        purposes: formData.purpose,
        document: {
          description: formData.purpose,
          documentTypeId: Number(props.documentTypeId),
        },
        purchase_request_items: itemsPayload,
      };
      result = await purchaseRequestStore.create(createPayload);
    }

    if (result) {
      return result;
    } else {
      message.error(purchaseRequestStore.error || "ເກີດຂໍ້ຜິດພາດ");
      return null;
    }
  } catch (err) {
    console.error("Save/Update failed:", err);
    message.error("ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່");
    return null;
  } finally {
    loading.value = false;
  }
}

const totalPrice = computed(() => {
  return formState.value.addMore.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const itemCount = item.count ? parseInt(item.count, 10) : 0;
    return total + itemPrice * itemCount;
  }, 0);
});

const formattedPrice = (index: number) =>
  computed({
    get() {
      return formatPrice(formState.value.addMore[index].price);
    },
    set(value: string) {
      const digitsOnly = value.replace(/\D/g, "");
      formState.value.addMore[index].price = parsePrice(digitsOnly);
    },
  });

defineExpose({
  validateForm,
  getFormData,
  handleSave,
});
</script>

<template>
  <div class="px-4 mb-[4rem] max-w-7xl mx-auto">
    <!-- Header section -->
    <UiForm ref="formRef" :model="formState" :rules="CreatePRValidate(t)" class="bg-white rounded-lg shadow-sm p-4">
       <div class="flex justify-between items-center mb-2 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
          <Icon icon="mdi:user" class="text-4xl text-blue-600" />
        </div>
        <div class="info">
          <h2 class="text-xl font-semibold mb-1">
            {{ t("purchase-rq.field.proposer", "ໃບສະເໜີ") }}
          </h2>
          <div class="flex items-center gap-2 text-gray-600">
            <span>{{ departmentUser?.getUser()?.getUsername() }}</span>
            <span>•</span>
            <span>{{ userPosition }}</span>
          </div>
        </div>
      </div>

      <UiFormItem
        :label="t('purchase-rq.field.date_rq', 'ເລືອກວັນທີ')"
        name="expired_date"
        required
        class="w-[300px]"
      >
        <DatePicker
          v-model:value="formState.expired_date"
          class="w-full"
          :placeholder="t('purchase-rq.phd.rq_date', 'ເລືອກວັນທີ')"
        />
      </UiFormItem>
    </div>
    <!-- Main Form -->

      <!-- Purpose section -->
      <div class="mb-4">
        <h3 class="text-lg font-medium mb-4">
          {{ t("purchase-rq.field.proposals", "ວັດຖຸປະສົງ") }}
        </h3>
        <Textarea
          v-model="formState.purpose"
          :placeholder="t('purchase-rq.phd.purpose', 'ລະບຸວັດຖຸປະສົງໃນການຂໍຊື້')"
          class="w-full min-h-[100px]"
        />
      </div>

      <!-- Vendor & Quota section -->
      <div class="mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Vendor Selection -->
          <div>
            <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
              <Icon icon="mdi:store" class="text-blue-600" />
              ເລືອກຮ້ານຄ້າ
            </h3>
            <InputSelect
              v-model="selectedVendorId"
              :options="[
                { value: '', label: 'ເລືອກຮ້ານຄ້າ' },
                ...vendors.map(vendor => ({
                  value: vendor.getId(),
                  label: vendor.getname()
                }))
              ]"
              placeholder="ເລືອກຮ້ານຄ້າ"
              class="w-full"
              @update:value="handleVendorChange"
            />
          </div>

          <!-- Quota Selection -->
          <!-- <div>
            <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
              <Icon icon="mdi:package-variant" class="text-green-600" />
              ເລືອກ Quota ສິນຄ້າ (Global)
            </h3>
            <InputSelect
              v-model="selectedQuotaId"
              :options="quotaOptions"
              placeholder="ເລືອກ Quota ສິນຄ້າ"
              class="w-full"
            />
            <div v-if="!selectedVendorId && selectedQuotaId" class="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200">
              <p class="text-sm text-yellow-700">
                <Icon icon="mdi:information" class="inline mr-1" />
                ແນະນຳ: ເລືອກຮ້ານຄ້າເພື່ອສະແດງ Quota ສະເພາະຮ້ານຄ້ານັ້ນໆ
              </p>
            </div>
          </div> -->
        </div>

        <!-- Quota Details Display (Compact) -->
        <div v-if="selectedQuotaDetails" class="mt-6">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-semibold text-gray-800 text-sm flex items-center gap-1">
              <Icon icon="mdi:clipboard-text" class="text-blue-500 text-base" />
              ລາຍລະອຽດ Quota (Global)
            </h4>
          </div>
          <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-3">
            <div class="flex flex-wrap items-center gap-4 text-sm">
              <!-- Product Name -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 font-medium">ສິນຄ້າ:</span>
                <span class="font-semibold text-gray-900">{{ selectedQuotaDetails.productName }}</span>
              </div>

              <!-- Year -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 font-medium">ປີ:</span>
                <span class="font-semibold text-gray-700 bg-white px-2 py-1 rounded">{{ selectedQuotaDetails.year }}</span>
              </div>

              <!-- Quantity -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 font-medium">ຈຳນວນ:</span>
                <span class="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{{ selectedQuotaDetails.qty }} ຊຸດ</span>
              </div>

              <!-- Price -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 font-medium">ລາຄາ:</span>
                <span class="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{{ parseInt(selectedQuotaDetails.price).toLocaleString() }} ກີບ</span>
              </div>

              <!-- Product Type -->
              <div v-if="selectedQuotaDetails.productType" class="flex items-center gap-2">
                <span class="text-xs text-gray-500 font-medium">ປະເພດ:</span>
                <span class="font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded text-xs">{{ selectedQuotaDetails.productType }}</span>
              </div>
            </div>

            <!-- Product Description (if exists) -->
            <div v-if="selectedQuotaDetails.productDescription" class="mt-2 pt-2 border-t border-blue-100">
              <p class="text-xs text-gray-600 italic">{{ selectedQuotaDetails.productDescription }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Items section -->
      <div v-for="(item, index) in formState.addMore" :key="index" class="mb-6">
        <div class="flex justify-between items-center mb-4 bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <Icon icon="mdi:shopping-outline" class="text-blue-600" />
            {{ t("purchase-rq.card_title.title", "ລາຍການ") }} #{{ index + 1 }}
          </h3>
          <div class="flex gap-2">
            <UiButton
              type="primary"
              size="middle"
              class="flex items-center gap-1 px-4"
              @click="moreFunction"
            >
              <Icon icon="mdi:plus" />
              {{ t("purchase-rq.btn.add_title", "ເພີ່ມລາຍການ") }}
            </UiButton>
            <UiButton
              danger
              size="middle"
              class="flex items-center gap-1 px-4"
              :disabled="formState.addMore.length <= 1"
              @click="removeMore(index)"
            >
              <Icon icon="mdi:trash-can-outline" />
              {{ t("purchase-rq.btn.dl_title", "ລົບລາຍການນີ້") }}
            </UiButton>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <!-- Quota Selection Section (Per Item) -->
          <div class="lg:col-span-1">
            <p class="text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
              <Icon icon="mdi:package-variant" class="text-green-600" />
              ເລືອກ Quota ສິນຄ້າ (ລາຍການທີ່ {{ index + 1 }})
            </p>
            <InputSelect
              v-model="itemQuotaSelections[index]"
              :options="quotaOptions"
              placeholder="ເລືອກ Quota ສິນຄ້າ"
              class="w-full mb-3"
              @update:value="(quotaId: string) => handleItemQuotaChange(index, quotaId)"
            />

            <!-- Quota Details Display -->
            <!-- <div v-if="getItemQuotaDetails(index)" class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-3">
              <h4 class="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-1">
                <Icon icon="mdi:clipboard-text" class="text-blue-500 text-base" />
                ລາຍລະອຽດ Quota
              </h4>
              <div class="space-y-1 text-xs">
            
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 font-medium">ສິນຄ້າ:</span>
                  <span class="font-semibold text-gray-900">{{ getItemQuotaDetails(index)?.productName }}</span>
                </div>

           
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 font-medium">ປີ:</span>
                  <span class="font-semibold text-gray-700 bg-white px-2 py-1 rounded">{{ getItemQuotaDetails(index)?.year }}</span>
                </div>

         
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 font-medium">ຈຳນວນ:</span>
                  <span class="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{{ getItemQuotaDetails(index)?.qty }} ຊຸດ</span>
                </div>

      
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 font-medium">ລາຄາ:</span>
                  <span class="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{{ parseInt(getItemQuotaDetails(index)?.price || "0").toLocaleString() }} ກີບ</span>
                </div>

            
                <div v-if="getItemQuotaDetails(index)?.productType" class="flex items-center gap-2">
                  <span class="text-gray-500 font-medium">ປະເພດ:</span>
                  <span class="font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded">{{ getItemQuotaDetails(index)?.productType }}</span>
                </div>
              </div>
            </div> -->

            <!-- Image upload section (moved below quota) -->
            <div class="mt-4">
              <p class="text-sm font-medium mb-3 text-gray-700">
                {{ t("purchase-rq.field.img_example", "ຮູບตົວຢ່າງ") }}
              </p>
              <div class="aspect-video relative rounded-lg overflow-hidden group">
                <template v-if="item.images.length > 0">
                  <a-image
                    :src="item.images[0]"
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      class="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      @click="modalUpload(index)"
                      title="Change image"
                    >
                      <Icon icon="mdi:camera" class="text-xl text-gray-700" />
                    </button>
                    <button
                      class="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      @click="deleteImage(index, 0)"
                      title="Delete image"
                    >
                      <Icon icon="mdi:trash-can" class="text-xl text-red-600" />
                    </button>
                  </div>
                </template>
                <div
                  v-else
                  class="w-full h-full flex flex-col justify-center items-center text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  @click="modalUpload(index)"
                >
                  <Icon icon="mdi:cloud-upload" class="text-4xl text-blue-600 mb-2" />
                  <p class="text-sm font-medium">ອັບໂຫລດຮູບພາບ</p>
                  <p class="text-xs text-gray-500">ຮູບຕົວຢ່າງຂອງສິນຄ້າ (ຖ້າມີ)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Form fields -->
          <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <UiFormItem
              :label="t('purchase-rq.field.title', 'ຊື່ລາຍການ')"
              :name="['addMore', index.toString(), 'title']"
              required
            >
              <UiInput
                v-model="item.title"
                :placeholder="t('purchase-rq.phd.title', 'ເຊັ່ນ Computer')"
                :disabled="hasItemQuota(index)"
              />
            </UiFormItem>

            <UiFormItem
              :label="t('purchase-rq.field.qty', 'ຈຳນວນ')"
              :name="['addMore', index.toString(), 'count']"
              required
            >
              <UiInput
                v-model="item.count"
                :placeholder="t('purchase-rq.phd.qty', 'ເຊັ່ນ 5')"
                @keypress="NumberOnly"
              />
            </UiFormItem>

            <UiFormItem
              :label="t('purchase-rq.field.unit', 'ຫົວໜ່ວຍ')"
              :name="['addMore', index.toString(), 'unit_id']"
              required
            >
              <ASelect
                v-model:value="item.unit_id"
                :placeholder="t('purchase-rq.phd.unit', 'ເລືອກຫົວໜ່ວຍ')"
                :options="units.map((unit) => ({ value: unit.getId(), label: unit.getName() }))"
                :disabled="hasItemQuota(index)"
              />
            </UiFormItem>

            <UiFormItem
              :label="t('purchase-rq.field.price', 'ລາຄາ')"
              :name="['addMore', index.toString(), 'price']"
              required
            >
              <UiInput
                v-model="formattedPrice(index).value"
                :placeholder="t('purchase-rq.phd.price', 'ເຊັ່ນ 25,000,000')"
                @keypress="NumberOnly"
                :disabled="hasItemQuota(index)"
              />
            </UiFormItem>

            <UiFormItem
              class="col-span-2"
              :label="t('purchase-rq.field.remark', 'ໝາຍເຫດ')"
              :name="['addMore', index.toString(), 'remark']"
            >
              <UiInput
                v-model="item.remark"
                :placeholder="t('purchase-rq.phd.remark', 'ລາຍລະອຽດເພີ່ມເຕີມ (ຖ້າມີ)')"
              />
            </UiFormItem>
          </div>
        </div>
      </div>

      <!-- Total section -->
      <div class="flex justify-end items-center mt-8 pt-4 border-t">
        <div class="bg-gray-50 px-6 py-4 rounded-lg">
          <p class="text-gray-600 mb-1">{{ t("purchase-rq.field.amount", "ຍອດລວມສຸດທິ") }}</p>
          <p class="text-red-600 font-bold text-2xl">{{ formatPrice(totalPrice) }} LAK</p>
        </div>
      </div>
    </UiForm>
  </div>

  <UploadModal
    :visible="createModalVisible"
    :loading="uploadLoading"
    @update:visible="createModalVisible = $event"
    @upload="handleImageUpload"
  />
</template>