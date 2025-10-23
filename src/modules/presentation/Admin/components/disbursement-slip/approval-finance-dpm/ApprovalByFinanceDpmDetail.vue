<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import ApvLayout from "./ApvLayout.vue";
import { columns } from "./column";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { Icon } from "@iconify/vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PropovalDrawer from "./drawers/PropovalDrawer.vue";
import ApprovalDrawer from "./drawers/ApprovalDrawer.vue";
import { useRoute } from "vue-router";
import { useReceiptStore } from "../../../stores/receipt.store";
import {
  getUserApv,
  getUserRole,
  UserRoleEnum,
} from "@/modules/shared/utils/get-user.login";
import UploadSlipModal from "./modals/UploadSlipModal.vue";
import { uploadFile } from "@/modules/application/services/upload.service";
import { message } from "ant-design-vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import type { ISelectVendor } from "@/modules/application/dtos/receipt.dto";
import VendorDrawer from "./drawers/VendorDrawer.vue";
import Print from "./modals/Print.vue";
const openPropoval = ref(false);
const openAppropoval = ref(false);
const openVendor = ref(false);
const { t } = useI18n();
const { params } = useRoute();
const receiptId = params.id as string;
const rStore = useReceiptStore();
const user = computed(() => getUserApv());
const userRole = ref<string[]>(getUserRole() ?? []);
const uploadLoading = ref<boolean>(false);
const createModalVisible = ref(false);
const printModalVisible = ref(false);
const formRef = ref();
const selectedId = ref<number | null>(null);
const dataVendor = ref<ISelectVendor | null>(null);
const formModel = ref({
  account_code: "",
});
const isRole = computed(() =>
  userRole.value.some(
    (role) =>
      role.includes(UserRoleEnum.ACCOUNT_ADMIN) ||
      role.includes(UserRoleEnum.ACCOUNT_USER)
  )
);

const formState = ref({
  files: [] as { file_name: string }[],
});

const uploadedImages = ref<string[]>([]); // keep previews only
const uploadCompleted = ref(false); // <-- add this

const handleImageUpload = async (files: File[]) => {
  if (!files.length) return;

  uploadLoading.value = true;
  try {
    for (const file of files) {
      const blobUrl = URL.createObjectURL(file);
      uploadedImages.value.push(blobUrl);

      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await uploadFile(uploadData);
      const file_name = response.fileName;

      if (file_name) {
        formState.value.files.push({ file_name });
        message.success(`ອັບໂຫລດ ${file.name} ສຳເລັດ`);
      } else {
        throw new Error("Filename not found in API response.");
      }
    }
    // ✅ close modal
    createModalVisible.value = false;
    uploadCompleted.value = true;
  } catch (error) {
    console.error("File upload failed:", error);
    message.error("ອັບໂຫລດຮູບພາບບໍ່ສຳເລັດ");

    // Remove the blob URL if upload failed
    if (uploadedImages.value.length > 0) {
      const lastBlobUrl = uploadedImages.value.pop();
      URL.revokeObjectURL(lastBlobUrl as string); // Clean up blob URL
    }
  } finally {
    uploadLoading.value = false;
  }
};

const deleteImage = (index: number) => {
  uploadedImages.value.splice(index, 1);
  formState.value.files.splice(index, 1);
  if (index === 0) {
    uploadCompleted.value = false;
  }
};

// end
// i need check by user id on here
const isUserPendingApprover = computed(() => {
  const userId = user.value?.id;
  if (!userId) return false;
  const steps = rStore.currentReceipts?.user_approval?.approval_step || [];
  return steps.some(
    (step) =>
      step.status_id === 1 && // only steps with status_id === 1
      step.doc_approver?.some((doc) => doc.user?.id === userId)
  );
});
const check = computed(() =>
  rStore.currentReceipts?.user_approval?.approval_step?.some(
    (step) => step.requires_file_upload
  )
);
const userNextApprove = computed(() =>
  rStore.currentReceipts?.user_approval?.approval_step?.map((step) => ({
    status: [
      {
        id: step.status_id,
        name: step.document_status.name,
        ...(step.doc_approver &&
          step.doc_approver.length > 0 && {
          dpm: step.doc_approver.map((approver) => ({
            id: approver.department?.id || 0,
            name: approver.department?.name,
          })),
          user: step.doc_approver.map((userData) => ({
            id: userData.user?.id,
            username: userData.user?.username,
          })),
        }),
      },
    ],
  }))
);
const checkUpload = computed(() => {
  return (
    userNextApprove.value?.flatMap(
      (d) =>
        d.status
          ?.filter((s) => s.id === 1) // only pending
          .flatMap((s) => s.user ?? []) ?? []
    ) ?? []
  );
});
const isAwaitingUser = computed(() =>
  checkUpload.value.some((u) => u.id === user.value.id)
);
// map data to show on header tag ແລະ ກວດເງື່ອນໄຂການອະນຸມັດ
const dataHead = computed(() => ({
  form_ref: formRef.value,
  exist_access: rStore.currentReceipts?.account_code ? true : false,
  role: isRole.value,
  rId: Number(receiptId),
  no: rStore.currentReceipts?.receipt_number,
  isApproved: isUserPendingApprover.value ?? false,
  data: {
    stepId: rStore.currentReceipts?.user_approval?.approval_step?.find(
      (step) =>
        step.status_id === 1 && // only steps with status_id === 1
        step.doc_approver?.some((doc) => doc.user?.id === user.value?.id)
    )?.id,
    remark: rStore.currentReceipts?.remark,
    type: "r",
    files: check.value ? formState.value.files : [],
    account_code: formModel.value.account_code || "",
    uploadCompleted: uploadCompleted.value || false,
    formState: formState.value || { files: [] },
    uploadedImages: uploadedImages.value || [],
  },
  status: rStore.currentReceipts?.user_approval?.approval_step?.map((step) => ({
    id: step.status_id,
    name: step.document_status.name,
  })),

  created_at: rStore.currentReceipts?.created_at,

  is_otp: rStore.currentReceipts?.user_approval?.approval_step?.some(
    (step) => step.status_id === 1 && step.is_otp
  ),
  is_upload: rStore.currentReceipts?.user_approval?.approval_step?.some(
    (step) => step.status_id === 1 && step.requires_file_upload
  ),

  approver_info: userNextApprove.value,
}));
const showPropoval = () => {
  selectedId.value =
    Number(rStore.currentReceipts?.purchase_request_id) ?? null;
  openPropoval.value = true;
};
const showApproval = () => {
  selectedId.value = Number(rStore.currentReceipts?.purchase_order_id) ?? null;
  openAppropoval.value = true;
};
// const vendor = computed(
//   () => rStore.currentReceipts?.receipt_item[0].purchase_order_item.selected_vendor[0].vendor
// );
// const bank = computed(
//   () =>
//     rStore.currentReceipts?.receipt_item[0].purchase_order_item.selected_vendor[0]
//       .vendor_bank_account.bank
// );
// const account = computed(
//   () =>
//     rStore.currentReceipts?.receipt_item[0].purchase_order_item.selected_vendor[0]
//       .vendor_bank_account
// );
const budgetAcc = computed(
  () =>
    rStore.currentReceipts?.receipt_item[0].purchase_order_item.budget_item
      .budget_account
);
const attachments = computed(
  () => rStore.currentReceipts?.document_attachment ?? []
);
const vendorInfo = (data: ISelectVendor) => {
  dataVendor.value = data;
  openVendor.value = true;
};
const openPrintModal = () => {
  window.print();
};

onMounted(async () => {
  await rStore.fetchById(receiptId);
  uploadedImages.value.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
});
</script>
<template>
  <div class="no-print">
    <ApvLayout :dataHead="dataHead" :onPrint="openPrintModal"></ApvLayout>
    <div class="mt-[10rem] mb-[5rem]">
      <div class="user-info">
        <div class="flex gap-[4rem]">
          <div class="u w-full">
            <h2 class="text-md font-semibold px-2 mb-4">
              {{ t("purchase-rq.field.proposer") }}
            </h2>
            <div class="info flex items-center px-2 gap-4 mb-4">
              <div class="flex items-center justify-center **w-16 h-16** rounded-full **bg-blue-100** **text-4xl**">
                <Icon icon="mdi:user" class="text-6xl" />
              </div>
              <div class="detail -space-y-2">
                <p class="font-medium">
                  {{ rStore.currentReceipts?.document.requester.username }}
                </p>
                <p class="text-gray-600">
                  {{ rStore.currentReceipts?.document?.position[0].name }}
                </p>
              </div>
            </div>
          </div>
          <!-- Purpose Section -->
          <div class="purposes space-y-1 px-2 mb-4 w-full">
            <h2 class="text-md font-semibold">
              {{ t("purchase-rq.field.purposes") }}
            </h2>
            <p class="text-gray-600 text-md">
              {{ rStore.currentReceipts?.remark || "----" }}
            </p>

            <div class="account_number">
              <h3>{{ t("receipt.title.account_number") }}</h3>
              <UiInput v-if="
                dataHead.isApproved &&
                isRole &&
                !rStore.currentReceipts?.account_code
              " v-model="formModel.account_code" placeholder="ປ້ອນລະຫັດບັນຊີ" size="middle"
                class="md:w-[15rem] w-full">
              </UiInput>
              <span class="text-[16px] text-gray-700" v-if="rStore.currentReceipts?.account_code">{{
                rStore.currentReceipts?.account_code }}</span>
            </div>
          </div>
        </div>

        <div class="table -space-y-0 mb-2 w-full px-2 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">
            {{ t("purchase-rq.field.title") }}
          </h2>
          <a-table :columns="columns(t)" :dataSource="rStore.currentReceipts?.receipt_item" :pagination="false"
            row-key="id">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'id'">
                <span>{{ index + 1 }}</span>
              </template>
              <template v-if="column.key === 'title'">
                <span>{{
                  record.purchase_order_item?.purchase_request_item?.title
                }}</span>
              </template>
              <template v-if="column.key === 'budget_code'">
                <span>{{ budgetAcc?.code }} - {{ budgetAcc?.name }}</span>
              </template>
              <!-- <template v-if="column.key === 'account_code'">

            </template> -->
              <!-- <template v-if="column.key === 'qty'">
              <span>₭ {{ formatPrice(record.price) }}</span>
            </template> -->
              <template v-if="column.key === 'price'">
                <span>₭ {{ formatPrice(record.price) }}</span>
              </template>
              <template v-if="column.key === 'vendor'">
                <span @click="
                  vendorInfo(record.purchase_order_item.selected_vendor[0])
                  " class="cursor-pointer text-red-600 hover:text-red-800">ເບິ່ງຮ້ານຄ້າ</span>
              </template>
            </template>
          </a-table>
          <div class="total flex justify-end gap-1 text-[14px] mr-10 text-gray-700">
            <div class="lable flex flex-col items-end mt-4 font-medium">
              <p class="text-sky-500">{{ t('receipt.total.sub_total') }}</p>
              <p class="-mt-3 text-orange-500">{{ t('receipt.total.vat') }}</p>
              <p class="-mt-3 text-red-500">{{ t('receipt.total.total') }}</p>
            </div>
            <div class="lable mt-4">
              <p>:</p>
              <p class="-mt-3">:</p>
              <p class="-mt-3">:</p>
            </div>
            <div class="lable mt-4">
              <!-- ₭ -->
              <p class=" text-sky-500 "> {{ formatPrice(rStore.currentReceipts?.sub_total) }} LAK</p>
              <p class="-mt-3 text-orange-500"> {{ formatPrice(rStore.currentReceipts?.vat) }} LAK</p>
              <p class="-mt-3 text-red-500"> {{ formatPrice(rStore.currentReceipts?.total) }} LAK</p>
            </div>
          </div>
        </div>
        <div v-if="
          check && isAwaitingUser && !uploadCompleted && !attachments.length
        " class="mb-4 mt-4">
          <h2>ອັບໂຫລດສະລິບໂອນເງິນ</h2>

          <!-- Trigger Upload Modal -->
          <div
            class="flex flex-col items-center justify-center w-[190px] h-[120px] border border-dashed bg-gray-100/60 border-gray-300 rounded-md hover:border-red-500 transition cursor-pointer"
            @click="createModalVisible = true">
            <Icon icon="mdi:upload" class="text-2xl text-gray-400 mb-1" />
            <p class="text-gray-600 text-sm">Click to upload</p>
            <p class="text-gray-400 text-xs">SVG, PNG, JPG (MAX. 5MB)</p>
          </div>

          <!-- Uploaded images preview -->
        </div>
        <!-- Uploaded images preview -->
        <!-- <div v-if="uploadedImages.length" class="mb-1 mt-4 w-full h-auto"> -->
        <div v-if="uploadedImages.length" class="mb-1 mt-4 w-full h-auto">
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <div v-for="(img, index) in uploadedImages" :key="index"
              class="relative w-[100px] h-[130px] flex items-center justify-center overflow-hidden rounded-md">
              <a-image :src="img" style="max-width: 100%; max-height: 100%;" />
              <button @click="deleteImage(index)"
                class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs">
                ×
              </button>
            </div>
            <div @click="createModalVisible = true"
              class="w-[3rem] h-[3rem] flex items-center justify-center border border-dashed bg-gray-100/60 border-gray-300 rounded-md hover:border-red-500 transition cursor-pointer">
              <Icon icon="material-symbols:image-arrow-up-outline-rounded" class="text-2xl text-gray-400 mb-1" />
            </div>
          </div>
        </div>

        <div v-else-if="attachments.length" class="mb-1 mt-4 w-full h-auto">
          <h2>ຫຼັກຖານການໂອນເງິນ</h2>

          <!-- Flex container for images -->
          <div class="flex flex-wrap gap-4 -mt-1">
            <div v-for="(doc, index) in attachments" :key="index"
              class="w-[90px] h-[130px] flex items-center justify-center overflow-hidden rounded-md">
              <a-image class="flex items-center justify-center" :src="doc?.file_name_url"
                style="max-width: 100%; max-height: 100%;" />
            </div>
          </div>
        </div>

        <!-- Signature Section -->
        <h2 class="text-md ml-3 mt-0 font-semibold">
          {{ t("purchase-rq.signature") }}
        </h2>
        <div class="signature flex flex-wrap items-center justif-start gap-[3rem] shadow-sm px-0 rounded-md pb-4">
          <div v-for="(step, index) in [
            ...(rStore.currentReceipts?.user_approval?.approval_step || []),
          ].sort((a, b) => a.step_number - b.step_number)" :key="index" class="signature-approver text-center">
            <p class="text-slate-500 text-sm font-bold">
              {{ index === 0 ? "ຜູ້ສ້າງ" : t("purchase-rq.approver") + ' ' + (step.step_number) }}
            </p>

            <a-image v-if="step.approver?.user_signature?.signature_url" class=" -mt-2"
              :src="step.approver?.user_signature?.signature_url" alt="signature" :width="120" :height="100"
              :preview="false" />
            <div v-else
              class="w-[120px] h-[80px] border border-slate-100 flex items-center justify-center text-xs text-slate-400">
              <!-- No Signature -->
            </div>

            <div class="info text-sm text-slate-600 -space-y-2">
              <p>{{ step.approver?.username || "-" }}</p>
              <p>{{ step.position?.name || "-" }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 shadow-sm p-4 px-2 bg-white rounded-md">
          <h2 class="text-md font-semibold mb-3">
            {{ $t("disbursement.field.doc_attachment") }}
          </h2>
          <div class="flex flex-wrap gap-4">
            <div @click="showPropoval"
              class="text-sky-500 hover:text-sky-600 p-2 bg-slate-50 flex items-center gap-2 cursor-pointer rounded-full">
              <Icon icon="material-symbols:docs-outline" />
              <span class="text-sm">{{ rStore.currentReceipts?.pr_doc_type }} - ເລກທີ
                {{ rStore.currentReceipts?.pr_number }}</span>
              <Icon icon="mdi:arrow-top-right" />
            </div>
            <div @click="showApproval"
              class="text-sky-500 hover:text-sky-600 p-2 bg-slate-50 flex items-center gap-2 cursor-pointer rounded-full">
              <Icon icon="material-symbols:docs-outline" />
              <span class="text-sm">{{ rStore.currentReceipts?.po_doc_type }} - ເລກທີ
                {{ rStore.currentReceipts?.po_number }}</span>
              <Icon icon="mdi:arrow-top-right" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- //upload modal  -->
    <UploadSlipModal :visible="createModalVisible" :loading="uploadLoading"
      @update:visible="createModalVisible = $event" @upload="handleImageUpload" />
    <UiDrawer v-model:open="openVendor" :title="`ຂໍ້ມູນຮ້ານຄ້າ`" placement="right" :width="470">
      <VendorDrawer :data="dataVendor" />
    </UiDrawer>
    <UiDrawer v-model:open="openPropoval"
      :title="`${rStore.currentReceipts?.pr_doc_type} - ເລກທີ ${rStore.currentReceipts?.pr_number} - ${rStore.currentReceipts?.receipt_item[0].purchase_order_item?.purchase_request_item?.created_at}`"
      placement="right" :width="1185">
      <PropovalDrawer :id="selectedId" />
    </UiDrawer>

    <UiDrawer v-model:open="openAppropoval"
      :title="`${rStore.currentReceipts?.po_doc_type} - ເລກທີ ${rStore.currentReceipts?.po_number} - ${rStore.currentReceipts?.created_at}`"
      placement="right" :width="1185">
      <ApprovalDrawer :id="selectedId" />
    </UiDrawer>
  </div>
  <div class="print-only">

    <!-- v-if="printModalVisible" -->
    <Print :receipt="rStore.currentReceipts"></Print>
  </div>
</template>
<style scoped>
.user-info {
  background: white;
  border-radius: 0.5rem;
}

@media print {
  .no-print {
    display: none !important;
  }

  body * {
    visibility: hidden;
  }

  .print-only,
  .print-only * {
    visibility: visible;
  }

  .print-only {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
    overflow: visible;
    z-index: 9999;
  }

  .flex.justify-between {
    display: none !important;
  }

  /* ✅ Hide print header and timestamp correctly */
  :deep(.print-header),
  :deep(.print-timestamp) {
    display: none !important;
    visibility: hidden !important;
  }

  @page {
    margin: 15mm 10mm 15mm 10mm;
    size: A4;
  }
}


@media screen {
  .print-only {
    position: fixed;
    left: -9999px;
    top: -9999px;
    visibility: hidden;
    overflow: hidden;
    width: 0;
    height: 0;
  }
}
</style>
