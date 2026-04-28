import { formatDate } from "@/modules/shared/formatdate";

export class DocumentCategoryEntity {
  private id: string;
  private name: string;
  private code: string;
  private createdAt: string;
  private updatedAt: string;
  private deletedAt: string | null;

  constructor(
    id: string,
    name: string,
    code: string = "",
    createdAt: string = "",
    updatedAt: string = "",
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.createdAt = formatDate(createdAt);
    this.updatedAt = formatDate(updatedAt);
    this.deletedAt = deletedAt ? formatDate(deletedAt) : null;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getCode(): string {
    return this.code;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }

  getUpdatedAt(): string {
    return this.updatedAt;
  }

  getDeletedAt(): string | null {
    return this.deletedAt;
  }

  // Business methods
  delete(): void {
    if (this.isDeleted()) {
      throw new Error("Document category is already deleted");
    }
    this.deletedAt = formatDate(new Date().toISOString());
  }

  restore(): void {
    if (!this.isDeleted()) {
      throw new Error("Document category is not deleted");
    }
    this.deletedAt = null;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
