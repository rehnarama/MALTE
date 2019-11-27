import { editor as editorType } from "monaco-editor";
import File from "./File";
import Monaco from "./Monaco";
import { RGAJSON } from "rga/dist/RGA";
import Socket from "../functions/Socket";

export default class Editor {
  private editor: editorType.ICodeEditor;
  private files: File[] = [];
  private editorNamespace: typeof editorType;

  constructor(editor: editorType.ICodeEditor) {
    this.editor = editor;
    this.editorNamespace = Monaco.getInstance().getEditorNamespace();
  }

  public initialize() {
    const currentModel: editorType.IEditorModel | null = this.editor.getModel();
    if (currentModel) {
      const socket = Socket.getInstance().getSocket();
      socket.on("open-buffer", (data: { path: string; content: RGAJSON }) => {
        this.openNewBuffer(data.path, data.content);
      });
      socket.emit("join-buffer", { path: "tmp.js" });
    } else {
      console.error("No current model in Monaco editorDidMount");
    }
  }

  private openNewBuffer(path: string, content: RGAJSON) {
    const newModel = this.editorNamespace.createModel("");
    newModel.pushEOL(this.editorNamespace.EndOfLineSequence.LF);

    const file = new File(path, content, newModel);
    this.files.push(file);

    this.editor.setModel(newModel);
  }
}
