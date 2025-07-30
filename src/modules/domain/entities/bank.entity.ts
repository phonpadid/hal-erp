import { formatDate } from "@/modules/shared/formatdate";

export class BankEntity {
  private id: string;
  private name: string;
  private shortName: string;
  private logo: string | null;
  private logoUrl: string | null;
  private createdAt: string;
  private updatedAt: string;
  private deletedAt: string | null;

  constructor(
    id: string,
    name: string,
    shortName: string,
    logo: string | null,
    logoUrl: string | null,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.shortName = shortName;
    this.logo = logo;
    this.logoUrl = logoUrl;
    this.createdAt = formatDate(createdAt);
    this.updatedAt = formatDate(updatedAt);
    this.deletedAt = deletedAt !== null ? formatDate(deletedAt) : null;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getShortName(): string {
    return this.shortName;
  }

  public getLogo(): string | null {
    return this.logo;
  }

  public getLogoUrl(): string | null {
    return this.logoUrl;
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

  public updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateShortName(shortName: string): void {
    this.shortName = shortName;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateLogo(logo: string | null): void {
    this.logo = logo;
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
  public static create(id: string, name: string, shortName: string, logo: string | null): BankEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new BankEntity(id, name, shortName, logo,null, now, now, null);
  }
}
