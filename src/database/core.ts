import { fromScoreboardName, Scoreboard, toScoreboardName } from "../scoreboard";

export interface CoreDatabase {
  get<T>(key: string): T;

  open(): void;

  set<T>(key: string, value: T): void;
}

export class StandardCoreDatabase implements CoreDatabase {
  private data: {
    [key: string]: any;
  } = {};

  public constructor(
    private dbName: string,
    private dbTag: string,
    private scoreboard: Scoreboard
  ) {

  }

  public get<T>(key: string): T {
    // TODO Does this work for arrays?
    const value = this.data[key];
    return typeof value === "object" ? Object.assign({}, value) : value;
  }

  public open() {
    // Ensure the "database" exists

    try {
      const hasObjective = this.scoreboard.hasObjective(this.dbName);

      if (!hasObjective) {
        this.addDbObjective();
      }
    } catch (error: any) {
      error = JSON.parse(error);

      // Error - no objectives
      if (error.statusCode === -0x7ffe0000) {
        try {
          this.addDbObjective();
        } catch (error: any) {
          throw JSON.parse(error);
        }
      } else {
        throw error;
      }
    }

    // Load or initialize "database"

    try {
      const encodedName = this.scoreboard.getPlayers().find((name) => {
        return name.indexOf(this.dbTag) === 0;
      })?.slice(this.dbTag.length);

      if (encodedName) {
        this.data = fromScoreboardName(encodedName);
      } else {
        this.addDbPlayer();
      }
    } catch (error: any) {
      error = JSON.parse(error);

      // Error - no data
      if (error.statusCode === -0x7ffe0000) {
        try {
          this.addDbPlayer();
        } catch (error: any) {
          throw JSON.parse(error);
        }
      } else {
        throw error;
      }
    }
  }

  public set<T>(key: string, value: T): void {
    let encodedName = this.dbTag + toScoreboardName(this.data);
    this.scoreboard.resetPlayer(encodedName, this.dbName);

    this.data[key] = value;

    encodedName = this.dbTag + toScoreboardName(this.data);
    this.scoreboard.addPlayer(encodedName, this.dbName);
  }

  private addDbObjective(): string {
    return this.scoreboard.addObjective(this.dbName);
  }

  private addDbPlayer(): string {
    const encodedName = this.dbTag + toScoreboardName({});
    return this.scoreboard.addPlayer(encodedName, this.dbName);
  }
}
