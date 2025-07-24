export class Bank {
  private id: string
  private name: string
  private short_name: string
  private logo: string | null
  private created_at: string
  private updated_at: string
  private deleted_at: Date | null

  constructor(
    id: string,
    name: string,
    short_name: string,
    logo: string | null,
    created_at: string,
    updated_at: string,
    deleted_at: Date | null = null
  ) {
    this.id = id
    this.name = name
    this.short_name = short_name
    this.logo = logo
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

  public getShortName(): string {
    return this.short_name
  }

  public getLogo(): string | null {
    return this.logo
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

  public updateShortName(short_name: string): void {
    this.short_name = short_name
    this.updated_at = new Date().toString()
  }

  public updateLogo(logo: string | null): void {
    this.logo = logo
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

  public static create(
    id: string,
    name: string,
    short_name: string,
    logo: string | null = null
  ): Bank {
    const now = new Date().toString()
    return new Bank(id, name, short_name, logo, now, now)
  }
}
