import { formatDate } from "@/modules/shared/formatdate";

export class DocumentTypeEntity {
  private id: string;
  private name: string;
  private code: string;
  private categoryId: number | null;
  private createdAt: string;
  private updatedAt: string;
  private deletedAt: string | null;

  constructor(
    id: string,
    name: string,
    code: string,
    categoryId: number | null = null,
    createdAt: string = "",
    updatedAt: string = "",
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.categoryId = categoryId;
    this.createdAt = formatDate(createdAt);
    this.updatedAt = formatDate(updatedAt);
    this.deletedAt = deletedAt !== null ? formatDate(deletedAt) : null;
  }

  public getId(): string {
    return this.id;
  }

  public getname(): string {
    return this.name;
  }

  public getcode(): string {
    return this.code;
  }

  public getCategoryId(): number | null {
    return this.categoryId;
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

  public updatename(name: string): void {
    this.name = name;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updatecode(code: string): void {
    this.code = code;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateCategoryId(categoryId: number | null): void {
    this.categoryId = categoryId;
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

  public static create(id: string, name: string, code: string, categoryId: number | null = null): DocumentTypeEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new DocumentTypeEntity(id, name, code, categoryId, now, now, null);
  }
}
