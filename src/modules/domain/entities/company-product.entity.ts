import { formatDate } from "@/modules/shared/formatdate";

export class CompanyProductEntity {
  private id: string;
  private companyId: string;
  private productId: string;
  private productName: string;
  private companyName: string;
  private status: string;
  private createdAt: string;
  private updatedAt: string;
  private deletedAt: string | null;

  constructor(
    id: string,
    companyId: string,
    productId: string,
    productName: string,
    companyName: string,
    status: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.companyId = companyId;
    this.productId = productId;
    this.productName = productName;
    this.companyName = companyName;
    this.status = status;
    this.createdAt = formatDate(createdAt);
    this.updatedAt = formatDate(updatedAt);
    this.deletedAt = deletedAt !== null ? formatDate(deletedAt) : null;
  }

  public getId(): string {
    return this.id;
  }

  public getCompanyId(): string {
    return this.companyId;
  }

  public getProductId(): string {
    return this.productId;
  }

  public getProductName(): string {
    return this.productName;
  }

  public getCompanyName(): string {
    return this.companyName;
  }

  public getStatus(): string {
    return this.status;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }

  public getUpdatedAt(): string {
    return this.updatedAt;
  }

  public getDeletedAt(): string | null {
    return this.deletedAt;
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public updateStatus(status: string): void {
    this.status = status;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public delete(): void {
    this.deletedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.updatedAt = this.deletedAt;
  }

  public restore(): void {
    this.deletedAt = null;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public static create(id: string, companyId: string, productId: string, status: string = "active"): CompanyProductEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new CompanyProductEntity(id, companyId, productId, "", "", status, now, now, null);
  }
}
