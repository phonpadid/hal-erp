import type { DocumentTypeEntity } from "./document-type.entities";

export class ApprovalWorkflowEntity {
  private id: string | null;
  private name: string;
  private document_type_id: string;

  private document_types: DocumentTypeEntity | null;

  private createdAt: string | null;
  private updatedAt: string | null;
  private deletedAt: string | null

  constructor(
    id: string | null = null,
    name: string, document_type_id: string,
    document_types: DocumentTypeEntity | null = null,
    createdAt: string | null = null,
    updatedAt: string | null = null,
    deletedAt: string | null = null) {
    this.id = id;
    this.name = name;
    this.document_type_id = document_type_id;

    this.document_types = document_types;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public getId(): string | null {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDocument_type_id(): string {
    return this.document_type_id;
  }
  public getDocument_type(): DocumentTypeEntity | null {
    return this.document_types;
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
  public update(name: string, document_type_id: string): void {
    this.name = name
    this.document_type_id = document_type_id
  }
  public isDeleted(): boolean {
    return this.deletedAt !== null
  }
  public delete(): void {
    this.deletedAt = new Date().toString()
    this.updatedAt = new Date().toString()
  }
  // เพิ่มเมธอดเพื่อตรวจสอบว่าวันที่ถูกต้องหรือไม่
  public hasValidDates(): boolean {
    return Boolean(this.createdAt && this.updatedAt);
  }
  public static create(name: string, document_type_id: string): ApprovalWorkflowEntity {
    return new ApprovalWorkflowEntity(null,name, document_type_id)
  }
}
