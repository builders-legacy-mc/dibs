import { Player, world } from "mojang-minecraft";

export function playerChunkId(player: Player): string {
  return `${Math.floor(player.location.x / 16)},${Math.floor(player.location.z / 16)}`;
}

export function reply(sender: Player, message: string): void {
  sender.dimension.runCommand(`tell "${sender.name}" ${message}`);
}

export function replyWithError(sender: Player, type: string, error: any): void {
  reply(sender, `Unexpected ${type} error (this should be reported to a server admin): ${toTellableError(error)}`);
}

export function runOwCommand(command: string): string {
  return world.getDimension("minecraft:overworld").runCommand(command).statusMessage;
}

export function toTellableError(error: any) {
  if (!(error instanceof Error) && typeof error === 'object') {
    error = JSON.stringify(error);
  }

  return error;
}
