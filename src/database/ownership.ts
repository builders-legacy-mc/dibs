import { CoreDatabase } from "./core";

interface OwnershipData {
  [chunkId: string]: string;
}

export interface OwnershipDatabase {
  getOwner(chunkId: string): string | null;

  isOwner(chunkId: string, playerName: string): boolean;

  hasOwner(chunkId: string): boolean;

  open(): void;

  setOwner(chunkId: string, playerName: string): void;
}

export class StandardOwnershipDatabase implements OwnershipDatabase {
  public constructor(
    private db: CoreDatabase
  ) {

  }

  public getOwner(chunkId: string): string | null {
    const dibs = this.db.get("ownership") as OwnershipData;
    return dibs[chunkId] ?? null;
  }

  public hasOwner(chunkId: string): boolean {
    return this.getOwner(chunkId) !== null;
  }

  public isOwner(chunkId: string, playerName: string): boolean {
    return this.getOwner(chunkId) === playerName;
  }

  public open(): void {
    const dibs = this.db.get("ownership");

    if (!dibs) {
      this.db.set("ownership", {});
    }
  }

  public setOwner(chunkId: string, playerName: string): void {
    const dibs = this.db.get("ownership") as OwnershipData;
    dibs[chunkId] = playerName;

    this.db.set("ownership", dibs);
  }
}
