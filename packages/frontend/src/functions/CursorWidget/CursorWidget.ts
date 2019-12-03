import * as monaco from "monaco-editor";
import reactMonaco from "../Monaco";
import File from "../File";
import RGAIdentifier from "rga/dist/RGAIdentifier";
import BubbleWidget from "./BubbleWidget";
import classes from "./Widget.module.css";

const WIDGET_PREFIX = "cursor";

/**
 * A Monaco Content Widget that represents another persons cursor
 */
class CursorWidget implements monaco.editor.IContentWidget {
  private editor: monaco.editor.ICodeEditor;
  private file: File;
  private userId: string;

  private domNode: HTMLElement;

  private position: monaco.IPosition = { column: 0, lineNumber: 0 };

  private bubbleWidget: BubbleWidget;

  /**
   * @param editor  An instance of the monaco editor. The cursor will be drawn
   * upon this editor
   * @param file    The file that is currently open in the editor
   * @param userId  The cursor represnts this users id. This will also be shown
   * in the bubble displayed over the cursor
   * @param color   The color of the cursor
   */
  public constructor(
    editor: monaco.editor.ICodeEditor,
    file: File,
    userId: string,
    color = "#f44336"
  ) {
    this.editor = editor;
    this.file = file;

    this.userId = userId;

    this.domNode = document.createElement("div");
    this.domNode.className = classes.widget;
    this.domNode.style.background = color;
    this.domNode.style.width = "2px";
    this.domNode.style.height = `${editor.getConfiguration().lineHeight}px`;

    this.bubbleWidget = new BubbleWidget(userId, color);
  }

  getId(): string {
    return `${WIDGET_PREFIX}:${this.userId}`;
  }
  getDomNode(): HTMLElement {
    return this.domNode;
  }
  getPosition(): monaco.editor.IContentWidgetPosition {
    return {
      position: this.position,
      preference: [
        reactMonaco.getInstance().getEditorNamespace()
          .ContentWidgetPositionPreference.EXACT
      ]
    };
  }

  private calculatePosition(id: RGAIdentifier): void {
    const model = this.editor.getModel();
    if (model) {
      const position = model.getPositionAt(this.file.getIndex(id));
      this.position = position;
    }
  }

  /**
   * Updates the position of this cursor
   * @param id  Where in the document (currently open in the file given in the
   * constructor) this cursor should be
   */
  updatePosition(id: RGAIdentifier) {
    this.calculatePosition(id);
    this.bubbleWidget.updatePosition(this.position);
    this.editor.layoutContentWidget(this);
    this.editor.layoutContentWidget(this.bubbleWidget);
  }

  /**
   * Adds this cursor to the editor
   */
  addWidget() {
    this.editor.addContentWidget(this);
    this.editor.addContentWidget(this.bubbleWidget);
  }

  /**
   * Removes this cursor from the editor
   */
  removeWidget() {
    this.editor.removeContentWidget(this);
    this.editor.removeContentWidget(this.bubbleWidget);
  }
}

export default CursorWidget;
