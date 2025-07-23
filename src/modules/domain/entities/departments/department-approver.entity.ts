import type { UserEntity } from "../user.entities"
import type { DepartmentEntity } from "./department.entity"

export class DepartmentApproverEntity {
  private id: string | null
  private user_id: string
  private user: UserEntity | null
  private department: DepartmentEntity | null
  private createdAt: string | null
  private updatedAt: string | null
  private deletedAt: string | null

  constructor(
    id: string | null = null,
    user_id: string,
    user: UserEntity | null = null,
    department: DepartmentEntity | null = null,
    createdAt: string | null = null,
    updatedAt: string | null = null,
    deletedAt: string | null = null
  ) {
    this.id = id
    this.user_id = user_id
    this.user = user
    this.department = department
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.deletedAt = deletedAt
  }

  public getId(): string | null {
    return this.id
  }

  public getUser_id(): string {
    return this.user_id
  }
  public getUser(): UserEntity | null {
    return this.user
  }
  public getDepartment(): DepartmentEntity | null {
    return this.department
  }

  public getCreatedAt(): string | null {
    return this.createdAt
  }

  public getUpdatedAt(): string | null {
    return this.updatedAt
  }

  public getDeletedAt(): string | null {
    return this.deletedAt
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null
  }

  public updated(user_id: string): void {
    this.user_id = user_id
  }

  public delete(): void {
    this.deletedAt = new Date().toString()
  }

  public restore(): void {
    this.deletedAt = null
  }

  public static create(user_id: string): DepartmentApproverEntity {
    return new DepartmentApproverEntity(null, user_id, null, null)
  }
}
