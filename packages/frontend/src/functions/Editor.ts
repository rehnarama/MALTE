import { editor as editorType } from "monaco-editor";
import File from "./File";
import Monaco from "./Monaco";
import { RGAJSON, RGAOperationJSON } from "rga/dist/RGA";
import Socket from "../functions/Socket";
import RGAIdentifier from "rga/dist/RGAIdentifier";
import CursorWidget from "./CursorWidget/CursorWidget";
import { CursorMovement, CursorList } from "malte-common/dist/Cursor";

interface BufferOperationData {
  path: string;
  operation: RGAOperationJSON;
}

export default class Editor {
  private editor: editorType.ICodeEditor;
  private files: File | undefined;
  private editorNamespace: typeof editorType;

  private widgets = new Map<string, CursorWidget>();

  private cursorList: CursorList = [];

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

      // Changed buffer? Let's update cursors
      this.onCursors(this.cursorList);
    });

    socket.on("cursor/list", (data: CursorList) => {
      this.cursorList = data.filter(c => c.userId !== socket.id);
      this.onCursors(this.cursorList);
    });

    this.editor.onDidChangeCursorPosition(e => {
      if (this.files) {
        const rgaPosition = this.files.getPositionRGA(e.position);
        const movement: CursorMovement = {
          path: this.files.path,
          id: rgaPosition
        };
        socket.emit("cursor/move", movement);
      }
    });
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

  private onCursors(cursors: CursorList): void {
    if (!this.files) {
      return;
    }

    const newWidgets = new Map<string, CursorWidget>();
    for (const cursor of cursors) {
      if (cursor.path !== this.files.path) {
        // We don't want this cursor in our editor!
        continue;
      }
      const userId = cursor.userId;
      let widget = this.widgets.get(userId);
      if (widget === undefined) {
        widget = new CursorWidget(this.editor, this.files, cursor.userId);
        widget.addWidget();
      } else {
        this.widgets.delete(userId);
      }
      newWidgets.set(userId, widget);

      widget.updatePosition(new RGAIdentifier(cursor.id.sid, cursor.id.sum));
    }

    // Clear cursors that weren't updated
    for (const widget of this.widgets.values()) {
      widget.removeWidget();
    }

    this.widgets = newWidgets;
  }
}
