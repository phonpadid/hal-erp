import { PurchaseOrderVendorEntity } from "./purchase-order-vendor.entity";

export class PurchaseOrderItemEntity {
  private constructor(
    public readonly purchaseRequestItemId: number,
    public readonly price: number,
    public readonly isVat: boolean,
    public readonly selectedVendor: PurchaseOrderVendorEntity,
  ) {}

  /**
   * Factory method สำหรับสร้าง Item Entity
   * @returns {PurchaseOrderItemEntity}
   */
  public static create(
    purchaseRequestItemId: number,
    price: number,
    isVat: boolean,
    selectedVendor: PurchaseOrderVendorEntity,
  ): PurchaseOrderItemEntity {
    if (price < 0) {
      throw new Error("Price cannot be negative.");
    }
    return new PurchaseOrderItemEntity(purchaseRequestItemId, price, isVat, selectedVendor);
  }
}
