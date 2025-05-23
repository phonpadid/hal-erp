export class UserEntity {
  private id: string;
  private username: string;
  private email: string;
  private password?: string;
  private tel?: string;
  private createdAt: string;
  private updatedAt: string;
  private deletedAt: string | null;

  constructor(
    id: string,
    username: string,
    email: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null = null,
    password?: string,
    tel?: string
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
