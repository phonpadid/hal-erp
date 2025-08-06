import type { ApprovalWorkflowEntity } from "./approval-workflows.entity";
import type { DepartmentEntity } from "./departments/department.entity";
import type { UserEntity } from "./user.entities";

export class ApprovalWorkflowStepEntity {
  private id: string | null;
  private approval_workflow_id: string | null;
  private department_id: string | null;
  private step_name: string;
  private step_number: number;
  private user_id: number;
  private type: string;
  private requires_file: string;

  private approval_workflow: ApprovalWorkflowEntity | null;
  private user: UserEntity | null;
  private department: DepartmentEntity | null;
  private createdAt: string | null;
  private updatedAt: string | null;
  private deletedAt: string | null

  constructor(
    id: string | null = null,
    approval_workflow_id: string | null = null,
    department_id: string | null = null,
    step_name: string,
    step_number: number,
    user_id: number,
    type: string,
    requires_file: string,
    approval_workflow: ApprovalWorkflowEntity | null = null,
    user: UserEntity | null = null,
    department: DepartmentEntity | null = null,
    createdAt: string | null = null,
    updatedAt: string | null = null,
    deletedAt: string | null = null
  ) {
    this.id = id;
    this.approval_workflow_id = approval_workflow_id;
    this.department_id = department_id;

    this.step_name = step_name;
    this.step_number = step_number;
    this.user_id = user_id;
    this.type = type;
    this.requires_file = requires_file;
    this.approval_workflow = approval_workflow;
    this.department = department;
    this.user = user;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public getId(): string | null {
    return this.id;
  }

  public getApprovalWorkflowId(): string | null {
    return this.approval_workflow_id;
  }

  public getDepartemntId(): string | null {
    return this.department_id;
  }
  public getStepName(): string {
    return this.step_name;
  }
  public getStepNumber(): number {
    return this.step_number;
  }
  public getUserId(): number {
    return this.user_id;
  }
  public getType(): string {
    return this.type;
  }
  public getRequiredFile(): string {
    return this.requires_file;
  }
  public getApprovalWorkflow(): ApprovalWorkflowEntity | null {
    return this.approval_workflow;
  }
  public getDepartment(): DepartmentEntity | null {
    return this.department;
  }
  public getUser(): UserEntity | null {
    return this.user;
  }

  public getCreatedAt(): string | null {
    return this.createdAt;
  }

  public getUpdatedAt(): string | null {
    return this.updatedAt;
  }
  public getDeleteddAt(): string | null {
    return this.updatedAt;
  }
  public update(
    approval_workflow_id: string,
    department_id: string,
    step_name: string,
    step_number: number,
    user_id: number,
    type: string,
    requires_file: string,
  ): void {
    this.approval_workflow_id = approval_workflow_id
    this.department_id = department_id
    this.step_name = step_name
    this.step_number = step_number
    this.user_id = user_id
    this.type = type
    this.requires_file = requires_file
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
  public static create(
    id: number,
    approval_workflow_id: string,
    department_id: string,
    step_name: string,
    step_number: number,
    user_id: number,
    type: string,
    requires_file: string,
  ): ApprovalWorkflowStepEntity {
    return new ApprovalWorkflowStepEntity(
      id.toString(),
      approval_workflow_id,
      department_id,
      step_name,
      step_number,
      user_id,
      type,
      requires_file,
    )
  }
}
