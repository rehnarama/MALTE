import { monaco } from "@monaco-editor/react";
import monacoType, { editor as editorType } from "monaco-editor";
class Monaco {
  private static instance: Monaco;
  private editor: typeof editorType | undefined;
  private monaco: typeof monacoType | undefined;
  static getInstance(): Monaco {
    if (!Monaco.instance) {
      Monaco.instance = new Monaco();
    }
    return Monaco.instance;
  }
  public async initialize(): Promise<void> {
    if (!this.editor) {
      const m = await monaco.init();
      this.monaco = m;
      this.editor = m.editor;
    }
  }
  public getEditorNamespace(): typeof editorType {
    if (this.editor) {
      return this.editor;
    } else {
      throw new Error("Monaco must be initialized before use!");
    }
  }
  public getMonacoNamespace(): typeof monacoType {
    if (this.monaco) {
      return this.monaco;
    } else {
      throw new Error("Monaco must be initialized before use!");
    }
  }
}
export default Monaco;
