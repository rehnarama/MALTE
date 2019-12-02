import { monaco } from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";

class Monaco {
  private static instance: Monaco;
  private editor: typeof editorType | undefined;

  static getInstance(): Monaco {
    if (!Monaco.instance) {
      Monaco.instance = new Monaco();
    }
    return Monaco.instance;
  }

  public async initialize(): Promise<void> {
    const m = await monaco.init();
    this.editor = m.editor;
  }

  public getEditorNamespace(): typeof editorType {
    if (this.editor) {
      return this.editor;
    } else {
      throw new Error("Monaco must be initialized before use!");
    }
  }
}

export default Monaco;
