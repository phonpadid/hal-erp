export class DepartmentApproverEntity {
  private id: string
  private department_id: string
  private user_id: string
  private createdAt: Date
  private updatedAt: Date
  private deletedAt: Date | null

  constructor(
    id: string,
    department_id: string,
    user_id: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null = null
  ) {
    this.id = id
    this.department_id = department_id
    this.user_id = user_id
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.deletedAt = deletedAt
  }

  public getId(): string {
    return this.id
  }

  public getDeparture_id(): string {
    return this.department_id
  }
  public getUser_id(): string {
    return this.user_id
  }

  public getCreatedAt(): Date {
    return this.createdAt
  }

  public getUpdatedAt(): Date {
    return this.updatedAt
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null
  }

  public updated(department_id: string, user_id: string): void {
    this.department_id = department_id
    this.user_id = user_id
    this.updatedAt = new Date()
  }

  public delete(): void {
    this.deletedAt = new Date()
    this.updatedAt = new Date()
  }

  public restore(): void {
    this.deletedAt = null
    this.updatedAt = new Date()
  }

  public static create(id: string, department_id: string, user_id: string): DepartmentApproverEntity {
    const now = new Date()
    return new DepartmentApproverEntity(id, department_id, user_id, now, now)
  }
}
