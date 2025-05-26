export class DepartmentUserEntity {
  private id: string
  private department_id: string
  private position_id: string
  private user_id: string
  private signature_file: string | File
  private createdAt: Date
  private updatedAt: Date
  private deletedAt: Date | null

  constructor(
    id: string,
    department_id: string,
    position_id: string,
    user_id: string,
    signature_file: string | File,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null = null
  ) {
    this.id = id
    this.department_id = department_id
    this.position_id = position_id
    this.user_id = user_id
    this.signature_file = signature_file
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.deletedAt = deletedAt
  }

  public getId(): string {
    return this.id
  }

  public getdepartment_id(): string {
    return this.department_id
  }

  public getPosition_id(): string {
    return this.position_id
  }
  public getUser_id(): string {
    return this.user_id
  }
  public getSignature_file(): string | File{
    return this.signature_file
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

  public updateDpmUser(department_id: string, position_id: string, user_id: string, signature_file: string | File): void {
    this.department_id = department_id
    this.position_id = position_id
    this.user_id = user_id
    this.signature_file = signature_file
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

  public static create(id: string, department_id: string, position_id: string, user_id: string, signature_file: string | File): DepartmentUserEntity {
    const now = new Date()
    return new DepartmentUserEntity(id,department_id, position_id, user_id, signature_file, now, now)
  }
}
