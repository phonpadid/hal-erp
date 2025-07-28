import type { UserAPIResponse, Role } from "@/modules/interfaces/user.interface";
import { formatDate } from "@/modules/shared/formatdate";

export class UserEntity {
  private id: string;
  private username: string;
  private email: string;
  private password?: string;
  private tel?: string;
  private roleIds: number[];
  private permissionIds: number[];
  private roles: Role[];
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;

  constructor(
    id: string,
    username: string,
    email: string,
    roleIds: number[],
    roles: Role[],
    permissionIds: number[],
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null,
    password?: string,
    tel?: string
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.roleIds = roleIds;
    this.roles = roles;
    this.permissionIds = permissionIds;
    this.password = password;
    this.tel = tel;
    this.created_at = formatDate(created_at);
    this.updated_at = formatDate(updated_at);
    this.deleted_at = deleted_at === null ? null : formatDate(deleted_at);
  }

  public getId(): string {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): string {
    return this.email;
  }
  public getRoleIds(): number[] {
    return this.roleIds;
  }

  public getPermissionIds(): number[] {
    return this.permissionIds;
  }

  public getRoles(): Role[] {
    return this.roles;
  }
  public getPassword(): string | undefined {
    return this.password;
  }

  public getTel(): string | undefined {
    return this.tel;
  }

  public getCreatedAt(): string {
    return this.created_at;
  }

  public getUpdatedAt(): string {
    return this.updated_at;
  }

  public getDeletedAt(): string | null {
    return this.deleted_at;
  }

  public isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  public updateUsername(username: string): void {
    this.username = username;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateEmail(email: string): void {
    this.email = email;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }
  public updateRoleIds(roleIds: number[]): void {
    this.roleIds = roleIds;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updatePermissionIds(permissionIds: number[]): void {
    this.permissionIds = permissionIds;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updatePassword(password: string): void {
    this.password = password;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateTel(tel: string | undefined): void {
    this.tel = tel;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public delete(): void {
    this.deleted_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.updated_at = this.deleted_at;
  }

  public restore(): void {
    this.deleted_at = null;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public static create(
    id: string,
    username: string,
    email: string,
    password: string,
    roleIds: number[],
    permissionIds: number[],
    tel?: string
  ): UserEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new UserEntity(
      id,
      username,
      email,
      roleIds,
      [],
      permissionIds,
      now,
      now,
      null,
      password,
      tel
    );
  }
  public static fromAPI(data: UserAPIResponse): UserEntity {
    return new UserEntity(
      data.id.toString(),
      data.username,
      data.email,
      data.roles.map((role) => role.id),
      data.roles,
      data.permissions.map((perm) => perm.id),
      data.created_at,
      data.updated_at,
      null,
      undefined,
      data.tel
    );
  }
}
