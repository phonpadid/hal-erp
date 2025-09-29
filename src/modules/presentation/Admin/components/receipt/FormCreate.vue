<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import type { ButtonType } from "@/modules/shared/buttonType";
// import { useI18n } from "vue-i18n";
const selectType = ref<string>(""); // Single selection - empty string initially
// Components
import Table from "@/common/shared/components/table/Table.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import Radio from "@/common/shared/components/Input/Radio.vue";
import { usePurchaseOrderStore } from "../../stores/purchase_requests/purchase-order";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useReceiptStore } from "../../stores/receipt.store";
import { getUserApv } from "@/modules/shared/utils/get-user.login";
import { useI18n } from "vue-i18n";
import { useApprovalStepStore } from "../../stores/approval-step.store";
import OtpModal from "../disbursement-slip/approval-finance-dpm/modals/OtpModal.vue";
import PropovalDrawer from "../disbursement-slip/approval-finance-dpm/drawers/PropovalDrawer.vue";
import ApprovalDrawer from "../disbursement-slip/approval-finance-dpm/drawers/ApprovalDrawer.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
const purchaseOrderStore = usePurchaseOrderStore();
const orderDetails = ref<PurchaseOrderEntity | null>(null);
const { error } = useNotification();
const rStore = useReceiptStore();
const user = computed(() => getUserApv());
const { t } = useI18n();
const openPropoval = ref(false);
const openAppropoval = ref(false);
const selectedId = ref<number | null>(null);
/********************************************************* */
const isOtpModalVisible = ref(false);
const otpLoading = ref(false);
const modalAction = ref("");
const otpSending = ref(false);
const approvalStepStore = useApprovalStepStore();
// const { t } = useI18n();
const { params } = useRoute();
const purchaseOrderId = params.id?.toString();
// --- Reactive State for Form Inputs ---
const remark = ref("");
const document_type = params.docid as string; // Fixed documentTypeId based on your API payload
// Updated form state to match API payload structure
const formState = ref({
  purchase_order_id: undefined as number | undefined,
  remark: "",
  document: {
    documentTypeId: document_type, // Fixed documentTypeId based on your API payload
  },
  receipt_items: [] as Array<{
    purchase_order_item_id: number;
    payment_currency_id: number;
    payment_type: string;
    remark: string;
  }>,
});

// Computed property to build receipt_items array
const buildReceiptItems = computed(() => {
  if (!orderDetails.value || !selectType.value) return [];

  return orderDetails.value.getPurchaseOrderItem().map((item) => ({
    purchase_order_item_id: String(item.getId()), // Assuming item has an id property
    payment_currency_id: String(item?.getCurrency()?.id), // You might need to get this from the item or set it based on your logic
    payment_type: selectType.value || "",
    remark: remark.value || "",
  }));
});

// Function to send data to API
const submitPaymentRequest = async () => {
  try {
    if (!orderDetails.value) {
      error("ບໍ່ພົບຂໍ້ມູນເອກະສານ");
      return;
    }

    if (!selectType.value) {
      error("ກະລຸນາເລືອກປະເພດການຈ່າຍເງິນ");
      return;
    }

    const payload = {
      purchase_order_id: purchaseOrderId,
      remark: formState.value.remark,
      documentType_id: formState.value.document.documentTypeId.toString(),
      receipt_items: buildReceiptItems.value,
    };
    await rStore.created(payload);
    console.log("dataHead:", dataHead.value);
    console.log("rStore.currentReceipts:", rStore.currentReceipts);
    modalAction.value = "approve";
    if (dataHead.value?.is_otp) {
      // 🔹 Call request OTP before showing modal
      await requestOtp();
    } else {
      // 🔹 Skip OTP, just open modal directly
      isOtpModalVisible.value = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງໃບເບີກຈ່າຍ", err);
  }
};

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
const dataHead = computed(() => ({
  rId: Number(rStore.currentReceipts?.id) || 0,
  no: rStore.currentReceipts?.receipt_number,
  data: {
    isStep_on: true,
    stepId: rStore.currentReceipts?.user_approval?.approval_step?.find(
      (step) =>
        step.status_id === 1 && // only steps with status_id === 1
        step.doc_approver?.some((doc) => doc.user?.id === user.value?.id)
    )?.id,
    remark: rStore.currentReceipts?.remark,
    type: "r",
    files: [],
    account_code: "",
  },
  status: rStore.currentReceipts?.user_approval?.approval_step?.map((step) => ({
    id: step.status_id,
    name: step.document_status.name,
  })),
  created_at: rStore.currentReceipts?.created_at,
  is_otp: rStore.currentReceipts?.user_approval?.approval_step?.some(
    (step) => step.status_id === 1 && step.is_otp
  ),
  approver_info: userNextApprove.value,
}));

// Header buttons based on the image
const customButtons = [
  {
    label: t('receipt.title.create'),
    type: "primary" as ButtonType,
    danger: true, // Making the button red as in the image
    onClick: submitPaymentRequest,
  },
  {
    label: "Print",
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100",
    type: "default" as ButtonType,
    onClick: () => {
      window.print();
    },
  },
];

const typeOption = [
  { label: "ເງິນສົດ (Cash)", value: "cash" },
  { label: "ໂອນເງິນ (Transfer)", value: "transfer" },
  { label: "ເຊັກ (Cheque)", value: "cheque" },
];

const columns = [
  {
    title: "ລຳດັບ",
    dataIndex: "id",
    key: "id",
    width: 80,
    align: "center",
  },
  {
    title: "ເນື້ອໃນລາຍການ",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "ລະຫັດງົບປະມານ",
    dataIndex: "budgetCode",
    key: "budgetCode",
  },
  {
    title: "ລາຄາລວມ",
    dataIndex: "total",
    key: "total",
    align: "right",
  },
];
// OTP Modal handlers
const handleOtpConfirm = async (otpValue: string) => {
  try {
    otpLoading.value = true;

    if (modalAction.value === "approve") {
      // Handle approval logic with OTP
      console.log("Approving with OTP:", otpValue);
      isOtpModalVisible.value = false;
    }
  } catch (error) {
    console.error("OTP confirmation error:", error);
    // Handle error - maybe show error modal instead
  } finally {
    otpLoading.value = false;
  }
};

const handleOtpClose = () => {
  isOtpModalVisible.value = false;
  modalAction.value = "";
};

const handleOtpResend = async () => {
  try {
    if (!dataHead.value?.data?.stepId) {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ID");
      return;
    }
    await approvalStepStore.sendOtp(dataHead.value.data.stepId);
  } catch (error) {
    console.error("Resend OTP error:", error);
  }
};
const requestOtp = async () => {
  if (!dataHead.value?.data?.stepId) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ID");
    return;
  }

  try {
    otpSending.value = true;
    const otpResponse = await approvalStepStore.sendOtp(
      dataHead.value?.data.stepId
    );
    if (otpResponse) {
      isOtpModalVisible.value = true;
    } else {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງລະຫັດ OTP ໄດ້");
    }
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  } finally {
    otpSending.value = false;
  }
};
const fetchOrderDetails = async () => {
  try {
    const result = await purchaseOrderStore.fetchById(Number(purchaseOrderId));
    if (result) {
      orderDetails.value = result;
      // Set the purchase_order_id in formState
      formState.value.purchase_order_id = Number(purchaseOrderId);
    } else {
      error("ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ", err);
  }
};

onMounted(async () => {
  await fetchOrderDetails();
});
const showPropoval = () => {
  selectedId.value =
    Number(orderDetails.value?.getPurchaseRequest().id) ?? null;
  openPropoval.value = true;
};
const showApproval = () => {
  selectedId.value =
    Number(
      orderDetails.value?.getPurchaseOrderItem()[0].getPurchaseOrderId()
    ) ?? null;
  openAppropoval.value = true;
};
</script>

<template>
  <div class="p-4">
    <header-component
      :header-title="t('menu-sidebar.receipt')"
      :breadcrumb-items="[t('receipt.title.approval_proposal'), t('receipt.title.create')]"
      :show-document-date="false"
      :show-document-number="false"
      :document-prefix="t('receipt.title.create')"
      :action-buttons="customButtons"
    />
    <div class="bg-white rounded-lg shadow-sm p-2 mt-4">
      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ຈາກໜ່ວຍງານ</h3>
        <div class="flex items-center gap-3">
          <a-avatar size="large" :src="'/public/4.png'" />
          <div>
            <p class="font-medium">
              {{ orderDetails?.getRequester().username }}
            </p>
            <p class="text-gray-500 text-sm">
              {{ orderDetails?.getPosition()[0].name }}
            </p>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">{{ t("purchase-rq.field.purposes") }}</h3>
        <UiInput
          v-model="formState.remark"
          placeholder="ປ້ອນຈຸດປະສົງ"
          className="bg-gray-50"
        />
      </div>

      <div class="mb-6 border rounded-lg p-4">
        <h3 class="text-base font-semibold mb-4">{{ t("disbursement.vendor.title") }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="flex">
            <span class="font-medium w-28">{{ t("disbursement.vendor.name") }}</span>
            <span class="text-gray-700">{{
              orderDetails
                ?.getPurchaseOrderItem()[0]
                .getSelectedVendor()
                ?.getVendor().name
            }}</span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">{{ t("disbursement.vendor.bank") }}</span>
            <span class="text-gray-700 flex items-center gap-2">
              <img
                :src="orderDetails?.getBankLogo() ?? ''"
                class="w-6 h-6"
                alt="Bank Icon"
              />
              {{ orderDetails?.getBankName() }}
            </span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">{{ t("disbursement.vendor.account_name") }}</span>
            <span class="text-gray-700">{{
              orderDetails?.getAccountName()
            }}</span>
          </div>
          <!-- <div class="flex">
            <span class="font-medium w-28">ເລກບັນຊີ LAK</span>
            <span class="text-gray-700">{{
              orderDetails?.getAccountNumber()
            }}</span>
          </div> -->
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700 flex items-center gap-1"
              >{{ t("disbursement.vendor.account_number") }}
              <span
                class="text-sm rounded-full py-1 w-14 flex justify-center items-center bg-gray-200/70"
                >{{ orderDetails?.getCurrencyCode() }}</span
              >
            </label>
            <span class="text-gray-700">{{ orderDetails?.getAccountNumber() }}</span>
          </div>
        </div>
      </div>
      <!-- FIXED CHECKBOX SECTION - SINGLE SELECTION -->
      <div class="select-type mb-6">
        <h3 class="text-base font-semibold mb-4">ປະເພດການຈ່າຍເງິນ</h3>
        <div class="space-y-2">
          <Radio v-model="selectType" :options="typeOption" />
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ລາຍການ</h3>
        <Table
          :columns="columns"
          :dataSource="orderDetails?.getPurchaseOrderItem() ?? []"
        >
          <template #id="{ index }">
            <span class="font-medium">{{ index + 1 }}</span>
          </template>
          <template #total="{ record }">
            <span class="font-medium">
              {{ record.total.toLocaleString() }} ₭
            </span>
          </template>
        </Table>
        <div class="flex justify-end mt-4">
          <div class="w-1/3">
            <div class="flex justify-center gap-2 items-center">
              <span class="font-semibold text-gray-700">ມູນຄ່າລວມທັງໝົດ:</span>
              <span class="font-bold text-lg text-red-600">
                {{ orderDetails?.getPurchaseRequest().total.toLocaleString() }}
                ₭
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ໝາຍເຫດ</h3>
        <UiInput
          v-model="remark"
          placeholder="ລະບຸຂໍ້ມູນເພີ່ມເຕີມ (ຖ້າມີ)"
          className="bg-gray-50"
        />
      </div>

      <div>
        <!-- test: {{ orderDetails?.getPurchaseRequest().id }}
        <span>ເອກະສານທີຕິດຂັດ</span>
        <div class="flex items-center gap-2 mt-2">
          <HeaderComponent
            :header-title="`${orderDetails?.getPurchaseRequest()?.document.document_type.name} - ເລກທີ ${orderDetails?.getPurchaseRequest().pr_number}`"
            header-title-color="blue-600"
            prefix-icon="mdi:file-document-outline"
            suffix-icon="mdi:arrow-top-right"
            prefix-icon-class="text-blue-500"
            suffix-icon-class="text-blue-500"
            :suffix-icon-clickable="true"
            :show-document-date="false"
            :show-document-number="false"
            :show-document-prefix="false"
            :show-breadcrumb="false"
            class="cursor-pointer"
            @click="showDrawer"
          />
          <HeaderComponent
            :header-title="`${orderDetails?.getDocument()?.document_type?.name} - ເລກທີ ${orderDetails?.getPoNumber()}`"
            header-title-color="blue-600"
            prefix-icon="mdi:file-document-outline"
            suffix-icon="mdi:arrow-top-right"
            prefix-icon-class="text-blue-500"
            suffix-icon-class="text-blue-500"
            :suffix-icon-clickable="true"
            :show-document-date="false"
            :show-document-number="false"
            :show-document-prefix="false"
            :show-breadcrumb="false"
            class="cursor-pointer"
            @click="showDrawer"
          />
        </div> -->
        <div class="mt-4 shadow-sm p-4 px-2 bg-white rounded-md">
          <h2 class="text-md font-semibold mb-3">
            {{ $t("disbursement.field.doc_attachment") }}
          </h2>
          <div class="flex flex-wrap gap-4">
            <div
              @click="showPropoval"
              class="text-sky-500 hover:text-sky-600 p-2 bg-slate-50 flex items-center gap-2 cursor-pointer rounded-full"
            >
              <Icon icon="material-symbols:docs-outline" />
              <span class="text-sm">{{
                orderDetails?.getPurchaseRequest()?.document.document_type
                  .name +
                "- ເລກທີ " +
                orderDetails?.getPurchaseRequest().pr_number
              }}</span>
              <Icon icon="mdi:arrow-top-right" />
            </div>
            <div
              @click="showApproval"
              class="text-sky-500 hover:text-sky-600 p-2 bg-slate-50 flex items-center gap-2 cursor-pointer rounded-full"
            >
              <Icon icon="material-symbols:docs-outline" />
              <span class="text-sm">{{
                orderDetails?.getDocument()?.document_type?.name +
                " - ເລກທີ " +
                orderDetails?.getPoNumber()
              }}</span>
              <Icon icon="mdi:arrow-top-right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <OtpModal
    :visible="isOtpModalVisible"
    :title="t('purchase-rq.otp_verification')"
    :loading="otpLoading"
    :approval-step-id="1"
    :is_otp="dataHead?.is_otp"
    :r-id="dataHead?.rId"
    :data-head="dataHead?.data"
    @confirm="handleOtpConfirm"
    @close="handleOtpClose"
    @resend="handleOtpResend"
  />

  <UiDrawer
    v-model:open="openPropoval"
    :title="`${
      orderDetails?.getPurchaseRequest()?.document.document_type.name
    } - ເລກທີ ${orderDetails?.getPurchaseRequest().pr_number}`"
    placement="right"
    :width="1185"
  >
    <PropovalDrawer :id="selectedId" />
  </UiDrawer>

  <UiDrawer
    v-model:open="openAppropoval"
    :title="`${
      orderDetails?.getDocument()?.document_type?.name
    } - ເລກທີ ${orderDetails?.getPoNumber()}`"
    placement="right"
    :width="1185"
  >
    <ApprovalDrawer :id="selectedId" />
  </UiDrawer>
</template>

<style scoped>
.select-type .space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style>
