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

  /**
   * Creates a new RGANode with next as null
   */
  public copy(): RGANode {
    const id = new RGAIdentifier(this.id.sid, this.id.sum);
    const node = new RGANode(id, this.content);
    node.tombstone = this.tombstone;
    return node;
  }
}
