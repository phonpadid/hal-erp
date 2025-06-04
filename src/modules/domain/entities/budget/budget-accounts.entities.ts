export class BudGetAccountsEntity {
  private id: string;
  private code: string;
  private name: string;
  private fiscal_year?: string;
  private allocated_amount?: string;
  private department_id?: string;
  private created_at: string;
  private updated_at: string;
  private deleted_at: string | null;

  constructor(
    id: string,
    code: string,
    name: string,
    fiscal_year: string | undefined,
    
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null,

  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.tel = tel;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string | undefined {
    return this.password;
  }

  public getTel(): string | undefined {
    return this.tel;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }

  public getUpdatedAt(): string {
    return this.updatedAt;
  }

  public getDeletedAt(): string | null {
    return this.deletedAt;
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public updateUsername(username: string): void {
    this.username = username;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateEmail(email: string): void {
    this.email = email;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updatePassword(password: string): void {
    this.password = password;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public updateTel(tel: string | undefined): void {
    this.tel = tel;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public delete(): void {
    this.deletedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
    this.updatedAt = this.deletedAt;
  }

  public restore(): void {
    this.deletedAt = null;
    this.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  public static create(
    id: string,
    username: string,
    email: string,
    password: string,
    tel?: string
  ): UserEntity {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return new UserEntity(id, username, email, now, now, null, password, tel);
  }
}
