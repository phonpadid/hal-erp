<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { computed, onMounted, ref } from "vue";
import { columns } from "../../../views/purchase_requests/column";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { useRoute } from "vue-router";
import { formatDate } from "@/modules/shared/formatdate";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { useRouter } from "vue-router";
import OtpModal from "../../purchase-requests/modal/OtpModal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";

// **************************************
import { usePurchaseRequestsStore } from "../../../stores/purchase_requests/purchase-requests.store";
import { useToggleStore } from "../../../stores/storage.store";
import { useApprovalStepStore } from "../../../stores/approval-step.store";
import { useDocumentStatusStore } from "../../../stores/document-status.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";
import { Icon } from "@iconify/vue";

const { t } = useI18n();
const route = useRoute();
const { error } = useNotification();
const router = useRouter();

// 2. สร้าง Instance ของ Store ทั้งหมดที่ต้องใช้
const toggleStore = useToggleStore();
const purchaseRequestStore = usePurchaseRequestsStore();
const approvalStepStore = useApprovalStepStore();
const documentStatusStore = useDocumentStatusStore();

const { toggle } = storeToRefs(toggleStore);

const isApproveModalVisible = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const loading = ref(true);
const isOtpModalVisible = ref(false);
// const otpValue = ref("");
// const currentStepForApproval = ref<any>(null);
const requestDetail = ref<PurchaseRequestEntity | null>(null);

const confirmLoading = computed(() => approvalStepStore.loading);

const approvalSteps = computed(() => requestDetail.value?.getUserApproval()?.approval_step ?? []);

const approvedStatusId = computed(() => {
  return documentStatusStore.document_Status.find((s) => s.getName() === "APPROVED")?.getId();
});
const rejectedStatusId = computed(() => {
  return documentStatusStore.document_Status.find((s) => s.getName() === "REJECTED")?.getId();
});
const requesterInfo = computed(() => requestDetail.value?.getRequester());
const departmentInfo = computed(() => requestDetail.value?.getDepartment());
const positionInfo = computed(() => requestDetail.value?.getPosition());
const items = computed(() => requestDetail.value?.getItems() ?? []);
const totalAmount = computed(() => requestDetail.value?.getTotal() ?? 0);
// const imageList = computed(() => {
//   return items.value.map((item) => item.file_name_url).filter((url): url is string => !!url);
// });

const currentApprovalStep = computed(() => {
  return approvalSteps.value.find(
    (step) =>
      step.status_id === 1 && // PENDING
      !step.approver &&
      step.step_number === (getPreviousApprovedStep.value?.step_number ?? 0) + 1
  );
});

const getPreviousApprovedStep = computed(() => {
  return [...approvalSteps.value]
    .filter((step) => step.status_id === 2)
    .sort((a, b) => b.step_number - a.step_number)[0];
});

const isLastStep = computed(() => {
  const lastStep = [...approvalSteps.value].sort((a, b) => b.step_number - a.step_number)[0];
  return currentApprovalStep.value?.step_number === lastStep?.step_number;
});

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
  // check button show
  if (!canApprove.value) {
    return [];
  }

  const currentStep = currentApprovalStep.value;
  if (!currentStep) return [];

  if (currentStep.is_otp) {
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

const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});

/*********************Logic OTP*********************** */
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

    await approvalStepStore.submitApproval(documentId, payload);
    isOtpModalVisible.value = false;
  } catch (err) {
    console.error("Error in handleOtpConfirm:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    isOtpModalVisible.value = false;
  }
};
const handleApprove = async () => {
  isApproveModalVisible.value = false;

  const currentStep = currentApprovalStep.value;
  if (!currentStep?.id) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ปัจจุบัน");
    return;
  }

  const documentId = route.params.id as string;

  // --- final ---
  if (currentStep.is_otp === true) {
    // ---- use OTP ----
    try {
      // use Store to API /send-otp/{id}
      const otpData = await approvalStepStore.sendOtp(currentStep.id);

      // sucess, - OTP Modal wait...
      if (otpData) {
        isOtpModalVisible.value = true;
      }
    } catch (err) {
      console.error("Error in handleApprove (OTP case):", err);
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງ OTP ໄດ້");
    }
  } else {
    // ---- No OTP ----
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
        // console.log("Reloaded requestDetail:", requestDetail.value);

        if (isLastStep.value) {
          router.push({
            name: "doc-type-select",
            query: { purchase_request_id: requestDetail.value?.getId() },
          });
        }
        // console.log("Approval successful");
      }
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

  if (!requestDetail.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    return;
  }

  try {
    const userApproval = requestDetail.value.getUserApproval();
    if (!userApproval?.approval_step?.[0]?.id) {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step");
      return;
    }

    const approvalStepId = userApproval.approval_step[0].id;

    const documentId = route.params.id as string;
    const payload = {
      type: "pr" as const,
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
      />
    </div>

    <OtpModal
      :visible="isOtpModalVisible"
      :title="t('purchase-rq.otp-verification')"
      :loading="confirmLoading"
      @confirm="handleOtpConfirm"
      @close="isOtpModalVisible = false"
      @resend="handleApprove"
    />

    <UiModal
      title="ອະນຸມັດ"
      :visible="isApproveModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isApproveModalVisible = false"
    >
      <p>ທ່ານຕ້ອງການຢືນຢັນຄຳຂໍຈັດຊື້ ແທ້ ຫຼື ບໍ່?</p>
      <template #footer>
        <div class="flex gap-x-2">
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

    <UiModal
      title="ປະຕິເສດ"
      :visible="isRejectModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isRejectModalVisible = false"
    >
      <div class="space-y-4">
        <p>ໃສ່ເຫດຜົນໃນການປະຕິເສດ</p>
        <div>
          <p class="mb-2 font-semibold">ເຫດຜົນ</p>
          <Textarea v-model="rejectReason" placeholder="ປ້ອນເຫດຜົນ" :rows="4" />
        </div>
      </div>
      <template #footer>
        <div class="flex gap-x-2">
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

    <!-- Main Content -->
    <div v-if="loading" class="mt-[10rem] text-center">Loading...</div>
    <div v-else-if="requestDetail" class="bg-white rounded-lg shadow-sm p-6 mt-40">
      <!-- Requester Information -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center **w-16 h-16** rounded-full **bg-blue-100** **text-4xl**"
          >
            <Icon icon="mdi:user" class="text-6xl" />
          </div>

          <div>
            <h3 class="text-lg font-semibold">{{ requesterInfo?.username }}</h3>
            <p class="text-gray-600">{{ positionInfo?.name }} - {{ departmentInfo?.name }}</p>
          </div>
        </div>
        <p class="text-gray-500">
          <span>{{ t("purchase-rq.field.date_rq") }}<br /></span>
          {{ formatDate(requestDetail.getExpiredDate()) }}
        </p>
      </div>

      <!-- Purpose -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">{{ t("purchase-rq.proposer_list") }}</h4>
        <p class="text-gray-600">{{ requestDetail.getPurposes() }}</p>
      </div>

      <!-- Items Table -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">ລາຍການ</h4>
        <Table :columns="columns(t)" :dataSource="items" row-key="id">
          <template #index="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template #total_price="{ record }">
            <span>₭ {{ formatPrice(record.getTotalPrice()) }}</span>
          </template>
          <template #image="{ record }">
            <span v-if="!record.file_name_url">ບໍ່ມີ</span>
            <a-image
              v-else
              :src="record.file_name_url"
              alt="ຮູບພາບ"
              style="max-width: 50px; max-height: 50px; border-radius: 6px"
              :preview="true"
            />
          </template>
        </Table>
        <div>
          <p class="text-gray-500 mt-2 flex justify-end">
            {{ t("purchase_qequest.table.total") }}:
            <span class="font-semibold">{{ formatPrice(totalAmount) }}₭</span>
          </p>
        </div>
      </div>
      <!-- Signatures -->
      <div class="signature shadow-sm py-4 px-6 rounded-md mb-[10rem]">
        <h2 class="text-md font-semibold">{{ t("purchase-rq.signature") }}</h2>

        <div class="flex justify-start gap-x-12">
          <div class="text-center">
            <p class="text-slate-500 text-sm">{{ t("purchase-rq.proposer") }}</p>
            <div class="flex justify-start">
              <a-image
                :src="(requesterInfo as any)?.user_signature?.signature_url ?? '/public/2.png'"
                alt="signature"
                :width="180"
                :height="100"
                :preview="false"
              />
            </div>

            <div class="info text-sm text-slate-600 -space-y-2 mt-4">
              <p>{{ requesterInfo?.username }}</p>
              <p>{{ departmentInfo?.name }}</p>
            </div>
          </div>

          <div class="text-center">
            <p class="text-slate-500 text-sm">{{ t("purchase-rq.approver") }}</p>
            <div class="flex justify-start">
              <a-image
                :src="(requesterInfo as any)?.user_signature?.signature_url ?? '/public/2.png'"
                alt="signature"
                :width="180"
                :height="100"
                :preview="false"
              />
            </div>

            <div class="info text-sm text-slate-600 -space-y-2 mt-4">
              <p>{{ requesterInfo?.username }}</p>
              <p>{{ departmentInfo?.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
