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

      const MAX_SAVE_TIME = 10;
      const f = new File("filename", MAX_SAVE_TIME);
      f.scheduleSave();
      f.scheduleSave();

      assert.equal(saveCount, 1);

      setTimeout(() => {
        assert.equal(saveCount, 2);
        done();
      }, MAX_SAVE_TIME * 5);
    });

    it("Should only save twice if triggering many times close to each other", (done: MochaDone) => {
      let saveCount = 0;
      File.prototype.save = async (): Promise<void> => {
        saveCount++;
      };

      const MAX_SAVE_TIME = 10;
      const f = new File("filename", MAX_SAVE_TIME);
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();

      assert.equal(saveCount, 1);

      setTimeout(() => {
        assert.equal(saveCount, 2);
        done();
      }, MAX_SAVE_TIME * 5);
    });
  });
});
