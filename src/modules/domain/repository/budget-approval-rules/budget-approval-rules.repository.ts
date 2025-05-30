
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { BudgetApprovalRuleEntity } from "../../entities/budget-approval-rules/budget-approver-rules.entity";

export interface BudgetApprovalRuleRepository {
  create(input: BudgetApprovalRuleEntity): Promise<BudgetApprovalRuleEntity>;
  findById(id: string): Promise<BudgetApprovalRuleEntity | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<BudgetApprovalRuleEntity>>;
  update(id: string, input: BudgetApprovalRuleEntity): Promise<BudgetApprovalRuleEntity>;
  delete(id: string): Promise<boolean>;
}
