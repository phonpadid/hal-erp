import type { IncreaseBudgetItemRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget-item.repository";

export class DeleteIncreaseBudgetItemUseCase {
  constructor(private readonly repo: IncreaseBudgetItemRepository) {}

  async execute(id: string): Promise<boolean> {
    // Check if budGet exists
    const budGet = await this.repo.findById(id);
    if (!budGet) {
      throw new Error(`budGet with id ${id} not found`);
    }

    // Delete budGet
    return await this.repo.delete(id);
  }
}
