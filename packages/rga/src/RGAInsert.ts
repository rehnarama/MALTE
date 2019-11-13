import RGAIdentifier from "./RGAIdentifier";
import RGANode from "./RGANode";

export default class RGAInsert {
  public reference: RGAIdentifier;
  public node: RGANode;

  public constructor(reference: RGAIdentifier, node: RGANode) {
    this.reference = reference;
    this.node = node;
  }
}
