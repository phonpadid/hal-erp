/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/infrastructure/auth/api-auth.repository.ts
import { api } from "@/common/config/axios/axios";
import type { AuthRepository } from "@/modules/domain/repository/auth/auth.repository";
import type { LoginDTO, AuthResponseDTO } from "@/modules/application/dtos/auth/auth.dto";
import { AuthEntity } from "@/modules/domain/entities/auth/auth.entity";
import type { AxiosError } from "axios";

export class ApiAuthRepository implements AuthRepository {
  private readonly baseUrl = "/users";

  async login(credentials: LoginDTO): Promise<AuthEntity> {
    try {
      const response = await api.post(`${this.baseUrl}/login`, credentials) as { data: AuthResponseDTO };

      if (response.data.status_code !== 201) {
        throw new Error(response.data.message);
      }

      return this.toEntity(response.data.data);
    } catch (error) {
      throw this.handleError(error as AxiosError, "Login failed");
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/logout`);
    } catch (error) {
      throw this.handleError(error as AxiosError, "Logout failed");
    }
  }

  private toEntity(data: AuthResponseDTO['data']): AuthEntity {
    const { user, access_token } = data;
    return new AuthEntity(
      user.id,
      user.username,
      user.email,
      user.tel,
      user.created_at,
      user.updated_at,
      user.deleted_at,
      access_token
    );
  }

  private handleError(error: AxiosError, defaultMessage: string): Error {
    if (error.response) {
      const statusCode = error.response.status;
      const message = (error.response.data as any)?.message || defaultMessage;
      return new Error(`API Error (${statusCode}): ${message}`);
    }
    return error as Error;
  }
}
