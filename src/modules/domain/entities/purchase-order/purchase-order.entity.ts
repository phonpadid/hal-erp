/* eslint-disable @typescript-eslint/no-explicit-any */
import { PurchaseOrderItemEntity } from "./purchase-order-item.entity";
import { PurchaseOrderVendorEntity } from "./purchase-order-vendor.entity";

interface PurchaseOrderDocument {
  description: string | null;
  documentTypeId: number;
  department?: any;
  requester?: any;
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
  private poNumber: string | null;
  private purchaseRequestId: number;
  private document: PurchaseOrderDocument;
  private purchaseRequest: any;
  private userApproval: any;
  private items: PurchaseOrderItemEntity[];
  private createdBy: string;
  private createdAt: string;
  private updatedBy: string;
  private updatedAt: string;
  private deletedAt: string | null;

  private constructor(
    id: number | null,
    poNumber: string | null,
    purchaseRequestId: number,
    document: PurchaseOrderDocument,
    items: PurchaseOrderItemEntity[],
    createdBy: string,
    createdAt: string,
    updatedBy: string,
    updatedAt: string,
    deletedAt: string | null = null,
    purchaseRequest?: any,
    userApproval?: any
  ) {
    this.id = id;
    this.poNumber = poNumber;
    this.purchaseRequestId = purchaseRequestId;
    this.document = document;
    this.items = items;
    this.purchaseRequest = purchaseRequest;
    this.userApproval = userApproval;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedBy = updatedBy;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public static create(data: {
    id?: number;
    poNumber?: string;
    purchase_request_id: number;
    document: {
      description: string | null;
      documentTypeId: number;
      department?: string;
      requester?: string;
      position?: Array<{
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
      }>;
      document_type_id?: number;
      created_by?: string;
      created_at?: string;
      updated_by?: string;
      updated_at?: string;
    };
    purchase_request?: any;
    user_approval?: any;
    items: Array<{
      purchase_request_item_id: number;
      price: number;
      is_vat: boolean;
      selected_vendor: Array<{
        vendor_id: number;
        vendor_bank_account_id: number | string | null;
        filename: string | null;
        reason: string | null;
        selected: boolean;
      }>;
    }>;
    created_by?: string;
    created_at?: string;
    updated_by?: string;
    updated_at?: string;
    deleted_at?: string | null;
  }): PurchaseOrderEntity {
    const currentTimestamp = "2025-08-12 03:05:12"; // UTC time
    const currentUser = "phonpadid";

    const orderItems = data.items.map((itemDto) => {
      const selectedVendorDto = itemDto.selected_vendor.find((v) => v.selected === true);

      if (!selectedVendorDto) {
        throw new Error(
          `Item ID ${itemDto.purchase_request_item_id} does not have a selected vendor.`
        );
      }

      const vendor = PurchaseOrderVendorEntity.create({
        vendorId: selectedVendorDto.vendor_id,
        vendorBankAccountId:
          typeof selectedVendorDto.vendor_bank_account_id === "number"
            ? selectedVendorDto.vendor_bank_account_id
            : null,
        filename: selectedVendorDto.filename,
        reason: selectedVendorDto.reason,
        created_by: currentUser,
        created_at: currentTimestamp,
      });

      return PurchaseOrderItemEntity.create({
        purchaseRequestItemId: itemDto.purchase_request_item_id,
        price: itemDto.price,
        isVat: itemDto.is_vat,
        selectedVendor: vendor,
        created_by: currentUser,
        created_at: currentTimestamp,
      });
    });

    if (orderItems.length === 0) {
      throw new Error("Purchase Order must have at least one item.");
    }

    return new PurchaseOrderEntity(
      data.id || null,
      data.poNumber || null,
      data.purchase_request_id,
      {
        ...data.document,
        documentTypeId: data.document.documentTypeId,
        department: data.document.department || null,
        requester: data.document.requester || null,
        position: data.document.position || [],
        created_by: data.document.created_by || currentUser,
        created_at: data.document.created_at || currentTimestamp,
        updated_by: data.document.updated_by || currentUser,
        updated_at: data.document.updated_at || currentTimestamp,
      },
      orderItems,
      data.created_by || currentUser,
      data.created_at || currentTimestamp,
      data.updated_by || currentUser,
      data.updated_at || currentTimestamp,
      data.deleted_at || null,
      data.purchase_request,
      data.user_approval
    );
  }

  // --- Getters ---
  public getId(): number | null {
    return this.id;
  }
  public getPoNumber(): string | null {
    return this.poNumber;
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

  public getRequester(): any {
    return this.document.requester;
  }

  // --- Business Logic Methods (ตัวอย่าง) ---

  /**
   * คำนวณยอดรวมของใบสั่งซื้อ
   * @returns {number}
   */
  public getTotalWithVAT(): number {
    return this.items.reduce((total, item) => {
      const itemPrice = item.getPrice();
      return total + (item.getIsVat() ? itemPrice * 1.07 : itemPrice);
    }, 0);
  }
}
