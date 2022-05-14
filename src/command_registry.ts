import { BeforeChatEvent } from "mojang-minecraft";

type CommandHandler = (event: BeforeChatEvent, args: string[]) => void;
type PrefixValidator = (event: BeforeChatEvent) => boolean;

export interface CommandRegistry {
  hasCommandHandler(prefix: string, command: string): boolean;

  processCommand(prefix: string, event: BeforeChatEvent, command: string, args: string[]): void;

  setCommandHandler(prefix: string, command: string, handler: CommandHandler): void;

  setEventValidator(prefix: string, validator: PrefixValidator): void;

  validateEvent(prefix: string, event: BeforeChatEvent): boolean;
}

export class StandardCommandRegistry implements CommandRegistry {
  private prefixValidators = new Map<string, PrefixValidator>();
  private commandProcessor = new Map<string, CommandHandler>();

  public hasCommandHandler(prefix: string, command: string): boolean {
    return this.commandProcessor.has(`${prefix}:${command}`);
  }

  public processCommand(prefix: string, event: BeforeChatEvent, command: string, args: string[]): void {
    this.commandProcessor.get(`${prefix}:${command}`)?.(event, args);
  }

  public setCommandHandler(prefix: string, command: string, handler: CommandHandler): void {
    this.commandProcessor.set(`${prefix}:${command}`, handler);
  }

  public setEventValidator(prefix: string, validator: PrefixValidator): void {
    this.prefixValidators.set(prefix, validator);
  }

  public validateEvent(prefix: string, event: BeforeChatEvent): boolean {
    return this.prefixValidators.get(prefix)?.(event) ?? true;
  }
}
