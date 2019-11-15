import "mocha";
import { assert } from "chai";
import RGA from "./RGA";
import RGANode from "./RGANode";
import RGAIdentifier from "./RGAIdentifier";
import RGAInsert from "./RGAInsert";
import RGARemove from "./RGARemove";

const LETTERS = "abcdefghijklmnopqrstuvwxyzåäö";
function randomLetter() {
  return LETTERS.substr(Math.random() * LETTERS.length, 1);
}

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
    assert.equal(insertion.content, "a");
    // Insertion at 0 should refer to head node
    assert.equal(
      insertion.reference.compareTo(RGAIdentifier.NullIdentifier),
      0
    );
    assert.exists(insertionPos);
    assert.equal(insertionPos.content, "a");
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

  describe("stress test", () => {
    it("should converge between two clients inserting independently", () => {
      const rgaA = new RGA(1);
      const rgaB = new RGA(2);

      const op1a = rgaA.insert(rgaA.createInsertPos(0, "a"));
      const op2a = rgaA.insert(rgaA.createInsertPos(1, "b"));
      const op3a = rgaA.insert(rgaA.createInsertPos(2, "c"));

      const op1b = rgaB.insert(rgaB.createInsertPos(0, "1"));
      const op2b = rgaB.insert(rgaB.createInsertPos(1, "2"));
      const op3b = rgaB.insert(rgaB.createInsertPos(2, "3"));

      rgaA.insert(op1b);
      rgaA.insert(op2b);
      rgaA.insert(op3b);
      rgaB.insert(op1a);
      rgaB.insert(op2a);
      rgaB.insert(op3a);

      assert.equal(rgaA.toString(), "123abc");
      assert.equal(rgaB.toString(), "123abc");
    });

    it("should converge between two clients removing same element", () => {
      const rgaA = new RGA(1);
      const rgaB = new RGA(2);

      const op1 = rgaA.insert(rgaA.createInsertPos(0, "a"));
      const op2 = rgaA.insert(rgaA.createInsertPos(1, "b"));
      const op3 = rgaA.insert(rgaA.createInsertPos(2, "c"));

      rgaB.insert(op1);
      rgaB.insert(op2);
      rgaB.insert(op3);

      const op4a = rgaA.remove(rgaA.createRemovePos(2));
      const op4b = rgaB.remove(rgaB.createRemovePos(2));

      rgaA.remove(op4b);
      rgaB.remove(op4a);

      assert.equal(rgaA.toString(), "ac");
      assert.equal(rgaB.toString(), "ac");
    });

    it("should converge between two clients removing independently", () => {
      const rgaA = new RGA(1);
      const rgaB = new RGA(2);

      const op1 = rgaA.insert(rgaA.createInsertPos(0, "a"));
      const op2 = rgaA.insert(rgaA.createInsertPos(1, "b"));
      const op3 = rgaA.insert(rgaA.createInsertPos(2, "c"));

      rgaB.insert(op1);
      rgaB.insert(op2);
      rgaB.insert(op3);

      const op4a = rgaA.remove(rgaA.createRemovePos(1));
      const op4b = rgaB.remove(rgaB.createRemovePos(3));

      rgaA.remove(op4b);
      rgaB.remove(op4a);

      assert.equal(rgaA.toString(), "b");
      assert.equal(rgaB.toString(), "b");
    });

    it("should converge when many clients do many changes interleaved", () => {
      const N_CLIENTS = 5;
      const N_ROUNDS = 5;
      const N_OPERATIONS = 10;

      /**
       * doRound - Performs a series of random operations on a RGA and returns them
       * @param rga The RGA of which to perform random opeartions on
       */
      function doRound(rga: RGA) {
        const insertions: RGAInsert[] = [];
        const removals: RGARemove[] = [];

        let currentLength = rga.toString().length;
        for (let operation = 0; operation < N_OPERATIONS; operation++) {
          if (Math.random() <= 0.5 && currentLength > 0) {
            // Do removal
            const op = rga.createRemovePos(Math.random() * currentLength);
            rga.remove(op);

            removals.push(op);
            currentLength--;
          } else {
            // Do insertion
            const op = rga.createInsertPos(
              Math.random() * currentLength,
              randomLetter()
            );
            rga.insert(op);

            insertions.push(op);
            currentLength++;
          }
        }
        return { insertions, removals };
      }

      // Initialize the RGA
      const rgas: RGA[] = [];
      for (let client = 0; client < N_CLIENTS; client++) {
        rgas.push(new RGA(client));
      }

      for (let round = 0; round < N_ROUNDS; round++) {
        const roundOps = new Map<
          number,
          { insertions: RGAInsert[]; removals: RGARemove[] }
        >();

        // Perform all rounds of random operations
        for (let client = 0; client < N_CLIENTS; client++) {
          const ops = doRound(rgas[client]);
          roundOps.set(client, ops);
        }

        // Send operations to other clients
        for (let client = 0; client < N_CLIENTS; client++) {
          const ops = roundOps.get(client);
          if (ops === undefined) {
            throw new Error("Should never happen");
          }
          for (let otherClient = 0; otherClient < N_CLIENTS; otherClient++) {
            if (client === otherClient) {
              continue;
            }

            ops.insertions.forEach(op => {
              rgas[otherClient].insert(op);
            });
            ops.removals.forEach(op => {
              rgas[otherClient].remove(op);
            });
          }
        }
      }

      for (let client = 1; client < N_CLIENTS; client++) {
        assert.equal(rgas[client - 1].toString(), rgas[client].toString());
      }
    });
  });
});