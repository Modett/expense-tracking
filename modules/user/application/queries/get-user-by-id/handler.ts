import type { IUserQueryRepository } from "../../../domain/repositories/IUserQueryRepository.js";
import { UserId } from "../../../domain/value-objects/index.js";
import { GetUserByIdQuery } from "./query.js";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetUserByIdQueryHandler {
  constructor(private readonly userQueryRepository: IUserQueryRepository) {}

  async handle(query: GetUserByIdQuery): Promise<UserDto | null> {
    const userId = UserId.fromString(query.userId);
    const user = await this.userQueryRepository.findById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id.getValue(),
      name: user.name.getValue(),
      email: user.email.getValue(),
      role: user.role.toString(),
      status: user.status.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
