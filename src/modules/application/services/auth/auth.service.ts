// src/modules/application/services/auth/auth.service.ts
import type { AuthRepository } from "@/modules/domain/repository/auth/auth.repository";
import type { LoginDTO } from "@/modules/application/dtos/auth/auth.dto";
import type { AuthEntity } from "@/modules/domain/entities/auth/auth.entity";

export class AuthServiceImpl {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(credentials: LoginDTO): Promise<AuthEntity> {
    return this.authRepository.login(credentials);
  }
  async logout(): Promise<void> {
    return this.authRepository.logout();
  }
}
