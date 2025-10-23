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
import { formatPrice } from "@/modules/shared/utils/format-price";
import { storeToRefs } from "pinia";
import DrawerPr from "../drawer-pr-and-po/DrawerPr.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import BudgetApprovalDrawer from "./BudgetApprovalDrawer.vue";
import OtpModal from "../purchase-requests/modal/OtpModal.vue";
import SelectDocumentTypeModal from "../receipt/modal/SelectDocumentTypeModal.vue";
import ShowShop from "../approval-department/ShowShop.vue";
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
const selectedPrId = ref<number | null>(null);

const showDrawer = () => {
  selectedPrId.value = orderDetails.value?.getPurchaseRequest()?.id ?? null;
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
  
  const rejected = documentStatusStore.document_Status.find((s) => s.getName() === "REJECTED");

  return rejected?.getId();
});
const documentStatus = computed(() => {
  const sortedSteps = [...(orderDetails.value?.getUserApproval()?.approval_step || [])].sort(
    (a, b) => a.step_number - b.step_number
  );
  const rejectedStep = sortedSteps.find((step) => step.status_id === 3);
  if (rejectedStep) {
    return {
      status: `ຖືກປະຕິເສດ`,
      statusClass: "text-red-500 font-medium ml-2 bg-red-50 px-3 py-1 rounded-full",
    };
  }
  const pendingStep = sortedSteps.find((step) => step.status_id === 1);
  if (pendingStep) {
    const nextDepartment = pendingStep.doc_approver?.[0]?.department?.name;
    return {
      status: `ລໍຖ້າ ${nextDepartment || ""} ກວດສອບ`,
      statusClass: "text-orange-500 font-medium ml-2 bg-orange-50 px-3 py-1 rounded-full",
    };
  }
  const allStepsApproved = sortedSteps.every((step) => step.status_id === 2);
  if (allStepsApproved && sortedSteps.length > 0) {
    return {
      status: "ອະນຸມັດສຳເລັດ",
      statusClass: "text-green-500 font-medium ml-2 bg-green-50 px-3 py-1 rounded-full",
    };
  }
  return {
    status: "ກຳລັງດຳເນີນການ",
    statusClass: "text-gray-500 font-medium ml-2 bg-gray-50 px-3 py-1 rounded-full",
  };
});
// Show Shop Drawer
const isShopDrawerVisible = ref(false);
const selectedShopId = ref<number | undefined>(undefined);

const selectedShopDetails = computed(() => {
  if (!selectedShopId.value || !orderDetails.value) return null;
  return orderDetails.value
    .getPurchaseOrderItem()
    .find((item) => item.getId() === selectedShopId.value);
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const showShopDetails = (record: any) => {
  selectedShopId.value = record.getId();
  isShopDrawerVisible.value = true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStepTitle = (index: number, step: any) => {
  if (index === 0) {
    return t("purchase-rq.proposer");
  }
  return `${t("purchase-rq.approver")} ${index}`;
};
const approvalStep = computed(() => {
  const steps = orderDetails.value?.getUserApproval()?.approval_step ?? [];
  return [...steps].sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0));
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
  if (!orderDetails.value || !approvalSteps.value.length) {
    return null;
  }

  // check user to localStorage
  const userDataStr = localStorage.getItem('userData');
  const userData = userDataStr ? JSON.parse(userDataStr) : null;

  if (!userData) {
   
    return null;
  }

  //  pending
  const pendingStep = approvalSteps.value.find(step => 
    step.status_id === 1 && // PENDING
    step.step_number === (getPreviousApprovedStep.value?.step_number ?? 0) + 1
  );

  if (!pendingStep) {
   
    return null;
  }

  // ตรวจสอบสิทธิ์
  const isAuthorized = pendingStep.doc_approver?.some(approver => {
    const userMatches = approver.user?.username === userData.username;
    const departmentMatches = approver.department?.name === userData.department_name;
    return userMatches && departmentMatches;
  });

  return isAuthorized ? pendingStep : null;
});
// computed property for canCreatePaymentDocument
const canCreatePaymentDocument = computed(() => {
  if (!orderDetails.value || !approvalSteps.value.length) {
    console.log('No order details or approval steps');
    return false;
  }

  
  const userDataStr = localStorage.getItem('userData');
  const userData = userDataStr ? JSON.parse(userDataStr) : null;

  if (!userData) {
    
    return false;
  }

  
  const allStepsApproved = approvalSteps.value.every(step => step.status_id === 2);
  if (!allStepsApproved) {
    
    return false;
  }
  const lastStep = [...approvalSteps.value].sort((a, b) => b.step_number - a.step_number)[0];
  
  const isAuthorized = lastStep.doc_approver?.some(approver => {
    const userMatches = approver.user?.username === userData.username;
    const departmentMatches = approver.department?.name === userData.department_name;
    return userMatches && departmentMatches;
  });

  return isAuthorized;
});

const currentApprovalStepDebug = computed(() => {
  const pendingSteps = approvalSteps.value.filter((step) => step.status_id === 1);
  if (pendingSteps.length === 0) {
    return null;
  }

  const nextPendingStep = pendingSteps.sort((a, b) => a.step_number - b.step_number)[0];

  const canApprove =
    nextPendingStep.approver_id === loggedInUserId.value || nextPendingStep.approver_id === 0;
  return canApprove ? nextPendingStep : null;
});

const canApprove = computed(() => {
  const currentStep = currentApprovalStep.value;
  if (!currentStep) {
    console.log('No current step available');
    return false;
  }
  if (currentStep.step_number === 0) {
    return true;
  }
  const previousStep = getPreviousApprovedStep.value;
  const canApprove = previousStep && 
                     previousStep.status_id === 2 && 
                     previousStep.step_number === currentStep.step_number - 1;
  return canApprove;
});

const customButtons = computed(() => {
  if (canCreatePaymentDocument.value) {
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
const findStepById = (stepId: number) => {
  return approvalSteps.value.find((step) => step.id === stepId);
};
const step204 = computed(() => findStepById(204));
watch(
  [approvalSteps, currentApprovalStepDebug, step204],
  () => {
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
      type: "po",
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
const purchaseOrderId = route.params.id as string;
const onChooseDocumentType = () => {
  selectedData.value = purchaseOrderId;
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
      router.push("/budget-approval");

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

const getTotalAmount = computed(() => {
  if (!orderDetails.value?.getPurchaseOrderItem()) return 0;
  return orderDetails.value.getPurchaseOrderItem().reduce((sum, item) => {
    return sum + item.getTotal();
  }, 0);
});
/***************Table********************* */


const handleBudgetConfirm = (data: any) => {
  if (activeItemRecord.value) {
    selectedBudgets.value[activeItemRecord.value.id] = {
      purchaseOrderItemId: activeItemRecord.value.id,
      budgetId: data.id,
      budgetCode: data.budget_account?.code || "No Code",
      budgetName: data.budget_account?.name,
      budgetAmount: data.allocated_amount,
      remainingAmount: data.balance_amount,
      usedAmount: data.used || data.use_amount,
    };
    console.log("Selected budgets after confirm:", selectedBudgets.value);
  }
  visibleBudget.value = false;
};

const userInfo = {
  name: "ນາງ ປາກາລີ ລາຊະບູລີ",
  department: "ພະແນກໄອທີ, ພະບໍລິມາດ",
};
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
        :document-status="documentStatus.status"
        :document-status-class="documentStatus.statusClass"
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
    <!-- Budget Selection Drawer -->
    <UiDrawer
      v-model:open="visibleBudget"
      title="ເລືອກລະຫັດງົບປະມານ"
      placement="right"
      :width="500"
    >
      <BudgetApprovalDrawer @confirm="handleBudgetConfirm" />
    </UiDrawer>

    <div v-if="store.loading" class="flex justify-center items-center h-48">
      <p>ກຳລັງດຶງຂໍ້ມູນ...</p>
    </div>
    <div v-else-if="store.error">
      <p>ເກີດຂໍ້ຜິດພາດ: {{ store.error }}</p>
    </div>
    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow-sm p-6 mt-36" v-else-if="orderDetails">
      <h2>ຂໍ້ມູນສ້າງໃບອານຸມັດຈັດຊື້ - ຈັດຈ້າງ</h2>
      <!-- Requester Information -->
      <div class="flex items-start gap-4 mb-2">
        <div
          class="flex items-center justify-center **w-16 h-16** rounded-full **bg-blue-100** **text-4xl**"
        >
          <Icon icon="mdi:user" class="text-6xl" />
        </div>
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
          <div class="grid grid-rows-2">
            <h4 class="text-base font-semibold">ຈຸດປະສົງ ແລະ ລາຍການ</h4>
            <p class="text-gray-600">{{ orderDetails?.getDocument()?.description ?? "ບໍ່ມີ" }}</p>
          </div>
        </div>
      </div>
      <!-- Items Table -->
      <div>
        <h4 class="text-base font-semibold mb-2">ລາຍການ</h4>
        <Table :columns="columns" :dataSource="getItemsForTable">
          <template #number="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template #image="{ record }">
              <span>
                <a-image
                  v-if="record.getQuotationImageUrl()"
                  :src="record.getQuotationImageUrl()"
                  alt="Product Image"
                  :width="50"
                  :height="50"
                  :preview="true"
                />
                <img
                  v-else
                  src="/public/5.png"
                  alt="Default Image"
                  class="w-12 h-12 object-cover"
                />
              </span>
            </template>
          <template #quantity="{ record }">
            <span class="text-gray-600"
              >{{ record.quantity }}
              {{
                orderDetails.getPurchaseRequest()?.purchase_request_item?.[0]?.unit?.name || "N/A"
              }}</span
            >
          </template>
           <template #shop="{ record }">
              <UiButton
                type="link"
                icon="ant-design:eye-outlined"
                color-class="flex items-center text-red-500 hover:!text-red-900"
                @click="() => showShopDetails(record)"
              >
                ລາຍລະອຽດຮ້ານຄ້າ
              </UiButton>
            </template>

          <template #id_name="{ record }">
            <span class="text-gray-600">
              <div v-if="canManageBudget">
                <div v-if="selectedBudgets[record.id]">
                  <span class="font-semibold text-blue-700">
                    {{ selectedBudgets[record.id]?.budgetCode }} -
                    {{ selectedBudgets[record.id]?.budgetName }}
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
                  {{ selectedBudgets[record.id]?.budgetCode || "No Budget Code" }}
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
            <div v-if="orderDetails">
              <div class="grid grid-cols-[auto_130px] gap-2 text-right">
                <div class="font-medium">ລາຄາລວມ:</div>
                <div class="text-gray-600">{{ formatPrice(getTotalAmount) }} ₭</div>

                <div class="font-medium">ພາສີມູນຄ່າເພີ່ມ (VAT):</div>
                <div class="text-gray-600">{{ formatPrice(orderDetails.getVat()) }} ₭</div>

                <div class="font-medium">ລາຄາລວມທັງໝົດ:</div>
                <div class="text-gray-600 font-bold">
                  {{ formatPrice(orderDetails.getTotal()) }} ₭
                </div>
              </div>
            </div>
          </div>
      </div>
      <!-- Signatures -->
      <div class="flex flex-wrap gap-4">
        <!-- Approval Steps -->
        <template v-for="(step, index) in approvalStep" :key="step.id">
          <div>
            <!-- Step Title -->
            <p class="text-slate-500 text-sm mb-2 text-center">
              {{ getStepTitle(index, step) }}
            </p>

            <!-- Signature Display -->
            <div class="signature-box w-[80px] h-[80px]">
              <template v-if="step.status_id === 2 && step.approver?.user_signature">
                <!-- Approved signature -->
                <a-image
                  :src="step.approver.user_signature.signature_url"
                  alt="signature"
                  :width="80"
                  :height="80"
                  :preview="false"
                  class="block"
                />
              </template>
              <template v-else-if="step.status_id === 1">
                <!-- Pending signature -->
                <div class="h-full flex items-center justify-center bg-gray-50">
                  <span class="text-gray-400 text-center">{{ t("purchase-rq.pending") }}</span>
                </div>
              </template>
            </div>

            <!-- Approver Info -->
            <div class="info text-sm text-slate-600 -space-y-1 text-center">
              <template v-if="step.approver">
                <p class="font-medium">{{ step.approver.username }}</p>
                <!-- <p class="text-xs">{{ step.position?.name || "-" }}</p> -->
                <!-- <p class="text-xs" v-if="step.approved_at">
                  {{ formatDate(step.approved_at) }}
                </p> -->
              </template>
              <template v-else-if="step.doc_approver?.[0]?.user">
                <p class="font-medium">{{ step.doc_approver[0].user.username }}</p>
                <p class="text-xs">{{ t("purchase-rq.pending") }}</p>
              </template>
            </div>
          </div>
        </template>
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
  <UiDrawer
    v-model:open="visible"
    title="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
    placement="right"
    :width="1050"
  >
    <DrawerPr :id="selectedPrId" />
  </UiDrawer>
  <SelectDocumentTypeModal v-model:visible="open" :isEdit="true" :itemid="String(selectedData)" />
  <ShowShop v-model:open="isShopDrawerVisible" :shop-details="selectedShopDetails" />
</template>

<style scoped></style>
