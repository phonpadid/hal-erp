import { formatDate } from "@/modules/shared/formatdate";
import type { DepartmentEntity } from "../departments/department.entity";
import type { UserEntity } from "../user.entities";

export class BudgetApprovalRuleEntity {
  private id: string | null;
  private department_id: string;
  private approver_id: string;
  private min_amount: string;
  private max_amount: string;
  private department: DepartmentEntity | null;
  private approver: UserEntity | null;
  private created_at: string | null;
  private updated_at: string | null;
  private deleted_at: string | null;

  constructor(
    id: string | null = null,
    department_id: string,
    approver_id: string,
    min_amount: string,
    max_amount: string,
    department: DepartmentEntity | null = null,
    approver: UserEntity | null = null,
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null
  ) {
    this.id = id;
    this.department_id = department_id;
    this.approver_id = approver_id;
    this.min_amount = min_amount;
    this.max_amount = max_amount;

    this.department = department;
    this.approver = approver;

    this.created_at = formatDate(created_at);
    this.updated_at = formatDate(updated_at);
    this.deleted_at = formatDate(deleted_at ?? undefined);
  }

  public getId(): string | null {
    return this.id;
  }

  public getDepartment_id(): string {
    return this.department_id;
  }
  public getApprover_id(): string {
    return this.approver_id;
  }
  public getMin_amount(): string {
    return this.min_amount;
  }
  public getMax_amount(): string {
    return this.max_amount;
  }
  public getDepartment(): DepartmentEntity | null {
    return this.department;
  }
  public getUser(): UserEntity | null {
    return this.approver;
  }

  public getCreatedAt(): string | null {
    return this.created_at;
  }

  public getUpdatedAt(): string | null {
    return this.updated_at;
  }

  public getDeletedAt(): string | null {
    return this.deleted_at;
  }

  public isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  public updated(
    department_id: string,
    approver_id: string,
    min_amount: string,
    max_amount: string
  ): void {
    this.department_id = department_id;
    this.approver_id = approver_id;
    this.min_amount = min_amount;
    this.max_amount = max_amount;
  }

  public delete(): void {
    this.deleted_at = new Date().toString();
    this.updated_at = new Date().toString();
  }

  public static create(
    department_id: string,
    approver_id: string,
    max_amount: string,
    min_amount: string
  ): BudgetApprovalRuleEntity {
    return new BudgetApprovalRuleEntity(
      null,
      department_id,
      approver_id,
      max_amount,
      min_amount,
      null,
      null,
      new Date().toISOString(),
      new Date().toISOString(),
      null
    );
  }
}
