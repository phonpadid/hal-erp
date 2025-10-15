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

const units: Ref<UnitEntity[]> = ref([]);

const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const departmentUser = userLocal.currentDpmUser;

onMounted(async () => {
  await unitStore.fetchUnits({ page: 1, limit: 1000 });
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
      // message.success("ອັບໂຫລດຮູບພາບສຳເລັດ");
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

  const itemsPayload = formData.addMore.map((item) => ({
    ...(item.id && { id: item.id }),
    title: item.title,
    file_name: item.file_name || "",
    quantity: item.count ? parseInt(item.count, 10) : 0,
    price: item.price || 0,
    remark: item.remark,
    unit_id: item.unit_id!,
  }));

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
      // message.success(props.isEditing ? "ອັບເດດສຳເລັດ!" : "ສ້າງສຳເລັດ!");
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

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Image upload section -->
          <div class="h-full">
            <p class="text-sm font-medium mb-3 text-gray-700">
              {{ t("purchase-rq.field.img_example", "ຮູບຕົວຢ່າງ") }}
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

          <!-- Form fields -->
          <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <UiFormItem
              :label="t('purchase-rq.field.title', 'ຊື່ລາຍການ')"
              :name="['addMore', index.toString(), 'title']"
              required
            >
              <UiInput
                v-model="item.title"
                :placeholder="t('purchase-rq.phd.title', 'ເຊັ່ນ Computer')"
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