import { world } from "mojang-minecraft";
import { StandardCommandRegistry } from "./command_registry";
import { StandardCoreDatabase } from "./database/core";
import { OwnershipDatabase, StandardOwnershipDatabase } from "./database/ownership";
import { StandardScoreboard } from "./scoreboard";
import { playerChunkId, reply, replyWithError } from "./utils";

// This process is gross. Basically, when setting up the "database" some errors can occur. However,
// those errors cannot be reported anywhere (that I know of) at the time they occur. Instead, this
// module is written to capture errors in the set-up process and then send them back to users that
// try to utilize the mod. See "./command_processor.ts:initialize" (towards the beginning) and
// "./util/index.ts:replyWithError". I am unsure if/how logging works, but it would be nicer to
// utilize logging if at all possible - something to explore.

let ownershipDb: OwnershipDatabase;
let globalError: any;

try {
  const db = new StandardCoreDatabase("BL_DATABASE", "BL_DATA:", new StandardScoreboard());
  db.open();

  ownershipDb = new StandardOwnershipDatabase(db);
  ownershipDb.open();
} catch (error) {
  globalError = error;
}

const commandRegistry = new StandardCommandRegistry();

commandRegistry.setEventValidator(
  "bl",
  (event) => {
    if (event.sender.dimension.id !== "minecraft:overworld") {
      reply(event.sender, "You can only use '+bl:' commands in the overworld.");
      return false;
    }

    return true;
  }
);

commandRegistry.setCommandHandler(
  "bl",
  "check",
  (event, args) => {
    if (args.length !== 0) {
      reply(event.sender, "Usage: '+bl:check'");
      return;
    }

    const chunkId = playerChunkId(event.sender);

    try {
      if (ownershipDb.hasOwner(chunkId)) {
        if (ownershipDb.isOwner(chunkId, event.sender.name)) {
          reply(event.sender, "You have dibs on this chunk.");
        } else {
          reply(event.sender, `${ownershipDb.getOwner(chunkId)} has dibs on this chunk.`);
        }
      } else {
        reply(event.sender, "No one has dibs on this chunk.")
      }
    } catch (error) {
      replyWithError(event.sender, "Dibs", error);
    }
  }
);

commandRegistry.setCommandHandler(
  "bl",
  "dibs",
  (event, args) => {
    if (args.length !== 0) {
      reply(event.sender, "Usage: '+bl:dibs'");
      return;
    }

    const chunkId = playerChunkId(event.sender);

    try {
      if (ownershipDb.hasOwner(chunkId)) {
        if (ownershipDb.isOwner(chunkId, event.sender.name)) {
          reply(event.sender, "You already have dibs on this chunk.");
        } else {
          reply(event.sender, `${ownershipDb.getOwner(chunkId)} already has dibs on this chunk.`);
        }
      } else {
        ownershipDb.setOwner(chunkId, event.sender.name);
        reply(event.sender, "You successfully called dibs on this chunk.")
      }
    } catch (error) {
      replyWithError(event.sender, "Dibs", error);
    }
  }
);

commandRegistry.setCommandHandler(
  "bl",
  "transfer",
  (event, args) => {
    if (args.length !== 1) {
      reply(event.sender, "Usage: '+bl:transfer <to>'");
      return;
    }

    const to = args[0];
    const chunkId = playerChunkId(event.sender);

    try {
      if (ownershipDb.isOwner(chunkId, event.sender.name)) {
        ownershipDb.setOwner(chunkId, to);
        reply(event.sender, `You successfully transferred this chunk to ${to}.`);
      } else {
        reply(event.sender, "You cannot transfer a chunk you do not have dibs on.");
      }
    } catch (error) {
      replyWithError(event.sender, "Dibs", error);
    }
  }
)

world.events.beforeChat.subscribe((event) => {
  if (event.message.indexOf("+bl:") === 0 && !event.sendToTargets) {
    event.cancel = true;

    if (globalError) {
      replyWithError(event.sender, "Global", globalError);
      return;
    }

    if (commandRegistry.validateEvent("bl", event)) {
      const [command, ...args] = event.message.slice(4).split(" ");

      if (commandRegistry.hasCommandHandler("bl", command)) {
        commandRegistry.processCommand("bl", event, command, args);
      } else {
        reply(event.sender, `Unknown command '+bl:${command}'`);
      }
    }
  }
});
