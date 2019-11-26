import "mocha";
import { assert } from "chai";
import File from "./File";

describe("File", function() {
  describe("::triggerSave()", () => {
    let saveProt: typeof File.prototype.save;
    beforeEach(() => {
      saveProt = File.prototype.save;
    });
    afterEach(() => {
      File.prototype.save = saveProt;
    });

    it("Should save when no save has happened before", () => {
      let saveCount = 0;
      File.prototype.save = async (): Promise<void> => {
        saveCount++;
      };

      const f = new File("filename");
      f.scheduleSave();

      assert.equal(saveCount, 1);
    });

    it("Should only save once if triggering save twice short after each other", () => {
      let saveCount = 0;
      File.prototype.save = async (): Promise<void> => {
        saveCount++;
      };

      const f = new File("filename");
      f.scheduleSave();
      f.scheduleSave();

      assert.equal(saveCount, 1);
    });

    it("Should save twice if triggering close to each other after a short while", (done: MochaDone) => {
      let saveCount = 0;
      File.prototype.save = async (): Promise<void> => {
        saveCount++;
      };

      const f = new File("filename", 5);
      f.scheduleSave();
      f.scheduleSave();

      assert.equal(saveCount, 1);

      function saveChecker(): void {
        if (!f.isSaveScheduled()) {
          assert.equal(saveCount, 2);
          done();
        } else {
          setImmediate(saveChecker);
        }
      }
      saveChecker();
    });

    it("Should only save twice if triggering many times close to each other", (done: MochaDone) => {
      let saveCount = 0;
      File.prototype.save = async (): Promise<void> => {
        saveCount++;
      };

      const f = new File("filename", 5);
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();

      assert.equal(saveCount, 1);

      function saveChecker(): void {
        if (!f.isSaveScheduled()) {
          assert.equal(saveCount, 2);
          done();
        } else {
          setImmediate(saveChecker);
        }
      }
      saveChecker();
    });
  });
});
