export class Unit {
  private id: string
  private name: string
  private created_at: string
  private updated_at: string
  private deleted_at: Date | null

  constructor(
    id: string,
    name: string,
    created_at: string,
    updated_at: string,
    deleted_at: Date | null = null
  ) {
    this.id = id
    this.name = name
    this.created_at = created_at
    this.updated_at = updated_at
    this.deleted_at = deleted_at
  }

  public getId(): string {
    return this.id
  }

  public getName(): string {
    return this.name
  }

  public getCreatedAt(): string {
    return this.created_at
  }

  public getUpdatedAt(): string {
    return this.updated_at
  }

  public getDeletedAt(): Date | null {
    return this.deleted_at
  }

  public isDeleted(): boolean {
    return this.deleted_at !== null
  }

  public updateName(name: string): void {
    this.name = name
    this.updated_at = new Date().toString()
  }

  public delete(): void {
    this.deleted_at = new Date()
    this.updated_at = new Date().toString()
  }

  public restore(): void {
    this.deleted_at = null
    this.updated_at = new Date().toString()
  }

  public static create(id: string, name: string): Unit {
    const now = new Date()
    return new Unit(id, name, now.toString(), now.toString())
  }
}
