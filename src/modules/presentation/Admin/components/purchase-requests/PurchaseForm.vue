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
import { UploadOutlined } from "@ant-design/icons-vue";

// --- HELPERS, STATE, & VALIDATION ---
import { formatPrice, NumberOnly, parsePrice } from "@/modules/shared/utils/format-price";
import { formState, moreFunction } from "./formstate";
import { CreatePRValidate } from "../../views/purchase-requests/validation/create-purchase-request";
import { useI18n } from "vue-i18n";
import { uploadFile } from "@/modules/application/services/upload.Service";

// --- ENTITY & DTO TYPES ---
import type { Unit } from "@/modules/domain/entities/unit.entities";
import type { CreatePurchaseRequestDTO } from "@/modules/application/dtos/purchase-requests/purchase-request.dto";

// --- STORES ---
import { useUnitStore } from "../../stores/unit.store";
import { usePurchaseRequestsStore } from "../../stores/purchase_requests/purchase-requests.store";
import { departmenUsertStore } from "../../stores/departments/department-user.store";

// --- SCRIPT LOGIC ---
const { t } = useI18n();
const formRef = ref();
const loading = ref<boolean>(false);
const uploadLoading = ref<boolean>(false);
const createModalVisible = ref(false);
const currentUploadIndex = ref<number>(0);

const props = defineProps<{
  documentTypeId: number | string;
}>();

const purchaseRequestStore = usePurchaseRequestsStore();
const unitStore = useUnitStore();
const userLocal = departmenUsertStore();

const units: Ref<Unit[]> = ref([]);

const profileImage = ref("/public/Profile-PNG-File.png");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const data = localStorage.getItem("userData");
const parsed = data ? JSON.parse(data) : null;
const departmentUser = userLocal.currentDpmUser;

onMounted(async () => {
  if (parsed?.id) {
    await userLocal.fetchDepartmentUserById(parsed.id);
  }
  await unitStore.fetchUnits({ page: 1, limit: 1000 });
  units.value = unitStore.activeUnits;
});

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
      currentItem.file_name = filename; // << NO ERROR NOW
      const url = URL.createObjectURL(file);
      currentItem.images.push(url);
      message.success("ອັບໂຫລດຮູບພາບສຳເລັດ");
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

async function handleSave(): Promise<boolean> {
  loading.value = true;
  const isValid = await validateForm();
  if (!isValid) {
    message.error(t("purchase-rq.msg.validate_fail", "ກະລຸນາກວດສອບຂໍ້ມູນໃນຟອມໃຫ້ຄົບຖ້ວນ"));
    loading.value = false;
    return false;
  }

  const formData = getFormData();
  if (!props.documentTypeId || !formData.expired_date) {
    message.error("Document Type and Expired Date are required.");
    loading.value = false;
    return false;
  }

  const payload: CreatePurchaseRequestDTO = {
    expired_date: dayjs(formData.expired_date).format("YYYY-MM-DD"),
    purposes: formData.purpose,
    document: {
      description: formData.purpose,
      documentTypeId: Number(props.documentTypeId),
    },
    purchase_request_items: formData.addMore.map((item) => {
      const quantity = item.count ? parseInt(item.count, 10) : 0;
      return {
        title: item.title,
        file_name: item.file_name || "",
        quantity: quantity,
        price: item.price || 0,
        remark: item.remark,
        unit_id: item.unit_id!,
      };
    }),
  };

  try {
    const result = await purchaseRequestStore.create(payload);
    if (result) {
      message.success(t("purchase-rq.msg.create_success", "ສ້າງໃບສະເໜີສຳເລັດ!"));
      loading.value = false;
      return true;
    } else {
      message.error(
        purchaseRequestStore.error ||
          t("purchase-rq.msg.create_fail", "ເກດຂໍ້ຜິດພາດໃນການສ້າງໃບຂໍຊື້")
      );
      loading.value = false;
      return false;
    }
  } catch (err) {
    console.error("Failed to save purchase request:", err);
    message.error(t("purchase-rq.msg.create_fail", "ເກດຂໍ້ຜິດພາດໃນການສ້າງໃບຂໍຊື້"));
    loading.value = false;
    return false;
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
  <div class="px-0 mb-[20rem]">
    <div>
      <h2 class="text-md font-semibold px-0 mb-4">
        {{ t("purchase-rq.field.proposer", "ໃບສະເໜີ") }}
      </h2>
      <div class="info flex items-center px-0 gap-4 mb-4">
        <a-image
          :src="profileImage"
          alt="avatar"
          class="w-20 h-20 rounded-full object-cover"
          :width="80"
          :height="80"
          :preview="false"
        />
        <div class="detail -space-y-2">
          <p class="font-medium">{{ departmentUser?.getUser()?.getUsername() }}</p>
          <p class="text-gray-600">{{ userPosition }}</p>
        </div>
      </div>

      <UiForm ref="formRef" :model="formState" :rules="CreatePRValidate(t)">
        <div class="date md:flex flex-row w-full gap-8 mt-4">
          <UiFormItem
            :label="t('purchase-rq.field.date_rq', 'ເລືອກວັນທີ')"
            name="expired_date"
            required
          >
            <DatePicker
              v-model:value="formState.expired_date"
              class="md:w-[557px] w-full"
              :placeholder="t('purchase-rq.phd.rq_date', 'ເລືອກວັນທີ')"
            />
          </UiFormItem>
        </div>

        <div class="purposes mt-4">
          <p>{{ t("purchase-rq.field.proposal", "ວັດຖຸປະສົງ") }}</p>
          <Textarea
            v-model="formState.purpose"
            :placeholder="t('purchase-rq.phd.purpose', 'ລະບຸວັດຖຸປະສົງໃນການຂໍຊື້')"
            class="md:w-[557px] w-full"
          />
        </div>

        <div
          class="item border-t border-gray-200 mt-6 pt-4"
          v-for="(item, index) in formState.addMore"
          :key="index"
        >
          <div class="request mt-4">
            <p class="font-semibold text-lg">
              {{ t("purchase-rq.card_title.title", "ລາຍການ") }} ({{ index + 1 }})
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
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
                class="md:col-span-2 lg:col-span-4"
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

          <div class="image-view mt-4">
            <p>{{ t("purchase-rq.field.img_example", "ຮູບຕົວຢ່າງ") }}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <div
                v-for="(image, imageIndex) in item.images"
                :key="imageIndex"
                class="w-[250px] h-[150px] rounded-md shadow-sm ring-1 ring-slate-300 overflow-hidden relative group"
              >
                <a-image
                  :src="image"
                  :width="250"
                  :height="150"
                  class="w-full h-full object-cover rounded-md"
                />
                <button
                  class="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-lg"
                  @click="deleteImage(index, imageIndex)"
                  title="Delete image"
                >
                  ×
                </button>
              </div>

              <div
                v-if="item.images.length === 0"
                class="w-[250px] h-[150px] flex flex-col justify-center items-center text-center rounded-md shadow-sm ring-1 ring-slate-300 bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100 transition"
                @click="modalUpload(index)"
              >
                <p class="text-2xl"><UploadOutlined /></p>
                <p class="text-sm font-medium">ອັບໂຫລດຮູບພາບ</p>
                <p class="text-xs text-gray-400">ຮູບຕົວຢ່າງຂອງສິນຄ້າ (ຖ້າມີ)</p>
              </div>
            </div>
          </div>

          <div class="add-more mt-6 flex gap-2">
            <UiButton
              type="primary"
              size="small"
              icon="ant-design:plus-outlined"
              @click="moreFunction"
              colorClass="flex items-center"
            >
              {{ t("purchase-rq.btn.add_title", "ເພີ່ມລາຍການ") }}
            </UiButton>
            <UiButton
              danger
              size="small"
              icon="ant-design:minus-outlined"
              :disabled="formState.addMore.length <= 1"
              @click="removeMore(index)"
              colorClass="flex items-center"
            >
              {{ t("purchase-rq.btn.dl_title", "ລົບລາຍການນີ້") }}
            </UiButton>
          </div>
        </div>
      </UiForm>

      <div class="total flex justify-end items-center mt-8 text-xl gap-4 border-t pt-4">
        <p class="font-semibold">{{ t("purchase-rq.field.amount", "ຍອດລວມສຸດທິ") }}:</p>
        <p class="text-red-600 font-bold text-2xl">{{ formatPrice(totalPrice) }} LAK</p>
      </div>


    </div>
  </div>

  <UploadModal
    :visible="createModalVisible"
    :loading="uploadLoading"
    @update:visible="createModalVisible = $event"
    @upload="handleImageUpload"
  />
</template>
