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
import { departmenUsertStore } from "../../stores/departments/department-user.store";

const createModalVisible = ref(false);
const loading = ref<boolean>(false);
const currentUploadIndex = ref<number>(0);
const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const store = useDocumentTypeStore();
const formRef = ref();
const data = localStorage.getItem("userData");
const parsed = data ? JSON.parse(data) : null;
const userLocal = departmenUsertStore()

const departmentUser = userLocal.currentDpmUser;
console.log('user:', parsed);
console.log('user:', departmentUser?.getUser()?.getUsername());

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

const totalPrice = computed(() => {
  return formState.value.addMore.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const itemCount = item.count || 0;
     const all = total + itemPrice * itemCount;
     formState.value.addMore[0].totalPrice = all
     return all
  }, 0);
});

const modalUpload = (index: number) => {
  currentUploadIndex.value = index;
  createModalVisible.value = true;
};

const handleImageUpload = (files: File[]) => {
  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    formState.value.addMore[currentUploadIndex.value].images.push(url);
  });
  createModalVisible.value = false;
};

onMounted(async () => {
  await store.fetchdocumentType({ page: 1, limit: 1000 });
  await userLocal.fetchDepartmentUserById(parsed.id)
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

const deleteImage = (itemIndex: number, imageIndex: number) => {
  const imageUrl = formState.value.addMore[itemIndex].images[imageIndex];
  if (imageUrl && imageUrl.startsWith("blob:")) {
    URL.revokeObjectURL(imageUrl);
  }
  formState.value.addMore[itemIndex].images.splice(imageIndex, 1);
};

function validateForm(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!formRef.value) return resolve(false);
    formRef.value
      .validate()
      .then(() => resolve(true))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        console.error("Validation errors:", err);
        resolve(false);
      });
  });
}

function getFormData() {
  return formState.value;
}

defineExpose({
  validateForm,
  getFormData,
});
</script>

<template>
  <div class="px-0 mb-[20rem]">
    <div>
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
          <p class="font-medium">{{ departmentUser?.getUser()?.getUsername() }}</p>
          <p class="text-gray-600">{{ userPosition }}</p>
        </div>
      </div>

      <UiForm ref="formRef" :model="formState" :rules="CreatePRValidate(t)">
        <div class="date md:flex flex-row w-full gap-8">
          <UiFormItem
            :label="t('purchase-rq.field.date_rq')"
            name="expired_date"
            required
          >
            <DatePicker
              v-model:value="formState.expired_date"
              class="md:w-[557px] w-full"
              :placeholder="t('purchase-rq.phd.rq_date')"
            />
          </UiFormItem>
        </div>

        <div class="purposes">
          <p>{{ t("purchase-rq.field.proposal") }}</p>
          <Textarea
            name="purpose"
            v-model="formState.purpose"
            :placeholder="t('purchase-rq.phd.purpose')"
            class="md:w-[557px] w-full"
          />
        </div>

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
                  :placeholder="t('purchase-rq.phd.title')"
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
                  :placeholder="t('purchase-rq.phd.qty')"
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
                  :placeholder="t('purchase-rq.phd.price')"
                  @keypress="NumberOnly"
                />
              </UiFormItem>

              <UiFormItem
                class="w-full"
                :label="t('purchase-rq.field.remark')"
                name="remark"
              >
                <UiInput
                  v-model="item.remark"
                  :placeholder="t('purchase-rq.phd.remark')"
                />
              </UiFormItem>
            </div>
          </div>

          <div class="image-view">
            <p>{{ t("purchase-rq.field.img_example") }}</p>
            <div class="flex flex-wrap gap-2">
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
