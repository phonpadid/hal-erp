import { formatDate } from "@/modules/shared/formatdate";
import type { UnitEntity } from "../../unit.entity";

export class PurchaseReqestItemEntity {
  private id: string;
  private purchase_request_id: string;
  private title: string;
  private file_name: string | null;
  private file_name_url: string | null;
  private quantity: number;
  private unit_id: string;
  private price: number;
  private total_price: number;
  private remark: string;

  private unit: UnitEntity | null;

  private created_at: string | null;
  private updated_at: string | null;
  private deleted_at: string | null;

  constructor(
    id: string,
    purchase_request_id: string,
    title: string,
    file_name: string | null = null,
    file_name_url: string | null = null,
    quantity: number,
    unit_id: string,
    price: number,
    total_price: number,
    remark: string,

    unit: UnitEntity | null = null,
    created_at: string | null = null,
    updated_at: string | null = null,
    deleted_at: string | null = null,
  ) {
    this.id = id;
    this.purchase_request_id = purchase_request_id;
    this.title = title;
    this.file_name = file_name;
    this.file_name_url = file_name_url;
    this.quantity = quantity;
    this.unit_id = unit_id;
    this.price = price;
    this.total_price = total_price;
    this.remark = remark;

    this.unit = unit;
    this.created_at = formatDate(created_at!) ?? null;
    this.updated_at = formatDate(updated_at!) ?? null;
    this.deleted_at = deleted_at ? formatDate(deleted_at) : null;
  }

  public getId(): string {
    return this.id;
  }

  public getPurchaseRequestItemId(): string {
    return this.purchase_request_id;
  }
  public getTitle(): string {
    return this.title;
  }
  public getFilename(): string | null {
    return this.file_name;
  }
  public getFilenameUrl(): string | null {
    return this.file_name_url;
  }
  public getQuantity(): number{
    return this.quantity;
  }
  public getUnitId(): string{
    return this.unit_id;
  }
  public getPrice(): number{
    return this.price;
  }
  public getTotalPrice(): number{
    return this.total_price;
  }
  public getRemark(): string {
    return this.remark;
  }
  public getUnit(): UnitEntity | null {
    return this.unit;
  }

  public getCreatedAt(): string | null{
    return this.created_at;
  }

  public getUpdatedAt(): string | null{
    return this.updated_at;
  }

  public getDeletedAt(): string | null {
    return this.deleted_at;
  }

  public isDeleted(): boolean {
    return this.deleted_at !== null;
  }


}
