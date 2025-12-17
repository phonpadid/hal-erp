
export class IncreaseBudgetFileEntity {
  private id: string;
  private increase_budget_id: number | null;
  private file_name: string;
  private file_name_url: string | null;

  // private increase_budget: IncreaseBudGetAccountsEntity | null;

  private created_at: string | null;
  private updated_at: string | null;
  private deleted_at: string | null;

  constructor(
    id: string,
    increase_budget_id: number | null = null,
    file_name: string,
    file_name_url: string | null = null,

    // increase_budget: IncreaseBudGetAccountsEntity | null = null,

    created_at: string | null = null,
    updated_at: string | null = null,
    deleted_at: string | null = null,
  ) {
    this.id = id;
    this.increase_budget_id = increase_budget_id;
    this.file_name = file_name;
    this.file_name_url = file_name_url;

    // this.increase_budget = increase_budget;

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
  public getBudGetItemId(): string {
    return this.file_name;
  }
  public getFileNameUrl(): string | null{
    return this.file_name_url;
  }

  // public getIncreaseBudget(): IncreaseBudGetAccountsEntity | null {
  //   return this.increase_budget;
  // }

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
}
