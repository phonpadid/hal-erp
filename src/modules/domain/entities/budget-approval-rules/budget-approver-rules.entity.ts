import type { DepartmentEntity } from "../departments/department.entity"
import type { UserEntity } from "../user.entities"

export class BudgetApprovalRuleEntity {
  private id: string | null
  private department_id: string
  private approver_id: string
  private min_amount: string
  private max_amount: string
  private department: DepartmentEntity | null
  private approver: UserEntity | null
  private createdAt: string | null
  private updatedAt: string | null
  private deletedAt: string | null

  constructor(
    id: string | null = null,
    department_id: string,
    approver_id: string,
    min_amount: string,
    max_amount: string,
    department: DepartmentEntity | null = null,
    approver: UserEntity | null = null,
    createdAt: string | null = null,
    updatedAt: string | null = null,
    deletedAt: string | null = null
  ) {
    this.id = id
    this.department_id = department_id
    this.approver_id = approver_id
    this.min_amount = min_amount
    this.max_amount = max_amount

    this.department = department
    this.approver = approver

    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.deletedAt = deletedAt
  }

  public getId(): string | null {
    return this.id
  }

  public getDepartment_id(): string {
    return this.department_id
  }
  public getApprover_id(): string {
    return this.approver_id
  }
  public getMin_amount(): string {
    return this.min_amount
  }
  public getMax_amount(): string {
    return this.max_amount
  }
  public getDepartment(): DepartmentEntity | null {
    return this.department
  }
  public getUser(): UserEntity | null {
    return this.approver
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

  public updated(department_id: string, approver_id: string, min_amount: string, max_amount: string): void {
    this.department_id = department_id
    this.approver_id = approver_id
    this.min_amount = min_amount
    this.max_amount = max_amount
  }

  public delete(): void {
    this.deletedAt = new Date().toString()
    this.updatedAt = new Date().toString()
  }

  public static create(department_id: string, approver_id: string, max_amount: string, min_amount: string): BudgetApprovalRuleEntity {
    return new BudgetApprovalRuleEntity(null, department_id, approver_id, max_amount, min_amount)
  }
}
