type ApprovalType = "pr" | "po" | "r";

interface ApprovalPurchaseOrderItem {
  id: number;
  budgetItemId: number;
}

interface ApprovalFile {
  fileName: string;
}

// Interface สำหรับ create method
interface CreateApprovalStepData {
  type: string;
  statusId: number | string;
  remark?: string;
  approvalStepId?: number; // เพิ่ม approvalStepId เป็น optional
  purchase_order_items?: {
    id: number;
    budget_item_detail_id: number;
  };
  account_code?: string;
  files?: Array<{ file_name: string }>;
}

export class ApprovalStepEntity {
  private readonly type: ApprovalType;
  private readonly statusId: number;
  private readonly remark: string | null;
  private readonly purchaseOrderItem: ApprovalPurchaseOrderItem | null;
  private readonly accountCode: string | null;
  private readonly files: ApprovalFile[];
  private readonly approvalStepId: number;

  private constructor(
    type: ApprovalType,
    statusId: number,
    approvalStepId: number,
    remark: string | null,
    purchaseOrderItem: ApprovalPurchaseOrderItem | null,
    accountCode: string | null,
    files: ApprovalFile[]
  ) {
    this.type = type;
    this.statusId = statusId;
    this.approvalStepId = approvalStepId;
    this.remark = remark;
    this.purchaseOrderItem = purchaseOrderItem;
    this.accountCode = accountCode;
    this.files = files;
  }

  public static create(data: CreateApprovalStepData): ApprovalStepEntity {
    const {
      type,
      statusId,
      remark,
      approvalStepId, // รับค่า approvalStepId โดยตรง
      purchase_order_items,
      account_code,
      files,
    } = data;

    // Validation
    if (!["pr", "po", "r"].includes(type)) {
      throw new Error("Invalid approval type. Must be 'pr', 'po', or 'r'.");
    }

    if (typeof statusId !== "number" && typeof statusId !== "string") {
      throw new Error("Status ID must be a number or string.");
    }

    // ตรวจสอบ approvalStepId
    if (!approvalStepId) {
      throw new Error("Approval Step ID is required");
    }

    const approvalType = type as ApprovalType;
    const finalStatusId = Number(statusId);
    const finalRemark = remark || null;
    const finalAccountCode = account_code || null;
    const finalFiles = (files || []).map((f) => ({ fileName: f.file_name }));
    const finalPurchaseOrderItem = purchase_order_items
      ? {
          id: purchase_order_items.id,
          budgetItemId: purchase_order_items.budget_item_detail_id,
        }
      : null;

    return new ApprovalStepEntity(
      approvalType,
      finalStatusId,
      approvalStepId,
      finalRemark,
      finalPurchaseOrderItem,
      finalAccountCode,
      finalFiles
    );
  }

  // Getters คงเดิม
  public getType(): ApprovalType {
    return this.type;
  }
  public getStatusId(): number {
    return this.statusId;
  }
  public getApprovalStepId(): number {
    return this.approvalStepId;
  }
  public getRemark(): string | null {
    return this.remark;
  }
  public getPurchaseOrderItem(): ApprovalPurchaseOrderItem | null {
    return this.purchaseOrderItem;
  }
  public getAccountCode(): string | null {
    return this.accountCode;
  }
  public getFiles(): ApprovalFile[] {
    return [...this.files];
  }
  public isApproved(): boolean {
    return this.statusId === 2;
  }
  public hasFiles(): boolean {
    return this.files.length > 0;
  }
}
