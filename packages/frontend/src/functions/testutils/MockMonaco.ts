import { editor as editorType, IDisposable, IRange } from "monaco-editor";

function range(
  startLineNumber: number,
  startColumn: number,
  endLineNumber: number,
  endColumn: number
): IRange {
  return { startColumn, startLineNumber, endColumn, endLineNumber };
}

function rangeFromAppend(value: string): IRange {
  const lines = value.split("\n");
  const lastLine = lines[lines.length - 1];
  return range(lines.length, lastLine.length, lines.length, lastLine.length);
}

export class MockModel {
  public value = "";
  public listener: undefined | Function = undefined;

  constructor(value?: string) {
    if (value) {
      this.value = value;
    }
  }

  public setValue(newValue: string) {
    this.value = newValue;
  }

  public appendCharacter(c: string) {
    this.value = this.value + c;
    const monacoOp = {
      range: rangeFromAppend(this.value),
      rangeLength: 0,
      text: c,
      rangeOffset: 0,
      forceMoveMarkers: false
    };
    if (this.listener) {
      this.listener({
        changes: [monacoOp],
        eol: "",
        isFlush: false,
        isRedoing: false,
        isUndoing: false,
        versionId: 1
      });
    }
  }

  public onDidChangeContent(
    listener: (e: editorType.IModelContentChangedEvent) => void
  ): IDisposable {
    this.listener = listener;
    return {
      dispose: () => {
        this.listener = undefined;
        return;
      }
    };
  }
}

/**
 * Usage:
 *
 * import {mockEditor, MockModel} from ""./testutils/MockMonaco";
 *
 * ...
 *
 * const m1 = new MockModel("console.log(\"Hello World!\");");
 * const m2 = new MockModel("");
 *
 * mockEditor.setModels([m1, m2]);
 *
 * [Execute code where mockEditor.getModel/setModel is called]
 *
 * assert(m1.value === "newValue");
 * assert(m2.value === "secondNewValue");
 *
 */

export const mockEditor = {
  currentModel: (new MockModel() as unknown) as editorType.ITextModel,
  models: [] as editorType.ITextModel[],
  nextModel: 0,

  /**
   * Sets the current model of the editor
   */
  setModel: (model: editorType.ITextModel) => {
    mockEditor.currentModel = model;
  },

  /**
   * Gets the current model of the editor
   */
  getModel: () => mockEditor.currentModel,

  /**
   * Gets the next model to be "created" by the editor.
   * If there are more calls to createModel than there are models initialized
   * in setModel an error will be thrown.
   */
  createModel: () => {
    if (mockEditor.nextModel >= mockEditor.models.length - 1) {
      const createdModel = mockEditor.models[mockEditor.nextModel];
      mockEditor.nextModel++;
      return createdModel;
    } else {
      throw new Error("Too few mock models for test");
    }
  },

  /**
   * Sets the mocked models that will be accessable through createModel.
   */
  setModels: (models: MockModel[]) => {
    mockEditor.models = (models as unknown) as editorType.ITextModel[];
  },

  /**
   * Resets the mock editor for future usage
   */
  reset: () => {
    mockEditor.currentModel = (new MockModel() as unknown) as editorType.ITextModel;
    mockEditor.models = [];
    mockEditor.nextModel = 0;
  }
};
