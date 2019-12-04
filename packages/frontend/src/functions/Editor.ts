import { editor as editorType } from "monaco-editor";
import File from "./File";
import Monaco from "./Monaco";
import { RGAJSON, RGAOperationJSON } from "rga/dist/RGA";
import Socket from "../functions/Socket";
import RGAIdentifier from "rga/dist/RGAIdentifier";
import CursorWidget from "./CursorWidget/CursorWidget";

interface RemoteCursor {
  id: RGAIdentifier;
  path: string;
  userId: string;
}

interface BufferOperationData {
  path: string;
  operation: RGAOperationJSON;
}

export default class Editor {
  private editor: editorType.ICodeEditor;
  private files: File | undefined;
  private editorNamespace: typeof editorType;

  private widgets = new Map<string, CursorWidget>();

  constructor(editor: editorType.ICodeEditor) {
    this.editor = editor;
    this.editorNamespace = Monaco.getInstance().getEditorNamespace();
  }

  public initialize() {
    const socket = Socket.getInstance().getSocket();
    socket.on("open-buffer", (data: { path: string; content: RGAJSON }) => {
      if (this.files !== undefined) {
        // Close previously open file
        this.files.close();
      }
      this.openNewBuffer(data.path, data.content);

      /**
       * PROOF OF CONCEPT CODE CAN BE REMOVED WHEN WE ACTUALLY SEND CURSOR DATA
       */
      Socket.getInstance()
        .getSocket()
        .on("buffer-operation", (data: BufferOperationData) => {
          if (this.files && data.path === this.files.path) {
            const id = data.operation.id;
            if (id) {
              this.onCursors([
                {
                  id,
                  userId: "Michael",
                  path: this.files.path
                }
              ]);
            }
          }
        });
      /**
       * END OF PROOF OF CONCEPT CODE
       */
    });
    socket.emit("join-buffer", { path: "tmp.js" });
  }

  private openNewBuffer(path: string, content: RGAJSON) {
    const Uri = Monaco.getInstance().getMonacoNamespace().Uri;
    const newModel = this.editorNamespace.createModel(
      "",
      undefined,
      Uri.file(path)
    );
    newModel.setEOL(this.editorNamespace.EndOfLineSequence.LF);

    const file = new File(path, content, newModel);
    this.files = file;

    this.editor.setModel(newModel);
  }

  private onCursors(cursors: RemoteCursor[]): void {
    if (!this.files) {
      return;
    }

    const newWidgets = new Map<string, CursorWidget>();
    for (const cursor of cursors) {
      const userId = cursor.userId;
      let widget = this.widgets.get(userId);
      if (widget === undefined) {
        widget = new CursorWidget(this.editor, this.files, "abc123");
        widget.addWidget();
      } else {
        this.widgets.delete(userId);
      }
      newWidgets.set(userId, widget);

      widget.updatePosition(cursor.id);
    }

    // Clear cursors that weren't updated
    for (const widget of this.widgets.values()) {
      widget.removeWidget();
    }

    this.widgets = newWidgets;
  }
}
