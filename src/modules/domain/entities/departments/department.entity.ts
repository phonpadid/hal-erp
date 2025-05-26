export class DepartmentEntity {
  private id: string;
  private name: string;
  private code: string;
  private createdAt: string;
  private updatedAt: string;
  private deletedAt: string | null

  constructor(id: string, name: string, code: string, createdAt: string, updatedAt: string, deletedAt: string | null = null) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getCode(): string {
    return this.code;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }

  public getUpdatedAt(): string {
    return this.updatedAt;
  }
  public getDeleteddAt(): string {
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
  public static create(id: string, name: string, code: string): DepartmentEntity {
    const now = new Date().toString()
    return new DepartmentEntity(id, name, code, now, now)
  }
}
