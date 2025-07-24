export class Position {
  private id: string
  private name: string
  private createdAt: string
  private updatedAt: string
  private deletedAt: Date | null

  constructor(
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: Date | null = null
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

  public getDeletedAt(): Date | null {
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
    this.deletedAt = new Date()
    this.updatedAt = new Date().toString()
  }

  public restore(): void {
    this.deletedAt = null
    this.updatedAt = new Date().toString()
  }

  public static create(id: string, name: string): Position {
    const now = new Date()
    return new Position(id, name, now.toString(), now.toString())
  }
}
