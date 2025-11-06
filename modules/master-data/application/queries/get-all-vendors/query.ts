export class GetAllVendorsQuery {
  constructor(
    public readonly limit?: number,
    public readonly offset?: number,
    public readonly isActive?: boolean,
    public readonly searchTerm?: string
  ) {}
}
