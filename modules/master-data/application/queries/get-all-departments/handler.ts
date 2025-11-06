import type { IDepartmentQueryRepository } from "../../../domain/repositories/IDepartmentQueryRepository.js";
import type { GetAllDepartmentsQuery } from "./query.js";

export interface DepartmentListItemResponse {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAllDepartmentsResponse {
  departments: DepartmentListItemResponse[];
  total: number;
}

export class GetAllDepartmentsQueryHandler {
  constructor(private readonly departmentQueryRepository: IDepartmentQueryRepository) {}

  async handle(query: GetAllDepartmentsQuery): Promise<GetAllDepartmentsResponse> {
    const departments = await this.departmentQueryRepository.findAll({
      ...(query.limit !== undefined && { limit: query.limit }),
      ...(query.offset !== undefined && { offset: query.offset }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.searchTerm !== undefined && { searchTerm: query.searchTerm }),
    });

    const total = await this.departmentQueryRepository.count({
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    });

    return {
      departments: departments.map((department) => ({
        id: department.id.getValue(),
        name: department.getName().getValue(),
        code: department.getCode().getValue(),
        isActive: department.isActive(),
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
      })),
      total,
    };
  }
}
