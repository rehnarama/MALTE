import RGANode from "./RGANode";
import RGAIdentifier from "./RGAIdentifier";

export default class RGA {
  private head: RGANode;

  public constructor() {
    this.head = new RGANode(RGAIdentifier.NullIdentifier);
  }

  public findNode(position: number) {
      return this.head;
  }

  public toString() {
    return "";
  }
}
