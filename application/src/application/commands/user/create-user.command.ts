export class CreateUserCommand {
  constructor(
    public readonly _id: string,
    public readonly tier: string,
    public readonly name: string,
    public readonly surname: string,
    public readonly email: string,
    public readonly password: string,
    public readonly created_at: Date,
    public readonly updated_at: Date,
  ) {}
}
