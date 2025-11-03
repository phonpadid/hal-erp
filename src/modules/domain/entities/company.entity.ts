import { formatDate } from "@/modules/shared/formatdate"

export class CompanyEntity {
  private id: string
  private name: string
  private logo: string | null
  private tel: string
  private email: string
  private address: string
  private createdAt: string
  private updatedAt: string
  private deletedAt: string | null

  constructor(
    id: string,
    name: string,
    logo: string | null,
    tel: string,
    email: string,
    address: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null
  ) {
    this.id = id
    this.name = name
    this.logo = logo
    this.tel = tel
    this.email = email
    this.address = address
    this.createdAt = formatDate(createdAt)
    this.updatedAt = formatDate(updatedAt)
    this.deletedAt = deletedAt !== null ? formatDate(deletedAt) : null;
  }

  public getId(): string {
    return this.id
  }

  public getName(): string {
    return this.name
  }

  public getLogo(): string | null {
    return this.logo
  }

  public getTel(): string {
    return this.tel
  }

  public getEmail(): string {
    return this.email
  }

  public getAddress(): string {
    return this.address
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
    this.updatedAt = new Date().toISOString().replace("T", "").substring(0, 19);
  }

  public updateLogo(logo: string | null): void {
    this.logo = logo
    this.updatedAt = new Date().toISOString().replace("T", "").substring(0, 19);
  }

  public updateTel(tel: string): void {
    this.tel = tel
    this.updatedAt = new Date().toISOString().replace("T", "").substring(0, 19);
  }

  public updateEmail(email: string): void {
    this.email = email
    this.updatedAt = new Date().toISOString().replace("T", "").substring(0, 19);
  }

  public updateAddress(address: string): void {
    this.address = address
    this.updatedAt = new Date().toISOString().replace("T", "").substring(0, 19);
  }

  public delete(): void {
    this.deletedAt = new Date().toISOString().replace("T", "").substring(0, 19);
    this.updatedAt = this.deletedAt;
  }

  public restore(): void {
    this.deletedAt = null
    this.updatedAt = new Date().toISOString().replace("T", "").substring(0, 19);
  }

  public static create(
    id: string,
    name: string,
    logo: string | null,
    tel: string,
    email: string,
    address: string
  ): CompanyEntity {
    const now = new Date().toISOString().replace("T", "").substring(0, 19);
    return new CompanyEntity(id, name, logo, tel, email, address, now, now, null);
  }

  // Static method to create entity from API response
  public static fromAPI(data: any): CompanyEntity {
    return new CompanyEntity(
      data.id?.toString() ?? "",
      data.name ?? "",
      data.logo ?? null,
      data.tel ?? "",
      data.email ?? "",
      data.address ?? "",
      data.created_at ?? "",
      data.updated_at ?? "",
      data.deleted_at ?? null
    );
  }
}