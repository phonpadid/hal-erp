import type { Position } from "../position.entities"
import type { UserEntity } from "../user.entities"
import type { DepartmentEntity } from "./department.entity"

export class DepartmentUserEntity {
  private id: string | null
  private position_id: string
  private signature_file: string | File

  private department: DepartmentEntity | null
  private position: Position | null
  private user: UserEntity | null

  private createdAt: Date | null
  private updatedAt: Date | null
  private deletedAt: Date | null

  constructor(
    id: string | null = null,
    position_id: string,
    signature_file: string | File,
    department: DepartmentEntity | null = null,
    position: Position | null = null,
    user: UserEntity,
    createdAt: Date | null = null,
    updatedAt: Date | null = null,
    deletedAt: Date | null = null
  ) {
    this.id = id
    this.position_id = position_id
    this.signature_file = signature_file
    this.department = department
    this.position = position
    this.user = user
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
  public getSignature_file(): string | File{
    return this.signature_file
  }
  public getDepartment(): DepartmentEntity | null{
    return this.department
  }
  public getPostion(): Position | null{
    return this.position
  }
  public getUser(): UserEntity | null{
    return this.user
  }
  public getCreatedAt(): Date | null {
    return this.createdAt
  }

  public getUpdatedAt(): Date | null{
    return this.updatedAt
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null
  }

  public updateDpmUser( position_id: string, user: UserEntity, signature_file: string | File): void {
    // this.department_id = department_id
    this.user = user
    this.position_id = position_id
    this.signature_file = signature_file
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
    signature_file: string | File
  ): DepartmentUserEntity {
    return new DepartmentUserEntity(
      null,                   // id
      position_id,            // position_id
      signature_file,         // signature_file
      null,                   // department
      null,                   // position
      user,                   // user
    );
  }

}
