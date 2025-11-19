export class DepartmentRole {
  private id: string;
  private role_id: number;
  private department_id: number;
  private permissions: number[];
  private created_at: Date;
  private updated_at: Date;
  private deletedAt: Date | null;

  constructor(
    id: string,
    role_id: number,
    department_id: number,
    permissions: number[],
    created_at: Date | string,
    updated_at: Date | string,
    deletedAt: Date | string | null = null
  ) {
    this.id = id;
    this.role_id = role_id;
    this.department_id = department_id;
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

  // Getters
  public getId(): string {
    return this.id;
  }

  public getRoleId(): number {
    return this.role_id;
  }

  public getDepartmentId(): number {
    return this.department_id;
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

  // Update methods
  public updateRoleId(role_id: number): void {
    this.role_id = role_id;
    this.updated_at = new Date();
  }

  public updateDepartmentId(department_id: number): void {
    this.department_id = department_id;
    this.updated_at = new Date();
  }

  public updatePermissions(permissions: number[]): void {
    this.permissions = permissions;
    this.updated_at = new Date();
  }

  // Soft delete methods
  public delete(): void {
    this.deletedAt = new Date();
    this.updated_at = new Date();
  }

  public restore(): void {
    this.deletedAt = null;
    this.updated_at = new Date();
  }

  // Factory methods
  public static create(id: string, role_id: number, department_id: number, permissions: number[]): DepartmentRole {
    const now = new Date();
    return new DepartmentRole(id, role_id, department_id, permissions, now, now);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fromApiResponse(data: any): DepartmentRole {
    return new DepartmentRole(
      String(data.id),
      data.role_id,
      data.department_id,
      data.permissions || [],
      data.created_at,
      data.updated_at,
      data.deleted_at || null
    );
  }
}