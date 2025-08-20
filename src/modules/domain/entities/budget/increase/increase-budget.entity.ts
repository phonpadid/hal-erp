import type { BudGetAccountsEntity } from "../budget-accounts.entities";
import type { UserEntity } from "../../user.entities";
import type { IncreaseBudgetFileEntity } from "./increase-budget-file.entity";
import type { IcraseDetailEntity } from "./increase-detail.entity";

export class IncreaseBudGetAccountsEntity {
  private id: string | null;
  private budget_account_id: number;
  private allocated_amount: number;
  private description: string | null;
  // private import_date: string;
  private file_name: string;
  private user_id: number | null;
  //map detail
  private increase_budget_details: IcraseDetailEntity[];

  private budget_account: BudGetAccountsEntity | null;
  private created_by: UserEntity | null;
  private increase_budget_files: IncreaseBudgetFileEntity[] | null;

  private created_at: string | null;
  private updated_at: string | null;

  constructor(
    id: string | null = null,
    budget_account_id: number,
    allocated_amount: number,
    description: string,
    // import_date: string,
    file_name: string,
    user_id: number | null = null,
    increase_budget_details: IcraseDetailEntity[] = [],

    budget_account: BudGetAccountsEntity | null = null,
    created_by: UserEntity | null = null,
    increase_budget_files: IncreaseBudgetFileEntity[] | null = null,

    created_at: string | null = null,
    updated_at: string | null = null,
  ) {
    this.id = id;
    this.budget_account_id = budget_account_id;
    this.allocated_amount = allocated_amount;
    this.description = description;
    // this.import_date = import_date;
    this.file_name = file_name;
    this.user_id = user_id;
    this.increase_budget_details = increase_budget_details;

    this.budget_account = budget_account;
    this.created_by = created_by;
    this.increase_budget_files = increase_budget_files;

    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  public getId(): string | null {
    return this.id;
  }

  public getBudgetAccountId(): number {
    return this.budget_account_id;
  }

  public getAllocatedAmount(): number {
    return this.allocated_amount;
  }

  public getDescription(): string | null {
    return this.description;
  }

  // public getImportdate(): string {
  //   return this.import_date;
  // }
  public getFileName(): string {
    return this.file_name;
  }

  public getUserId(): number | null {
    return this.user_id;
  }
  public getDetail(): IcraseDetailEntity[] | [] {
    return this.increase_budget_details;
  }
  public getBudgetAccount(): BudGetAccountsEntity | null {
    return this.budget_account;
  }
  public getCreateBy(): UserEntity | null {
    return this.created_by;
  }
  public getIncreaseFile(): IncreaseBudgetFileEntity[] | null {
    return this.increase_budget_files;
  }
  public getCreatedAt(): string | null {
    return this.created_at;
  }

  public getUpdatedAt(): string | null {
    return this.updated_at;
  }



  public updated(budget_account_id: number, description: string, file_name: string): void {
    // this.allocated_amount = allocated_amount;
    this.budget_account_id = budget_account_id;
    this.description = description;
    this.file_name = file_name;
  }

  public delete(): void {
    // this.deleted_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    // this.updated_at = this.deleted_at;
  }

  // ✅ Static create method from your Postman payload
  public static create(data: {
    budget_account_id: number;
    allocated_amount: number;
    description: string;
    // import_date: string;
    file_name: string;
    increase_budget_details: IcraseDetailEntity[];
    user_id: number;
  }): IncreaseBudGetAccountsEntity {
    return new IncreaseBudGetAccountsEntity(
      null, // or your ID generator
      data.budget_account_id,
      data.allocated_amount,
      data.description,
      data.file_name,
      // data.import_date,
      null,
      data.increase_budget_details,
      null,
      null,
    );
  }
}
