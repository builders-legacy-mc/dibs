import { runOwCommand } from "./utils";

export interface Scoreboard {
  addObjective(name: string): string;

  addPlayer(name: string, objective: string): string;

  getPlayers(): string[];

  hasObjective(name: string): boolean;

  resetPlayer(name: string, objective: string): string;
}

export class StandardScoreboard implements Scoreboard {
  public addObjective(name: string): string {
    return runOwCommand(`scoreboard objectives add ${name} dummy`);
  }

  public addPlayer(name: string, objective: string): string {
    return runOwCommand(`scoreboard players add "${name}" ${objective} 0`);
  }

  public getPlayers(): string[] {
    return runOwCommand("scoreboard players list").split("\n")[1].split(", ");
  }

  public hasObjective(name: string): boolean {
    return runOwCommand("scoreboard objectives list").split("\n").some((line) => {
      return line.indexOf(`- ${name}`) === 0;
    });
  }

  public resetPlayer(name: string, objective: string): string {
    return runOwCommand(`scoreboard players reset "${name}" ${objective}`);
  }
}

export function fromScoreboardName(name: string): object {
  return JSON.parse(name.split(' ').map(c => String.fromCharCode(parseInt(c, 10))).join(''));
}

export function toScoreboardName(obj: object): string {
  return JSON.stringify(obj).split("").map(c => c.charCodeAt(0)).join(' ');
}
