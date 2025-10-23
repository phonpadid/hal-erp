/* eslint-disable @typescript-eslint/no-explicit-any */
import { PurchaseOrderItemEntity } from "./purchase-order-item.entity";
// import { PurchaseOrderVendorEntity } from "./purchase-order-vendor.entity";
import { PurchaseOrderItemDataEntity } from "./purchase-order-Item-data.entity";
import { PurchaseOrderVendorEntity } from "./purchase-order-vendor.entity";

interface PurchaseOrderDocument {
  description: string;
  documentTypeId: number;
  department?: any;
  document_type?: any;
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
  private id: number;
  private po_number: string | null;
  private sub_total: number;
  private vat: number;
  private total: number;
  private purchaseRequestId: number;
  private document: PurchaseOrderDocument;
  private purposes: string;
  private purchaseRequest: any;
  private user_approval: {
    id: number;
    document_id: number;
    status_id: number;
    approval_step: Array<{
      approver: any;
      position?: any;
      id: number;
      user_approval_id: number;
      step_number: number;
      approver_id: number;
      status_id: number;
      remark: string;
      is_otp: boolean;
      requires_file_upload: boolean;
      approved_at?: string | null;
      doc_approver?: Array<{    
        user: {
          username: string;
          department?: { name: string } ;
        };
        department?: { name: string };
      }>;
      
    }>;
  } | null = null;
  // private items: PurchaseOrderItemEntity[];
  private items: any[];
  private purchase_order_item: PurchaseOrderItemDataEntity[];
  private readonly budget_item_id: number;
  private createdBy: string;
  private createdAt: string;
  private updatedBy: string;
  private updatedAt: string;
  private deletedAt: string | null;

  private constructor(
    id: number,
    po_number: string | null,
    sub_total: number,
    vat: number,
    total: number,
    purchaseRequestId: number,
    document: PurchaseOrderDocument,
    items: PurchaseOrderItemEntity[],
    purchase_order_item: PurchaseOrderItemDataEntity[],
    purposes: string,
    budget_item_id: number,
    createdBy: string,
    createdAt: string,
    updatedBy: string,
    updatedAt: string,
    deletedAt: string | null = null,
    purchaseRequest?: any,
    user_approval: any = null
  ) {
    this.id = id;
    this.po_number = po_number;
    this.sub_total = sub_total;
    this.vat = vat;
    this.total = total;
    this.purchaseRequestId = purchaseRequestId;
    this.document = document;
    this.purposes = purposes;
    this.items = items;
    this.purchase_order_item = purchase_order_item;
    this.budget_item_id = budget_item_id;
    this.purchaseRequest = purchaseRequest;
    this.user_approval = user_approval;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedBy = updatedBy;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public static create(data: any): PurchaseOrderEntity {
    // console.log("=== Creating PurchaseOrderEntity ===");
    // console.log("Input data:", data);
    // console.log("Document data:", data.document);

    const id = data.id;
    const po_number = data.po_number || null;
    const sub_total = data.sub_total || 0;
    const vat = data.vat || 0;
    const total = data.total || 0;
    // console.log("Sub Total:", sub_total, "VAT:", vat, "Total:", total);
    // console.log("Purchase Request Data:", data.purchase_request);
    // console.log("Purposes from Purchase Request:", data.purchase_request?.purposes);
    const purchaseRequestId = data.purchase_request_id || 0;
    const purposes = data.purposes || data.purchase_request?.purposes || "N/A";
    const createdAt = data.created_at || "Invalid date";
    const updatedAt = data.updated_at || "Invalid date";
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const currentUser = "phonpadid";

    // แปลง items จาก data.items เป็น PurchaseOrderItemEntity[]
    const items = Array.isArray(data.items)
      ? data.items
          .map((item: any) => {
            const vendorData =
              item.selected_vendor && item.selected_vendor[0] ? item.selected_vendor[0] : null;

            if (!vendorData) {
              console.warn(`No vendor data found for item: ${item.purchase_request_item_id}`);
              return null;
            }

            const vendor = PurchaseOrderVendorEntity.create({
              vendorId: Number(vendorData.vendor_id),
              vendorBankAccountId: vendorData.vendor_bank_account_id
                ? Number(vendorData.vendor_bank_account_id)
                : null,
              filename: vendorData.filename || null,
              reason: vendorData.reason || null,
              created_by: currentUser,
              created_at: currentTimestamp,
            });

            return PurchaseOrderItemEntity.create({
              purchaseRequestItemId: Number(item.purchase_request_item_id),
              price: Number(item.price),
              isVat: Boolean(item.is_vat),
              selectedVendor: vendor,
              created_by: currentUser,
              created_at: currentTimestamp,
            });
          })
          .filter((item: any) => item !== null)
      : [];

    let purchaseOrderItems: PurchaseOrderItemDataEntity[] = [];
    if (Array.isArray(data.purchase_order_item)) {
      const purchaseRequestItems = data.purchase_request?.purchase_request_item || [];
      purchaseOrderItems = data.purchase_order_item.map(
        (item: any) => new PurchaseOrderItemDataEntity(item, purchaseRequestItems)
      );
    }
    const documentData = data.document || data.purchase_request?.document;
    // console.log("Document data for processing:", documentData);

    const document: PurchaseOrderDocument = {
      description: documentData?.description || null,
      documentTypeId: documentData?.documentTypeId || documentData?.document_type_id || 0,
      department: documentData?.department || null,
      document_type: documentData?.document_type || null,
      requester: documentData?.requester || null,
      position: documentData?.position || [],
      created_at: documentData?.created_at || "Invalid date",
      updated_at: documentData?.updated_at || "Invalid date",
    };
    // console.log("Final document object:", document);
    // console.log("documentTypeId value:", document.documentTypeId);

    return new PurchaseOrderEntity(
      id,
      po_number,
      sub_total,
      vat,
      total,
      purchaseRequestId,
      document,
      items,
      purchaseOrderItems,
      purposes,
      data.budget_item_id || 0,
      data.created_by || "N/A",
      createdAt,
      data.updated_by || "N/A",
      updatedAt,
      data.deleted_at || null,
      data.purchase_request,
      data.user_approval
    );
  }

  public setPurchaseOrderItem(items: any[]): void {
    this.purchase_order_item = items.map((item) => new PurchaseOrderItemDataEntity(item));
  }

  // --- Getters ---
  public getId(): number {
    return this.id;
  }
  public getPoNumber(): string | null {
    return this.po_number;
  }
  public getSubTotal(): number {
    return this.sub_total;
  }
  public getVat(): number {
    return this.vat;
  }
  public getTotal(): number {
    return this.total;
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

  public getUserApproval() {
    if (
      this.user_approval &&
      typeof this.user_approval === "object" &&
      "id" in this.user_approval &&
      "approval_step" in this.user_approval
    ) {
      return this.user_approval;
    }
    return null;
  }

  public getDepartment(): any {
    return this.document.department;
  }

  public getPurchaseOrderItem(): PurchaseOrderItemDataEntity[] {
    return this.purchase_order_item;
  }

  public getBudgetItemDetailId(): number {
    return this.budget_item_id;
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
  public getTotalWithVAT(): number {
   
    if (this.items && this.items.length > 0) {
      return this.items.reduce((total, item) => {
        const itemPrice = item.getPrice();
        return total + (item.getIsVat() ? itemPrice * 1.07 : itemPrice);
      }, 0);
    }
    if (this.purchase_order_item && this.purchase_order_item.length > 0) {
      return this.purchase_order_item.reduce((total, item) => {
        return total + item.getTotalWithVat();
      }, 0);
    }

    return 0;
  }
}
