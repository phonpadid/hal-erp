export class UserApprovalEntity {
  private id: string
  private approval_workflow_id: string
  private status_id: string
  private document_id: string

  private doc_title: string | null
  private status_name: string | null
  private approval_workflow_name: string | null
  private created_at: string | null
  private updated_at: string | null
  private deletedAt: string | null

  constructor(
    id: string,
    approval_workflow_id: string,
    status_id: string,
    document_id: string,

    doc_title: string | null = null,
    status_name: string | null = null,
    approval_workflow_name: string | null = null,
    created_at: string | null = null,
    updated_at: string | null = null,
    deletedAt: string | null = null
  ) {
    this.id = id
    this.approval_workflow_id = approval_workflow_id
    this.status_id = status_id
    this.document_id = document_id

    this.doc_title = doc_title
    this.status_name = status_name
    this.approval_workflow_name = approval_workflow_name
    this.created_at = created_at
    this.updated_at = updated_at
    this.deletedAt = deletedAt
  }

  public getId(): string {
    return this.id
  }

  public getApprovalId(): string {
    return this.approval_workflow_id
  }
  public getStatusId(): string {
    return this.status_id
  }
  public getDocumentId(): string {
    return this.document_id
  }
  public getDocumentName(): string | null {
    return this.doc_title
  }
  public getStatusName(): string | null {
    return this.status_name
  }
  public getApprovalName(): string | null {
    return this.approval_workflow_name
  }

  public getCreatedAt(): string | null {
    return this.created_at
  }

  public getUpdatedAt(): string | null {
    return this.updated_at
  }

  public getDeletedAt(): string | null {
    return this.deletedAt
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null
  }

  public updated(approval_workflow_id: string, status_id: string, document_id: string): void {
    this.approval_workflow_id = approval_workflow_id
    this.status_id = status_id
    this.document_id = document_id
  }

  public delete(): void {

  }
  public static create(id: string, approval_workflow_id: string, status_id: string, document_id: string): UserApprovalEntity {
    const now = new Date()
    return new UserApprovalEntity(id, approval_workflow_id, status_id, document_id)
  }
}
