export interface ApprovalStepInterface {
  type?: string;
  statusId: number;
  remark?: string;
  purchase_order_items: Purchase_order_itemsInterface;
  account_code?: string;
  files: FileNameinterface[];
}
export interface Purchase_order_itemsInterface {
  id: number;
  budget_item_detail_id: number;
}
export interface FileNameinterface {
  file_name: string | null;
}
export interface SubmitApprovalStepInterface {
  type: "pr" | "po" | "r";
  statusId: string | number;
  remark?: string;
  approvalStepId?: number; 
  purchase_order_items?: {
    id: number;
    budget_item_detail_id: number;
  };
  account_code?: string;
  files?: Array<{
    file_name: string;
  }>;
}
