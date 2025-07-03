<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import { DatePicker } from "ant-design-vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import {
  formatPrice,
  NumberOnly,
  parsePrice,
} from "@/modules/shared/utils/format-price";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UploadModal from "./modal/UploadModal.vue";
import { UploadOutlined } from "@ant-design/icons-vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { formState, moreFunction } from "./formstate";
import { useI18n } from "vue-i18n";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import { CreatePRValidate } from "../../views/purchase-requests/validation/create-purchase-request";

const createModalVisible = ref(false);
const loading = ref<boolean>(false);
const currentUploadIndex = ref<number>(0); // Track which item is being uploaded to
const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const store = useDocumentTypeStore();
const formRef = ref()
const removeMore = (index: number) => {
  if (formState.value.addMore.length > 1) {
    // Clean up image URLs before removing
    formState.value.addMore[index].images.forEach((imageUrl) => {
      if (imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    });
    formState.value.addMore.splice(index, 1);
  }
};

// total price
const totalPrice = computed(() => {
  return formState.value.addMore.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const itemCount = item.count || 0;
    return total + itemPrice * itemCount;
  }, 0);
});
const modalUpload = (index: number) => {
  currentUploadIndex.value = index;
  createModalVisible.value = true;
};

// Handle image upload from modal
const handleImageUpload = (files: File[]) => {
  console.log("Uploaded files:", files);

  // Convert files to URLs and add to the specific item's images
  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    formState.value.addMore[currentUploadIndex.value].images.push(url);
    console.log("Added image URL:", url);
  });

  // Log current images for the item
  console.log(
    "Current images for item:",
    formState.value.addMore[currentUploadIndex.value].images
  );

  // Close modal
  createModalVisible.value = false;
};

onMounted(async () => {
  await store.fetchdocumentType({ page: 1, limit: 1000 });
});

// Create computed properties for each item's price formatting
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

const deleteImage = (itemIndex: number, imageIndex: number) => {
  const imageUrl = formState.value.addMore[itemIndex].images[imageIndex];
  if (imageUrl && imageUrl.startsWith("blob:")) {
    URL.revokeObjectURL(imageUrl);
  }
  formState.value.addMore[itemIndex].images.splice(imageIndex, 1);
  console.log("Updated images for item:", formState.value.addMore[itemIndex].images);
};
</script>

<template>
  <div class="px-0 mb-[20rem]">
    <div class="">
      <h2 class="text-md font-semibold px-0 mb-4">
        {{ t("purchase-rq.field.proposer") }}
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
          <p class="font-medium">{{ userName }}</p>
          <p class="text-gray-600">{{ userPosition }}</p>
        </div>
      </div>

      <!-- form  -->

      <UiForm ref="formRef" :model="CreatePRValidate(t)">
        <!-- date  -->
        <div class="date md:flex flex-row w-full gap-8">
          <div class="requested-date -space-y-4">
            <p class="font-medium">{{ t("purchase-rq.field.rq_date") }}</p>
            <DatePicker
              v-model:value="formState.requested_date"
              class="md:w-[370px] w-full"
            />
          </div>
          <div class="expired-date -space-y-4">
            <p class="font-medium">{{ t("purchase-rq.field.date_rq") }}</p>
            <DatePicker
              v-model:value="formState.expired_date"
              class="md:w-[370px] w-full"
            />
          </div>
        </div>

        <!-- purposes  -->
        <div class="purposes mt-4">
          <p>{{ t("purchase-rq.field.proposal") }}</p>
          <Textarea v-model="formState.purpose" class="md:w-[770px] w-full" />
        </div>

        <!-- title request items -->
        <div
          class="item"
          v-for="(item, index) in formState.addMore"
          :key="index"
        >
          <div class="request mt-4">
            <p>{{ t("purchase-rq.card_title.title") }} ({{ index + 1 }})</p>
            <div class="title flex gap-4">
              <UiFormItem
                class="w-full"
                :label="t('purchase-rq.field.title')"
                :name="['addMore', index.toString(), 'title']"
                required
              >
                <UiInput
                  v-model="item.title"
                  placeholder="ປ້ອນຫົວຂໍ້ທີ່ຕ້ອງການສະເໜີ"
                />
              </UiFormItem>

              <UiFormItem
                class="w-full"
                :label="t('purchase-rq.field.qty')"
                :name="['addMore', index.toString(), 'count']"
                required
              >
                <UiInput
                  v-model="item.count"
                  type="number"
                  placeholder="ປ້ອນຈຳນວນ"
                  @keypress="NumberOnly"
                />
              </UiFormItem>

              <UiFormItem
                class="w-full"
                :label="t('purchase-rq.field.price')"
                :name="['addMore', index.toString(), 'price']"
                required
              >
                <UiInput
                  v-model="formattedPrice(index).value"
                  placeholder="ປ້ອນລາຄາທີ່ຕ້ອງການສະເໜີ"
                  @keypress="NumberOnly"
                />
              </UiFormItem>

              <UiFormItem
                class="w-full"
                :label="t('purchase-rq.field.remark')"
                name="remark"
              >
                <UiInput v-model="item.remark" placeholder="ປ້ອນໝາຍເຫດ" />
              </UiFormItem>
            </div>
          </div>

          <!-- example image  -->
          <div class="image-view">
            <p>{{ t("purchase-rq.field.img_example") }}</p>
            <div class="flex flex-wrap gap-2">
              <!-- Image Preview -->
              <div
                v-for="(image, imageIndex) in item.images"
                :key="imageIndex"
                :name="['addMore', index.toString(), 'images']"
                class="w-[250px] h-[150px] rounded-md shadow-sm ring-1 ring-slate-300 overflow-hidden relative group"
              >
                <a-image
                  :src="image"
                  :width="250"
                  :height="150"
                  class="w-full h-full object-cover rounded-md"
                />
                <!-- Delete Button -->
                <button
                  class="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-lg"
                  @click="deleteImage(index, imageIndex)"
                  title="Delete image"
                >
                  ×
                </button>
              </div>

              <!-- Upload Button Box -->
              <div
                class="w-[250px] h-[150px] flex flex-col justify-center items-center text-center rounded-md shadow-sm ring-1 ring-slate-300 bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100 transition"
                @click="modalUpload(index)"
              >
                <p class="text-2xl">
                  <UploadOutlined />
                </p>
                <p class="text-sm font-medium">ອັບໂຫລດຮູບພາບ</p>
                <p class="text-sm">ຮູບຕົວຢ່າງຂອງສິນຄ້າ</p>
              </div>
            </div>
          </div>

          <!-- add more / remove buttons -->
          <div class="add-more mt-6 flex gap-1">
            <UiButton
              type="primary"
              size="small"
              icon="ant-design:plus-outlined"
              @click="moreFunction"
              colorClass="flex items-center"
            >
              {{ t("purchase-rq.btn.add_title") }}
            </UiButton>
            <UiButton
              size="small"
              icon="ant-design:minus-outlined"
              :disabled="formState.addMore.length <= 1"
              @click="removeMore(index)"
              colorClass="flex items-center"
            >
              {{ t("purchase-rq.btn.dl_title") }}
            </UiButton>
          </div>
        </div>
      </UiForm>
      <!-- // total -->
      <div class="total flex mt-4 text-xl gap-4">
        <p>{{ t("purchase-rq.field.amount") }}:</p>
        <p class="text-red-600">{{ formatPrice(totalPrice) }} LAK</p>
      </div>
    </div>
  </div>

  <UploadModal
    :visible="createModalVisible"
    :loading="loading"
    @update:visible="createModalVisible = $event"
    @upload="handleImageUpload"
  />
</template>
