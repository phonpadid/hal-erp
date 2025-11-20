import { formatDate } from "@/modules/shared/formatdate"
import type { UnitEntity } from "./unit.entity"

export class ProductEntity {
  private id: string
  private name: string
  private description: string
  private product_type_id: number
  private unit_id: string | null
  private unit: UnitEntity | null
  private status: string
  private createdAt: string
  private updatedAt: string
  private deletedAt: string | null

  constructor(
    id: string,
    name: string,
    description: string,
    product_type_id: number,
    unit_id: string | null,
    unit: UnitEntity | null = null,
    status: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.product_type_id = product_type_id
    this.unit_id = unit_id
    this.unit = unit
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

  public getUnitId(): string | null {
    return this.unit_id
  }
  public getUnit(): UnitEntity | null {
    return this.unit
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

  public updateUnitId(unit_id: string | null): void {
    this.unit_id = unit_id
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

  public static create(id: string, name: string, description: string, product_type_id: number, unit_id: string | null, status: string = "active"): ProductEntity {
    const now = new Date().toISOString().replace("T", "").substring(0, 19);
    return new ProductEntity(id, name, description, product_type_id, unit_id, null, status, now, now, null);
  }
}
