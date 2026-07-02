import { formatDate } from "@/modules/shared/formatdate";

export class CompanyVendorEntity {
  private id: string;
  private companyId: string;
  private vendorId: string;
  private vendorName: string;
  private companyName: string;
  private status: string;
  private creditTermDays: number;
  private creditLimit: number;
  private paymentTerm: string | null;
  private createdAt: string;
  private updatedAt: string;
  private deletedAt: string | null;

  constructor(
    id: string,
    companyId: string,
    vendorId: string,
    vendorName: string,
    companyName: string,
    status: string,
    creditTermDays: number,
    creditLimit: number,
    paymentTerm: string | null,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.companyId = companyId;
    this.vendorId = vendorId;
    this.vendorName = vendorName;
    this.companyName = companyName;
    this.status = status;
    this.creditTermDays = creditTermDays;
    this.creditLimit = creditLimit;
    this.paymentTerm = paymentTerm;
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

  public getVendorId(): string {
    return this.vendorId;
  }

  public getVendorName(): string {
    return this.vendorName;
  }

  public getCompanyName(): string {
    return this.companyName;
  }

  public getStatus(): string {
    return this.status;
  }

  public getCreditTermDays(): number {
    return this.creditTermDays;
  }

  public getCreditLimit(): number {
    return this.creditLimit;
  }

  public getPaymentTerm(): string | null {
    return this.paymentTerm;
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

  public static create(
    id: string,
    companyId: string,
    vendorId: string,
    status: string = "active",
    creditTermDays: number = 0,
    creditLimit: number = 0,
    paymentTerm: string | null = null
  ): CompanyVendorEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new CompanyVendorEntity(id, companyId, vendorId, "", "", status, creditTermDays, creditLimit, paymentTerm, now, now, null);
  }
}
