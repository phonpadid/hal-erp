import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";

export class BudGetAccountsEntity {
  private id: string;
  private code: string;
  private name: string;
  private fiscal_year?: number | string;
  private allocated_amount?: string | number;
  private department_id?: string | number;
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;
  private department?: DepartmentApiModel;

  constructor(
    id: string,
    code: string,
    name: string,
    fiscal_year: string | undefined | number,
    allocated_amount: string | undefined | number,
    department_id: string | undefined | number,
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null,
    department?: DepartmentApiModel
  ) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.fiscal_year = fiscal_year;
    this.allocated_amount = allocated_amount;
    this.department_id = department_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
    this.department = department;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getCode(): string {
    return this.code;
  }

  public getFiscalYear(): string | number | undefined {
    return this.fiscal_year;
  }
  public getAllocatedAmount(): string | number | undefined {
    return this.allocated_amount;
  }
  public getDepartmentId(): string | number | undefined {
    return this.department_id;
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
  public getDepartment(): DepartmentApiModel | undefined {
    return this.department;
  }

  public updateName(name: string): void {
    this.name = name;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateCode(code: string): void {
    this.code = code;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateFiscalYear(fiscal_year: string): void {
    this.fiscal_year = fiscal_year;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateAllocateAmount(allocated_amount: string | undefined): void {
    this.allocated_amount = allocated_amount;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public delete(): void {
    this.deleted_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.updated_at = this.deleted_at;
  }
  public setDepartment(department: DepartmentApiModel): void {
    this.department = department;
  }

  public static create(
    id: string,
    name: string,
    code: string,
    fiscal_year: string | undefined,
    allocated_amount: string | undefined,
    department_id: string | undefined
  ): BudGetAccountsEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new BudGetAccountsEntity(
      id,
      name,
      code,
      fiscal_year,
      allocated_amount,
      department_id,
      now,
      now,
      null
    );
  }
}
