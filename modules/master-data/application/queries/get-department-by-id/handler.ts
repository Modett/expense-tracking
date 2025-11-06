import type { IDepartmentQueryRepository } from "../../../domain/repositories/IDepartmentQueryRepository.js";
import { DepartmentId } from "../../../domain/value-objects/index.js";
import type { GetDepartmentByIdQuery } from "./query.js";

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetDepartmentByIdQueryHandler {
  constructor(private readonly departmentQueryRepository: IDepartmentQueryRepository) {}

  async handle(query: GetDepartmentByIdQuery): Promise<DepartmentResponse | null> {
    const departmentId = DepartmentId.fromString(query.id);
    const department = await this.departmentQueryRepository.findById(departmentId);

    if (!department) {
      return null;
    }

    return {
      id: department.id.getValue(),
      name: department.getName().getValue(),
      code: department.getCode().getValue(),
      isActive: department.isActive(),
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    };
  }
}
