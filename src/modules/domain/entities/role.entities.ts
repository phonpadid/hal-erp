export class Role {
  private id: string;
  private name: string;
  private display_name: string;
  private department_id: number;
  private department_name: string;
  private permissions: number[];
  private created_at: Date;
  private updated_at: Date;
  private deletedAt: Date | null;

  constructor(
    id: string,
    name: string,
    display_name: string,
    department_id: number,
    department_name: string,
    permissions: number[],
    created_at: Date | string,
    updated_at: Date | string,
    deletedAt: Date | string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.display_name = display_name;
    this.department_id = department_id;
    this.department_name = department_name;
    this.permissions = permissions;
    this.created_at = this.parseDate(created_at);
    this.updated_at = this.parseDate(updated_at);
    this.deletedAt = deletedAt ? this.parseDate(deletedAt) : null;
  }

  private parseDate(date: Date | string): Date {
    if (date instanceof Date) return date;

    try {
      // ถ้าเป็นรูปแบบ "DD-MM-YYYY HH:MM:SS"
      if (typeof date === "string" && date.match(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/)) {
        const [datePart, timePart] = date.split(" ");
        const [day, month, year] = datePart.split("-").map(Number);
        const [hours, minutes, seconds] = timePart.split(":").map(Number);

        // เดือนใน JS Date เริ่มจาก 0
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }

      // กรณีอื่นๆ ให้ใช้ constructor ปกติ
      return new Date(date);
    } catch (error) {
      console.error(`Error parsing date: ${date}`, error);
      return new Date();
    }
  }

  public getFormattedCreatedAt(): string {
    return this.formatDate(this.created_at);
  }

  public getFormattedUpdatedAt(): string {
    return this.formatDate(this.updated_at);
  }

  public getFormattedDeletedAt(): string | null {
    return this.deletedAt ? this.formatDate(this.deletedAt) : null;
  }

  private formatDate(date: Date): string {
    try {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error(`Error formatting date: ${date}`, error);
      return "";
    }
  }

  // เมธอดอื่น ๆ คงเดิม
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDisplayname(): string {
    return this.display_name;
  }
  public getDepartmentId(): number {
    return this.department_id;
  }
  public getDepartmentName(): string {
    return this.department_name;
  }
  public getPermissions(): number[] {
    return this.permissions;
  }

  public getCreatedAt(): Date {
    return this.created_at;
  }

  public getUpdatedAt(): Date {
    return this.updated_at;
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public updateName(name: string): void {
    this.name = name;
    this.updated_at = new Date();
  }

  public updateDisplayName(display_name: string): void {
    this.display_name = display_name;
    this.updated_at = new Date();
  }

  public delete(): void {
    this.deletedAt = new Date();
    this.updated_at = new Date();
  }

  public restore(): void {
    this.deletedAt = null;
    this.updated_at = new Date();
  }

  public static create(id: string, name: string, display_name: string, department_id: number, department_name: string, permissions: number[]): Role {
    const now = new Date();
    return new Role(id, name, display_name, department_id, department_name, permissions, now, now);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fromApiResponse(data: any): Role {
    return new Role(
      String(data.id),
      data.name,
      data.display_name || data.name,
      data.department_id,
      data.permissions,
      data.created_at,
      data.updated_at,
      data.deleted_at || null
    );
  }
}
