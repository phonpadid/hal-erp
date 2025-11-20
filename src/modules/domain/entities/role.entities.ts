export class Role {
  private id: string;
  private name: string;
  private display_name: string;
  private department_id: number;
  private department_name: string;
  private permissions: number[];
  private created_at: string | null;
  private updated_at: string | null;
  private deletedAt: string | null;

  constructor(
    id: string,
    name: string,
    display_name: string,
    department_id: number,
    department_name: string,
    permissions: number[],
    created_at: string | null = null,
    updated_at: string | null = null,
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.display_name = display_name;
    this.department_id = department_id;
    this.department_name = department_name;
    this.permissions = permissions;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deletedAt = deletedAt ? deletedAt : null;
  }



  public getFormattedCreatedAt(): string | null {
    return this.created_at;
  }

  public getFormattedUpdatedAt(): string | null {
    return this.updated_at;
  }

  public getFormattedDeletedAt(): string | null {
    return this.deletedAt ? this.deletedAt : null;
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

  public getCreatedAt(): string | null {
    return this.created_at;
  }

  public getUpdatedAt(): string | null {
    return this.updated_at;
  }

  public getDeletedAt(): string | null {
    return this.deletedAt;
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public updateName(name: string): void {
    this.name = name;
  }

  public updateDisplayName(display_name: string): void {
    this.display_name = display_name;
  }

  public delete(): void {
  }

  public restore(): void {
    this.deletedAt = null;;
  }

  public static create(id: string, name: string, display_name: string, department_id: number, department_name: string, permissions: number[]): Role {
    return new Role(id, name, display_name, department_id, department_name, permissions, null , null);
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
