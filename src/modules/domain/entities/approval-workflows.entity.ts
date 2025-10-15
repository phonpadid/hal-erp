import type { ApprovalWorkflowStepApiModel } from "@/modules/interfaces/approval-workflow-step.interface";
import type { DocumentTypeEntity } from "./document-type.entities";

export class ApprovalWorkflowEntity {
  private id: string | null;
  private name: string;
  private document_type_id: string;
  private status?: string | null;
  private document_type: DocumentTypeEntity | null;
  private steps: ApprovalWorkflowStepApiModel[];

  private createdAt: string | null;
  private updatedAt: string | null;
  private deletedAt: string | null;

  constructor(
    id: string | null = null,
    name: string,
    document_type_id: string,
    status: string | null = null,
    document_type: DocumentTypeEntity | null = null,
    steps: ApprovalWorkflowStepApiModel[] = [],
    createdAt: string | null = null,
    updatedAt: string | null = null,
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.document_type_id = document_type_id;
    this.status = status;
    this.document_type = document_type;
    this.steps = steps;
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

  public getDocumentTypeId(): string {
    return this.document_type_id;
  }
  public getStatus(): string | null {
    return this.status ?? '';
  }
  public getDocumentType(): DocumentTypeEntity | null {
    return this.document_type;
  }

  public getSteps(): ApprovalWorkflowStepApiModel[] {
    return this.steps;
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

  public update(name: string, document_type_id: string): void {
    this.name = name;
    this.document_type_id = document_type_id;
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public delete(): void {
    const now = new Date().toISOString();
    this.deletedAt = now;
    this.updatedAt = now;
  }

  public hasValidDates(): boolean {
    return Boolean(this.createdAt && this.updatedAt);
  }

  public static create(
    name: string,
    document_type_id: string,
    steps: ApprovalWorkflowStepApiModel[] = []
  ): ApprovalWorkflowEntity {
    return new ApprovalWorkflowEntity(null, name, document_type_id, null, null, steps);
  }
}
