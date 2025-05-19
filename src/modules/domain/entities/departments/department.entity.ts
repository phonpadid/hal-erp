export class DepartmentEntity {
  private id: string
  private name: string
  private code: string
  private createdAt: Date
  private updatedAt: Date
  private deletedAt: Date | null

  constructor(
    id: string,
    name: string,
    code: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null = null
  ) {
    this.id = id
    this.name = name
    this.code = code
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.deletedAt = deletedAt
  }

  public getId(): string {
    return this.id
  }

  public getName(): string {
    return this.name
  }
  public getCode(): string {
    return this.code
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

  public updateName(name: string): void {
    this.name = name
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

  public static create(id: string, name: string, code: string): DepartmentEntity {
    const now = new Date()
    return new DepartmentEntity(id, name, code, now, now)
  }
}
