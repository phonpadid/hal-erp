import type { IncreaseBudGetAccountsEntity } from "./increase-budget.entity";
import type { BudGetItemEntity } from "../budget-items.entities";

export class IcraseDetailEntity {
  private id: string;
  private increase_budget_id: number | null;
  private budget_item_id: number;
  private allocated_amount: number;

  private increase_budget: IncreaseBudGetAccountsEntity | null;
  private budget_item: BudGetItemEntity | null;

  private created_at: string | null;
  private updated_at: string | null;
  private deleted_at: string | null;

  constructor(
    id: string,
    increase_budget_id: number | null = null,
    budget_item_id: number,
    allocated_amount: number,

    increase_budget: IncreaseBudGetAccountsEntity | null = null,
    budget_item: BudGetItemEntity | null = null,

    created_at: string | null = null,
    updated_at: string | null = null,
    deleted_at: string | null = null,
  ) {
    this.id = id;
    this.increase_budget_id = increase_budget_id;
    this.budget_item_id = budget_item_id;
    this.allocated_amount = allocated_amount;

    this.increase_budget = increase_budget;
    this.budget_item = budget_item;

    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  public getId(): string {
    return this.id;
  }

  public getIncreaseBudgetId(): number | null {
    return this.increase_budget_id;
  }
  public getBudGetItemId(): number {
    return this.budget_item_id;
  }

  public getAllocatedAmount(): number {
    return this.allocated_amount;
  }

  public getIncreaseBudget(): IncreaseBudGetAccountsEntity | null {
    return this.increase_budget;
  }

  public getBudgetItem(): BudGetItemEntity | null {
    return this.budget_item;
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

  public updated(budget_item_id: number, allocated_amount: number): void {
    this.budget_item_id = budget_item_id;
    this.allocated_amount = allocated_amount;
  }

  public delete(): void {
    this.deleted_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.updated_at = this.deleted_at;
  }
  public static create(
    id: string,
    budget_item_id: number,
    allocated_amount: number,
  ): IcraseDetailEntity {
    return new IcraseDetailEntity(
      id,
      null,
      budget_item_id,
      allocated_amount,
      null,
      null,
      null
    );
  }
}
