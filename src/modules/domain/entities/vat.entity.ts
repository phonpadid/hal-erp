import { formatDate } from "@/modules/shared/formatdate"

export class VatEntity {
  private id: string
  private amount: number
  private createdAt: string
  private updatedAt: string
  private deletedAt: string | null

  constructor(
    id: string,
    amount: number,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null
  ) {
    this.id = id
    this.amount = amount
    this.createdAt = formatDate(createdAt)
    this.updatedAt = formatDate(updatedAt)
    this.deletedAt = deletedAt !== null ? formatDate(deletedAt) : null;
  }

  public getId(): string {
    return this.id
  }

  public getAmount(): number {
    return this.amount
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

  public updateAmount(amount: number): void {
    this.amount = amount
    this.updatedAt = new Date().toISOString().replace("T", "").substring(0, 19);
  }
}
