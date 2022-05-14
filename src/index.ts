import { world } from "mojang-minecraft";
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

world.events.beforeChat.subscribe((event) => {
  if (event.message.indexOf("+bl:") === 0 && !event.sendToTargets) {
    event.cancel = true;

    if (globalError) {
      replyWithError(event.sender, "Global", globalError);
      return;
    }

    if (event.sender.dimension.id === "minecraft:overworld") {
      const command = event.message.slice(4).split(" ");

      if (command[0] === "check") {
        if (command.length > 1) {
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
          return;
        }
      } else if (command[0] === "dibs") {
        if (command.length > 1) {
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
          return;
        }
      } else if (command[0] === "transfer") {
        const to = command[1];
        const chunkId = playerChunkId(event.sender);

        if (!to) {
          reply(event.sender, "Usage: '+bl:transfer <to>'");
          return;
        }

        try {
          if (ownershipDb.isOwner(chunkId, event.sender.name)) {
            ownershipDb.setOwner(chunkId, to);
            reply(event.sender, `You successfully transferred this chunk to ${to}.`);
          } else {
            reply(event.sender, "You cannot transfer a chunk you do not have dibs on.");
          }
        } catch (error) {
          replyWithError(event.sender, "Dibs", error);
          return;
        }
      } else {
        reply(event.sender, `Unknown command '+bl:${command[0]}'`);
      }
    } else {
      reply(event.sender, "You can only use '+bl:' commands in the overworld.")
    }
  }
});
