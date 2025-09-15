type ApprovalType = "pr" | "po" | "r";

interface ApprovalPurchaseOrderItem {
  id: number;
  budgetItemId: number;
}

interface ApprovalFile {
  fileName: string;
}

export interface OrderItem {
  id: number;
  budget_item_id: number;
}

interface CreateApprovalStepData {
  type: string;
  statusId: number | string;
  remark?: string;
  approvalStepId?: number;
  approval_id?: number;
  purchase_order_items?: OrderItem[];
  account_code?: string;
  otp?: string;
  is_otp?: boolean;
  files?: Array<{ file_name: string }>;
}

export class ApprovalStepEntity {
  private readonly type: ApprovalType;
  private readonly statusId: number;
  private readonly remark: string | null;
  private readonly purchase_order_items: ApprovalPurchaseOrderItem[];
  private readonly accountCode: string | null;
  private readonly otp: string | null;
  private readonly isOtp: boolean;
  private readonly files: ApprovalFile[];
  private readonly approvalStepId: number;
  private approval_id?: number = 0;

  private constructor(
    type: ApprovalType,
    statusId: number,
    approvalStepId: number,
    approval_id: number,
    remark: string | null,
    purchase_order_items: ApprovalPurchaseOrderItem[],
    accountCode: string | null,
    otp: string | null,
    isOtp: boolean,
    files: ApprovalFile[]
  ) {
    this.type = type;
    this.statusId = statusId;
    this.approvalStepId = approvalStepId;
    this.approval_id = approval_id;
    this.remark = remark;
    this.purchase_order_items = purchase_order_items;
    this.accountCode = accountCode;
    this.otp = otp;
    this.isOtp = isOtp;
    this.files = files;
  }

  public static create(data: CreateApprovalStepData): ApprovalStepEntity {
    // console.log("Creating ApprovalStepEntity with approval_id :", data.approval_id);
    const {
      type,
      statusId,
      remark,
      approvalStepId,
      purchase_order_items,
      account_code,
      otp,
      is_otp,
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
    const finalOtp = otp || null;
    const finalIsOtp = is_otp || false;
    const finalapproval_id = data.approval_id !== undefined ? Number(data.approval_id) : 0;

    const finalFiles = (files || []).map((f) => ({ fileName: f.file_name }));
    const finalPurchaseOrderItems = purchase_order_items
      ? (Array.isArray(purchase_order_items) ? purchase_order_items : [purchase_order_items]).map(
          (item) => ({
            id: item.id,
            budgetItemId: item.budget_item_id,
          })
        )
      : [];

    return new ApprovalStepEntity(
      approvalType,
      finalStatusId,
      approvalStepId,
      finalapproval_id,
      finalRemark,
      finalPurchaseOrderItems,
      finalAccountCode,
      finalOtp,
      finalIsOtp,
      finalFiles
    );
  }

  // Getters
  public getType(): ApprovalType {
    return this.type;
  }

  public getStatusId(): number {
    return this.statusId;
  }

  public getOtp(): string | null {
    return this.otp;
  }

  public getIsOtp(): boolean {
    return this.isOtp;
  }

  getApprovalId(): number {
    return this.approval_id ?? 0;
  }

  setApprovalId(approval_id: number): void {
    this.approval_id = approval_id;
  }

  public getApprovalStepId(): number {
    return this.approvalStepId;
  }

  public getRemark(): string | null {
    return this.remark;
  }

  public getPurchaseOrderItems(): ApprovalPurchaseOrderItem[] {
    return [...this.purchase_order_items];
  }

  public getPurchaseOrderItem(): ApprovalPurchaseOrderItem[] {
    return this.getPurchaseOrderItems();
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
