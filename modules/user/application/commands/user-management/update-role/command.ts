export class UpdateRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly newRole: string
  ) {}
}
