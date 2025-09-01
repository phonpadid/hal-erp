import { formatDate } from "@/modules/shared/formatdate";
import type { ReceiptItemEntity } from "./receipt-item.entity";
import type { DocumentTypeEntity } from "../document-type.entities";

export class ReceiptEntity {
  private id: string | null;
  private purchase_order_id: string;
  private documentType_id: string;
  private remark: string;

  private receipt_items: ReceiptItemEntity[] | null;
  private document_type: DocumentTypeEntity | null;

  private created_at: string | null;
  private updated_at: string | null;
  private deleted_at: string | null;

  constructor(
    id: string | null = null,
    purchase_order_id: string,
    documentType_id: string,
    remark: string,

    receipt_items: ReceiptItemEntity[] | null = null,
    document_type: DocumentTypeEntity | null = null,
    created_at: string | null = null,
    updated_at: string | null = null,
    deleted_at: string | null = null,
  ) {
    this.id = id;
    this.purchase_order_id = purchase_order_id;
    this.documentType_id = documentType_id;
    this.remark = remark;
    this.receipt_items = receipt_items;
    this.document_type = document_type;

    this.created_at = formatDate(created_at!) ?? null;
    this.updated_at = formatDate(updated_at!) ?? null;
    this.deleted_at = deleted_at ? formatDate(deleted_at) : null;
  }

  public getId(): string | null {
    return this.id;
  }

  public getPurchaseOrderId(): string {
    return this.purchase_order_id;
  }
  public documentTypeId(): string {
    return this.documentType_id;
  }
  public getRemark(): string {
    return this.remark;
  }
  public getReceiptItem(): ReceiptItemEntity[] | null {
    return this.receipt_items;
  }
  public getDocumentType(): DocumentTypeEntity | null {
    return this.document_type;
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

  public updated(receipt_items: ReceiptItemEntity[]): void {
    this.receipt_items = receipt_items;
  }

  public static created(
    purchase_order_id: string,
    documentType_id: string,
    remark: string,
    receipt_items: ReceiptItemEntity[]
  ): ReceiptEntity {
    return new ReceiptEntity(
      null,
      purchase_order_id,
      documentType_id,
      remark,
      receipt_items,
    );
  }
}
