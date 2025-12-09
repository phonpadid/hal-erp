import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  ProposalApprovalStep,
  ProposalDocument,
  ProposalApprover
} from "@/modules/application/dtos/proposal.dto";

export const useProposalStore = defineStore("proposal", () => {
  // State
  const proposals = ref<ProposalDocument[]>([]);
  const currentProposal = ref<ProposalDocument | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasData = computed(() => proposals.value.length > 0);

  const pendingProposals = computed(() =>
    proposals.value.filter(proposal =>
      proposal.user_approval?.approval_step?.some(step => step.status_id === 1)
    )
  );

  const approvedProposals = computed(() =>
    proposals.value.filter(proposal =>
      proposal.user_approval?.approval_step?.every(step => step.status_id === 2)
    )
  );

  // Actions
  const fetchAll = async (params?: { page?: number; limit?: number }) => {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      proposals.value = [
        {
          id: 1,
          proposal_number: "PR2024-001",
          title: "ຈັດຊື້ອຸປະກອນສຳນັກງານ",
          created_at: "2024-01-15T08:30:00Z",
          user_approval: {
            id: 1,
            approval_step: [
              {
                id: 1,
                step_number: 1,
                status_id: 2, // Approved
                document_status: { id: 2, name: "ອະນຸມັດແລ້ວ" },
                requires_file_upload: false,
                is_otp: false,
                doc_approver: [
                  {
                    id: 1,
                    user: {
                      id: 1,
                      username: "admin",
                      position: { id: 1, name: "ຜູ້ບໍລິຫານ" }
                    },
                    department: {
                      id: 1,
                      name: "ພະແນກບໍລິຫານ"
                    },
                    approved_at: "2024-01-15T09:00:00Z"
                  }
                ]
              },
              {
                id: 2,
                step_number: 2,
                status_id: 1, // Pending
                document_status: { id: 1, name: "ລໍຖ້າອະນຸມັດ" },
                requires_file_upload: true,
                is_otp: true,
                doc_approver: [
                  {
                    id: 2,
                    user: {
                      id: 2,
                      username: "manager",
                      position: { id: 2, name: "ຜູ້ຈັດການ" }
                    },
                    department: {
                      id: 2,
                      name: "ພະແນກການເງິນ"
                    }
                  }
                ]
              }
            ]
          },
          document: {
            id: 1,
            company: {
              id: 1,
              name: "HAL ບໍລິສັດ",
              address: "ນະຄອນຫຼວງວຽງຈັນ"
            },
            department: {
              id: 1,
              name: "ພະແນກຊື້"
            },
            requester: {
              id: 3,
              username: "staff1",
              position: { id: 3, name: "ພະນັກງານ" }
            }
          },
          total_amount: 5000000,
          remark: "ຈັດຊື້ອຸປະກອນສຳນັກງານປະຈຳເດືອນ"
        },
        {
          id: 2,
          proposal_number: "PR2024-002",
          title: "ຈັດຊື້ລະບົບຄອມພິວເຕີ້",
          created_at: "2024-01-16T10:00:00Z",
          user_approval: {
            id: 2,
            approval_step: [
              {
                id: 3,
                step_number: 1,
                status_id: 1, // Pending
                document_status: { id: 1, name: "ລໍຖ້າອະນຸມັດ" },
                requires_file_upload: false,
                is_otp: false,
                doc_approver: [
                  {
                    id: 3,
                    user: {
                      id: 4,
                      username: "supervisor",
                      position: { id: 4, name: "ຜູ້ຄຸ້ມຄອງ" }
                    },
                    department: {
                      id: 3,
                      name: "ພະແນກ IT"
                    }
                  }
                ]
              }
            ]
          },
          document: {
            id: 2,
            company: {
              id: 2,
              name: "HAL Tech",
              address: "ນະຄອນຫຼວງວຽງຈັນ"
            },
            department: {
              id: 3,
              name: "ພະແນກ IT"
            },
            requester: {
              id: 5,
              username: "itstaff",
              position: { id: 5, name: "ຜູ້ຊຳລະລະບົບ" }
            }
          },
          total_amount: 15000000,
          remark: "ອັບເກຣດລະບົບຄອມພິວເຕີ້"
        }
      ];

    } catch (err) {
      error.value = "Failed to fetch proposals";
      console.error("Error fetching proposals:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchById = async (id: string | number) => {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const proposal = proposals.value.find(p => p.id === Number(id) || p.proposal_number === id);
      if (proposal) {
        currentProposal.value = proposal;
      } else {
        error.value = "Proposal not found";
      }
    } catch (err) {
      error.value = "Failed to fetch proposal";
      console.error("Error fetching proposal:", err);
    } finally {
      loading.value = false;
    }
  };

  const approveProposal = async (proposalId: number, stepId: number, data: any) => {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update proposal status in local state
      const proposal = proposals.value.find(p => p.id === proposalId);
      if (proposal && proposal.user_approval?.approval_step) {
        const step = proposal.user_approval.approval_step.find(s => s.id === stepId);
        if (step) {
          step.status_id = 2; // Approved
          step.document_status = { id: 2, name: "ອະນຸມັດແລ້ວ" };

          // Update approver info
          if (step.doc_approver) {
            step.doc_approver.forEach(approver => {
              approver.approved_at = new Date().toISOString();
            });
          }
        }
      }

      return true;
    } catch (err) {
      error.value = "Failed to approve proposal";
      console.error("Error approving proposal:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const rejectProposal = async (proposalId: number, stepId: number, reason: string) => {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update proposal status in local state
      const proposal = proposals.value.find(p => p.id === proposalId);
      if (proposal && proposal.user_approval?.approval_step) {
        const step = proposal.user_approval.approval_step.find(s => s.id === stepId);
        if (step) {
          step.status_id = 3; // Rejected
          step.document_status = { id: 3, name: "ປະຕິເສດ" };
          step.remark = reason;
        }
      }

      return true;
    } catch (err) {
      error.value = "Failed to reject proposal";
      console.error("Error rejecting proposal:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const clearCurrent = () => {
    currentProposal.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    proposals,
    currentProposal,
    loading,
    error,

    // Getters
    hasData,
    pendingProposals,
    approvedProposals,

    // Actions
    fetchAll,
    fetchById,
    approveProposal,
    rejectProposal,
    clearCurrent,
    clearError
  };
});