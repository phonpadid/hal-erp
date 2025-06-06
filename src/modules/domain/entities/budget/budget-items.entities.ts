export class BudGetItemEntity {
  private id: string;
  private budget_account_id: string;
  private name: string;
  private allocated_amount?: string;
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;

  constructor(
    id: string,
    budget_account_id: string,
    name: string,
    allocated_amount: string | undefined,
    created_at: string,
    updated_at: string,
    deleted_at: string | null = null
  ) {
    this.id = id;
    this.budget_account_id = budget_account_id;
    this.name = name;
    this.allocated_amount = allocated_amount;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getBudgetAccountsId(): string {
    return this.budget_account_id;
  }

  public getAllocatedAmount(): string | undefined {
    return this.allocated_amount;
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

  public updateName(name: string): void {
    this.name = name;
    this.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateBudgetAccounts(budget_account_id: string): void {
    this.budget_account_id = budget_account_id;
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

  public static create(
    id: string,
    name: string,
    budget_account_id: string,
    allocated_amount: string | undefined
  ): BudGetItemEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new BudGetItemEntity(
      id,
      name,
      budget_account_id,
      allocated_amount,
      now,
      now,
      null
    );
  }
}
