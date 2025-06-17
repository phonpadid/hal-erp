import type { ApprovalWorkflowEntity } from "./approval-workflows.entity";
import type { DepartmentEntity } from "./departments/department.entity";

export class ApprovalWorkflowStepEntity {
  private id: string | null;
  private approval_workflow_id: string | null;
  private department_id: string | null;
  private step_name: string;
  private step_number: number;

  private approval_workflow: ApprovalWorkflowEntity | null;
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

    approval_workflow: ApprovalWorkflowEntity | null = null,
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
    this.approval_workflow = approval_workflow;
    this.department = department;
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
  public getApprovalWorkflow(): ApprovalWorkflowEntity | null {
    return this.approval_workflow;
  }
  public getDepartment(): DepartmentEntity | null {
    return this.department;
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
    step_number: number
  ): void {
    this.approval_workflow_id = approval_workflow_id
    this.department_id = department_id
    this.step_name = step_name
    this.step_number = step_number
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
    approval_workflow_id: string,
    department_id: string,
    step_name: string,
    step_number: number
  ): ApprovalWorkflowStepEntity {
    return new ApprovalWorkflowStepEntity(
      null,
      approval_workflow_id,
      department_id,
      step_name,
      step_number
    )
  }
}
