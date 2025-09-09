<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { computed, nextTick, onMounted, ref } from "vue";
import { columnsApprovalDetails } from "../../views/budget/budget-approval/column/columnDetails";
import { useI18n } from "vue-i18n";
import { usePurchaseOrderStore } from "../../stores/purchase_requests/purchase-order";
import { useNotification } from "@/modules/shared/utils/useNotification";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import { useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderShowDrawer from "../purchase/purchase_orders/PurchaseOrderShowDrawer.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import BudgetApprovalDrawer from "./BudgetApprovalDrawer.vue";
import { formatPrice } from "@/modules/shared/utils/format-price";
/********************************************************* */
const { t } = useI18n();
const { success, error } = useNotification();
const store = usePurchaseOrderStore();
const route = useRoute();
const orderDetails = ref<PurchaseOrderEntity | null>(null);
const orderId = ref<number | null>(null);
const isApproveModalVisible = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const confirmLoading = ref(false);
const visible = ref(false);
const visibleBudget = ref(false);

const showDrawer = () => {
  visible.value = true;
};
const showBudgetDrawer = (record: any) => {
  activeItemRecord.value = record;
  visibleBudget.value = true;
};
const otpValue = ref<string[]>(Array(6).fill(""));
const otpInputRefs = ref<any[]>([]);
const currentStep = ref(0);
const isOtpModalVisible = ref(false);
const isSignatureModalVisible = ref(false);
const isSuccessModalVisible = ref(false);
const signatureData = ref("");

const fetchOrderDetails = async () => {
  const id = parseInt(route.params.id as string, 10);
  if (isNaN(id)) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບລະຫັດເອກະສານ");
    return;
  }
  orderId.value = id;
  const result = await store.fetchById(id);
  if (result) {
    orderDetails.value = result;
  } else {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດດຶງຂໍ້ມູນເອກະສານໄດ້");
  }
};
/***************ດຶງຂໍ້ມູນ********************* */
onMounted(fetchOrderDetails);
/***************ດຶງຂໍ້ມູນ********************* */

const getItemsForTable = computed(() => {
  return orderDetails.value?.getPurchaseOrderItem() ?? [];
});
// Custom buttons for header
const customButtons = [
  {
    label: "print",
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100",
    type: "default" as ButtonType,
    onClick: () => {
      isRejectModalVisible.value = true;
    },
  },
  {
    label: "ປະຕິເສດ",

    class: "bg-white flex items-center gap-2 hover:bg-gray-100",
    type: "default" as ButtonType,
    onClick: () => {
      isRejectModalVisible.value = true;
    },
  },
  {
    label: "ອະນຸມັດ",

    class: "bg-red-500 flex items-center gap-2 hover:bg-red-800 text-white hover:!text-white",
    type: "default" as ButtonType,
    onClick: () => {
      isApproveModalVisible.value = true;
    },
  },
];

const handleBudgetConfirm = (data: any) => {
  if (activeItemRecord.value) {
    selectedBudgets.value[activeItemRecord.value.id] = data;
    console.log("Selected budgets:", selectedBudgets.value);
  }
  visibleBudget.value = false;
};
const userInfo = {
  name: "ນາງ ປາກາລີ ລາຊະບູລີ",
  department: "ພະແນກໄອທີ, ພະບໍລິມາດ",
};
// Handle approve
const handleApprove = async () => {
  try {
    confirmLoading.value = true;
    // Your approve logic here
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    isApproveModalVisible.value = false;
  } finally {
    confirmLoading.value = false;
  }
};

// Handle reject
const handleReject = async () => {
  try {
    if (!rejectReason.value.trim()) {
      return;
    }
    confirmLoading.value = true;
    // Your reject logic here
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    isRejectModalVisible.value = false;
    rejectReason.value = "";
  } finally {
    confirmLoading.value = false;
  }
};

// Document details
const documentDetails = {
  requester: {
    name: "ທ່ານ ພົມມະກອນ ຄວາມຄູ",
    position: "ພະນັກງານພັດທະນາລະບົບ, ຝ່າຍໄອທີ",
    avatar: "/public/4.png",
  },
  requestDate: "30 ມີນາ 2025",
  purpose:
    "ເພື່ອໃຫ້ແທດເໝາະ ໃຫ້ຮອງຮັບກັບການປະຕິບັດວຽກງານ ແລະ ເພື່ອອຳນວຍຄວາມສະດວກໃນການປະຕິບັດໜ້າທີ່ວຽກງານ",
};

// Signatures
const signatures = computed(() => {
  const sigs = [];
  const requester = orderDetails.value?.getRequester();
  const userApproval = orderDetails.value?.getUserApproval();
  const approvedStep = userApproval?.approval_step?.find((step: any) => step.status_id === 2); // APPROVED status id
  const approver = approvedStep?.approver;

  // ลายเซ็นของผู้เสนอ (Requester)
  if (requester) {
    sigs.push({
      role: "ຜູ້ສະເໜີ",
      name: requester.username,
      position: orderDetails.value?.getPosition()?.[0]?.name,
      signature_url: requester.user_signature?.signature_url || null,
    });
  }

  // ลายเซ็นของผู้ที่อนุมัติ
  if (approver) {
    sigs.push({
      role: "ຜູ້ອານຸມັດ",
      name: approver.username,
      position: "ຜູ້ຈັດການ", // สมมติว่า role นี้เป็นผู้จัดการ
      signature_url: approver.user_signature?.signature_url || null,
    });
  }

  return sigs;
});
// OTP
const handleOtpInput = (value: string, index: number) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (numericValue) {
    otpValue.value[index] = numericValue[0];
    if (index < 5) {
      nextTick(() => {
        const nextInput = otpInputRefs.value[index + 1];
        if (nextInput) {
          const inputElement = nextInput.$el.querySelector("input") || nextInput.$el;
          inputElement?.focus();
        }
      });
    }
  } else {
    otpValue.value[index] = "";
  }
};
//************************************* */
const handleOtpKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === "Backspace" && !otpValue.value[index]) {
    event.preventDefault();
    // ย้ายไป input ก่อนหน้า
    if (index > 0) {
      nextTick(() => {
        const prevInput = otpInputRefs.value[index - 1];
        if (prevInput) {
          const inputElement = prevInput.$el.querySelector("input") || prevInput.$el;
          inputElement?.focus();
          // เคลียร์ค่าของ input ก่อนหน้า
          otpValue.value[index - 1] = "";
        }
      });
    }
  }
  if (
    !/^\d$/.test(event.key) &&
    !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    event.preventDefault();
  }
};
/********************************************************** */
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData("text").replace(/[^0-9]/g, "");
  if (pastedData) {
    const digits = pastedData.split("").slice(0, 6);
    digits.forEach((digit, index) => {
      if (index < 6) {
        otpValue.value[index] = digit;
      }
    });
    const nextIndex = Math.min(digits.length, 5);
    nextTick(() => {
      const nextInput = otpInputRefs.value[nextIndex];
      if (nextInput) {
        const inputElement = nextInput.$el.querySelector("input") || nextInput.$el;
        inputElement?.focus();
      }
    });
  }
};
/********************************************************** */
const handleOtpConfirm = async () => {
  try {
    confirmLoading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isOtpModalVisible.value = false;
    isSignatureModalVisible.value = true;
  } catch (err) {
    console.error(err);
    error("ການຢືນຢັນ OTP ລົ້ມເຫລວ");
  } finally {
    confirmLoading.value = false;
    otpValue.value = Array(6).fill("");
  }
};

// Handle signature confirmation
const handleSignatureConfirm = async () => {
  try {
    confirmLoading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isSignatureModalVisible.value = false;
    isSuccessModalVisible.value = true;
    // currentStep.value = 1;
    success("ການຢືນຢັນສຳເລັດ");
  } catch (err) {
    console.error(err);
    error("ການຢືນຢັນລາຍເຊັນລົ້ມເຫລວ");
  } finally {
    confirmLoading.value = false;
  }
};
const handleSuccessConfirm = async () => {
  try {
    confirmLoading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isSuccessModalVisible.value = false;
    success("ການຢືນຢັນສຳເລັດ");
    currentStep.value = 1;
  } catch (err) {
    console.error(err);
    error("ການຢືນຢັນລາຍເຊັນລົ້ມເຫລວ");
  } finally {
    confirmLoading.value = false;
  }
};
/******************************************************* */
const setOtpInputRef = (el: any, index: number) => {
  if (el) {
    otpInputRefs.value[index] = el;
  }
};
/********************************** */
const handleModalCancel = () => {
  isOtpModalVisible.value = false;
  isSignatureModalVisible.value = false;
  isSuccessModalVisible.value = false;
  otpValue.value = Array(6).fill("");
  signatureData.value = "";
};

/************************Drawer**************************** */
const selectedBudgets = ref<Record<string, any>>({});
const activeItemRecord = ref<any>(null);
</script>

<template>
  <div class="mt-10">
    <!-- Header Component -->
    <header-component
      header-title="ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ"
      :breadcrumb-items="['ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ', 'ອານຸມັດ']"
      document-prefix="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ"
      document-number="0036/ພລ - ວັນທີ"
      :document-date="'2025-03-26'"
      :action-buttons="customButtons"
      document-status="ລໍຖ້າງົບປະມານກວດສອບ"
      document-status-class="text-orange-500 font-medium ml-2 bg-orange-50 px-3 py-1 rounded-full"
    />
    <!-- Action Buttons -->
    <UiModal
      title="ປະຕິເສດ"
      :visible="isApproveModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isApproveModalVisible = false"
      @ok="handleApprove"
    >
      <p>ທ່ານຕ້ອງການຢືນຢັນຄຳຂໍຈັດຊື້ ແທ້ ຫຼື ບໍ່?</p>
      <template #footer>
        <div class="flex">
          <UiButton @click="isApproveModalVisible = false" type="default" color-class="w-full"
            >ຍົກເລີກ</UiButton
          >
          <UiButton
            @click="handleReject"
            type="primary"
            :loading="confirmLoading"
            color-class="w-full"
            >ຢືນຢັນ</UiButton
          >
        </div>
      </template>
    </UiModal>
    <!-- OTP -->
    <UiModal
      title="ລາຍເຊັນ"
      title-icon="material-symbols-light:signature"
      :visible="isOtpModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isOtpModalVisible = $event"
      @ok="handleOtpConfirm"
      @cancel="handleModalCancel"
    >
      <div class="p-4">
        <div>
          <p>{{ userInfo.name }} {{ userInfo.department }}</p>
        </div>
        <div>
          <p class="text-gray-950 text-xl">ກວດສອບຂໍ້ຄວາມ</p>
          <p class="text-sm text-gray-500 mb-4">
            ລະຫັດຢືນຢັນ 6 ຕົວ ໄດ້ສົ່ງໄປທີ່ເບີໂທລະສັບ +856 20 5555 5555
          </p>
          <!-- OTP Input -->
          <div class="flex justify-center gap-2">
            <template v-for="i in 6" :key="i">
              <UiInput
                :ref="(el) => setOtpInputRef(el, i - 1)"
                v-model="otpValue[i - 1]"
                class="w-12 h-12 text-center text-xl"
                :maxlength="1"
                type="text"
                pattern="[0-9]*"
                inputmode="numeric"
                @input="(value) => handleOtpInput(value, i - 1)"
                @keydown="(event) => handleOtpKeydown(event, i - 1)"
                @paste="handlePaste"
              />
            </template>
          </div>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-500">
            ບໍ່ໄດ້ຮັບລະຫັດ?
            <a-button type="link" class="p-0">ສົ່ງອີກຄັ້ງ</a-button>
          </p>
        </div>
      </div>
      <template #footer>
        <div class="flex">
          <UiButton
            @click="handleOtpConfirm"
            type="primary"
            :loading="confirmLoading"
            color-class="w-full"
            >ຢືນຢັນ</UiButton
          >
        </div>
      </template>
    </UiModal>
    <!-- OTP -->
    <!-- Signature Modal -->
    <UiModal
      title="ລາຍເຊັນ"
      title-icon="material-symbols-light:signature"
      :visible="isSignatureModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isSignatureModalVisible = $event"
      @ok="handleSignatureConfirm"
      @cancel="handleModalCancel"
    >
      <div>
        <div>
          <p>{{ userInfo.name }} {{ userInfo.department }}</p>
        </div>

        <div>
          <p class="text-xl font-bold">ລາຍເຊັນ</p>
          <p>ລາຍເຊັນຂອງທ່ານຈະຖືກນຳໃຊ້ໃນການຢືນຢັນເອກະສານ</p>

          <!-- Signature Pad -->
          <div class="flex justify-center w-full">
            <img src="/public/2.png" class="w-52" />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex">
          <UiButton
            @click="handleSignatureConfirm"
            type="primary"
            :loading="confirmLoading"
            color-class="w-full"
            >ຢືນຢັນ</UiButton
          >
        </div>
      </template>
    </UiModal>
    <!-- Success Modal -->
    <UiModal
      title=""
      :visible="isSuccessModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isSuccessModalVisible = $event"
      @ok="handleSuccessConfirm"
      @cancel="handleModalCancel"
    >
      <div>
        <div>
          <Icon icon="mdi:check-decagram" class="text-green-500 text-6xl mx-auto mt-4" />
          <p>ອະນຸມັດສຳເລັດ</p>
          <span
            >ອະນຸມັດຄຳຂໍຈັດຊື້ຂອງທ່ານສຳເລັດ ຂໍ້ມູນຈະຖືກສົ່ງໄປຫາພະແນກການເງິນເພື່ອອະນຸມັດຂໍ້ມູນ</span
          >
        </div>
      </div>
      <template #footer>
        <div class="flex">
          <UiButton
            @click="handleSuccessConfirm"
            type="primary"
            :loading="confirmLoading"
            color-class="w-full"
            >ຢືນຢັນ</UiButton
          >
        </div>
      </template>
    </UiModal>

    <!-- Reject Modal -->
    <UiModal
      title="ປະຕິເສດ"
      :visible="isRejectModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isRejectModalVisible = false"
      @ok="handleReject"
    >
      <div class="space-y-4">
        <p>ໃສ່ເຫດຜົນໃນການປະຕິເສດ</p>
        <div>
          <p class="mb-2 font-semibold">ເຫດຜົນ</p>
          <Textarea :modelValue="rejectReason" placeholder="ປ້ອນເຫດຜົນ" :rows="4" />
        </div>
      </div>
      <template #footer>
        <UiButton
          @click="handleReject"
          type="primary"
          :loading="confirmLoading"
          color-class="w-full"
          >ຢືນຢັນ</UiButton
        >
      </template>
    </UiModal>
    <UiDrawer
      v-model:open="visible"
      title="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
      placement="right"
      :width="1050"
    >
      <PurchaseOrderShowDrawer />
    </UiDrawer>
    <!-- Budget Selection Drawer -->
    <UiDrawer
      v-model:open="visibleBudget"
      title="ເລືອກລະຫັດງົບປະມານ"
      placement="right"
      :width="500"
    >
      <BudgetApprovalDrawer
        :item-name="'ຄອມພິວເຕີ MacBook Air M3 (16GB/512GB)'"
        :item-price="24090000"
        @confirm="handleBudgetConfirm"
      />
    </UiDrawer>

    <div v-if="store.loading" class="flex justify-center items-center h-48">
      <p>ກຳລັງດຶງຂໍ້ມູນ...</p>
    </div>
    <div v-else-if="store.error">
      <p>ເກີດຂໍ້ຜິດພາດ: {{ store.error }}</p>
    </div>
    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow-sm p-6 mt-6" v-else-if="orderDetails">
      <h2>ຂໍ້ມູນສ້າງໃບອານຸມັດຈັດຊື້ - ຈັດຈ້າງ</h2>
      <!-- Requester Information -->
      <div class="flex items-start gap-4 mb-2">
        <img
          :src="documentDetails.requester.avatar"
          alt="Requester Avatar"
          class="w-14 h-14 rounded-full mb-2"
        />
        <div>
          <h4>{{ orderDetails?.getRequester()?.username }}</h4>
          <p class="text-gray-600">
            {{ orderDetails?.getDepartment()?.name }}, {{ orderDetails?.getPosition()?.[0]?.name }}
          </p>
        </div>
      </div>
      <!-- ຂໍ້ມຸນຜູ້ສະເໜີ -->
      <div>
        <h4>ສະເໜີ</h4>
        <div class="grid grid-cols-4">
          <div class="grid grid-rows-2">
            <h5>ຂໍ້ສະເໜີເບີກງົບປະມານ</h5>
            <span class="text-sm">{{ orderDetails?.getPurposes() }}</span>
          </div>
          <div class="grid grid-rows-2">
            <h5>ຈຳນວນ</h5>
            <span class="text-sm">{{ orderDetails?.getPurchaseOrderItem()?.length }}</span>
          </div>
          <div class="grid grid-rows-2">
            <h5>ພະແນກ</h5>
            <span class="text-sm">{{ orderDetails?.getDepartment()?.name }}</span>
          </div>
          <div class="grid grid-rows-2">
            <h5>ໜ່ວຍງານ</h5>
            <span class="text-sm"> {{ orderDetails?.getPosition()?.[0]?.name }}</span>
          </div>
        </div>
      </div>

      <!-- Purpose -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">ຈຸດປະສົງ ແລະ ລາຍການ</h4>
        <p class="text-gray-600">{{ orderDetails?.getDocument()?.description }}</p>
      </div>

      <!-- Items Table -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">ລາຍການ</h4>
        <Table :columns="columnsApprovalDetails(t)" :dataSource="getItemsForTable">
          <template #number="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template #quantity="{ record }">
            <span class="text-gray-600"
              >{{ record.quantity }}
              {{
                orderDetails.getPurchaseRequest()?.purchase_request_item?.[0]?.unit?.name || "N/A"
              }}</span
            >
          </template>
          <template #id_name="{ record }">
            <span class="text-gray-600">
              <div v-if="selectedBudgets[record.id]">
                <span class="font-semibold text-blue-700">
                  {{ selectedBudgets[record.id].budgetCode }} -
                  {{ selectedBudgets[record.id].budgetName }}
                </span>
                <UiButton @click="showBudgetDrawer(record)" type="link" class="p-0 text-blue-500">
                  ແກ້ໄຂ
                </UiButton>
              </div>
              <div v-else>
                <UiButton
                  @click="showBudgetDrawer(record)"
                  type="default"
                  class="w-full flex justify-between items-center text-blue-600 font-medium"
                >
                  <div class="flex-grow text-left">ເລືອກປະເພດງົບປະມານ</div>

                  <Icon icon="mdi:chevron-right" class="text-xl" />
                </UiButton>
              </div>
            </span>
          </template>
          <template #price="{ record }">
            <span class="text-gray-600">{{ record.price.toLocaleString() }}</span>
          </template>
          <template #total="{ record }">
            <span class="text-gray-600">{{ record.total.toLocaleString() }}</span>
          </template>
        </Table>
        <div>
          <p class="text-gray-500 mt-2 flex justify-end">
            {{ t("purchase_qequest.table.total") }}:
            <span class="font-semibold">{{ formatPrice(orderDetails?.getTotalWithVAT()) }}</span>
          </p>
        </div>
      </div>

      <!-- Attachments -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">ໃບສະເໜີລາຄາ</h4>
        <div class="border rounded-lg p-4">
          <img
            :src="orderDetails?.getQuotationImageUrl() || 'ບໍ່ມີຂໍ້ມູນຮູບ'"
            alt="MacBook Air"
            class="max-w-md rounded-lg"
          />
        </div>
      </div>
      <!-- ຂໍ້ມູນບັນຊີທະນາຄານ -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-4">ຂໍ້ມູນບັນຊີຮ້ານ</h4>
        <div class="grid grid-cols-2 mb-2">
          <span class="font-medium">ທະນາຄານ:</span>
          <span class="text-gray-600 flex items-center gap-2">
            <img
              :src="orderDetails.getBankLogo() || '/public/bclone.png'"
              class="w-8 h-8"
              alt="ໂລໂກ້ທະນາຄານ"
            />

            <span> {{ orderDetails?.getBankName() }}</span>
          </span>
        </div>
        <div class="grid grid-cols-2 mb-2">
          <span class="font-medium">ຊືບັນຊີ:</span>
          <span class="text-gray-600">{{ orderDetails.getAccountName() }}</span>
        </div>
        <div class="grid grid-cols-2">
          <span class="font-medium">ເລກບັນຊີ {{ orderDetails.getCurrencyCode() }}:</span>
          <span class="text-gray-600">{{ orderDetails.getAccountNumber() }}</span>
        </div>
      </div>
      <!-- Signatures -->
      <div class="grid grid-cols-2 gap-6">
        <h4 class="text-base font-semibold mb-4 col-span-2">ລາຍເຊັ່ນ</h4>
        <div v-for="(sig, index) in signatures" :key="index">
          <p class="font-semibold mb-2">{{ sig.role }}</p>
          <img
            :src="sig.signature_url || '/placeholder-signature.png'"
            :alt="`${sig.role} signature`"
            class="h-16 mb-2"
          />
          <p class="font-semibold">{{ sig.name }}</p>
          <p class="text-gray-600">{{ sig.position }}</p>
        </div>
      </div>
      <div>
        <span>ເອກະສານທີຕິດຂັດ</span>
        <HeaderComponent
          header-title="ໃບສະເໜີຈັດຊື້ - ເລກທີ 0036/ຈຊ/ຮລຕ/ນຄຫຼ"
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
      </div>
    </div>
  </div>
</template>

<style scoped></style>
