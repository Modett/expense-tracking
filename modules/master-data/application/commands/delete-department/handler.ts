import type { IDepartmentCommandRepository } from "../../../domain/repositories/IDepartmentCommandRepository.js";
import type { IDepartmentQueryRepository } from "../../../domain/repositories/IDepartmentQueryRepository.js";
import { DepartmentId } from "../../../domain/value-objects/index.js";
import type { DeleteDepartmentCommand } from "./command.js";

export class DeleteDepartmentCommandHandler {
  constructor(
    private readonly departmentRepository: IDepartmentCommandRepository,
    private readonly departmentQueryRepository: IDepartmentQueryRepository
  ) {}

  async handle(command: DeleteDepartmentCommand): Promise<void> {
    const departmentId = DepartmentId.fromString(command.id);

    const department = await this.departmentQueryRepository.findById(departmentId);
    if (!department) {
      throw new Error(`Department with id "${command.id}" not found`);
    }

    await this.departmentRepository.delete(departmentId);
  }
}
