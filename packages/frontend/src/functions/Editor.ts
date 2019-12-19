import { editor as editorType } from "monaco-editor";
import File from "./File";
import Monaco from "./Monaco";
import { RGAJSON } from "rga/dist/RGA";
import Socket from "../functions/Socket";
import CursorWidget from "./CursorWidget/CursorWidget";
import { CursorMovement, CursorList } from "malte-common/dist/Cursor";

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

    socket.on("buffer/open", this.onOpenBuffer);
    socket.on("cursor/list", this.onCursorList);

    this.initCursorChangeListener();
  }

  private onCursorList = (data: CursorList) => {
    const socket = Socket.getInstance().getSocket();
    this.cursorList = data.filter(c => c.socketId !== socket.id);
    this.onCursors(this.cursorList);
  };

  private onOpenBuffer = (data: { path: string; content: RGAJSON }) => {
    this.openNewBuffer(data.path, data.content);
    this.focus();
  };

  private initCursorChangeListener() {
    const socket = Socket.getInstance().getSocket();
    this.editor.onDidChangeCursorSelection(e => {
      if (this.activeFile) {
        const [fromId, fromOffset] = this.activeFile.getPositionRGA({
          lineNumber: e.selection.selectionStartLineNumber,
          column: e.selection.selectionStartColumn
        });
        const [toId, toOffset] = this.activeFile.getPositionRGA({
          lineNumber: e.selection.positionLineNumber,
          column: e.selection.positionColumn
        });
        const movement: CursorMovement = {
          path: this.activeFile.path,
          to: { ...toId, offset: toOffset },
          from: { ...fromId, offset: fromOffset }
        };
        socket.emit("cursor/move", movement);
      }
    });
  }

  private getFile(path: string): File | undefined {
    return this.files.find(f => f.path === path);
  }

  public openBuffer(path: string) {
    const file = this.getFile(path);
    if (file === undefined) {
      Socket.getInstance()
        .getSocket()
        .emit("buffer/join", {
          path
        });
    } else {
      this.changeTab(file);
    }
  }

  private changeTab(file: File) {
    if (this.activeFile) {
      this.activeFile.setViewState(this.editor.saveViewState());
    }
    this.activeFile = file;
    this.editor.setModel(file.model);
    this.onCursors(this.cursorList);

    const activeFileViewState = this.activeFile.getViewState();
    if (activeFileViewState) {
      this.editor.restoreViewState(activeFileViewState);
    }
    this.focus();
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
    const newModel = this.getModelForBuffer(path);

    const file = new File(path, content, newModel);
    this.files.push(file);

    this.changeTab(file);
  }

  private getModelForBuffer(path: string) {
    const Uri = Monaco.getInstance().getMonacoNamespace().Uri;
    const model = this.editorNamespace.getModel(Uri.file(path));
    if (model) {
      return model;
    } else {
      const newModel = this.editorNamespace.createModel(
        "",
        undefined,
        Uri.file(path)
      );
      return newModel;
    }
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

      widget.updatePosition(cursor);
    }

    // Clear cursors that weren't updated
    for (const widget of this.widgets.values()) {
      widget.removeWidget();
    }

    this.widgets = newWidgets;
  }

  /**
   * Bring browser focus to the text editor
   */
  private focus() {
    this.editor.focus();
  }

  public dispose() {
    const socket = Socket.getInstance().getSocket();
    socket.off("buffer/open", this.onOpenBuffer);
    socket.off("cursor/list", this.onCursorList);
    for (const file of this.files) {
      file.close();
    }
    this.editor.dispose();
  }
}
