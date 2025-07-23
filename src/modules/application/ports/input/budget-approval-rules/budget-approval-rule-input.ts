import type { CreateBudgetApprovalRuleDTO, UpdateBudgetApprovalRuleDTO } from "@/modules/application/dtos/budget-approval-rules/budget-approval-rules.repository";
import type { BudgetApprovalRuleEntity } from "@/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BudgetApprovalRulesInput {
  create(input: CreateBudgetApprovalRuleDTO): Promise<BudgetApprovalRuleEntity>;
  getById(id: string): Promise<BudgetApprovalRuleEntity | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<BudgetApprovalRuleEntity>>;
  update(id: string, input: UpdateBudgetApprovalRuleDTO): Promise<BudgetApprovalRuleEntity>;
  delete(id: string): Promise<boolean>;
}
