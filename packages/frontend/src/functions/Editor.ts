import { editor as editorType } from "monaco-editor";
import File from "./File";
import Monaco from "./Monaco";
import { RGAJSON } from "rga/dist/RGA";
import Socket from "../functions/Socket";

export default class Editor {
  private editor: editorType.ICodeEditor;
  private files: File | undefined;
  private editorNamespace: typeof editorType;

  constructor(editor: editorType.ICodeEditor) {
    this.editor = editor;
    this.editorNamespace = Monaco.getInstance().getEditorNamespace();
  }

  public initialize(setFileName: React.Dispatch<React.SetStateAction<string>>) {
    const socket = Socket.getInstance().getSocket();
    socket.on("open-buffer", (data: { path: string; content: RGAJSON }) => {
      if (this.files !== undefined) {
        // Close previously open file
        this.files.close();
      }
      this.openNewBuffer(data.path, data.content);
      const fileName = data.path.split("/").pop(); // possible to improve?
      if (fileName) setFileName(fileName);
    });
    socket.emit("join-buffer", { path: "tmp.js" });
  }

  private openNewBuffer(path: string, content: RGAJSON) {
    const newModel = this.editorNamespace.createModel("", "javascript");
    newModel.pushEOL(this.editorNamespace.EndOfLineSequence.LF);

    const file = new File(path, content, newModel);
    this.files = file;

    this.editor.setModel(newModel);
  }
}
