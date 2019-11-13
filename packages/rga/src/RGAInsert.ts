import RGAIdentifier from "./RGAIdentifier";
import RGANode from "./RGANode";

export default class RGAInsert {
  public reference: RGAIdentifier;

  public id: RGAIdentifier;
  public content: string;

  public constructor(
    reference: RGAIdentifier,
    id: RGAIdentifier,
    content: string
  ) {
    this.reference = reference;
    this.id = id;
    this.content = content;
  }
}
