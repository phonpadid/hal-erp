export interface CreateBudgetApprovalRuleDTO {
  department_id: string;
  approver_id: string;
  min_amount: number;
  max_amount: number
}

export interface UpdateBudgetApprovalRuleDTO {
  id: string;
  department_id: string;
  approver_id: string;
  min_amount: number;
  max_amount: number
}

export interface BudgetApprovalRuleDTO {
  id: string;
  department_id: string;
  approver_id: string;
  min_amount: number;
  max_amount: number
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
