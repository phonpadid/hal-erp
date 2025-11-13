import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";

export class DeleteQuotaUseCase {
  constructor(private readonly quotaRepository: QuotaRepository) {}

  async execute(id: string): Promise<void> {
    // Check if quota exists
    const quota = await this.quotaRepository.getById(id);
    if (!quota) {
      throw new Error("Quota not found");
    }

    if (quota.isDeleted()) {
      throw new Error("Quota is already deleted");
    }

    // Perform soft delete
    await this.quotaRepository.delete(id);
  }
}
