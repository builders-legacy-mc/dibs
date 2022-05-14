import { Player, world } from "mojang-minecraft";

interface ChunkLookupTarget {
  location: {
    x: number;
    z: number;
  };
}

export function targetChunkId(target: ChunkLookupTarget): string {
  return `${Math.floor(target.location.x / 16)},${Math.floor(target.location.z / 16)}`;
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

export function runPlayerCommand(player: Player, command: string, withFeedback: boolean = true) {
  if (withFeedback) {
    player.runCommand(command);
  } else {
    runOwCommand("gamerule sendCommandFeedback false");
    player.runCommand(command);
    runOwCommand("gamerule sendCommandFeedback true");
  }
}

export function toTellableError(error: any) {
  if (!(error instanceof Error) && typeof error === 'object') {
    error = JSON.stringify(error);
  }

  return error;
}
