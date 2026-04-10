import { DocumentCategoryEntity } from "@/modules/domain/entities/document-category.entity";
import type { DocumentCategoryRepository } from "@/modules/domain/repository/document-category.repository";
import { api } from "@/common/config/axios/axios";

export class ApiDocumentCategoryRepository implements DocumentCategoryRepository {
  async findAll(): Promise<DocumentCategoryEntity[]> {
    try {
      const response = await api.get("/document-categories");
      console.log("📡 API Response /document-categories:", response.data);
      return response.data.data.map((category: unknown) => this.toDomainModel(category));
    } catch (error) {
      this.handleApiError(error, "Failed to fetch document categories");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomainModel(category: any): DocumentCategoryEntity {
    return new DocumentCategoryEntity(
      category.id.toString(),
      category.name,
      category.code || "",
      category.created_at || "",
      category.updated_at || "",
      category.deleted_at || null
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as { response?: { data?: { message?: string } }; request?: unknown };

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(`${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
