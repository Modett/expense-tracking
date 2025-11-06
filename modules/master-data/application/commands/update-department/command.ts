export class UpdateDepartmentCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code?: string
  ) {}
}
