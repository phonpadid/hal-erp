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
import { useRoute, useRouter } from "vue-router";
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
import InputNumber from "@/common/shared/components/Input/InputNumber.vue";
import type { ISelectVendor } from "@/modules/application/dtos/receipt.dto";
import VendorDrawer from "./drawers/VendorDrawer.vue";
import Print from "./modals/Print.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { Radio } from "ant-design-vue";
import { useExchangeRateStore } from "../../../stores/exchange-rate.store";
import type { ExchangeRateEntity } from "@/modules/domain/entities/exchange-rate.entities";
import { useNotification } from "@/modules/shared/utils/useNotification";
const openPropoval = ref(false);
const openAppropoval = ref(false);
const openVendor = ref(false);
const printModalVisible = ref(false);
const printType = ref<"about_receipt" | "all_document">("about_receipt");
const printLoading = ref(false);
const { t } = useI18n();
const router = useRouter();
const goBack = () => router.back();
const { params } = useRoute();
const receiptId = params.id as string;
const rStore = useReceiptStore();
const user = computed(() => getUserApv());
const userRole = ref<string[]>(getUserRole() ?? []);
const uploadLoading = ref<boolean>(false);
const createModalVisible = ref(false);
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
const isFinanceRole = computed(() =>
  userRole.value.some(
    (role) =>
      role.includes(UserRoleEnum.FINANCE_ADMIN) ||
      role.includes(UserRoleEnum.FINANCE_USER)
  )
);

// Currency exchange (finance department only)
const erStore = useExchangeRateStore();
const { success: notifySuccess, error: notifyError } = useNotification();

// Display every exchange rate whose target currency is LAK
const TO_CODE = "LAK";

const codeToFlag = (code?: string): string => {
  const map: Record<string, string> = {
    LAK: "la",
    THB: "th",
    USD: "us",
    CNY: "cn",
    VND: "vn",
    EUR: "eu",
    JPY: "jp",
    KRW: "kr",
    GBP: "gb",
    SGD: "sg",
    MYR: "my",
    KHR: "kh",
    AUD: "au",
    HKD: "hk",
  };
  return map[(code || "").toUpperCase()] ?? "un";
};

const filteredExchangeRates = computed(() =>
  erStore.exchangeRate.filter((er) => {
    if (er.isDeleted()) return false;
    const fromCode = er.getFromCurrency()?.getCode().toUpperCase();
    const toCode = er.getToCurrency()?.getCode().toUpperCase();
    if (!fromCode || !toCode || fromCode === toCode) return false;
    return toCode === TO_CODE;
  })
);

const editingId = ref<string | null>(null);
const editRateValue = ref<number | null>(null);
const savingRate = ref(false);

const startEditRate = (rate: ExchangeRateEntity) => {
  editingId.value = rate.getId();
  editRateValue.value = Number(rate.getRate());
};

const cancelEditRate = () => {
  editingId.value = null;
  editRateValue.value = null;
};

const saveEditRate = async (rate: ExchangeRateEntity) => {
  if (!editRateValue.value || Number(editRateValue.value) <= 0) {
    notifyError("ຜິດພາດ", "ກະລຸນາປ້ອນອັດຕາແລກປ່ຽນທີ່ຖືກຕ້ອງ");
    return;
  }
  savingRate.value = true;
  try {
    const id = String(rate.getId());
    await erStore.updated(id, {
      id,
      from_currency_id: Number(rate.getFromCurrencyId()),
      to_currency_id: Number(rate.getToCurrencyId()),
      rate: Number(editRateValue.value),
      is_active: "true",
    });
    notifySuccess(
      t("exchange-rate.message.title"),
      t("exchange-rate.message.update")
    );
    cancelEditRate();
    await erStore.fetchAll({ page: 1, limit: 1000 });
  } catch (err) {
    notifyError("ຜິດພາດ", (err as Error).message);
  } finally {
    savingRate.value = false;
  }
};

// Show exchange-rate editor only on the FIRST pending step.
// Once that step is approved, the rate is considered "already entered"
// so subsequent approvers don't see this section again.
const showFinanceRate = computed(() => {
  if (!isFinanceRole.value || !isUserPendingApprover.value) return false;

  const steps = rStore.currentReceipts?.user_approval?.approval_step ?? [];
  if (!steps.length) return false;

  const userId = user.value?.id;
  const userStep = steps.find(
    (step) =>
      step.status_id === 1 &&
      step.doc_approver?.some((doc) => doc.user?.id === userId)
  );
  if (!userStep) return false;

  // Lowest step_number among still-pending steps
  const firstPending = [...steps]
    .filter((s) => s.status_id === 1)
    .sort((a, b) => a.step_number - b.step_number)[0];

  return userStep.step_number === firstPending?.step_number;
});

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

  // If all uploaded images are deleted, reset uploadCompleted
  if (uploadedImages.value.length === 0) {
    uploadCompleted.value = false;
    // If there are no old attachments, show the upload modal again
    if (attachments.value.length === 0) {
      createModalVisible.value = true;
    }
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
// Upload UI must only appear when the CURRENT user's pending step
// has been explicitly configured with requires_file_upload === true.
const check = computed(() => {
  const userId = user.value?.id;
  if (!userId) return false;
  const steps = rStore.currentReceipts?.user_approval?.approval_step ?? [];
  return steps.some(
    (step) =>
      step.status_id === 1 &&
      step.requires_file_upload === true &&
      step.doc_approver?.some((doc) => doc.user?.id === userId)
  );
});
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
// ສະແດງຊື່ຕຳແໜ່ງຢູ່ດ້ານລ່າງລາຍເຊັນຂອງແຕ່ລະ step
// ກວດສອບວ່າຜູ້ອະນຸມັດເປັນ khamthanom ຫຼື Thipkhouneheuan,
// ໃຫ້ສະແດງເປັນຫົວໜ້າພະແນກຂອງຜູ້ສະເໜີ (ບໍ່ແມ່ນພະແນກຂອງຜູ້ອະນຸມັດ)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStepTitle = (index: number, step: any) => {
  if (index === 0) {
    return "ຜູ້ສ້າງ";
  }
  const username = step?.doc_approver?.[0]?.user?.username;
  if (username === "khamthanom" || username === "Thipkhouneheuan") {
    const requesterDeptName =
      rStore.currentReceipts?.document?.department?.name;
    if (requesterDeptName) {
      return `ຫົວໜ້າ${requesterDeptName}`;
    }
  }
  return step?.doc_approver?.[0]?.department?.name ?? "ຜູ້ອຳນວຍການ";
};
// ສະແດງຊື່ຕຳແໜ່ງຢູ່ດ້ານລ່າງລາຍເຊັນ — ສຳລັບ khamthanom/Thipkhouneheuan
// ໃຫ້ໃຊ້ "ຫົວໜ້າ" + ພະແນກຂອງຜູ້ສະເໜີ ແທນຕຳແໜ່ງເດີມຂອງຜູ້ອະນຸມັດ
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStepPosition = (step: any) => {
  const username = step?.doc_approver?.[0]?.user?.username;
  if (username === "khamthanom" || username === "Thipkhouneheuan") {
    const requesterDeptName =
      rStore.currentReceipts?.document?.department?.name;
    if (requesterDeptName) {
      return `ຫົວໜ້າ${requesterDeptName}`;
    }
  }
  return step?.position?.name || "-";
};
// map data to show on header tag ແລະ ກວດເງື່ອນໄຂການອະນຸມັດ
const dataHead = computed(() => ({
  form_ref: formRef.value,
  exist_access: rStore.currentReceipts?.account_code ? true : false,
  role: isRole.value,
  finance_role: isFinanceRole.value,
  show_finance_rate: showFinanceRate.value,
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
  is_upload: check.value,

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
  printType.value = "about_receipt";
  printModalVisible.value = true;
};

const handlePrintConfirm = async () => {
  if (!receiptId) {
    message.error("ບໍ່ພົບລະຫັດໃບເບີກຈ່າຍ");
    return;
  }
  try {
    printLoading.value = true;
    await rStore.printReceipt(receiptId, printType.value);
    printModalVisible.value = false;
  } catch (err) {
    console.error("Print error:", err);
    message.error("ບໍ່ສາມາດພິມເອກະສານໄດ້");
  } finally {
    printLoading.value = false;
  }
};

// Function to reset uploaded images after successful approval
const resetUploadedImages = () => {
  uploadedImages.value = [];
  formState.value.files = [];
  uploadCompleted.value = false;
  createModalVisible.value = false;
};

onMounted(async () => {
  await Promise.all([
    rStore.fetchById(receiptId),
    erStore.fetchAll({ page: 1, limit: 1000 }),
  ]);
  uploadedImages.value.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
});
</script>
<template>
  <div class="no-print flex flex-col h-[calc(100vh-5rem)]">
    <!-- Fixed Header -->
    <div
      class="flex-shrink-0 bg-white shadow-sm -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-3 mb-3 z-30"
    >
      <div class="flex justify-end mb-2">
        <UiButton
         icon="mdi:arrow-left" size="small" class="flex items-center gap-2 text-white bg-blue-600 hover:!bg-blue-900 hover:!text-white"
          @click="goBack"
          >ກັບຄືນ</UiButton
        >
      </div>
      <ApvLayout :dataHead="dataHead" :onPrint="openPrintModal" :onApprovalSuccess="resetUploadedImages"></ApvLayout>
    </div>
    <!-- Scrollable Body -->
    <div class="flex-1 overflow-y-auto pr-1">
    <div class="mt-[2rem] mb-[5rem]">
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

          <div class="purposes space-y-1 px-2 mb-4 w-full">
            <h2 class="text-md font-semibold">
              {{ t("receipt.from_company") }}
            </h2>
            <p class="text-gray-600 text-md">
              {{ rStore.currentReceipts?.document?.company?.name || "----" }}
            </p>

            <div class="account_number">
              {{ t("receipt.address") }}
              <p class="text-gray-600 text-md">
                {{ rStore.currentReceipts?.document?.company?.address || "----" }}
              </p>
            </div>
          </div>
        </div>

        <!-- Finance Department: Exchange Rate Editor -->
        <div
          v-if="showFinanceRate && filteredExchangeRates.length"
          class="exchange-rate-card bg-white rounded-md shadow-sm px-3 py-3 mb-3 mx-2"
        >
          <div class="flex items-center gap-2 mb-3">
            <Icon icon="mdi:swap-horizontal-bold" class="text-base text-green-600" />
            <h2 class="text-sm font-semibold">
              {{ t("exchange-rate.title") }}
            </h2>
          </div>

          <div class="rate-list">
            <div
              v-for="rate in filteredExchangeRates"
              :key="rate.getId() ?? ''"
              class="rate-row"
            >
              <!-- Currency pair (fixed width) -->
              <div class="pair">
                <div class="curr-chip">
                  <Icon
                    :icon="`circle-flags:${codeToFlag(rate.getFromCurrency()?.getCode())}`"
                    class="flag-icon"
                  />
                  <span class="curr-code">{{ rate.getFromCurrency()?.getCode() }}</span>
                </div>
                <Icon icon="mdi:arrow-right-bold" class="pair-arrow" />
                <div class="curr-chip">
                  <Icon
                    :icon="`circle-flags:${codeToFlag(rate.getToCurrency()?.getCode())}`"
                    class="flag-icon"
                  />
                  <span class="curr-code">{{ rate.getToCurrency()?.getCode() }}</span>
                </div>
              </div>

              <!-- Rate value cell (flex grow) -->
              <div class="rate-cell">
                <InputNumber
                  v-if="editingId === rate.getId()"
                  v-model="editRateValue"
                  :min="0"
                  size="middle"
                  class="rate-input"
                />
                <div v-else class="rate-display">
                  {{ formatPrice(rate.getRate()) }}
                </div>
              </div>

              <!-- Action cell (fixed width) -->
              <div class="action-cell">
                <template v-if="editingId === rate.getId()">
                  <button
                    type="button"
                    class="action-btn save-btn"
                    :disabled="savingRate"
                    @click="saveEditRate(rate)"
                  >
                    <Icon icon="mdi:check" />
                    ບັນທຶກ
                  </button>
                  <button
                    type="button"
                    class="action-btn cancel-btn"
                    :disabled="savingRate"
                    @click="cancelEditRate"
                  >
                    <Icon icon="mdi:close" />
                    ຍົກເລີກ
                  </button>
                </template>
                <button
                  v-else
                  type="button"
                  class="action-btn edit-btn"
                  @click="startEditRate(rate)"
                >
                  <Icon icon="mdi:pencil-outline" />
                  ແກ້ໄຂ
                </button>
              </div>
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
                <span
                  >{{ formatPrice(record.price) }}
                  {{
                    record.purchase_order_item?.purchase_request_item?.currency?.code
                    || record.currency?.code
                    || "LAK"
                  }}</span
                >
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
          check && isAwaitingUser && !attachments.length && !uploadedImages.length
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

        <!-- Show old attachments when there are attachments but no new uploads -->
        <div v-if="attachments.length && !uploadedImages.length" class="mb-1 mt-4 w-full h-auto">
          <h2>ຫຼັກຖານການໂອນເງິນ</h2>

          <!-- Flex container for images -->
          <div class="flex flex-wrap items-center justify-start gap-4 -mt-1">
            <div v-for="(doc, index) in attachments" :key="'old-' + index"
              class="w-[90px] h-[130px] flex items-center justify-center overflow-hidden rounded-md">
              <a-image class="flex items-center justify-center" :src="doc?.file_name_url"
                style="max-width: 100%; max-height: 100%;" />
            </div>
            <!-- Show upload button only if user can upload -->
            <div v-if="check && isAwaitingUser && isUserPendingApprover"
              class="flex flex-col items-center justify-center w-[190px] h-[120px] border border-dashed bg-gray-100/60 border-gray-300 rounded-md hover:border-red-500 transition cursor-pointer"
              @click="createModalVisible = true">
              <Icon icon="mdi:upload" class="text-2xl text-gray-400 mb-1" />
              <p class="text-gray-600 text-sm">Click to upload</p>
              <p class="text-gray-400 text-xs">SVG, PNG, JPG (MAX. 5MB)</p>
            </div>
          </div>
        </div>

        <!-- Show both old attachments and new uploaded images when there are new uploads -->
        <div v-if="uploadedImages.length" class="mb-1 mt-4 w-full h-auto">
          <h2>ຫຼັກຖານການໂອນເງິນ</h2>

          <!-- Single flex container for all images -->
          <div class="flex flex-wrap items-center justify-start gap-2 -mt-1">
            <!-- Old attachments -->
            <div v-for="(doc, index) in attachments" :key="'old-' + index"
              class="w-[90px] h-[130px] flex items-center justify-center overflow-hidden rounded-md border-2 border-gray-200">
              <a-image class="flex items-center justify-center" :src="doc?.file_name_url"
                style="max-width: 100%; max-height: 100%;" />
            </div>

            <!-- New uploaded images -->
            <div v-for="(img, index) in uploadedImages" :key="'new-' + index"
              class="relative w-[100px] h-[130px] flex items-center justify-center overflow-hidden rounded-md border-2 border-blue-300">
              <a-image :src="img" style="max-width: 100%; max-height: 100%;" />
              <button @click="deleteImage(index)"
                class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs">
                ×
              </button>
            </div>

            <!-- Add more images button -->
            <div @click="createModalVisible = true"
              class="w-[3rem] h-[3rem] flex items-center justify-center border border-dashed bg-gray-100/60 border-gray-300 rounded-md hover:border-red-500 transition cursor-pointer">
              <Icon icon="material-symbols:image-arrow-up-outline-rounded" class="text-2xl text-gray-400 mb-1" />
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
            <p v-if="step.doc_approver" class="text-slate-500 text-sm font-bold">
              {{ getStepTitle(index, step) }}
              <!-- {{ index === 0 ? "ຜູ້ສ້າງ" : t("purchase-rq.approver") + ' ' + (step.step_number) }} -->
            </p>

            <a-image v-if="step.approver?.user_signature?.signature_url" class=" -mt-2"
              :src="step.approver?.user_signature?.signature_url" alt="signature" :width="120" :height="100"
              :preview="false" />
            <div v-else
              class="w-[120px] h-[80px] border border-slate-100 flex items-center justify-center text-xs text-slate-400">
              <!-- No Signature -->
            </div>

            <div class="info text-sm text-slate-600 space-y-1">
              <p>{{ step.approver?.username || "-" }}</p>
              <p>{{ getStepPosition(step) }}</p>
              <p>{{ step?.approved_at || "-" }}</p>
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

    <UiModal
      title="ເລືອກຮູບແບບການພິມ"
      title-icon="ant-design:printer-outlined"
      :visible="printModalVisible"
      :width="460"
      @update:visible="printModalVisible = $event"
      @ok="handlePrintConfirm"
      @cancel="printModalVisible = false"
    >
      <div class="py-2">
        <Radio.Group v-model:value="printType" class="flex flex-col gap-3">
          <Radio value="about_receipt">ສະເພາະໃບເບີກຈ່າຍ (Receipt)</Radio>
          <Radio value="all_document">ທັງໝົດ (PR + PO + Receipt)</Radio>
        </Radio.Group>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton type="default" @click="printModalVisible = false">ຍົກເລີກ</UiButton>
          <UiButton type="primary" :loading="printLoading" @click="handlePrintConfirm">ພິມ</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
  <div class="print-only">
    <Print
      :receipt="rStore.currentReceipts"
      :data="rStore.printData"
      :mode="rStore.printMode"
    />
  </div>
</template>
<style scoped>
.user-info {
  background: white;
  border-radius: 0.5rem;
}

/* Exchange Rate UI */
.exchange-rate-card {
  border: 1px solid #f1f5f9;
}

.rate-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rate-row {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  min-height: 48px;
}

.pair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.curr-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  white-space: nowrap;
}

.curr-code {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
}

.pair-arrow {
  font-size: 1.1rem;
  color: #16a34a;
  flex-shrink: 0;
}

.flag-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.rate-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.rate-display {
  width: 100%;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
  padding: 0 0.75rem;
}

.rate-input {
  width: 100%;
}

.rate-input :deep(.ant-input-number) {
  width: 100% !important;
}

.action-cell {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-btn {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #2563eb;
}

.edit-btn:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.save-btn {
  background: #16a34a;
  border: 1px solid #16a34a;
  color: #fff;
}

.save-btn:hover:not(:disabled) {
  background: #15803d;
  border-color: #15803d;
}

.cancel-btn {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #6b7280;
}

.cancel-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

@media (max-width: 640px) {
  .rate-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .rate-display {
    text-align: left;
    padding: 0;
  }

  .action-cell {
    justify-content: flex-start;
  }
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
