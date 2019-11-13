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
    const node = new RGANode(new RGAIdentifier(this.sid, this.clock), content);

    return new RGAInsert(reference, node);
  }

  public createRemovePos(position: number) {
    return this.createRemove(this.findNodePos(position).id);
  }

  public createRemove(id: RGAIdentifier) {
    return new RGARemove(id);
  }

  public insert(insertion: RGAInsert) {
    const reference = this.getFromNodeMap(insertion.reference);

    if (reference === undefined) {
      throw new Error(
        "Could not find reference node. Has operations been delivered out of order?"
      );
    }

    const next = reference.next;
    reference.next = insertion.node;
    reference.next.next = next;

    this.setToNodeMap(insertion.node);

    this.clock++;
  }

  public toString() {
    let str = "";
    let cursor = this.head.next;
    while (cursor !== null) {
      str += cursor.content;
      cursor = cursor.next;
    }
    return str;
  }
}
