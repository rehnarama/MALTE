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
    const node: RGANode = rga.findNodePos(0);

    assert.equal(node.id.compareTo(RGAIdentifier.NullIdentifier), 0);
  });

  it("should be able to create insertion operation", () => {
    const rga = new RGA();
    const reference: RGANode = rga.findNodePos(0);
    const insertion = rga.createInsert(reference.id, "a");
    const insertionPos = rga.createInsertPos(0, "a");

    assert.exists(insertion);
    assert.equal(insertion.node.content, "a");
    // Insertion at 0 should refer to head node
    assert.equal(
      insertion.reference.compareTo(RGAIdentifier.NullIdentifier),
      0
    );
    assert.exists(insertionPos);
    assert.equal(insertionPos.node.content, "a");
    assert.equal(
      insertionPos.reference.compareTo(RGAIdentifier.NullIdentifier),
      0
    );
  });

  it("should be able to apply insertion operation", () => {
    const rga = new RGA();
    const insertion = rga.createInsertPos(0, "a");

    rga.insert(insertion);

    assert.equal(rga.toString(), "a");
  });

  it("should be able to insert in many different places", () => {
    const rga = new RGA();

    const insertion1 = rga.createInsertPos(0, "b");
    rga.insert(insertion1);
    const insertion2 = rga.createInsertPos(0, "a");
    rga.insert(insertion2);
    const insertion3 = rga.createInsertPos(2, "c");
    rga.insert(insertion3);

    assert.equal(rga.toString(), "abc");
  });

  it("should be able to create remove operation", () => {
    const rga = new RGA();

    rga.insert(rga.createInsertPos(0, "a"));
    rga.insert(rga.createInsertPos(1, "b"));
    rga.insert(rga.createInsertPos(2, "c"));

    const reference = rga.findNodePos(2);
    const removal = rga.createRemove(reference.id);
    const removalPos = rga.createRemovePos(2);

    assert.deepEqual(removal.reference, reference.id);
    assert.deepEqual(removalPos.reference, reference.id);
  });

  it("should be able to apply remove operation", () => {
    const rga = new RGA();

    rga.insert(rga.createInsertPos(0, "a"));
    rga.insert(rga.createInsertPos(1, "b"));
    rga.insert(rga.createInsertPos(2, "c"));

    const removal = rga.createRemovePos(2);
    rga.remove(removal);

    assert.equal(rga.toString(), "ac");
  });
});
