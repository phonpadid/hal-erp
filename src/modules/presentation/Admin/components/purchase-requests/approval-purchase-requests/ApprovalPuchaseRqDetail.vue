<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import type { ButtonType } from "@/modules/shared/buttonType";
import { storeToRefs } from "pinia";
import { columns } from "../column";
import { useToggleStore } from "../../../stores/storage.store";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { usePurchaseRequestsStore } from "../../../stores/purchase_requests/purchase-requests.store";
import { useRoute, useRouter } from "vue-router";
import { useDocumentStatusStore } from "../../../stores/document-status.store";
import { formatDate } from "@/modules/shared/formatdate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useApprovalStepStore } from "../../../stores/approval-step.store";
import { Icon } from "@iconify/vue";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";
import { useAuthStore } from "../../../stores/authentication/auth.store";
import { useReportPrStore } from "../../../stores/reports/report-pr.store";

import OtpModal from "../modal/OtpModal.vue";
import SuccessModal from "../modal/SuccessModal.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import PrintPurchaseRequest from "./PrintPurchaseRequest.vue";

const { t } = useI18n();
const purchaseRequestStore = usePurchaseRequestsStore();
const documentStatusStore = useDocumentStatusStore();
const requestDetail = ref<PurchaseRequestEntity | null>(null);
const { error } = useNotification();
const exportPrStore = useReportPrStore();
const approvalStepStore = useApprovalStepStore();
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const isApproveModalVisible = ref(false);
const authStore = useAuthStore();

/*********************check show button to data ********************* */
// const currentApprovalStep = computed(() => {
//   return requestDetail.value
//     ?.getUserApproval()
//     ?.approval_step.find((step) => step.status_id === 1 && !step.approver);
// });
const canApprove = computed(() => {
  return !!currentApprovalStep.value;
});

const currentApprovalStep = computed(() => {
  if (!requestDetail.value || !authStore.user) {
    return null;
  }

  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  const userApproval = requestDetail.value.getUserApproval();
  if (!userApproval?.approval_step) {
    return null;
  }
  const pendingStep = userApproval.approval_step.find((step) => step.status_id === 1);

  if (!pendingStep?.doc_approver?.length) {
    return null;
  }
  const isAuthorized = pendingStep.doc_approver.some((approver) => {
    const userMatches = approver.user?.username === userData?.username;
    const departmentMatches = approver.department?.name === userData?.department_name;

    return userMatches && departmentMatches;
  });

  return isAuthorized ? pendingStep : null;
});
// watchEffect(() => {
//   const step = currentApprovalStep.value;
//   console.log("Step changed:", {
//     hasStep: !!step,
//     stepId: step?.id,
//     isAuthorized: !!step,
//   });
// });

/****************************************** */
const requesterInfo = computed(() => requestDetail.value?.getRequester());
const departmentInfo = computed(() => requestDetail.value?.getDepartment());
const positionInfo = computed(() => requestDetail.value?.getPosition());
const companyInfo = computed(() => requestDetail.value?.getCompany());
const items = computed(() => requestDetail.value?.getItems() ?? []);
const totalAmount = computed(() => requestDetail.value?.getTotal() ?? 0);
const getStepTitle = (index: number, step: any) => {
  if (index === 0) {
    return t("purchase-rq.proposer");
  }
  // ໃຊ້ຊື່ແຜນກຈາກ doc_approver[0].department.name
  const deptName = step.doc_approver?.[0]?.department?.name;
  return deptName || `${t("purchase-rq.approver")} ${index}`;
};

/****************************************** */
const approvedStatusId = computed(() => {
  return documentStatusStore.document_Status.find((s) => s.getName() === "APPROVED")?.getId();
});
const rejectedStatusId = computed(() => {
  return documentStatusStore.document_Status.find((s) => s.getName() === "REJECTED")?.getId();
});
/****************************************** */

// Modal states
const isOtpModalVisible = ref(false);
const isSuccessModalVisible = ref(false);
const confirmLoading = ref(false);
const modalAction = ref(""); // 'approve' or 'reject'
const approval = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const approvalStepId = ref<number | null>(null);
const requiresOtp = ref(false);
const approvalId = ref<number | null>(null);

const handleExport = async () => {
  try {
    const documentId = route.params.id as string;
    if (!documentId) {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບເລກທີເອກະສານ");
      return;
    }

    loading.value = true;
    await exportPrStore.reportPrExport(documentId);
  } catch (err) {
    console.error("Export error:", err);
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດ Export ໄດ້");
  } finally {
    loading.value = false;
  }
};

const customButtons = computed(() => {
  if (!canApprove.value) {
    return [
      {
        label: "Export",
        icon: "ant-design:file-excel-outlined",
        class: "bg-green-600 flex items-center gap-2 hover:bg-green-800 mr-4",
        type: "default" as ButtonType,
        onClick: handleExport,
      },
      {
        label: "Print",
        icon: "ant-design:printer-outlined",
        class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
        type: "default" as ButtonType,
        onClick: handlePrint,
      },
    ];
  }

  // ✅ ถ้ามีสิทธิ์อนุมัติ แสดงปุ่ม Reject และ Approve
  const currentStep = currentApprovalStep.value;
  if (!currentStep) return [];

  return [
    {
      label: "Export",
      icon: "ant-design:file-excel-outlined",
      class: "bg-green-500 flex items-center gap-2 hover:bg-green-600 mr-4",
      type: "default" as ButtonType,
      onClick: handleExport,
    },
    {
      label: "Print",
      icon: "ant-design:printer-outlined",
      class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
      type: "default" as ButtonType,
      onClick: handlePrint,
    },
    {
      label: t("purchase-rq.card_title.refused"),
      type: "default" as ButtonType,
      onClick: () => {
        modalAction.value = "reject";
        isRejectModalVisible.value = true;
      },
    },
    {
      label: t("purchase-rq.btn.approval"),
      type: "primary" as ButtonType,
      onClick: async () => {
        modalAction.value = "approve";
        await handleApprove();
        modalAction.value = "";
      },
    },
  ];
});

/**********Check logic OTP and No OTP TO PO********** */
const approvalSteps = computed(() => requestDetail.value?.getUserApproval()?.approval_step ?? []);
const isLastStep = computed(() => {
  const lastStep = [...approvalSteps.value].sort((a, b) => b.step_number - a.step_number)[0];
  return currentApprovalStep.value?.step_number === lastStep?.step_number;
});
const approvalStep = computed(() => {
  const steps = requestDetail.value?.getUserApproval()?.approval_step ?? [];
  return [...steps].sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0));
});

const documentStatus = computed(() => {
  const rejectedStep = requestDetail.value
    ?.getUserApproval()
    ?.approval_step?.find((step) => step.status_id === 3);

  if (rejectedStep) {
    return {
      status: `ຖືກປະຕິເສດ`,
      // ໂດຍ ${rejectedStep.approver?.username || ''} ${rejectedStep.position?.name || ''
      statusClass: "text-red-500 font-medium ml-2 bg-red-50 px-3 py-1 rounded-full",
    };
  }
  const pendingStep = requestDetail.value
    ?.getUserApproval()
    ?.approval_step?.find((step) => step.status_id === 1);

  if (!pendingStep) {
    return {
      status: "ອະນຸມັດສຳເລັດ",
      statusClass: "text-green-500 font-medium ml-2 bg-green-50 px-3 py-1 rounded-full",
    };
  }
  // const nextApprover = pendingStep.doc_approver?.[0]?.user?.username;
  const nextDepartment = pendingStep.doc_approver?.[0]?.department?.name;

  return {
    status: `ລໍຖ້າ ${nextDepartment || ""} ກວດສອບ`,
    // ${nextApprover || ''}
    statusClass: "text-orange-500 font-medium ml-2 bg-orange-50 px-3 py-1 rounded-full",
  };
});

const handlePrint = () => {
  window.print();
};

const customButtonSuccess = [
  {
    label: "Export",
    icon: "ant-design:file-excel-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
    type: "default" as ButtonType,
    onClick: handleExport,
  },
  {
    label: "print",
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
    type: "default" as ButtonType,
    onClick: handlePrint,
  },
];

const handleApprove = async () => {
  isApproveModalVisible.value = false;

  const currentStep = currentApprovalStep.value;
  if (!currentStep?.id) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ປັจຈຸບັນ");
    return;
  }

  const documentId = route.params.id as string;

  if (currentStep.is_otp === true) {
    try {
      const otpData = await approvalStepStore.sendOtp(currentStep.id);
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
        type: "pr",
        statusId: Number(approvedStatusId.value),
        remark: "Approved",
        approvalStepId: Number(currentStep.id),
        is_otp: false,
      };
      const success = await approvalStepStore.submitApproval(documentId, payload);
      if (success) {
        await purchaseRequestStore.fetchById(documentId);

       

        // ✅ ກວດສອບວ່າເປັນຂັ້ນຕອນທຳອິດ (step 0) ຫຼືບໍ່
        if (currentStep.step_number === 0) {
          setTimeout(() => {
            router.push({ name: "apv_purchase_request.index" });
          }, 1500);
        } else if (currentStep.step_number === 1) {
          router.push({ name: "apv_purchase_request.index" });
        } else if (isLastStep.value) {
          router.push({
            name: "doc-type-select",
            query: { purchase_request_id: requestDetail.value?.getId() },
          });
        }
      }
    } catch (err) {
      error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    }
  }
};

const handleOtpConfirm = async (otpCode: string) => {
  if (modalAction.value === "reject") {
    await handleOtpRejectConfirm(otpCode);
    return;
  }
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
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນອ້างອີງ OTP");
    return;
  }

  try {
    const documentId = route.params.id as string;
    const payload: SubmitApprovalStepInterface = {
      type: "pr",
      statusId: Number(approvedStatusId.value),
      remark: "Approved",
      approvalStepId: Number(currentStep.id),
      approval_id: approvalIdFromOtp,
      is_otp: true,
      otp: otpCode,
    };

    const success = await approvalStepStore.submitApproval(documentId, payload);
    if (success) {
      isOtpModalVisible.value = false;

    

      // ✅ ກວດສອບວ່າເປັນຂັ້ນຕອນທຳອິດ (step 0) ຫຼືບໍ່
      if (currentStep.step_number === 0) {
        setTimeout(() => {
          router.push({ name: "apv_purchase_request.index" });
        }, 1500);
      } else if (currentStep.step_number === 1) {
        router.push({ name: "apv_purchase_request.index" });
      } else if (isLastStep.value) {
        router.push({
          name: "doc-type-select",
          query: { purchase_request_id: requestDetail.value?.getId() },
        });
      }
    }
  } catch (err) {
    console.error("Error in handleOtpConfirm:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    isOtpModalVisible.value = false;
  }
};

const handleResendOtp = async () => {
  if (!approvalStepId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນຂັ້ນຕອນການອະນຸມັດ");
    return;
  }
  try {
    const otpData = await approvalStepStore.sendOtp(approvalStepId.value);
    if (otpData) {
      approvalId.value = otpData.approval_id;
    }
  } catch (err) {
    console.error("Error resending OTP:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  }
};

const handleOtpClose = () => {
  isOtpModalVisible.value = false;
  modalAction.value = "";
};

// Handle final success confirmation
const handleReject = async () => {
  // if (!rejectReason.value.trim()) {
  //   error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາລະບຸເຫດຜົນໃນການປະຕິເສດ");
  //   return;
  // }

  if (!rejectedStatusId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນສະຖານະ 'Rejected' ໃນລະບົບ");
    return;
  }

  if (!requestDetail.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    return;
  }

  // ✅ ใช้ currentApprovalStep แทน approval_step[0]
  const currentStep = currentApprovalStep.value;
  if (!currentStep) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ຫຼື ທ່ານບໍ່ມີສິດອະນຸມັດ");
    return;
  }

  try {
    approvalStepId.value = currentStep.id;
    requiresOtp.value = currentStep.is_otp === true;

    const documentId = route.params.id as string;

    // ✅ กรณีไม่ต้องการ OTP
    if (!requiresOtp.value) {
      const payload = {
        type: "pr" as const,
        statusId: Number(rejectedStatusId.value),
        remark: rejectReason.value,
        approvalStepId: Number(approvalStepId.value),
        is_otp: false,
      };

      const success = await approvalStepStore.submitApproval(documentId, payload);
      if (success) {
        isRejectModalVisible.value = false;
        rejectReason.value = "";
        isSuccessModalVisible.value = true;
      }
      return;
    }

    // ✅ กรณีต้องการ OTP - ส่ง OTP ก่อน
    const otpData = await approvalStepStore.sendOtp(currentStep.id);
    if (otpData) {
      approvalId.value = otpData.approval_id;
      isRejectModalVisible.value = false;
      isOtpModalVisible.value = true;
    }
  } catch (err) {
    console.error("Error in handleReject:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  }
};
const handleOtpRejectConfirm = async (otpCode: string) => {
  if (!otpCode) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາປ້ອນລະຫັດ OTP");
    return;
  }

  const approvalIdFromOtp = approvalStepStore.otpResponse?.approval_id;
  if (!approvalIdFromOtp) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນອ້າງອີງ OTP");
    return;
  }

  try {
    const documentId = route.params.id as string;
    const payload: SubmitApprovalStepInterface = {
      type: "pr",
      statusId: Number(rejectedStatusId.value),
      remark: rejectReason.value,
      approvalStepId: Number(approvalStepId.value),
      approval_id: approvalIdFromOtp,
      is_otp: true,
      otp: otpCode,
    };

    const success = await approvalStepStore.submitApproval(documentId, payload);
    if (success) {
      isOtpModalVisible.value = false;
      rejectReason.value = "";
      isSuccessModalVisible.value = true;
    }
  } catch (err) {
    console.error("Error in handleOtpRejectConfirm:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    isOtpModalVisible.value = false;
  }
};

const handleSuccessConfirm = async () => {
  confirmLoading.value = true;
  try {
    // ปิด Success Modal
    isSuccessModalVisible.value = false;
    modalAction.value = "";
    approval.value = true;
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  } finally {
    confirmLoading.value = false;
  }
};

const handleSuccessCancel = () => {
  isSuccessModalVisible.value = false;
  modalAction.value = "";
};

const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});

const handleToggle = () => {
  toggle.value = !toggle.value;
  localStorage.setItem("toggle", toggle.value.toString());
};

// Dynamic success modal content based on action
const successModalProps = computed(() => {
  if (modalAction.value === "") {
    return {
      message: t("modal.success.title"),
      description: t("modal.success.description"),
      iconName: "mdi:check-decagram",
      iconColor: "text-green-500",
      buttonText: t("purchase-rq.btn.confirm"),
    };
  } else {
    return {
      message: t("modal.refused.title"),
      description: t("modal.refused.description"),
      iconName: "mdi:close-circle",
      iconColor: "text-red-500",
      buttonText: t("purchase-rq.btn.confirm"),
    };
  }
});

watch(modalAction, (newVal) => {
  if (newVal === "") {
    approval.value = true;
  } else {
    approval.value = false; // optional if you need to reset
  }
});

onMounted(async () => {
  const requestId = route.params.id as string;
  if (requestId) {
    loading.value = true;
    try {
      const [data] = await Promise.all([
        purchaseRequestStore.fetchById(requestId),
        documentStatusStore.fetctDocumentStatus({ page: 1, limit: 100 }),
      ]);

      requestDetail.value = data;
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<template>
  <div class="container mx-auto py-1 px-0">
    <!-- Header Component -->
    <div
      class="fixed px-6 py-4 top-0 z-20 bg-white shadow-sm transition-all duration-150 mt-[4rem]"
      :class="topbarStyle"
    >
      <header-component
        @toggle="handleToggle"
        :header-title="t('purchase-rq.approval_proposal')"
        :breadcrumb-items="[t('purchase-rq.approval_proposal'), t('purchase-rq.btn.approval')]"
        :document-prefix="t('purchase-rq.field.proposal')"
        :document-number="`${t('purchase-rq.field.pr_number')} 0036/ພລ - ${t('purchase-rq.date')}`"
        :document-date="formatDate(requestDetail?.getRequestedDate() ?? new Date())"
        :action-buttons="approval ? customButtonSuccess : customButtons"
        :document-status="documentStatus.status"
        :document-status-class="documentStatus.statusClass"
      />
    </div>

    <!-- Main Content -->
    <div v-if="loading" class="mt-[10rem] text-center">Loading...</div>

    <div class="body mt-[10rem]" v-else-if="requestDetail">
      <!-- Company & User Information Section -->
      <div class="user-info shadow-sm py-2">
        <!-- Company and User Info in Same Row -->
        <div class="info flex items-center justify-between px-6 gap-4 mb-4">
          <!-- Company Information (Left) -->
          <div class="company-section flex flex-col " v-if="companyInfo">
            <h3 class="text-xl font-semibold text-green-700 mb-2">ບໍລິສັດ</h3>
            <div class="flex items-center gap-4">
              <div
                class="flex items-center justify-center w-14 h-14 rounded-full bg-green-100"
              >
                <img
                  v-if="companyInfo.logo_url"
                  :src="companyInfo.logo_url"
                  :alt="companyInfo.name"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <Icon v-else icon="mdi:office-building" class="text-2xl text-green-600" />
              </div>
              <div class="detail -space-y-1">
                <p class="font-semibold text-green-700">{{ companyInfo.name }}</p>
                <p class="text-gray-600 text-sm">{{ companyInfo.email }}</p>
                <p class="text-gray-500 text-xs">{{ companyInfo.tel }}</p>
                <p class="text-gray-500 text-xs">{{ companyInfo.address }}</p>
              </div>
            </div>
          </div>
          

          <!-- User Information (Center) -->
          <div class="user-section flex flex-col flex-1">
            <h3 class="text-xl font-semibold text-blue-700 mb-2">ຂໍ້ມູນຜູ້ສະເໜີ</h3>
            <div class="flex items-center gap-4">
              <div
                class="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-4xl"
              >
                <Icon icon="mdi:user" class="text-6xl" />
              </div>
              <div class="detail -space-y-2">
                <p class="font-medium">{{ requesterInfo?.username }}</p>
                <p class="text-gray-600">{{ positionInfo?.name }} - {{ departmentInfo?.name }}</p>
              </div>
            </div>
          </div>

          <!-- Request Date (Right) -->
          <div class="date-section text-right">
            <h2 class="text-md font-semibold">
              {{ t("purchase-rq.field.date_rq") }}
            </h2>
            <p class="text-gray-600 text-sm">{{ formatDate(requestDetail.getExpiredDate()) }}</p>
          </div>
        </div>

        <!-- Required Date Section -->

        <!-- Purpose Section -->
        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">
            {{ t("purchase-rq.field.purposes") }}
          </h2>
          <p class="text-gray-600 text-sm">
            {{ requestDetail.getPurposes() }}
          </p>
        </div>

        <!-- Items Table Section -->
        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">
            {{ t("purchase-rq.field.title") }}
          </h2>
          <Table :columns="columns(t)" :dataSource="items" :pagination="false" row-key="id">
            <template #index="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #price="{ record }">
              <span class="text-green-500">₭ {{ formatPrice(record.getPrice()) }}</span>
            </template>
            <template #total="{ record }">
              <span class="text-red-500">₭ {{ formatPrice(record.total || record.price * record.quantity) }}</span>
            </template>
            <template #image="{ record }">
              <a-image
                v-if="record.file_name_url"
                :src="record.file_name_url"
                alt="example"
                :width="50"
                :height="50"
                :preview="true"
                class="rounded-lg shadow-sm"
              />
              <span v-else class="text-gray-400 italic">No Image</span>
            </template>
          </Table>
          <div class="price-summary grid grid-cols-[auto_150px] gap-2 px-6 text-right">
            <div class="font-medium text-slate-600">{{ t("purchase-rq.field.total_price") }}:</div>
            <div class="font-semibold md:text-lg text-sm text-green-500">
              {{ formatPrice(requestDetail?.getTotal()) }}₭
            </div>

            <div class="font-medium text-slate-600">{{ t("purchase-rq.field.amounts") }}:</div>
            <div class="font-semibold md:text-lg text-sm  text-red-500">
              {{ formatPrice(totalAmount) }}₭
            </div>
          </div>
        </div>
        <!-- Signature Section -->
        <div class="shadow-sm rounded-md p-4">
          <h2 class="text-md font-semibold mb-4">
            {{ t("purchase-rq.signature") }}
          </h2>

          <!-- ✅ เปลี่ยนจาก grid เป็น flex flex-wrap -->
          <div class="flex flex-wrap gap-4">
            <!-- Approval Steps -->
            <template v-for="(step, index) in approvalStep" :key="step.id">
              <div class="flex flex-col items-center">
                <!-- Step Title -->
                <p class="text-slate-500 text-sm mb-2 text-center">
                  {{ getStepTitle(index, step) }}
                </p>

                <!-- Signature Display - Fixed Container -->
                <div
                  class="w-[120px] h-[80px] flex items-center justify-center"
                >
                  <template v-if="step.status_id === 2 && step.approver?.user_signature">
                    <!-- Approved signature -->
                    <img
                      :src="step.approver.user_signature.signature_url"
                      alt="signature"
                      class="max-w-[110px] max-h-[70px] object-contain"
                    />
                  </template>
                  <template v-else-if="step.status_id === 1">
                    <!-- Pending signature -->
                    <span class="text-gray-400 text-sm text-center px-2">
                      {{ t("purchase-rq.pending") }}
                    </span>
                  </template>
                </div>

                <!-- Approver Info -->
                <div class="info text-sm text-slate-600 mt-2 text-center min-w-[120px]">
                  <template v-if="step.approver">
                    <p class="font-medium">{{ step.approver.username }}</p>
                    <p class="text-xs text-gray-500">{{ step.position?.name || "-" }}</p>
                    <!-- ເພີ່ມວັນທີເວລາອະນຸມັດ -->
                    <p v-if="step.approved_at" class="text-xs text-blue-500 mt-1">
                      {{ formatDate(step.approved_at) }}
                    </p>
                  </template>
                  <template v-else-if="step.doc_approver?.[0]?.user">
                    <p class="text-xs text-gray-500">
                      {{ t("purchase-rq.pending") }}
                    </p>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- OTP Modal -->
    <OtpModal
      :visible="isOtpModalVisible"
      :title="t('purchase-rq.otp_verification')"
      :approval-step-id="approvalStepId"
      :loading="confirmLoading"
      @confirm="handleOtpConfirm"
      @close="handleOtpClose"
      @resend="handleResendOtp"
    />

    <!-- Success Modal -->
    <SuccessModal
      v-model:visible="isSuccessModalVisible"
      :message="successModalProps.message"
      :description="successModalProps.description"
      :icon-name="successModalProps.iconName"
      :icon-color="successModalProps.iconColor"
      :button-text="successModalProps.buttonText"
      :loading="confirmLoading"
      @confirm="handleSuccessConfirm"
      @cancel="handleSuccessCancel"
    />

    <!-- Reject Modal -->
    <UiModal
      :title="t('purchase-rq.card_title.refused')"
      :visible="isRejectModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isRejectModalVisible = false"
      @ok="handleReject"
    >
      <div class="space-y-4">
        <p>{{ t("modal.description") }}</p>
        <div>
          <p class="mb-2 font-semibold">{{ t("modal.reason") }}</p>
          <Textarea :modelValue="rejectReason" :placeholder="t('modal.enter_reason')" :rows="4" />
        </div>
      </div>
      <template #footer>
        <UiButton
          @click="handleReject"
          type="primary"
          :loading="confirmLoading"
          color-class="w-full"
          >{{ t("purchase-rq.btn.confirm") }}</UiButton
        >
      </template>
    </UiModal>

    <div class="print-only">
      <PrintPurchaseRequest :purchase-request="requestDetail" />
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here if needed */

.company-info {
  background: white;
  border-radius: 0.5rem;
}

.user-info {
  background: white;
  border-radius: 0.5rem;
}

.table {
  background: white;
}

.image {
  background: white;
}

.signature {
  background: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .total {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .company-section {
    width: 100%;
    justify-content: center;
  }

  .user-section {
    width: 100%;
    justify-content: center;
  }

  .date-section {
    width: 100%;
    text-align: center;
  }
}

/* Company and User Section Styling */
.company-section {
  border-right: 1px solid #e5e7eb;
  padding-right: 1rem;
}

.company-section .detail p {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-section {
  border-right: 1px solid #e5e7eb;
  padding-right: 1rem;
}

@media (max-width: 1024px) {
  .info {
    flex-wrap: wrap;
    justify-content: center;
  }

  .company-section,
  .user-section {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .date-section {
    border-left: none;
    padding-left: 0;
  }
}

.signature-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
}

.print-only {
  display: none;
}

@media print {
  /* Hide everything except print component */
  body * {
    visibility: hidden;
  }

  .print-only,
  .print-only * {
    visibility: visible;
  }

  .print-only {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Hide scrollbars */
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  /* Remove shadows and borders for print */
  .print-only * {
    box-shadow: none !important;
  }
}
</style>
