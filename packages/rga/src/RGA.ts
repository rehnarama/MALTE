import RGANode from "./RGANode";
import RGAIdentifier from "./RGAIdentifier";
import RGAInsert from "./RGAInsert";
import RGARemove from "./RGARemove";

export interface RGAJSON {
  nodes: RGANode[]
};

/**
 * The RGA structure is a CRDT that allows for collaborative editing.
 * More info here: https://pages.lip6.fr/Marc.Shapiro/papers/rgasplit-group2016-11.pdf
 */
export default class RGA {
  private head: RGANode;
  private sid: number;
  private clock: number;

  private nodeMap: Map<number, Map<number, RGANode>>;

  /**
   * Constructs a new RGA structure
   * @param sid The identifier for this replica of RGA
   */
  public constructor(sid: number = Math.random() * Number.MAX_SAFE_INTEGER) {
    this.head = new RGANode(RGAIdentifier.NullIdentifier, "");
    this.sid = sid;
    this.clock = 0;
    this.nodeMap = new Map();
    this.setToNodeMap(this.head);
  }

  private getFromNodeMap(identifier: RGAIdentifier) {
    return this.nodeMap.get(identifier.sid)?.get(identifier.sum);
  }

  private setToNodeMap(node: RGANode) {
    let sidSet = this.nodeMap.get(node.id.sid);
    if (sidSet === undefined) {
      sidSet = new Map();
      this.nodeMap.set(node.id.sid, sidSet);
    }
    sidSet.set(node.id.sum, node);
  }

  /**
   * Finds a RGANode at the given position
   * @param position The position of the node
   */
  public findNodePos(position: number) {
    let count = 0;
    let cursor: RGANode | null = this.head;
    while (count < position && cursor.next !== null) {
      cursor = cursor.next;
      count += cursor.content.length;
    }

    if (cursor === null) {
      throw new Error(
        "Couldn't find node at position '" +
          position +
          "'. Is something out of sync?"
      );
    }

    return cursor;
  }

  /**
   * Creates an insertion the given position with the given content
   * @param position The position of which to create the insertion
   * @param content The content to insert. Should be a single charcater with length 1
   */
  public createInsertPos(position: number, content: string) {
    return this.createInsert(this.findNodePos(position).id, content);
  }

  /**
   * Creates an insertion to the right of the given reference with the given content
   * @param reference The identifier of the reference node.
   * The insertion will be to the right of the reference noded
   * @param content The content to insert. Should be a single character with length 1
   */
  public createInsert(reference: RGAIdentifier, content: string) {
    return new RGAInsert(
      reference,
      new RGAIdentifier(this.sid, this.clock),
      content
    );
  }

  /**
   * Creates a removal at the given position
   * @param position The position of the node to remove
   */
  public createRemovePos(position: number) {
    return this.createRemove(this.findNodePos(position).id);
  }

  /**
   * Creates a removal at the given identifier
   * @param id Creates a removal of the given id
   */
  public createRemove(id: RGAIdentifier) {
    return new RGARemove(id);
  }

  /**
   * Applies an insert operation
   * @param insertion The insertion to apply
   */
  public insert(insertion: RGAInsert) {
    let target: RGANode | null =
      this.getFromNodeMap(insertion.reference) || null;

    if (!target) {
      throw new Error(
        "Could not find reference node. Has operations been delivered out of order?"
      );
    }

    while (target.next && target.next.id.compareTo(insertion.id) > 0) {
      target = target.next;
    }

    if (!target) {
      throw new Error("Whoops, this should never happen! My bad.");
    }

    const node = new RGANode(insertion.id, insertion.content);
    const next = target.next;
    target.next = node;
    node.next = next;

    this.setToNodeMap(node);

    this.clock++;

    return insertion;
  }

  /**
   * Applies the remove operation
   * @param removal The removal to apply
   */
  remove(removal: RGARemove) {
    const node = this.getFromNodeMap(removal.reference);
    if (node === undefined) {
      throw new Error(
        "Could not find reference node. Has operations been delivered out of order?"
      );
    }

    node.tombstone = true;

    return removal;
  }

  /**
   * Applies either an insert or a remove to the RGA
   * @param op operation to perform
   */
  public applyOperation(op: RGAInsert | RGARemove): void {
    if (op instanceof RGAInsert) {
      this.insert(op);
    } else {
      this.remove(op);
    }
  }

  /**
   * Converts the RGA to a plain old string
   */
  public toString() {
    let str = "";
    let cursor = this.head.next;
    while (cursor !== null) {
      if (!cursor.tombstone) {
        str += cursor.content;
      }
      cursor = cursor.next;
    }
    return str;
  }

  /**
   * Converts a string into an RGA
   * @param s string to convert
   */
  public static fromString(s: string): RGA {
    const rga: RGA = new RGA();
    for (let i = s.length - 1; i >= 0; i--) {
      const insert = rga.createInsertPos(0, s[i]);
      rga.insert(insert);
    }
    return rga;
  }

  public static fromRGAJSON(rgaJSON: RGAJSON): RGA {
    const newRga = new RGA();
    for(let i = rgaJSON.nodes.length - 1; i >= 0; i--) {
      const node = rgaJSON.nodes[i];
      node.next = newRga.head.next;
      newRga.head.next = node;
      newRga.setToNodeMap(node);
    }
    newRga.clock = rgaJSON.nodes.length;
    return newRga;
  }

  public toRGAJSON(): RGAJSON {
    const nodes: RGANode[] = [];
    let cursor = this.head.next;
    while (cursor !== null) {
      const node = cursor.copy();
      nodes.push(node);
      cursor = cursor.next;
    }
    return {nodes}; 
  }
}
