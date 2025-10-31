import { formatDate } from "@/modules/shared/formatdate"

export class ProductEntity {
  private id: string
  private name: string
  private description: string
  private product_type_id: number
  private status: string
  private createdAt: string
  private updatedAt: string
  private deletedAt: string | null

  constructor(
    id: string,
    name: string,
    description: string,
    product_type_id: number,
    status: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.product_type_id = product_type_id
    this.status = status

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

  public getDescription(): string {
    return this.description
  }

  public getProductTypeId(): number {
    return this.product_type_id
  }

  public getStatus(): string {
    return this.status
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

  public updateDescription(description: string): void {
    this.description = description
    this.updatedAt = new Date().toISOString().replace("T", "").substring(0, 19);
  }

  public updateProductTypeId(product_type_id: number): void {
    this.product_type_id = product_type_id
    this.updatedAt = new Date().toISOString().replace("T", "").substring(0, 19);
  }

  public updateStatus(status: string): void {
    this.status = status
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

  public static create(id: string, name: string, description: string, product_type_id: number, status: string = "active"): ProductEntity {
    const now = new Date().toISOString().replace("T", "").substring(0, 19);
    return new ProductEntity(id, name, description, product_type_id, status, now, now, null);
  }
}