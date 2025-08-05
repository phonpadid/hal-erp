import { PurchaseRequestItemEntity } from "./purchase-request-item.entity";
import type {
  PurchaseRequestItemParams,
  Department,
  DocumentType,
  Position,
  Requester,
} from "@/modules/interfaces/purchase-requests/purchase-request.interface";

export class PurchaseRequestEntity {
  private readonly id: string | null;
  private documentTypeId: number;
  private pr_number: string | null;
  private requested_date: string | null;
  private expired_date: string;
  private purposes: string;
  private document_description: string;
  private status: string;
  private document_type: DocumentType | null;
  private department: Department | null;
  private requester: Requester | null;
  private position: Position | null;
  private total: number;
  private items: PurchaseRequestItemEntity[];
  private createdAt: string | null;
  private updatedAt: string | null;
  private deletedAt: string | null;

  constructor(
    id: string | null = null,
    documentTypeId: number,
    document_description: string,
    pr_number: string | null = null,
    requested_date: string | null = null,
    expired_date: string,
    purposes: string,
    status: string = "PENDING",
    document_type: DocumentType | null = null,
    department: Department | null = null,
    requester: Requester | null = null,
    position: Position | null = null,
    createdAt: string | null = null,
    updatedAt: string | null = null,
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.documentTypeId = documentTypeId;
    this.document_description = document_description;
    this.pr_number = pr_number;
    this.requested_date = requested_date || this.getCurrentTimestamp();
    this.expired_date = expired_date;
    this.purposes = purposes;
    this.status = status;
    this.document_type = document_type;
    this.department = department;
    this.requester = requester;
    this.position = position;
    this.total = 0;
    this.items = [];
    this.createdAt = createdAt || this.getCurrentTimestamp();
    this.updatedAt = updatedAt || this.getCurrentTimestamp();
    this.deletedAt = deletedAt;
  }

  // Utility methods
  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private updateTimestamp(): void {
    this.updatedAt = this.getCurrentTimestamp();
  }

  // Getters with proper return types
  public getId(): string | null {
    return this.id;
  }
  
  public getTotal(): number {
    return this.total;
  }

  public setTotal(total: number): void {
    this.total = total;
  }

  public getDocumentId(): number {
    return this.documentTypeId;
  }

  public getDocumentType(): DocumentType | null {
    return this.document_type;
  }

  public getStatus(): string {
    return this.status;
  }

  public getDepartment(): Department | null {
    return this.department;
  }

  public getRequester(): Requester | null {
    return this.requester;
  }

  public getPosition(): Position | null {
    return this.position;
  }

  public getDocumentDescription(): string {
    return this.document_description;
  }

  public getPrNumber(): string | null {
    return this.pr_number;
  }

  public getRequestedDate(): string | null {
    return this.requested_date;
  }

  public getExpiredDate(): string {
    return this.expired_date;
  }

  public getPurposes(): string {
    return this.purposes;
  }

  public getItems(): PurchaseRequestItemEntity[] {
    return [...this.items]; // Return a copy to prevent direct modification
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

  // Setters and modifiers
  public setItems(items: PurchaseRequestItemEntity[]): void {
    this.items = [...items]; // Create a copy of the array
    this.updateTimestamp();
  }

  public setStatus(status: string): void {
    this.status = status;
    this.updateTimestamp();
  }

  // Business logic methods
  public update(expired_date: string, purposes: string, items?: PurchaseRequestItemEntity[]): void {
    this.expired_date = expired_date;
    this.purposes = purposes;
    if (items) {
      this.setItems(items);
    }
    this.updateTimestamp();
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public delete(): void {
    this.deletedAt = this.getCurrentTimestamp();
    this.updateTimestamp();
  }

  // Static factory methods
  public static create(
    documentTypeId: number,
    document_description: string,
    expired_date: string,
    purposes: string
  ): PurchaseRequestEntity {
    return new PurchaseRequestEntity(
      null,
      documentTypeId,
      document_description,
      null,
      null, // requested_date will be set in constructor
      expired_date,
      purposes,
      "PENDING",
      null,
      null,
      null,
      null,
      null, // timestamps will be set in constructor
      null,
      null
    );
  }

  public static createPurchaseRequestWithItems(
    documentTypeId: number,
    documentDescription: string,
    expiredDate: string,
    purposes: string,
    purchaseItems: PurchaseRequestItemParams[]
  ): PurchaseRequestEntity {
    const purchaseRequest = PurchaseRequestEntity.create(
      documentTypeId,
      documentDescription,
      expiredDate,
      purposes
    );

    const purchaseRequestItems = purchaseItems.map((item) =>
      PurchaseRequestItemEntity.create(
        item.title,
        item.fileName,
        item.fileNameUrl || null,
        item.quantity,
        item.unitId.toString(),
        item.price,
        item.quantity * item.price,
        item.remark || ""
      )
    );

    purchaseRequest.setItems(purchaseRequestItems);

    return purchaseRequest;
  }

  // Validation method
  public validate(): boolean {
    return (
      this.documentTypeId > 0 &&
      this.document_description.trim() !== "" &&
      this.expired_date !== "" &&
      Array.isArray(this.items) &&
      this.items.length > 0
    );
  }
}
