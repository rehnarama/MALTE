import "mocha";
import { assert } from "chai";
import RGA from "../src/RGA";
import RGANode from "../src/RGANode";
import RGAIdentifier from "../src/RGAIdentifier";

describe("RGA", function() {
  it("should properly instantitate", () => {
    const rga = new RGA();
    assert.exists(rga);
  });

  it("should be empty when no insertions", () => {
    const rga = new RGA();
    assert.equal(rga.toString(), "");
  });

  it("head node should have null identifier", () => {
    const rga = new RGA();
    const node: RGANode = rga.findNode(0);

    assert.equal(node.id.compareTo(RGAIdentifier.NullIdentifier), 0);
  });

  it("should be able to create insertion operation", () => {
    const rga = new RGA();
    const reference: RGANode = rga.findNode(0);
    const insertion = rga.createInsert(reference, "a");

    assert.exists(insertion);
    assert.equal(insertion.node.content, "a");
  });
});
