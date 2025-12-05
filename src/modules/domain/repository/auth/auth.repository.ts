// src/modules/domain/repository/auth/auth.repository.ts
import type { AuthEntity } from "../../entities/auth/auth.entity";
import type { LoginDTO } from "@/modules/application/dtos/auth/auth.dto";

export interface AuthRepository {
  login(credentials: LoginDTO): Promise<AuthEntity>;
  logout(): Promise<void>;
}
