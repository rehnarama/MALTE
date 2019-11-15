import RGAIdentifier from "./RGAIdentifier";

/**
 * Represents a remove operation in the RGA
 */
export default class RGARemove {
  public reference: RGAIdentifier;

  public constructor(reference: RGAIdentifier) {
    this.reference = reference;
  }
}
