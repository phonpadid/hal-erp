<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { computed, onMounted, ref, watch } from "vue";
import { columnsApprovalDetails } from "../../views/budget/budget-approval/column/columnDetails";
import { useI18n } from "vue-i18n";
import { usePurchaseOrderStore } from "../../stores/purchase_requests/purchase-order";
import { useNotification } from "@/modules/shared/utils/useNotification";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { useToggleStore } from "../../stores/storage.store";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";
import { useApprovalStepStore } from "../../stores/approval-step.store";
import { useDocumentStatusStore } from "../../stores/document-status.store";
import { useAuthStore } from "../../stores/authentication/auth.store";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderShowDrawer from "../purchase/purchase_orders/PurchaseOrderShowDrawer.vue";
import BudgetApprovalDrawer from "./BudgetApprovalDrawer.vue";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { storeToRefs } from "pinia";
import OtpModal from "../purchase-requests/modal/OtpModal.vue";
import SelectDocumentTypeModal from "../receipt/modal/SelectDocumentTypeModal.vue";
/********************************************************* */
const { t } = useI18n();
const { success, error } = useNotification();
const store = usePurchaseOrderStore();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { userRoles } = storeToRefs(authStore);
const orderDetails = ref<PurchaseOrderEntity | null>(null);
const orderId = ref<number | null>(null);
const isApproveModalVisible = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const confirmLoading = ref(false);
const visible = ref(false);
const visibleBudget = ref(false);

const canManageBudget = computed(() => {
  return userRoles.value.includes("budget-admin") || userRoles.value.includes("budget-user");
});
const columns = computed(() => columnsApprovalDetails(t, userRoles.value));

const showDrawer = () => {
  visible.value = true;
};
const showBudgetDrawer = (record: any) => {
  activeItemRecord.value = record;
  visibleBudget.value = true;
};
const otpValue = ref<string[]>(Array(6).fill(""));

const currentStep = ref(0);
const isOtpModalVisible = ref(false);
const isSignatureModalVisible = ref(false);
const isSuccessModalVisible = ref(false);
const signatureData = ref("");

/*****************Header***************** */
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);

const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});

/*****************Header***************** */
/*****************Logic OTP and Send***************** */
const selectedBudgets = ref<Record<string, any>>({});
const activeItemRecord = ref<any>(null);
const approvalDetail = ref<PurchaseOrderEntity | null>(null);
const approvalSteps = computed(() => orderDetails.value?.getUserApproval()?.approval_step ?? []);
// const approvedStatusId = computed(() => {
//   return documentStatusStore.document_Status.find((s) => s.getName() === "APPROVED")?.getId();
// });
const rejectedStatusId = computed(() => {
  // console.log("🔍 Debug rejectedStatusId:");
  // console.log("document_Status:", documentStatusStore.document_Status);
  const rejected = documentStatusStore.document_Status.find((s) => s.getName() === "REJECTED");
  // console.log("Found rejected status:", rejected);
  return rejected?.getId();
});

const loggedInUserId = ref<number>(12);
const getPreviousApprovedStep = computed(() => {

  const approvedSteps = approvalSteps.value.filter((step) => step.status_id === 2);
  if (approvedSteps.length > 0) {

    return approvedSteps.sort((a, b) => b.step_number - a.step_number)[0];
  }
  return null;
});

const currentApprovalStep = computed(() => {
  // console.log("🔥 Using NEW currentApprovalStep logic");
  const pendingSteps = approvalSteps.value.filter((step) => step.status_id === 1);

  if (pendingSteps.length === 0) {
    return null;
  }
  const nextPendingStep = pendingSteps.sort((a, b) => a.step_number - b.step_number)[0];
  const canApprove =
    nextPendingStep.approver_id === loggedInUserId.value || nextPendingStep.approver_id === 0;

  // console.log("NEW currentApprovalStep result:", canApprove ? nextPendingStep : null);

  return canApprove ? nextPendingStep : null;
});

const currentApprovalStepDebug = computed(() => {
  // console.log("All approval steps:", approvalSteps.value);
  // console.log("Logged in user ID:", loggedInUserId.value);

  const pendingSteps = approvalSteps.value.filter((step) => step.status_id === 1);
  // console.log("Pending steps:", pendingSteps);

  if (pendingSteps.length === 0) {
    // console.log("No pending steps found");
    return null;
  }

  const nextPendingStep = pendingSteps.sort((a, b) => a.step_number - b.step_number)[0];
  // console.log("Next pending step:", nextPendingStep);

  const canApprove =
    nextPendingStep.approver_id === loggedInUserId.value || nextPendingStep.approver_id === 0;

  // console.log("Can approve:", canApprove);
  // console.log("Step approver_id:", nextPendingStep.approver_id);

  return canApprove ? nextPendingStep : null;
});
const findStepById = (stepId: number) => {
  return approvalSteps.value.find((step) => step.id === stepId);
};
const step204 = computed(() => findStepById(204));
watch(
  [approvalSteps, currentApprovalStepDebug, step204],
  () => {
    // console.log("👀 Watching changes...");
    // console.log("Steps:", approvalSteps.value);
    // console.log("Current step debug result:", currentApprovalStepDebug.value);
    // console.log("Step 204:", step204.value);
  },
  { immediate: true, deep: true }
);
const approvalStepStore = useApprovalStepStore();
const documentStatusStore = useDocumentStatusStore();

//************************************* */
/********************************************************** */
/********************************************************** */
const handleOtpConfirm = async (otpCode: string) => {
  if (!otpCode) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາປ້ອນລະຫັດ OTP");
    return;
  }

  const currentStep = currentApprovalStep.value;
  if (!currentStep?.id) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step");
    return;
  }
  const approvalIdFromOtp = approvalStepStore.otpResponse?.approval_id;
  if (!approvalIdFromOtp) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນอ้างອີງ OTP");
    return;
  }

  const purchaseOrderItemsPayload = Object.keys(selectedBudgets.value).map((itemId) => {
    const budget = selectedBudgets.value[itemId];
    return {
      id: Number(itemId),
      budget_item_id: budget.budgetId,
    };
  });

  try {
    const documentId = route.params.id as string;
    const payload: SubmitApprovalStepInterface = {
      type: "pr",
      // statusId: Number(approvedStatusId.value),
      statusId: 2,
      remark: "Approved",
      approvalStepId: Number(currentStep.id),
      approval_id: approvalIdFromOtp,
      is_otp: true,
      otp: otpCode,
      purchase_order_items: purchaseOrderItemsPayload,
    };

    await approvalStepStore.submitApproval(documentId, payload);
    isOtpModalVisible.value = false;
  } catch (err) {
    console.error("Error in handleOtpConfirm:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    isOtpModalVisible.value = false;
  }
};
const open = ref<boolean>(false);
const selectedData = ref<string | null>(null);
const purchaseOrderId = route.params.id as string
const onChooseDocumentType = () => {
  selectedData.value = purchaseOrderId
  open.value = true;
};
const handleApprove = async () => {
  isApproveModalVisible.value = false;
  const currentStep = currentApprovalStep.value;
  if (!currentStep?.id) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step");
    return;
  }
  const documentId = route.params.id as string;

  const purchaseOrderItemsPayload = Object.keys(selectedBudgets.value).map((itemId) => {
    const budgetData = selectedBudgets.value[itemId];
    return {
      id: Number(budgetData.purchaseOrderItemId),
      budget_item_id: budgetData.budgetId,
    };
  });

  // console.log("Payload for approval:", purchaseOrderItemsPayload);
  if (currentStep.is_otp === true) {

    try {
      const otpData = await approvalStepStore.sendOtp(currentStep.id, purchaseOrderItemsPayload);
      if (otpData) {
        isOtpModalVisible.value = true;
      }
    } catch (err) {
      console.error("Error in handleApprove (OTP case):", err);
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງ OTP ໄດ້");
    }
  } else {
    try {
      const payload: SubmitApprovalStepInterface = {
        type: "po",
        // statusId: Number(approvedStatusId.value),
        statusId: 2,
        remark: "Approved",
        approvalStepId: Number(currentStep.id),
        is_otp: false,
        purchase_order_items: purchaseOrderItemsPayload,
      };
      await approvalStepStore.submitApproval(documentId, payload);
      router.push("/budget-approval");
    } catch (err) {
      error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    }
  }
};

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາລະບຸເຫດຜົນໃນການປະຕິເສດ");
    return;
  }

  if (!rejectedStatusId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນສະຖານະ 'Rejected' ໃນລະບົບ");
    return;
  }

  if (!approvalDetail.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    return;
  }

  try {
    const userApproval = approvalDetail.value.getUserApproval();
    if (!userApproval?.approval_step?.[0]?.id) {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step");
      return;
    }

    const approvalStepId = userApproval.approval_step[0].id;

    const documentId = route.params.id as string;
    const payload = {
      type: "po" as const,
      statusId: Number(rejectedStatusId.value),
      remark: rejectReason.value,
      approvalStepId: Number(approvalStepId),
    };

    // console.log("Sending payload Reject:", payload);

    const success = await approvalStepStore.submitApproval(documentId, payload);
    if (success) {
      isRejectModalVisible.value = false;
      rejectReason.value = "";
    }
  } catch (err) {
    console.error("Error in handleReject:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
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
/********************************** */
const handleModalCancel = () => {
  isOtpModalVisible.value = false;
  isSignatureModalVisible.value = false;
  isSuccessModalVisible.value = false;
  otpValue.value = Array(6).fill("");
  signatureData.value = "";
};

/*****************Logic OTP***************** */

/***************ດຶງຂໍ້ມູນ********************* */
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
    // console.log("Order Details after fetch:", orderDetails.value);
  } else {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດດຶງຂໍ້ມູນເອກະສານໄດ້");
  }
};
onMounted(fetchOrderDetails);
/***************ດຶງຂໍ້ມູນ********************* */
/***************Table********************* */
const getItemsForTable = computed(() => {
  return orderDetails.value?.getPurchaseOrderItem() ?? [];
});
/***************Table********************* */

// Custom buttons for header

const canApprove = computed(() => {
  const currentStep = currentApprovalStep.value;
  const previousStep = getPreviousApprovedStep.value;

  if (!currentStep) return false;

  if (currentStep.step_number === 1) return true;

  return (
    previousStep &&
    previousStep.status_id === 2 && // APPROVED
    previousStep.step_number === currentStep.step_number - 1
  );
});
const customButtons = computed(() => {

  if (!canApprove.value) {
    return [

    {
        label: `ສ້າງໃບເບີກຈ່າຍ`,
        type: "primary" as ButtonType,
        onClick: () => {
          onChooseDocumentType();
        },
      },

    ];
  }

  const currentStep = currentApprovalStep.value;
  if (!currentStep) return [];

  if (!canApprove.value) {
    return [
      {
        label: `ອະນຸມັດ`,
        type: "primary" as ButtonType,
        onClick: () => {
          handleApprove();
        },
      },
    ];
  }

  return [
    {
      label: "ປະຕິເສດ",
      type: "default" as ButtonType,
      onClick: () => {
        isRejectModalVisible.value = true;
      },
    },
    {
      label: `ອະນຸມັດ`,
      type: "primary" as ButtonType,
      onClick: () => {
        isApproveModalVisible.value = true;
      },
    },
  ];
});
const handleBudgetConfirm = (data: any) => {
  if (activeItemRecord.value) {
    selectedBudgets.value[activeItemRecord.value.id] = {
      purchaseOrderItemId: activeItemRecord.value.id,
      budgetId: data.id,
    };
    // console.log("Selected budgets after confirm:", selectedBudgets.value);
  }
  visibleBudget.value = false;
};

const userInfo = {
  name: "ນາງ ປາກາລີ ລາຊະບູລີ",
  department: "ພະແນກໄອທີ, ພະບໍລິມາດ",
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
  if (requester) {
    sigs.push({
      role: "ຜູ້ສະເໜີ",
      name: requester.username,
      position: orderDetails.value?.getPosition()?.[0]?.name,
      signature_url: requester.user_signature?.signature_url || null,
    });
  }
  if (approver) {
    sigs.push({
      role: "ຜູ້ອານຸມັດ",
      name: approver.username,
      position: "ຜູ້ຈັດການ",
      signature_url: approver.user_signature?.signature_url || null,
    });
  }

  return sigs;
});
</script>

<template>
  <div class="mt-10">
    <!-- Header Component -->
    <div
      class="fixed px-6 py-4 top-0 z-40 h-auto bg-white shadow-sm transition-all duration-150 mt-[4rem]"
      :class="topbarStyle"
    >
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
    </div>

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
            @click="handleApprove"
            type="primary"
            :loading="confirmLoading"
            color-class="w-full"
            >ຢືນຢັນ</UiButton
          >
        </div>
      </template>
    </UiModal>
    <OtpModal
      :visible="isOtpModalVisible"
      :title="t('purchase-rq.otp-verification')"
      :loading="confirmLoading"
      @confirm="handleOtpConfirm"
      @close="isOtpModalVisible = false"
      @resend="handleApprove"
    />
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
        <Table :columns="columns" :dataSource="getItemsForTable">
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
          <!-- <template #id_name="{ record }">
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
           -->

          <template #id_name="{ record }">
            <span class="text-gray-600">
              <div v-if="canManageBudget">
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
              </div>
              <div v-else>
                <span class="font-semibold text-gray-700">
                  {{ selectedBudgets[record.id]?.budgetCode }}
                </span>
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
  <SelectDocumentTypeModal
      v-model:visible="open"
      :isEdit="true"
      :itemid="String(selectedData)"
    />
</template>

<style scoped></style>
