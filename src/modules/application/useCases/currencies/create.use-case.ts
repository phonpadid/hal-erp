import type { CreateDepartmentDTO } from "@/modules/application/dtos/departments/department.dto";
import { CurrencyEntity } from "@/modules/domain/entities/currency.entity";
import type { CurrencyRepository } from "@/modules/domain/repository/currency.repository";

export class CreateCurrencyUseCase {
  constructor(private readonly currencyRepo: CurrencyRepository) {}

  async execute(inputs: CreateDepartmentDTO[]): Promise<CurrencyEntity[] | CurrencyEntity> {
    const currencies = inputs.map(input => CurrencyEntity.create(input.name, input.code));
    return await this.currencyRepo.create(currencies); // make sure repo method is also updated
  }
}
