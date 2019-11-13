import RGANode from "./RGANode";
import RGAIdentifier from "./RGAIdentifier";
import RGAInsert from "./RGAInsert";

export default class RGA {
  private head: RGANode;
  private sid: number;
  private clock: number;

  public constructor(sid: number = Math.random() * Number.MAX_SAFE_INTEGER) {
    this.head = new RGANode(RGAIdentifier.NullIdentifier, "");
    this.sid = sid;
    this.clock = 0;
  }

  public findNode(position: number) {
    return this.head;
  }

  public createInsertPos(position: number, content: string) {
    this.createInsert(this.findNode(position), content);
  }

  public createInsert(reference: RGANode, content: string) {
    const node = new RGANode(new RGAIdentifier(this.sid, this.clock), content);

    return new RGAInsert(reference.id, node);
  }

  public toString() {
    return "";
  }
}
