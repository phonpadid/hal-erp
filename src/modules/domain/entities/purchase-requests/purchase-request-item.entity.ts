import type { PurchaseRequestEntity } from "./purchase-request.entity";
import type { UnitEntity } from "../unit.entity";

  export class PurchaseRequestItemEntity {
    private id: string | null;
    private title: string;
    private file_name: string | null; // Changed to array as requested
    private quantity: number;
    private unit_id: string;
    private unit: UnitEntity | null;
    private price: number;
    private total_price: number;
    private purchase_request: PurchaseRequestEntity | null;
    private remark: string;
    private createdAt: string | null;
    private updatedAt: string | null;
    private deletedAt: string | null;

    constructor(
      id: string | null = null,
      title: string,
      file_name: string | null = null,
      quantity: number = 0,
      unit_id: string = "",
      unit: UnitEntity | null = null,
      price: number = 0,
      total_price: number = 0,
      purchase_request: PurchaseRequestEntity | null = null,
      remark: string = "",
      createdAt: string | null = null,
      updatedAt: string | null = null,
      deletedAt: string | null = null
    ) {
      this.id = id;
      this.title = title;
      this.file_name = file_name;
      this.quantity = quantity;
      this.unit_id = unit_id;
      this.unit = unit;
      this.price = price;
      this.total_price = total_price;
      this.purchase_request = purchase_request;
      this.remark = remark;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
      this.deletedAt = deletedAt;
    }

    public getId(): string | null {
      return this.id;
    }

    public getTitle(): string {
      return this.title;
    }

    public getFileName(): string | null {
      return this.file_name;
    }

    public getQuantity(): number {
      return this.quantity;
    }

    public getUnitId(): string {
      return this.unit_id;
    }

    public getUnit(): UnitEntity | null {
      return this.unit;
    }

    public getPrice(): number {
      return this.price;
    }

    public getTotalPrice(): number {
      return this.total_price;
    }

    public getPurchaseRequest(): PurchaseRequestEntity | null {
      return this.purchase_request;
    }

    public getRemark(): string {
      return this.remark;
    }

    public getCreatedAt(): string | null {
      return this.createdAt;
    }

    public getUpdatedAt(): string | null {
      return this.updatedAt;
    }

    public getDeletedAt(): string | null {
      return this.deletedAt;
    }

    public update(
      title: string,
      file_name: string | null = null,
      quantity: number,
      unit_id: string,
      price: number,
      total_price: number,
      remark: string = ""
    ): void {
      this.title = title;
      this.file_name = file_name;
      this.quantity = quantity;
      this.unit_id = unit_id;
      this.price = price;
      this.total_price = total_price;
      this.remark = remark;
      this.updatedAt = new Date().toISOString();
    }

    public isDeleted(): boolean {
      return this.deletedAt !== null;
    }

    public delete(): void {
      this.deletedAt = new Date().toISOString();
      this.updatedAt = new Date().toISOString();
    }

    public static create(
      title: string,
      file_name: string | null = null,
      quantity: number,
      unit_id: string,
      price: number,
      total_price: number,
      remark: string = ""
    ): PurchaseRequestItemEntity {
      return new PurchaseRequestItemEntity(
        null,
        title,
        file_name,
        quantity,
        unit_id,
        null,
        price,
        total_price,
        null,
        remark,
        null,
        null,
        null
      );
    }
  }
