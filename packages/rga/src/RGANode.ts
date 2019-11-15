import RGAIdentifier from "./RGAIdentifier";

/**
 * Represents a node in the linked RGA structure
 */
export default class RGANode {
  public id: RGAIdentifier;
  public content: string;
  public tombstone: boolean;

  public next: RGANode | null = null;

  constructor(id: RGAIdentifier, content: string) {
    this.id = id;
    this.content = content;
    this.tombstone = false;
  }
}
