import { formatDate } from "@/modules/shared/formatdate";

export class VendorProductEntity {
  private id: string;
  private vendor_id: string;
  private product_id: string;
  private price: number;
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;

  constructor(
    id: string,
    vendor_id: string,
    product_id: string,
    price: number,
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null
  ) {
    this.id = id;
    this.vendor_id = vendor_id;
    this.product_id = product_id;
    this.price = price;
    this.created_at = formatDate(created_at);
    this.updated_at = formatDate(updated_at);
    this.deleted_at = deleted_at !== null ? formatDate(deleted_at) : null;
  }

  public getId(): string {
    return this.id;
  }

  public getVendorId(): string {
    return this.vendor_id;
  }

  public getProductId(): string {
    return this.product_id;
  }

  public getPrice(): number {
    return this.price;
  }

  public getCreatedAt(): string {
    return this.created_at;
  }

  public getUpdatedAt(): string {
    return this.updated_at;
  }

  public getDeletedAt(): string | null {
    return this.deleted_at;
  }

  public isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  public updatePrice(price: number): void {
    this.price = price;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateVendorId(vendor_id: string): void {
    this.vendor_id = vendor_id;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateProductId(product_id: string): void {
    this.product_id = product_id;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public delete(): void {
    this.deleted_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.updated_at = this.deleted_at;
  }

  public restore(): void {
    this.deleted_at = null;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public static create(
    id: string,
    vendor_id: string,
    product_id: string,
    price: number
  ): VendorProductEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new VendorProductEntity(id, vendor_id, product_id, price, now, now, null);
  }
}