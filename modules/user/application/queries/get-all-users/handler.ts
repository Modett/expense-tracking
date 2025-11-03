import type { IUserQueryRepository, UserListQuery } from "../../../domain/repositories/IUserQueryRepository.js";
import { GetAllUsersQuery } from "./query.js";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetAllUsersQueryHandler {
  constructor(private readonly userQueryRepository: IUserQueryRepository) {}

  async handle(query: GetAllUsersQuery): Promise<UserDto[]> {
    const listQuery: UserListQuery = {
      ...(query.limit !== undefined && { limit: query.limit }),
      ...(query.offset !== undefined && { offset: query.offset }),
      ...(query.role !== undefined && { role: query.role }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.searchTerm !== undefined && { searchTerm: query.searchTerm }),
    };

    const users = await this.userQueryRepository.findAll(listQuery);

    return users.map((user) => ({
      id: user.id.getValue(),
      name: user.name.getValue(),
      email: user.email.getValue(),
      role: user.role.toString(),
      status: user.status.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
