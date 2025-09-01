// modules/approvals/domain/repository/approval-step.repository.ts
import { ApprovalStepEntity } from '../entities/approval-step.entity';

export interface ApprovalStepRepository {
  submit(documentId: string, step: ApprovalStepEntity): Promise<boolean>;

  
   sendOtp(approvalStepId: number): Promise<{
    id: number;
    approval_id: number;
    expires_in: string;
    max_attempts: number;
    status: string;
    approver: {
      id: number;
      name: string;
      email: string;
      tel: string;
    }
  } | null>;
}
