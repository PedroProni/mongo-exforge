export class SelectURIsCommand {
  constructor(
    public readonly remember_me: boolean,
    public readonly uris: string[],
  ) {}
}
