/* eslint-disable @typescript-eslint/no-unused-vars */

import monaco, {
  editor as editorType,
  IDisposable,
  IRange,
  Position
} from "monaco-editor";

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

function dummyRange(): IRange {
  return range(1, 1, 1, 1);
}

export class MockModel {
  public value = "";
  public listener: undefined | Function = undefined;

  constructor(value?: string) {
    if (value) {
      this.value = value;
    }
  }

  public getPositionAt(offset: number): Position {
    return ({ offset } as unknown) as Position;
  }

  public setValue(newValue: string) {
    this.value = newValue;
  }

  public setEOL(eol: editorType.EndOfLineSequence) {
    return;
  }

  public applyEdits(edits: editorType.IIdentifiedSingleEditOperation[]) {
    const operations = [];
    for (const edit of edits) {
      let monacoOp = {};
      if (edit.text) {
        const offset = ((edit.range as unknown) as {
          start: number;
          end: number;
        }).start;
        this.setValue(
          this.value.slice(0, offset) + edit.text + this.value.slice(offset)
        );
        monacoOp = {
          range: dummyRange(),
          rangeLength: 0,
          text: edit.text,
          rangeOffset: offset,
          forceMoveMarkers: false
        };
      } else {
        const range = (edit.range as unknown) as {
          start: number;
          end: number;
        };
        const start = range.start;
        const end = range.end;
        this.setValue(this.value.slice(0, start) + this.value.slice(end));
        monacoOp = {
          range: dummyRange(),
          rangeLength: end - start,
          text: "",
          rangeOffset: start,
          forceMoveMarkers: false
        };
      }
      operations.push(monacoOp);
    }

    if (this.listener) {
      this.listener({
        changes: operations,
        eol: "",
        isFlush: false,
        isRedoing: false,
        isUndoing: false,
        versionId: 1
      });
    }
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

  public dispose() {
    // eslint-disable-line
  }
}

/**
 * Usage:
 *
 * import {mockEditorNamespace, MockModel} from ""./testutils/MockMonaco";
 *
 * ...
 *
 * const m1 = new MockModel("");
 * const m2 = new MockModel("");
 *
 * mockEditorNamespace.setModels([m1, m2]);
 *
 * [Execute code where mockEditorNamespace.createModel is called]
 *
 * assert(m1.value === "newValue");
 * assert(m2.value === "secondNewValue");
 *
 */
export const mockEditorNamespace = {
  EndOfLineSequence: { LF: 0 },

  models: [] as MockModel[],
  nextModel: 0,

  /**
   * Gets the next model to be "created" by the editor.
   * If there are more calls to createModel than there are models initialized
   * in setModel an error will be thrown.
   */
  createModel: (value: string, language?: string): editorType.ITextModel => {
    if (
      mockEditorNamespace.nextModel >=
      mockEditorNamespace.models.length - 1
    ) {
      const createdModel =
        mockEditorNamespace.models[mockEditorNamespace.nextModel];
      mockEditorNamespace.nextModel++;
      createdModel.value = value;
      return (createdModel as unknown) as editorType.ITextModel;
    } else {
      throw new Error("Too few mock models for test");
    }
  },

  /**
   * Sets the mocked models that will be accessable through createModel.
   */
  setModels: (models: MockModel[]) => {
    mockEditorNamespace.models = models;
  },

  /**
   * Resets the mock editor for future usage
   */
  reset: () => {
    mockEditorNamespace.models = [];
    mockEditorNamespace.nextModel = 0;
  }
};

export const mockMonacoNamespace = {
  Range: {
    fromPositions(start: Position, end?: Position): Range {
      const startOffset = ((start as unknown) as { offset: number }).offset;
      const endOffset = end
        ? ((end as unknown) as { offset: number }).offset
        : startOffset;
      return ({ start: startOffset, end: endOffset } as unknown) as Range;
    }
  }
};

export const mockICodeEditor = {
  currentModel: (new MockModel() as unknown) as editorType.ITextModel,

  /**
   * Sets the current model of the editor
   */
  setModel: (model: editorType.ITextModel) => {
    mockICodeEditor.currentModel = model;
  },

  /**
   * Gets the current model of the editor
   */
  getModel: () => mockICodeEditor.currentModel
};

import Monaco from "../Monaco";
Monaco.getInstance = () => {
  const m = new Monaco();
  m["editor"] = (mockEditorNamespace as unknown) as typeof editorType;
  m["monaco"] = (mockMonacoNamespace as unknown) as typeof monaco;
  return m;
};
