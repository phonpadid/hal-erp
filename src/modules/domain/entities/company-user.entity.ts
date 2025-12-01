import type { CompanyUserInterface, RoleInterface, PermissionInterface } from "@/modules/interfaces/company-user.interface";

export class CompanyUserEntity {
  private _id: number;
  private _username: string;
  private _email: string;
  private _tel: string;
  private _signature: string | null;
  private _signature_url: string | null;
  private _roles: RoleInterface[];
  private _permissions: PermissionInterface[];
  private _company_id: number;
  private _created_at: string | null;
  private _updated_at: string | null;
  private _deleted_at: string | null;

  constructor(data: CompanyUserInterface) {
    this._id = data.id;
    this._username = data.username || data.user?.username || '';
    this._email = data.email || data.user?.email || '';
    this._tel = data.tel || data.user?.tel || '';
    this._signature = data.signature || null;
    this._signature_url = data.signature_url || null;
    this._roles = data.roles || [];
    this._permissions = data.permissions || [];
    this._company_id = data.company_id;
    this._created_at = data.created_at || null;
    this._updated_at = data.updated_at || null;
    this._deleted_at = data.deleted_at || null;
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get tel(): string {
    return this._tel;
  }

  get signature(): string | null {
    return this._signature;
  }

  get signature_url(): string | null {
    return this._signature_url;
  }

  get roles(): RoleInterface[] {
    return this._roles;
  }

  get permissions(): PermissionInterface[] {
    return this._permissions;
  }

  get company_id(): number {
    return this._company_id;
  }

  get created_at(): string | null {
    return this._created_at;
  }

  get updated_at(): string | null {
    return this._updated_at;
  }

  get deleted_at(): string | null {
    return this._deleted_at;
  }

  // Setters
  set username(value: string) {
    this._username = value;
    this._updated_at = new Date().toISOString();
  }

  set email(value: string) {
    this._email = value;
    this._updated_at = new Date().toISOString();
  }

  set tel(value: string) {
    this._tel = value;
    this._updated_at = new Date().toISOString();
  }

  set signature(value: string | null) {
    this._signature = value;
    this._updated_at = new Date().toISOString();
  }

  set signature_url(value: string | null) {
    this._signature_url = value;
  }

  set roles(value: RoleInterface[]) {
    this._roles = value;
    this._updated_at = new Date().toISOString();
  }

  set permissions(value: PermissionInterface[]) {
    this._permissions = value;
    this._updated_at = new Date().toISOString();
  }

  // Business Methods
  isDeleted(): boolean {
    return this._deleted_at !== null;
  }

  delete(): void {
    this._deleted_at = new Date().toISOString();
    this._updated_at = this._deleted_at;
  }

  restore(): void {
    this._deleted_at = null;
    this._updated_at = new Date().toISOString();
  }

  hasRole(roleName: string): boolean {
    return this._roles.some((role: RoleInterface) => role.name === roleName);
  }

  hasPermission(permissionName: string): boolean {
    return this._permissions.some((permission: PermissionInterface) => permission.name === permissionName);
  }

  getRoleNames(): string[] {
    return this._roles.map((role: RoleInterface) => role.name);
  }

  getPermissionNames(): string[] {
    return this._permissions.map((permission: PermissionInterface) => permission.name);
  }

  // Static Factory Methods
  static create(data: {
    username: string;
    email: string;
    tel: string;
    signature?: string | null;
    roles?: RoleInterface[];
    permissions?: PermissionInterface[];
    company_id: number;
  }): CompanyUserEntity {
    const now = new Date().toISOString();
    return new CompanyUserEntity({
      id: 0,
      username: data.username,
      email: data.email,
      tel: data.tel,
      signature: data.signature || undefined,
      signature_url: undefined,
      roles: data.roles || [],
      permissions: data.permissions || [],
      company_id: data.company_id,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
  }

  static fromAPI(data: CompanyUserInterface): CompanyUserEntity {
    return new CompanyUserEntity(data);
  }

  toInterface(): CompanyUserInterface {
    return {
      id: this._id,
      username: this._username,
      email: this._email,
      tel: this._tel,
      signature: this._signature || undefined,
      signature_url: this._signature_url || undefined,
      roles: this._roles,
      permissions: this._permissions,
      company_id: this._company_id,
      created_at: this._created_at || undefined,
      updated_at: this._updated_at || undefined,
      deleted_at: this._deleted_at || undefined,
    };
  }
}