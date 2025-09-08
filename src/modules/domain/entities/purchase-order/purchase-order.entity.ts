/* eslint-disable @typescript-eslint/no-explicit-any */
import { PurchaseOrderItemEntity } from "./purchase-order-item.entity";
// import { PurchaseOrderVendorEntity } from "./purchase-order-vendor.entity";
import { PurchaseOrderItemDataEntity } from "./purchase-order-Item-data.entity";

interface PurchaseOrderDocument {
  description: string | null;
  documentTypeId: number;
  department?: any;
  requester?: any;
  purposes?: string;
  position?: Array<{
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }>;

  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

export class PurchaseOrderEntity {
  private id: number | null;
  private po_number: string | null;
  private purchaseRequestId: number;
  private document: PurchaseOrderDocument;
  private purposes: string;
  private purchaseRequest: any;
  private userApproval: any;
  private items: PurchaseOrderItemEntity[];
  private purchase_order_item: PurchaseOrderItemDataEntity[];
  private readonly budget_item_detail_id: number;
  private createdBy: string;
  private createdAt: string;
  private updatedBy: string;
  private updatedAt: string;
  private deletedAt: string | null;

  private constructor(
    id: number | null,
    po_number: string | null,
    purchaseRequestId: number,
    document: PurchaseOrderDocument,
    items: PurchaseOrderItemEntity[],
    purchase_order_item: PurchaseOrderItemDataEntity[],
    purposes: string,
    budget_item_detail_id: number,
    createdBy: string,
    createdAt: string,
    updatedBy: string,
    updatedAt: string,
    deletedAt: string | null = null,
    purchaseRequest?: any,
    userApproval?: any
  ) {
    this.id = id;
    this.po_number = po_number;
    this.purchaseRequestId = purchaseRequestId;
    this.document = document;
    this.purposes = purposes;
    this.items = items;
    this.purchase_order_item = purchase_order_item;
    this.budget_item_detail_id = budget_item_detail_id;
    this.purchaseRequest = purchaseRequest;
    this.userApproval = userApproval;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedBy = updatedBy;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public static create(data: any): PurchaseOrderEntity {
    const id = data.id || null;
    const poNumber = data.po_number || null;
    const purchaseRequestId = data.purchase_request_id || 0;
    const purposes = data.purposes || data.purchase_request?.purposes || "N/A";
    const createdAt = data.created_at || "Invalid date";
    const updatedAt = data.updated_at || "Invalid date";
    let purchaseOrderItems: PurchaseOrderItemDataEntity[] = [];
    if (Array.isArray(data.purchase_order_item)) {
      purchaseOrderItems = data.purchase_order_item.map(
        (item: any) => new PurchaseOrderItemDataEntity(item)
      );
    }
    const documentData = data.document || data.purchase_request?.document;
    const document: PurchaseOrderDocument = {
      description: documentData?.description || null,
      documentTypeId: documentData?.document_type_id || 0,
      department: documentData?.department || null,
      requester: documentData?.requester || null,
      position: documentData?.position || [],
      created_at: documentData?.created_at || "Invalid date",
      updated_at: documentData?.updated_at || "Invalid date",
    };

    return new PurchaseOrderEntity(
      id,
      poNumber,
      purchaseRequestId,
      document,
      [],
      purchaseOrderItems,
      purposes,
      data.budget_item_detail_id || 0,
      data.created_by || "N/A",
      createdAt,
      data.updated_by || "N/A",
      updatedAt,
      data.deleted_at || null,
      data.purchase_request,
      data.user_approval
    );
  }

  // เพิ่มเมธอด setPurchaseOrderItem
  public setPurchaseOrderItem(items: any[]): void {
    this.purchase_order_item = items.map((item) => new PurchaseOrderItemDataEntity(item));
  }

  // --- Getters ---
  public getId(): number | null {
    return this.id;
  }
  public getPoNumber(): string | null {
    return this.po_number;
  }
  public getPurchaseRequestId(): number {
    return this.purchaseRequestId;
  }
  public getItems(): PurchaseOrderItemEntity[] {
    return this.items;
  }
  public getDocument(): PurchaseOrderDocument {
    return this.document;
  }
  public getCreatedAt(): Date | string {
    return this.createdAt;
  }
  public getUpdatedAt(): Date | string {
    return this.updatedAt;
  }
  public getDeletedAt(): Date | string | null {
    return this.deletedAt;
  }
  public getPurchaseRequest(): any {
    return this.purchaseRequest;
  }

  public getUserApproval(): any {
    return this.userApproval;
  }

  public getDepartment(): any {
    return this.document.department;
  }

  public getPurchaseOrderItem(): PurchaseOrderItemDataEntity[] {
    return this.purchase_order_item;
  }

  public getBudgetItemDetailId(): number {
    return this.budget_item_detail_id;
  }

  public getRequester(): any {
    return this.document.requester;
  }
  public getPosition(): any {
    return this.document.position;
  }
  public getPurposes(): string {
    return this.purposes;
  }

  // เพิ่มเมธอดสำหรับดึงข้อมูลจาก purchase_order_item
  public getQuotationImageUrl(): string | null {
    if (this.purchase_order_item && this.purchase_order_item.length > 0) {
      return this.purchase_order_item[0].getQuotationImageUrl();
    }
    return null;
  }

  public getBankName(): string {
    if (this.purchase_order_item && this.purchase_order_item.length > 0) {
      return this.purchase_order_item[0].getBankName();
    }
    return "N/A";
  }

  public getBankLogo(): string | null {
    if (this.purchase_order_item && this.purchase_order_item.length > 0) {
      return this.purchase_order_item[0].getBankLogo();
    }
    return null;
  }

  public getAccountName(): string {
    if (this.purchase_order_item && this.purchase_order_item.length > 0) {
      return this.purchase_order_item[0].getAccountName();
    }
    return "N/A";
  }

  public getAccountNumber(): string {
    if (this.purchase_order_item && this.purchase_order_item.length > 0) {
      return this.purchase_order_item[0].getAccountNumber();
    }
    return "N/A";
  }

  public getCurrencyCode(): string {
    if (this.purchase_order_item && this.purchase_order_item.length > 0) {
      return this.purchase_order_item[0].getCurrencyCode();
    }
    return "LAK";
  }

  // --- Business Logic Methods (ตัวอย่าง) ---

  /**
   * คำนวณยอดรวมของใบสั่งซื้อ
   * @returns {number}
   */
  public getTotalWithVAT(): number {
    // ถ้ามีข้อมูลใน items ให้คำนวณจาก items
    if (this.items && this.items.length > 0) {
      return this.items.reduce((total, item) => {
        const itemPrice = item.getPrice();
        return total + (item.getIsVat() ? itemPrice * 1.07 : itemPrice);
      }, 0);
    }

    // ถ้าไม่มีข้อมูลใน items แต่มีข้อมูลใน purchase_order_item ให้คำนวณจาก purchase_order_item
    if (this.purchase_order_item && this.purchase_order_item.length > 0) {
      return this.purchase_order_item.reduce((total, item) => {
        return total + item.getTotalWithVat();
      }, 0);
    }

    return 0;
  }
}
