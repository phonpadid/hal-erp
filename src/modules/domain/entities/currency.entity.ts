export class CurrencyEntity {
  private id: string | null;
  private name: string;
  private code: string;
  private createdAt: string | null;
  private updatedAt: string | null;
  private deletedAt: string | null

  constructor(id: string | null = null, name: string, code: string, createdAt: string | null = null, updatedAt: string | null = null, deletedAt: string | null = null) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public getId(): string | null {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getCode(): string {
    return this.code;
  }

  public getCreatedAt(): string | null {
    return this.createdAt;
  }

  public getUpdatedAt(): string | null {
    return this.updatedAt;
  }
  public getDeleteddAt(): string | null {
    return this.updatedAt;
  }
  public updateDpm(name: string, code: string): void {
    this.name = name
    this.code = code
  }
  public isDeleted(): boolean {
    return this.deletedAt !== null
  }
  public delete(): void {
    this.deletedAt = new Date().toString()
    this.updatedAt = new Date().toString()
  }
  // เพิ่มเมธอดเพื่อตรวจสอบว่าวันที่ถูกต้องหรือไม่
  public hasValidDates(): boolean {
    return Boolean(this.createdAt && this.updatedAt);
  }
  public static create(name: string, code: string): CurrencyEntity {
    return new CurrencyEntity(null,name, code)
  }
}
