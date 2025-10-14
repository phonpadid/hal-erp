export class DepartmentEntity {
  private id: string;
  private name: string;
  private code: string;
  private department_head_id: number | string | null
  private type: 'in_the_office' | 'outside_the_office';
  private createdAt: string;
  private updatedAt: string;
  private deletedAt: string | null

  constructor(id: string, name: string, code: string, department_head_id: number | string | null, type: 'in_the_office' | 'outside_the_office', createdAt: string, updatedAt: string, deletedAt: string | null = null) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.department_head_id = department_head_id
    this.type = type;
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
  public getDepartmentUser() :number | string | null {
    return this.department_head_id
  }

  public getType(): 'in_the_office' | 'outside_the_office' {
    return this.type;
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
  public updateDpm(name: string, code: string,department_head_id:number |string| null,type: 'in_the_office' | 'outside_the_office'): void {
    this.name = name
    this.code = code
    this.department_head_id = department_head_id
    this.type = type
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
  public static create(id: string, name: string, code: string, type: 'in_the_office' | 'outside_the_office'): DepartmentEntity {
    const now = new Date().toString()
    return new DepartmentEntity(id, name, code, null, type, now, now)
  }
}
