// Approval Logic for Proposals (similar to Disbursement Slip)
import { ref, computed } from 'vue';
import { getUserApv, getUserRole, UserRoleEnum } from '@/modules/shared/utils/get-user.login';
import { useNotification } from '@/modules/shared/utils/useNotification';

export interface ApprovalStep {
  id: number;
  step_number: number;
  status_id: number; // 1: pending, 2: approved, 3: rejected
  document_status: { id: number; name: string };
  requires_file_upload: boolean;
  is_otp: boolean;
  doc_approver?: Array<{
    id: number;
    user?: { id: number; username: string };
    department?: { id: number; name: string };
    approved_at?: string;
  }>;
}

export interface UserApproval {
  id: number;
  approval_step: ApprovalStep[];
}

export interface ProposalDocument {
  id: number;
  proposal_number?: string;
  user_approval?: UserApproval;
  [key: string]: any;
}

// Main approval logic composable
export function useApprovalLogic(document: ProposalDocument) {
  const { warning, error } = useNotification();

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
    if (!userId || !document?.user_approval?.approval_step) return false;

    return document.user_approval.approval_step.some(
      (step) =>
        step.status_id === 1 && // pending status
        step.doc_approver?.some((doc) => doc.user?.id === userId)
    );
  });

  // Check if current step requires file upload
  const requiresFileUpload = computed(() => {
    if (!document?.user_approval?.approval_step) return false;
    return document.user_approval.approval_step.some(
      (step) => step.status_id === 1 && step.requires_file_upload
    );
  });

  // Check if current step requires OTP
  const requiresOtp = computed(() => {
    if (!document?.user_approval?.approval_step) return false;
    return document.user_approval.approval_step.some(
      (step) => step.status_id === 1 && step.is_otp
    );
  });

  // Get current step ID
  const currentStepId = computed(() => {
    if (!document?.user_approval?.approval_step) return undefined;
    const currentStep = document.user_approval.approval_step.find(
      (step) => step.status_id === 1 // pending step
    );
    return currentStep?.id;
  });

  // Get next approvers info
  const nextApprovers = computed(() => {
    if (!document?.user_approval?.approval_step) return [];

    const currentStep = document.user_approval.approval_step.find(
      (step) => step.status_id === 1 // pending step
    );

    if (!currentStep?.doc_approver) return [];

    return currentStep.doc_approver.map((approver) => ({
      id: approver.user?.id,
      username: approver.user?.username,
      department: approver.department?.name,
    }));
  });

  // Get approval status for display
  const approvalStatus = computed(() => {
    if (!document?.user_approval?.approval_step) return [];
    return document.user_approval.approval_step.map((step) => ({
      id: step.status_id,
      name: step.document_status.name,
    }));
  });

  // Get approver info for display
  const approverInfo = computed(() => {
    if (!document?.user_approval?.approval_step) return [];

    return document.user_approval.approval_step.map((step) => ({
      status: [{
        id: step.status_id,
        name: step.document_status.name,
        ...(step.doc_approver && step.doc_approver.length > 0 && {
          dpm: step.doc_approver.map((approver) => ({
            id: approver.department?.id || 0,
            name: approver.department?.name || '',
          })),
          user: step.doc_approver.map((approver) => ({
            id: approver.user?.id || 0,
            username: approver.user?.username || '',
          })),
        }),
      }],
    }));
  });

  // Approval action handlers
  const handleApprove = async (data: any = {}) => {
    if (!isUserPendingApprover.value) {
      warning('ແຈ້ງເຕືອນ', 'ທ່ານບໍ່ມີສິດອະນຸມັດເອກະສານນີ້');
      return false;
    }

    try {
      // Prepare approval data
      const approvalData = {
        proposal_id: document.id,
        step_id: currentStepId.value,
        remark: data.remark || '',
        files: data.files || [],
        otp_code: data.otp_code,
        user_id: user.value?.id,
      };

      // Emit approve event
      const approveEvent = new CustomEvent('approve-proposal', {
        detail: approvalData,
      });
      globalThis.dispatchEvent(approveEvent);

      return true;
    } catch (err) {
      console.error('Error in approve action:', err);
      error('ການອະນຸມັດຜິດພາດ', 'ບໍ່ສາມາດອະນຸມັດໄດ້');
      return false;
    }
  };

  const handleReject = async (reason: string) => {
    if (!isUserPendingApprover.value) {
      warning('ແຈ້ງເຕືອນ', 'ທ່ານບໍ່ມີສິດອະນຸມັດເອກະສານນີ້');
      return false;
    }

    if (!reason.trim()) {
      warning('ເກີດຂໍ້ຜິດພາດ', 'ກະລຸນາລະບຸເຫດຜົນໃນການປະຕິເສດ');
      return false;
    }

    try {
      // Prepare rejection data
      const rejectData = {
        proposal_id: document.id,
        step_id: currentStepId.value,
        reason: reason.trim(),
        user_id: user.value?.id,
      };

      // Emit reject event
      const rejectEvent = new CustomEvent('reject-proposal', {
        detail: rejectData,
      });
      globalThis.dispatchEvent(rejectEvent);

      return true;
    } catch (err) {
      console.error('Error in reject action:', err);
      error('ການປະຕິເສດຜິດພາດ', 'ບໍ່ສາມາດປະຕິເສດໄດ້');
      return false;
    }
  };

  // Check if user can view approval details
  const canViewApproval = computed(() => {
    return isRole.value || isUserPendingApprover.value;
  });

  // Get status color for UI
  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return 'yellow'; // pending
      case 2: return 'green';  // approved
      case 3: return 'red';    // rejected
      default: return 'gray';
    }
  };

  // Get status text
  const getStatusText = (statusId: number) => {
    switch (statusId) {
      case 1: return 'ລໍຖ້າອະນຸມັດ';
      case 2: return 'ອະນຸມັດແລ້ວ';
      case 3: return 'ປະຕິເສດ';
      default: return 'ບໍ່ຮູ້ສະຖານະ';
    }
  };

  return {
    // Computed properties
    user,
    userRole,
    isRole,
    isUserPendingApprover,
    requiresFileUpload,
    requiresOtp,
    currentStepId,
    nextApprovers,
    approvalStatus,
    approverInfo,
    canViewApproval,

    // Methods
    handleApprove,
    handleReject,
    getStatusColor,
    getStatusText,
  };
}

// Helper function to check document approval status
export function checkDocumentStatus(document: ProposalDocument) {
  if (!document?.user_approval?.approval_step) {
    return {
      isPending: false,
      isApproved: false,
      isRejected: false,
      currentStep: null,
    };
  }

  const steps = document.user_approval.approval_step;
  const currentStep = steps.find(step => step.status_id === 1);
  const approvedSteps = steps.filter(step => step.status_id === 2);
  const rejectedSteps = steps.filter(step => step.status_id === 3);

  return {
    isPending: !!currentStep,
    isApproved: steps.length === approvedSteps.length && rejectedSteps.length === 0,
    isRejected: rejectedSteps.length > 0,
    currentStep,
  };
}

// Function to get document by ID (for when clicking on a list item)
export async function getDocumentById(
  id: string | number,
  fetchFunction: (id: string | number) => Promise<ProposalDocument>
): Promise<ProposalDocument | null> {
  try {
    const document = await fetchFunction(id);
    return document;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}