import RGAIdentifier from "./RGAIdentifier";

/**
 * Represents an insert operations into the RGA
 */
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
