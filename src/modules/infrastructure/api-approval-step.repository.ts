import type { AxiosError } from "axios";
import { api } from "@/common/config/axios/axios";
import { ApprovalStepEntity } from "../domain/entities/approval-step.entity";
import type { ApprovalStepRepository } from "../domain/repository/approval-step.repository";

interface ApprovalStepApiModel {
  type: "pr" | "po" | "r";
  statusId: number;
  remark?: string;
  approvalStepId: number;
  approval_id?: number;
  purchase_order_items?: {
    id: number;
    budget_item_detail_id: number;
  };
  account_code?: string;
  otp?: string;
  is_otp: boolean;
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
  async sendOtp(approvalStepId: number): Promise<{
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
    };
  } | null> {
    try {
      const endpoint = `/send-otp/${approvalStepId}`;
      const response = await api.post(endpoint);

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      this.handleApiError(error, "Failed to send OTP");
      return null;
    }
  }

  private toApiModel(entity: ApprovalStepEntity): ApprovalStepApiModel {
    const purchaseOrderItem = entity.getPurchaseOrderItem();
    const approvalId = entity.getApprovalId();
    // console.log("API model - approval_id before sending:", approvalId);

    return {
      type: entity.getType(),
      statusId: entity.getStatusId(),
      remark: entity.getRemark() ?? undefined,
      approvalStepId: entity.getApprovalStepId(),
      approval_id: approvalId,
      purchase_order_items: purchaseOrderItem
        ? { id: purchaseOrderItem.id, budget_item_detail_id: purchaseOrderItem.budgetItemId }
        : undefined,
      account_code: entity.getAccountCode() ?? undefined,
      otp: entity.getOtp() ?? undefined,
      is_otp: entity.getIsOtp() ?? false,
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
