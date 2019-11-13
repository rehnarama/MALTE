export default class RGAIdentifier {
  public sid: number;
  public sum: number;

  constructor(sid: number, sum: number) {
    this.sid = sid;
    this.sum = sum;
  }

  compareTo(other: RGAIdentifier) {
    if (this.sid != other.sid) {
      return this.sid - other.sid;
    } else {
      return this.sum - other.sum;
    }
  }

  public static NullIdentifier = new RGAIdentifier(-1, -1);
}
