import type { DocumentTypeEntity } from "../document-type.entities";
import { PurchaseRequestItemEntity } from "./purchase-request-item.entity";

export class PurchaseRequestEntity {
  private id: string | null;
  private document_type_id: string;
  private pr_number: string | null;
  private requested_date: string;
  private expired_date: string;
  private purposes: string | null;
  private document_type: DocumentTypeEntity | null;

  private createdAt: string | null;
  private updatedAt: string | null;
  private deletedAt: string | null

  constructor(
    id: string | null = null,
    document_type_id: string,
    pr_number: string | null = null,
    requested_date: string,
    expired_date: string,
    purposes: string | null = null,
    document_type: DocumentTypeEntity | null = null,
    createdAt: string | null = null,
    updatedAt: string | null = null,
    deletedAt: string | null = null) {
    this.id = id;
    this.document_type_id = document_type_id;
    this.pr_number = pr_number;
    this.requested_date = requested_date;
    this.expired_date = expired_date;
    this.purposes = purposes;
    this.document_type = document_type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public getId(): string | null {
    return this.id;
  }

  public getDocumentId(): string {
    return this.document_type_id;
  }

  public getPrNumber(): string | null {
    return this.pr_number;
  }
  public getRequestedDate(): string {
    return this.requested_date;
  }
  public getExpiredDate(): string {
    return this.expired_date;
  }
  public getPurposes(): string | null {
    return this.purposes;
  }
  public getDocumentType(): DocumentTypeEntity | null {
    return this.document_type;
  }
  public getCreatedAt(): string | null {
    return this.createdAt;
  }

  public getUpdatedAt(): string | null {
    return this.updatedAt;
  }
  public getDeleteddAt(): string | null {
    return this.updatedAt;
  }
  public update(
    document_type_id: string,
    requested_date: string,
    expired_date: string,
    purposes: string,
  ): void {
    this.document_type_id = document_type_id
    this.requested_date = requested_date
    this.expired_date = expired_date
    this.purposes = purposes
  }
  public isDeleted(): boolean {
    return this.deletedAt !== null
  }
  public delete(): void {
    this.deletedAt = new Date().toString()
    this.updatedAt = new Date().toString()
  }
  public static create(
    document_type_id: string,
    requested_date: string,
    expired_date: string,
    purposes: string
  ): PurchaseRequestEntity {
    return new PurchaseRequestEntity(
      null,
      document_type_id,
      requested_date,
      expired_date,
      purposes,
      null, null, null, null)
  }

  public static createPurchaseRequestWithItems(
    documentTypeId: string,
    requestedDate: string,
    expiredDate: string,
    purposes: string,
    purchaseItem: Array<{
      title: string;
      fileName?: string[] | null;
      quantity: number;
      unitId: string;
      price: number;
      totalPrice: number;
      remark?: string;
    }>
  ) {
    // Create the main purchase request
    const purchaseRequest = PurchaseRequestEntity.create(
      documentTypeId,
      requestedDate,
      expiredDate,
      purposes
    );

    // Create all items
    const purchaseRequestItems = purchaseItem.map(item =>
      PurchaseRequestItemEntity.create(
        item.title,
        item.fileName || null,
        item.quantity,
        item.unitId,
        item.price,
        item.totalPrice,
        item.remark || ""
      )
    );

    return {
      purchaseRequest,
      items: purchaseRequestItems
    };
  }
}


// const data = {
//   documentTypeId: "1",
//   requestedDate: "2024-01-15",
//   expiredDate: "2024-02-15",
//   purposes: "Office supplies",
//   [
//     {
//       title: "Printer Paper",
//       file_name: ['object', 'object'],
//       quantity: 100,
//       unit_id: "unit-001",
//       price: 5.50,
//       total_price: 550.00
//     },
//     {
//       title: "Pens",
//       file_name: ['object', 'object'],
//       quantity: 50,
//       unit_id: "unit-002",
//       price: 1.20,
//       total_price: 60.00
//     }
//   ]
// }
