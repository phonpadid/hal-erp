<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { getUserApv, getUserRole, UserRoleEnum } from "@/modules/shared/utils/get-user.login";
import { useProposalStore } from "../../../stores/proposal.store";

// Props
interface Props {
  proposalId: string;
  dataHead: {
    form_ref: any;
    exist_access: boolean;
    role: boolean;
    rId: number;
    no: string;
    isApproved: boolean;
    data: {
      stepId?: number;
      remark?: string;
      type: string;
      files: Array<{ file_name: string }>;
      account_code?: string;
      uploadCompleted?: boolean;
      formState?: { files: Array<{ file_name: string }> };
      uploadedImages?: string[];
    };
    status: Array<{ id: number; name: string }>;
    created_at: string;
    is_otp: boolean;
    is_upload: boolean;
    approver_info: Array<{
      status: Array<{
        id: number;
        name: string;
        dpm?: Array<{ id: number; name: string }>;
        user?: Array<{ id: number; username: string }>;
      }>;
    }>;
  };
  onPrint?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  onPrint: () => {},
});

// Composables
const { warning } = useNotification();

// Stores
const proposalStore = useProposalStore();

// User data
const user = computed(() => getUserApv());
const userRole = computed(() => getUserRole() ?? []);

// Check if user has approval role
const isRole = computed(() =>
  userRole.value.some(
    (role: string) =>
      role.includes(UserRoleEnum.ACCOUNT_ADMIN) ||
      role.includes(UserRoleEnum.ACCOUNT_USER) ||
      role.includes(UserRoleEnum.HAL_GROUP_ADMIN)
  )
);

// Check if current user is pending approver
const isUserPendingApprover = computed(() => {
  const userId = user.value?.id;
  if (!userId) return false;

  const steps = proposalStore.currentProposal?.user_approval?.approval_step || [];
  return steps.some(
    (step) =>
      step.status_id === 1 && // pending status
      step.doc_approver?.some((doc) => doc.user?.id === userId)
  );
});

// Check if current step requires file upload
const requiresFileUpload = computed(() => {
  return proposalStore.currentProposal?.user_approval?.approval_step?.some(
    (step) => step.requires_file_upload
  );
});

// Check if current step requires OTP
const requiresOtp = computed(() => {
  return proposalStore.currentProposal?.user_approval?.approval_step?.some(
    (step) => step.status_id === 1 && step.is_otp
  );
});

// Get next approvers info
const nextApprovers = computed(() => {
  const steps = proposalStore.currentProposal?.user_approval?.approval_step || [];
  const currentStep = steps.find(
    (step) => step.status_id === 1 // pending step
  );

  if (!currentStep?.doc_approver) return [];

  return currentStep.doc_approver.map((approver) => ({
    id: approver.user?.id,
    username: approver.user?.username,
    department: approver.department?.name,
    position: approver.user?.position?.name,
  }));
});

// Handle approve action
const handleApprove = () => {
  if (!props.dataHead.isApproved) {
    warning("ແຈ້ງເຕືອນ", "ທ່ານບໍ່ມີສິດອະນຸມັດເອກະສານນີ້");
    return;
  }

  // Emit approve event to parent
  const approveEvent = new CustomEvent('approve-proposal', {
    detail: {
      proposalId: props.proposalId,
      stepId: props.dataHead.data.stepId,
      data: props.dataHead.data,
    },
  });
  globalThis.dispatchEvent(approveEvent);
};

// Handle reject action
const handleReject = () => {
  if (!props.dataHead.isApproved) {
    warning("ແຈ້ງເຕືອນ", "ທ່ານບໍ່ມີສິດອະນຸມັດເອກະສານນີ້");
    return;
  }

  // Emit reject event to parent
  const rejectEvent = new CustomEvent('reject-proposal', {
    detail: {
      proposalId: props.proposalId,
      stepId: props.dataHead.data.stepId,
      data: props.dataHead.data,
    },
  });
  globalThis.dispatchEvent(rejectEvent);
};

// Get status color
const getStatusColor = (statusId: number) => {
  switch (statusId) {
    case 1: return 'yellow'; // pending
    case 2: return 'green';  // approved
    case 3: return 'red';    // rejected
    default: return 'gray';
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>

<template>
  <div class="approval-layout">
    <!-- Header with Approval Actions -->
    <div class="approval-header bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div
              class="p-3 rounded-full"
              :class="[
                isUserPendingApprover ? 'bg-blue-100' : 'bg-gray-100',
                isUserPendingApprover ? 'text-blue-600' : 'text-gray-600'
              ]"
            >
              <Icon icon="mdi:file-document-check" class="text-2xl" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">ການອະນຸມັດໃບສະເໜີ</h1>
              <p class="text-sm text-gray-600">ເລກທີ: {{ dataHead.no || `PR-${proposalId}` }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Print Button -->
          <UiButton
            @click="onPrint"
            variant="outline"
            class="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Icon icon="mdi:printer" />
            ພິມ
          </UiButton>

          <!-- Approval Buttons (only show if user is pending approver) -->
          <div v-if="dataHead.isApproved" class="flex items-center gap-2">
            <!-- Reject Button -->
            <UiButton
              @click="handleReject"
              variant="outline"
              class="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Icon icon="mdi:close-circle" />
              ປະຕິເສດ
            </UiButton>

            <!-- Approve Button -->
            <UiButton
              @click="handleApprove"
              :class="[
                'px-4 py-2 transition-colors flex items-center gap-2',
                dataHead.is_otp
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              ]"
            >
              <Icon icon="mdi:check-circle" />
              {{ dataHead.is_otp ? 'ອະນຸມັດ (OTP)' : 'ອະนຸມັດ' }}
            </UiButton>
          </div>

          <!-- Status Badge -->
          <div v-else class="flex items-center gap-2">
            <Icon icon="mdi:information" class="text-gray-400" />
            <span class="text-sm text-gray-600">
              {{ isUserPendingApprover ? 'ລໍຖ້າການອະນຸມັດຈາກທ່ານ' : 'ບໍ່ມີສິດອະນຸມັດ' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Approval Requirements -->
      <div v-if="dataHead.isApproved" class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex items-center gap-6">
          <!-- OTP Requirement -->
          <div v-if="dataHead.is_otp" class="flex items-center gap-2 text-orange-600">
            <Icon icon="mdi:cellphone-key" />
            <span class="text-sm font-medium">ຕ້ອງຢັ້ງຢືນ OTP</span>
          </div>

          <!-- File Upload Requirement -->
          <div v-if="dataHead.is_upload" class="flex items-center gap-2 text-blue-600">
            <Icon icon="mdi:file-upload" />
            <span class="text-sm font-medium">ຕ້ອງອັບໂຫລດເອກະສານ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval Status Progress -->
    <div class="approval-progress bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">ຂັ້ນຕອນການອະນຸມັດ</h2>

      <div class="space-y-4">
        <div
          v-for="(step, index) in proposalStore.currentProposal?.user_approval?.approval_step || []"
          :key="step.id"
          class="flex items-start gap-4"
        >
          <!-- Step Number -->
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="[
                step.status_id === 2 ? 'bg-green-100 text-green-600' :
                step.status_id === 3 ? 'bg-red-100 text-red-600' :
                'bg-yellow-100 text-yellow-600'
              ]"
            >
              {{ index === 0 ? 'ສ້າງ' : step.step_number }}
            </div>
          </div>

          <!-- Step Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="font-medium text-gray-900">
                  {{ index === 0 ? 'ຜູ້ສ້າງເອກະສານ' : `ຂັ້ນຕອນທີ ${step.step_number}` }}
                </h3>
                <p class="text-sm text-gray-600">{{ step.document_status?.name }}</p>
              </div>

              <!-- Status Badge -->
              <span
                class="px-2 py-1 text-xs rounded-full font-medium"
                :class="[
                  step.status_id === 2 ? 'bg-green-100 text-green-800' :
                  step.status_id === 3 ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{
                  step.status_id === 2 ? 'ອະນຸມັດແລ້ວ' :
                  step.status_id === 3 ? 'ປະຕິເສດ' :
                  'ລໍຖ້າອະນຸມັດ'
                }}
              </span>
            </div>

            <!-- Approvers List -->
            <div v-if="step.doc_approver && step.doc_approver.length > 0" class="mt-3">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="approver in step.doc_approver"
                  :key="approver.id"
                  class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <Icon icon="mdi:account" class="text-gray-400 text-sm" />
                  <span class="text-sm text-gray-700">{{ approver.user?.username }}</span>
                  <span class="text-xs text-gray-500">({{ approver.department?.name }})</span>

                  <!-- Approval Status for Each Approver -->
                  <Icon
                    v-if="approver.approved_at"
                    icon="mdi:check-circle"
                    class="text-green-500 text-sm"
                  />
                  <Icon
                    v-else-if="step.status_id === 3"
                    icon="mdi:close-circle"
                    class="text-red-500 text-sm"
                  />
                  <Icon
                    v-else
                    icon="mdi:clock"
                    class="text-yellow-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Step Requirements -->
            <div v-if="step.requires_file_upload || step.is_otp" class="mt-3 flex items-center gap-4">
              <div v-if="step.requires_file_upload" class="flex items-center gap-1 text-xs text-blue-600">
                <Icon icon="mdi:paperclip" />
                <span>ຕ້ອງອັບໂຫລດເອກະສານ</span>
              </div>
              <div v-if="step.is_otp" class="flex items-center gap-1 text-xs text-orange-600">
                <Icon icon="mdi:cellphone-key" />
                <span>ຕ້ອງຢັ້ງຢືນ OTP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Next Approvers Info -->
    <div
      v-if="nextApprovers.length > 0 && dataHead.isApproved"
      class="next-approvers bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
    >
      <h3 class="text-sm font-semibold text-blue-900 mb-2">ຜູ້ອະນຸມັດລຳດັບຕໍ່ໄປ:</h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="approver in nextApprovers"
          :key="approver.id"
          class="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full"
        >
          <Icon icon="mdi:account-tie" class="text-blue-600 text-sm" />
          <span class="text-sm font-medium text-blue-800">{{ approver.username }}</span>
          <span class="text-xs text-blue-600">({{ approver.department }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.approval-layout {
  max-width: 100%;
}

.approval-header {
  border: 1px solid #e5e7eb;
}

.approval-progress {
  border: 1px solid #e5e7eb;
}

.next-approvers {
  border: 1px solid #3b82f6;
}

/* Smooth transitions */
.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
</style>