export class GetAllUsersQuery {
  constructor(
    public readonly limit?: number,
    public readonly offset?: number,
    public readonly role?: string,
    public readonly isActive?: boolean,
    public readonly searchTerm?: string
  ) {}
}
