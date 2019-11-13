import "mocha";
import { assert } from "chai";
import RGA from "../src/RGA";

describe("RGA", function() {
  it("should properly instantitate", () => {
    const rga = new RGA();
    assert.exists(rga);
  });

  it("should be empty when no insertions", () => {
    const rga = new RGA();
    assert.equal(rga.toString(), "");
  });
});
