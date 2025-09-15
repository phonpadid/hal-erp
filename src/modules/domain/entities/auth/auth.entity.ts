// src/modules/domain/entities/auth/auth.entity.ts
export class AuthEntity {
  constructor(
    private id: number,
    private username: string,
    private email: string,
    private tel: string,
    private roles: string[] | null, 
    private permission: string[], 
    private user_type: string[],
    private created_at: string,
    private updated_at: string,
    private deleted_at: string | null,
    private access_token: string
  ) {}

  // Getters
  getId(): number {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  // ✅ แก้ไข getter ให้ตรงกับชื่อ property
  getPermissions(): string[] {
    return this.permission;
  }

  getRoles(): string[] | null {
    return this.roles;
  }

  getEmail(): string {
    return this.email;
  }

  getTel(): string {
    return this.tel;
  }

  getCreatedAt(): string {
    return this.created_at;
  }

  getUpdatedAt(): string {
    return this.updated_at;
  }

  getDeletedAt(): string | null {
    return this.deleted_at;
  }

  getAccessToken(): string {
    return this.access_token;
  }

  // Helper methods
  isDeleted(): boolean {
    return this.deleted_at !== null;
  }
}
