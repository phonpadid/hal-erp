import type { PurchaseOrderVendorEntity } from "./purchase-order-vendor.entity";

interface ItemCreateProps {
  purchaseRequestItemId: number;
  price: number;
  isVat: boolean;
  selectedVendor: PurchaseOrderVendorEntity;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
}

export class PurchaseOrderItemEntity {
  private readonly createdBy: string;
  private readonly createdAt: string;
  private readonly updatedBy: string;
  private readonly updatedAt: string;

  private constructor(
    private readonly purchaseRequestItemId: number,
    private readonly price: number,
    private readonly isVat: boolean,
    private readonly selectedVendor: PurchaseOrderVendorEntity,
    createdBy: string,
    createdAt: string,
    updatedBy?: string,
    updatedAt?: string
  ) {
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedBy = updatedBy || createdBy;
    this.updatedAt = updatedAt || createdAt;
  }

  public static create(props: ItemCreateProps): PurchaseOrderItemEntity {
    if (props.price < 0) {
      throw new Error("Price cannot be negative.");
    }

    if (props.purchaseRequestItemId <= 0) {
      throw new Error("Purchase request item ID is invalid.");
    }

    return new PurchaseOrderItemEntity(
      props.purchaseRequestItemId,
      props.price,
      props.isVat,
      props.selectedVendor,
      props.created_by,
      props.created_at,
      props.updated_by,
      props.updated_at
    );
  }

  // Getters
  public getPurchaseRequestItemId(): number {
    return this.purchaseRequestItemId;
  }

  public getPrice(): number {
    return this.price;
  }

  public getIsVat(): boolean {
    return this.isVat;
  }

  public getVendor(): PurchaseOrderVendorEntity {
    return this.selectedVendor;
  }

  public getPriceWithVAT(): number {
    return this.isVat ? this.price * 1.07 : this.price;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }
}
