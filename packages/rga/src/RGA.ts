import RGANode from "./RGANode";
import RGAIdentifier from "./RGAIdentifier";
import RGAInsert from "./RGAInsert";
import RGARemove from "./RGARemove";

export default class RGA {
  private head: RGANode;
  private sid: number;
  private clock: number;

  private nodeMap: Map<number, Map<number, RGANode>>;

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

  private findNode(reference: RGAIdentifier) {
    let target = this.head;
    while (target.id.compareTo(reference) !== 0) {
      if (target.next == null) {
        throw new Error(
          "We've traversed the entire RGA without finding the reference node. Has a node been remove instead of tombstoned?"
        );
      }
      target = target.next;
    }
    return target;
  }

  public createInsertPos(position: number, content: string) {
    return this.createInsert(this.findNodePos(position).id, content);
  }

  public createInsert(reference: RGAIdentifier, content: string) {
    return new RGAInsert(
      reference,
      new RGAIdentifier(this.sid, this.clock),
      content
    );
  }

  public createRemovePos(position: number) {
    return this.createRemove(this.findNodePos(position).id);
  }

  public createRemove(id: RGAIdentifier) {
    return new RGARemove(id);
  }

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
}
