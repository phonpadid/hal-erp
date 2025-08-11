import { PurchaseOrderItemEntity } from "./purchase-order-item.entity";
import { PurchaseOrderVendorEntity } from "./purchase-order-vendor.entity";

// สร้าง Interface สำหรับ Document เพื่อให้ Type ชัดเจน
interface PurchaseOrderDocument {
  description: string | null;
  documentTypeId: number;
}

// แก้ชื่อเป็น Singular: PurchaseOrderEntity
export class PurchaseOrderEntity {
  private id: number | null;
  private poNumber: string | null; // เพิ่มเลขที่ PO
  private purchaseRequestId: number;
  private document: PurchaseOrderDocument;
  private items: PurchaseOrderItemEntity[];
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  // ทำให้ constructor เป็น private เพื่อควบคุมการสร้าง Object ผ่าน Factory Method
  private constructor(
    id: number | null,
    poNumber: string | null,
    purchaseRequestId: number,
    document: PurchaseOrderDocument,
    items: PurchaseOrderItemEntity[]
  ) {
    this.id = id;
    this.poNumber = poNumber;
    this.purchaseRequestId = purchaseRequestId;
    this.document = document;
    this.items = items;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.deletedAt = null;
  }

  /**
   * Factory Method หลักสำหรับสร้าง Purchase Order ใหม่จากข้อมูลดิบ (DTO)
   * @param data - ข้อมูลจาก JSON ที่ส่งมา
   * @returns {PurchaseOrderEntity}
   */
  public static create(data: {
    purchase_request_id: number;
    document: { description: string; documentTypeId: number };
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
  }): PurchaseOrderEntity {
    const orderItems = data.items.map((itemDto) => {
      const selectedVendorDto = itemDto.selected_vendor.find((v) => v.selected === true);

      if (!selectedVendorDto) {
        throw new Error(
          `Item ID ${itemDto.purchase_request_item_id} does not have a selected vendor.`
        );
      }

      const vendor = PurchaseOrderVendorEntity.create(
        selectedVendorDto.vendor_id,
        typeof selectedVendorDto.vendor_bank_account_id === "number"
          ? selectedVendorDto.vendor_bank_account_id
          : null,
        selectedVendorDto.filename,
        selectedVendorDto.reason
      );

      return PurchaseOrderItemEntity.create(
        itemDto.purchase_request_item_id,
        itemDto.price,
        itemDto.is_vat,
        vendor
      );
    });

    if (orderItems.length === 0) {
      throw new Error("Purchase Order must have at least one item.");
    }

    // สร้าง PurchaseOrderEntity ผ่าน private constructor
    return new PurchaseOrderEntity(
      null, // ID จะถูกสร้างโดย Database
      null, // PO Number จะถูกสร้างโดยระบบ
      data.purchase_request_id,
      data.document,
      orderItems
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
  public getCreatedAt(): Date {
    return this.createdAt;
  }
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  // --- Business Logic Methods (ตัวอย่าง) ---

  /**
   * คำนวณยอดรวมของใบสั่งซื้อ
   * @returns {number}
   */
  public getTotalAmount(): number {
    return this.items.reduce((total, item) => total + item.price, 0);
  }
}
