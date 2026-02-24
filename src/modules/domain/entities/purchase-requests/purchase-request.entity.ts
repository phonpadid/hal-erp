/* eslint-disable @typescript-eslint/no-explicit-any */
import { PurchaseRequestItemEntity } from "./purchase-request-item.entity";
import type {
  PurchaseRequestItemParams,
  Department,
  DocumentType,
  Position,
  Requester,
  UserApproval,
  UserSignature,
  Company
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
  private company: Company | null;
  private is_created_po: boolean;
  private user_approval: {
    id: number;
    document_id: number;
    status_id: number;
    approval_step: Array<{
      approver: any;
      position?: any;
      id: number;
      user_approval_id: number;
      step_number: number;
      approver_id: number;
      status_id: number;
      remark: string;
      is_otp: boolean;
      created_at?: string;
      requires_file_upload: boolean;
      approved_at?: string | null;
      doc_approver?: Array<{
        user: {
          username: string;
        };
        department?: {
          name: string;
        };
      }>;
    }>;
  } | null = null;

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
    company: Company | null = null,
    user_approval: any = null,
    createdAt: string | null = null,
    updatedAt: string | null = null,
    deletedAt: string | null = null,
    total: number = 0,
    is_created_po: boolean = false
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
    this.company = company;
    this.user_approval = user_approval;
    this.total = total;
    this.is_created_po = is_created_po;
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

  public getRequesterSignature(): UserSignature | null {
    if (this.requester && this.requester.user_signature) {
      return this.requester.user_signature;
    }
    return null;
  }

  public getPosition(): Position | null {
    return this.position;
  }

  public getCompany(): Company | null {
    return this.company;
  }

  public getUserApproval() {
    if (
      this.user_approval &&
      typeof this.user_approval === "object" &&
      "id" in this.user_approval &&
      "approval_step" in this.user_approval
    ) {
      return this.user_approval;
    }
    return null;
  }

  public getIsCreatedPo(): boolean {
    return this.is_created_po;
  }
  public setUserApproval(userApproval: UserApproval): void {
    this.user_approval = userApproval;
    this.updateTimestamp();
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
    return [...this.items];
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
    purposes: string,
    user_approval: UserApproval | null = null
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
      null,
      user_approval,
      null,
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

    console.log("PurchaseRequestEntity - purchaseItems:", purchaseItems);
    console.log("PurchaseRequestEntity - item.quotaId check:");

    const purchaseRequestItems = purchaseItems.map((item) => {
      console.log("item:", item);
      console.log("item.quotaId:", item.quotaId);
      console.log("item.quotaId || null:", item.quotaId || null);

      return PurchaseRequestItemEntity.create(
        item.title,
        item.fileName,
        item.fileNameUrl || null,
        item.quantity,
        item.unitId.toString(),
        item.price,
        item.quantity * item.price,
        item.remark || "",
        item.quotaId || null
      );
    });

    console.log("PurchaseRequestEntity - purchaseRequestItems created:", purchaseRequestItems);

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
