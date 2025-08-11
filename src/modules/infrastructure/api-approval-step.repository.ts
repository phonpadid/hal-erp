import type { AxiosError } from "axios";
import { api } from "@/common/config/axios/axios";
import { ApprovalStepEntity } from "../domain/entities/approval-step.entity";
import type { ApprovalStepRepository } from "../domain/repository/approval-step.repository";

// อัพเดท Interface ให้รองรับ approvalStepId
interface ApprovalStepApiModel {
  type: "pr" | "po" | "r";
  statusId: number;
  remark?: string;
  approvalStepId: number; // เพิ่ม field นี้
  purchase_order_items?: {
    id: number;
    budget_item_detail_id: number;
  };
  account_code?: string;
  files?: Array<{ file_name: string }>;
}

export class ApiApprovalStepRepository implements ApprovalStepRepository {
  async submit(documentId: string, step: ApprovalStepEntity): Promise<boolean> {
    try {
      
      const approvalStepId = step.getApprovalStepId();
      const endpoint = `/approve-step/${approvalStepId}`;

      const apiModel = this.toApiModel(step);

      await api.post(endpoint, apiModel);

      return true;
    } catch (error) {
      this.handleApiError(error, "Failed to submit approval step");
      return false;
    }
  }

  private toApiModel(entity: ApprovalStepEntity): ApprovalStepApiModel {
    const purchaseOrderItem = entity.getPurchaseOrderItem();

    return {
      type: entity.getType(),
      statusId: entity.getStatusId(),
      remark: entity.getRemark() ?? undefined,
      approvalStepId: entity.getApprovalStepId(),
      purchase_order_items: purchaseOrderItem
        ? { id: purchaseOrderItem.id, budget_item_detail_id: purchaseOrderItem.budgetItemId }
        : undefined,
      account_code: entity.getAccountCode() ?? undefined,
      files: entity.getFiles().map((f) => ({ file_name: f.fileName })),
    };
  }

  private handleApiError(error: unknown, defaultMessage: string): void {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const statusCode = axiosError.response.status;
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(`API Error (${statusCode}): ${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(`Network Error: The request was made but no response was received.`);
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
