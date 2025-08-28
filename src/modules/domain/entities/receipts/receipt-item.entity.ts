import { formatDate } from "@/modules/shared/formatdate";
import type { PurchaseOrderItemEntity } from "../purchase-order/purchase-order-item.entity";
import type { CurrencyEntity } from "../currency.entity";

export class ReceiptItemEntity {
  private id: string;
  private purchase_order_item_id: string;
  private payment_currency_id: string;
  private payment_type: string;
  private remark: string;

  private purchase_order_item: PurchaseOrderItemEntity | null;
  private payment_currency: CurrencyEntity | null;

  private created_at: string | null;
  private updated_at: string | null;
  private deleted_at: string | null;

  constructor(
    id: string,
    purchase_order_item_id: string,
    payment_currency_id: string,
    payment_type: string,
    remark: string,

    purchase_order_item: PurchaseOrderItemEntity | null = null,
    payment_currency: CurrencyEntity | null = null,
    created_at: string | null = null,
    updated_at: string | null = null,
    deleted_at: string | null = null,
  ) {
    this.id = id;
    this.purchase_order_item_id = purchase_order_item_id;
    this.payment_currency_id = payment_currency_id;
    this.payment_type = payment_type;
    this.remark = remark;

    this.purchase_order_item = purchase_order_item;
    this.payment_currency = payment_currency;
    this.created_at = formatDate(created_at!) ?? null;
    this.updated_at = formatDate(updated_at!) ?? null;
    this.deleted_at = deleted_at ? formatDate(deleted_at) : null;
  }

  public getId(): string {
    return this.id;
  }

  public getPurchaseOrderItemId(): string {
    return this.purchase_order_item_id;
  }
  public getPaymentCurrencyId(): string {
    return this.payment_currency_id;
  }
  public getPaymentType(): string {
    return this.payment_type;
  }
  public getRemark(): string {
    return this.remark;
  }
  public getPurchaseOrderitem(): PurchaseOrderItemEntity | null {
    return this.purchase_order_item;
  }
  public getPaymentCurrency(): CurrencyEntity | null {
    return this.payment_currency;
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
