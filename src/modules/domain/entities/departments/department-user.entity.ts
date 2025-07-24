import type { Position } from "../position.entity"
import type { UserEntity } from "../user.entities"
import type { DepartmentEntity } from "./department.entity"
import type { Role } from "../role.entities"
import type { Permission } from "../permission.entities"

export class DepartmentUserEntity {
  private id: string | null
  private position_id: string
  private signature_file: string | File
  private signature_file_url: string | null
  private department_id: string
  private permissionIds: number[]
  private roleIds: number[]

  private department: DepartmentEntity | null
  private position: Position | null
  private user: UserEntity | null
  private roles: Role | null
  private permissions: Permission | null

  private createdAt: Date | null
  private updatedAt: Date | null
  private deletedAt: Date | null

  constructor(
    id: string | null = null,
    position_id: string,
    signature_file: string | File,
    signature_file_url: string | null = null,
    department_id: string,
    permissionIds: number[],
    roleIds: number[],
    department: DepartmentEntity | null = null,
    position: Position | null = null,
    user: UserEntity,
    roles: Role | null = null,
    permissions: Permission | null = null,
    createdAt: Date | null = null,
    updatedAt: Date | null = null,
    deletedAt: Date | null = null
  ) {
    this.id = id
    this.position_id = position_id
    this.signature_file = signature_file
    this.signature_file_url = signature_file_url
    this.department_id = department_id
    this.permissionIds = permissionIds
    this.roleIds = roleIds
    this.department = department
    this.position = position
    this.user = user
    this.roles = roles
    this.permissions = permissions
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.deletedAt = deletedAt
  }

  public getId(): string | null {
    return this.id
  }
  public getPosition_id(): string {
    return this.position_id
  }
  public getSignature_file(): string | File {
    return this.signature_file
  }
  public getSignature_file_url(): string | null {
    return this.signature_file_url
  }
  public getDepartmentId(): string {
    return this.department_id
  }
  public getPermissionIds(): number[] {
    return this.permissionIds
  }
  public getRoleIds(): number[] {
    return this.roleIds
  }
  public getDepartment(): DepartmentEntity | null {
    return this.department
  }
  public getPostion(): Position | null {
    return this.position
  }
  public getUser(): UserEntity | null {
    return this.user
  }
  public getRoles(): Role | null {
    return this.roles
  }
  public getPermissions(): Permission | null {
    return this.permissions
  }
  public getCreatedAt(): Date | null {
    return this.createdAt
  }

  public getUpdatedAt(): Date | null {
    return this.updatedAt
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null
  }

  public updateDpmUser(
    position_id: string,
    user: UserEntity,
    signature_file: string | File,
    department_id: string,
    permissionIds: number[],
    roleIds: number[]
  ): void {
    // this.department_id = department_id
    this.user = user
    this.position_id = position_id
    this.signature_file = signature_file
    this.department_id = department_id
    this.permissionIds = permissionIds
    this.roleIds = roleIds
    this.updatedAt = new Date()
  }

  public delete(): void {
    this.deletedAt = new Date()
    this.updatedAt = new Date()
  }

  public restore(): void {
    this.deletedAt = null
    this.updatedAt = new Date()
  }

  public static create(
    position_id: string,
    user: UserEntity,
    signature_file: string | File,
    department_id: string,
    permissionIds: number[],
    roleIds: number[]
  ): DepartmentUserEntity {
    return new DepartmentUserEntity(
      null,                   // id
      position_id,            // position_id
      signature_file,         // signature_file
      '',
      department_id,
      permissionIds,
      roleIds,
      null,                   // department
      null,                   // position
      user,                   // user
    );
  }

}
