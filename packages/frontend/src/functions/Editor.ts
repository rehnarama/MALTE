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
  private files: File[] = [];
  private activeFile: File | undefined;
  private editorNamespace: typeof editorType;

  private widgets = new Map<string, CursorWidget>();

  private cursorList: CursorList = [];

  constructor(editor: editorType.ICodeEditor) {
    this.editor = editor;
    this.editorNamespace = Monaco.getInstance().getEditorNamespace();
  }

  public initialize() {
    const socket = Socket.getInstance().getSocket();

    socket.on("open-buffer", this.onOpenBuffer);
    socket.on("cursor/list", this.onCursorList);

    this.editor.onDidChangeCursorPosition(e => {
      if (this.activeFile) {
        const rgaPosition = this.activeFile.getPositionRGA(e.position);
        const movement: CursorMovement = {
          path: this.activeFile.path,
          id: rgaPosition
        };
        socket.emit("cursor/move", movement);
      }
    });
  }

  private onCursorList = (data: CursorList) => {
    const socket = Socket.getInstance().getSocket();
    this.cursorList = data.filter(c => c.socketId !== socket.id);
    this.onCursors(this.cursorList);
  };

  private onOpenBuffer = (data: { path: string; content: RGAJSON }) => {
    this.openNewBuffer(data.path, data.content);

    // Changed buffer? Let's update cursors
    this.onCursors(this.cursorList);
  };

  private getFile(path: string): File | undefined {
    return this.files.find(f => f.path === path);
  }

  public openBuffer(path: string) {
    const file = this.getFile(path);
    if (file === undefined) {
      Socket.getInstance()
        .getSocket()
        .emit("join-buffer", {
          path
        });
    } else {
      this.activeFile = file;
      this.editor.setModel(file.model);
    }
  }

  private removeFile(file: File) {
    const fileIndex = this.files.findIndex(f => f.path === file.path);
    if (fileIndex >= 0) {
      this.files.splice(fileIndex, 1);
    }
  }

  public closeBuffer(path: string) {
    const file = this.getFile(path);
    if (file) {
      file.close();
      this.removeFile(file);
    }
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
    this.files.push(file);
    this.activeFile = file;

    this.editor.setModel(newModel);
  }

  private onCursors(cursors: CursorList): void {
    if (!this.activeFile) {
      return;
    }

    const newWidgets = new Map<string, CursorWidget>();
    for (const cursor of cursors) {
      if (cursor.path !== this.activeFile.path) {
        // We don't want this cursor in our editor!
        continue;
      }

      let widget = this.widgets.get(cursor.socketId);
      if (widget === undefined) {
        widget = new CursorWidget(this.editor, this.activeFile, cursor.login);
        widget.addWidget();
      } else {
        this.widgets.delete(cursor.socketId);
      }
      newWidgets.set(cursor.socketId, widget);

      widget.updatePosition(new RGAIdentifier(cursor.id.sid, cursor.id.sum));
    }

    // Clear cursors that weren't updated
    for (const widget of this.widgets.values()) {
      widget.removeWidget();
    }

    this.widgets = newWidgets;
  }

  public dispose() {
    const socket = Socket.getInstance().getSocket();
    socket.off("open-buffer", this.onOpenBuffer);
    socket.off("cursor/list", this.onCursorList);
    this.editor.dispose();
  }
}
