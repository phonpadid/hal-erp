import type { ExpressDisbursementRequestEntity } from "./express-disbursement-request.entity";
import type { UnitEntity } from "../unit.entity";

/**
 * A single line item on an Express Disbursement Request.
 *
 * `budget_item_id` is captured LATER, during the budget-selection approval step
 * (via the /approve-step payload) — never at creation. It is therefore exposed
 * as a read-only getter only; the client never mutates budget amounts.
 */
export class ExpressDisbursementRequestItemEntity {
  private id: string | null;
  private title: string;
  private file_name: string | null;
  private fileType!: "image" | "pdf" | "";
  public file_name_url: string | null;
  private quantity: number;
  private unit_id: string;
  private unit: UnitEntity | null;
  private price: number;
  private total_price: number;
  private express_disbursement_request: ExpressDisbursementRequestEntity | null;
  private remark: string;
  private budget_item_id: number | null;
  private createdAt: string | null;
  private updatedAt: string | null;
  private deletedAt: string | null;

  constructor(
    id: string | null = null,
    title: string,
    file_name: string | null = null,
    file_name_url: string | null = null,
    quantity: number = 0,
    unit_id: string = "",
    unit: UnitEntity | null = null,
    price: number = 0,
    total_price: number = 0,
    express_disbursement_request: ExpressDisbursementRequestEntity | null = null,
    remark: string = "",
    budget_item_id: number | null = null,
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
    this.file_name_url = file_name_url;
    this.express_disbursement_request = express_disbursement_request;
    this.remark = remark;
    this.budget_item_id = budget_item_id;
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

  public getFileType(): "image" | "pdf" | "" {
    return this.fileType;
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

  public getExpressDisbursementRequest(): ExpressDisbursementRequestEntity | null {
    return this.express_disbursement_request;
  }

  public getRemark(): string {
    return this.remark;
  }

  public getFileNameUrl(): string | null {
    return this.file_name_url;
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

  /** Budget item assigned during the budget-selection step. Read-only. */
  public getBudgetItemId(): number | null {
    return this.budget_item_id;
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
    file_name_url: string | null,
    quantity: number,
    unit_id: string,
    price: number,
    total_price: number,
    remark: string = ""
  ): ExpressDisbursementRequestItemEntity {
    return new ExpressDisbursementRequestItemEntity(
      null,
      title,
      file_name,
      file_name_url,
      quantity,
      unit_id,
      null,
      price,
      total_price,
      null,
      remark,
      null,
      null,
      null,
      null
    );
  }
}
