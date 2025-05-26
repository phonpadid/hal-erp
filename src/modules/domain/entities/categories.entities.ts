export class Category {
  private id: string
  private name: string
  private createdAt: string
  private updatedAt: string
  private deletedAt: string | null
  constructor(
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null
  ) {
    this.id = id
    this.name = name
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
  public getCreatedAt(): string {
    return this.createdAt
  }
  public getUpdatedAt(): string {
    return this.updatedAt
  }
  public getDeletedAt(): string | null {
    return this.deletedAt
  }
  public isDeleted(): boolean {
    return this.deletedAt !== null
  }
  public updateName(name: string): void {
    this.name = name
    this.updatedAt = new Date().toString()
  }
  public delete(): void {
    this.deletedAt = new Date().toString()
    this.updatedAt = new Date().toString()
  }
  public restore(): void {
    this.deletedAt = null
    this.updatedAt = new Date().toString()
  }
  public static create(id: string, name: string): Category {
    const now = new Date()
    return new Category(id, name, now.toString(), now.toString())
  }
}
