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

    // Check if department can be deleted (prevents deleting system departments)
    if (!department.canBeDeleted()) {
      throw new Error(
        "Cannot delete system department. System departments like 'General' are required for core functionality."
      );
    }

    // Attempt to delete - this may fail if there are related records (expenses, budgets, etc.)
    try {
      await this.departmentRepository.delete(departmentId);
    } catch (error: any) {
      // Prisma foreign key constraint violation
      if (error.code === "P2003" || error.message?.includes("Foreign key constraint")) {
        throw new Error(
          "Cannot delete department because it has related expenses or budgets. Please reassign or delete those records first."
        );
      }
      throw error;
    }
  }
}
