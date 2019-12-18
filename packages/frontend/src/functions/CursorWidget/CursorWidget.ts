import * as monaco from "monaco-editor";
import reactMonaco from "../Monaco";
import File from "../File";
import RGAIdentifier from "rga/dist/RGAIdentifier";
import BubbleWidget from "./BubbleWidget";
import classes from "./Widget.module.css";

const WIDGET_PREFIX = "cursor";
const HOVER_TOLERANCE = 20;

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
  private bubbleWidgetAdded = false;

  private mouseMoveListener: monaco.IDisposable | null = null;

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

  private calculatePosition(id: RGAIdentifier, offset: number): void {
    const model = this.editor.getModel();
    if (model) {
      // +1 since the cursor has an "extra" position in comparison to number of
      // indices (i.e., cursor can both be BEFORE all text, and AFTER all text)
      const position = model.getPositionAt(this.file.getIndex(id, offset) + 1);
      this.position = position;
    }
  }

  /**
   * Updates the position of this cursor
   * @param id  Where in the document (currently open in the file given in the
   * constructor) this cursor should be
   */
  updatePosition(id: RGAIdentifier, offset: number) {
    this.calculatePosition(id, offset);
    this.bubbleWidget.updatePosition(this.position);
    this.editor.layoutContentWidget(this);
    this.editor.layoutContentWidget(this.bubbleWidget);
  }

  /**
   * Adds this cursor to the editor
   */
  addWidget() {
    this.editor.addContentWidget(this);
    this.mouseMoveListener = this.editor.onMouseMove(e => {
      const caretRect = this.getDomNode().getBoundingClientRect();
      const bubbleRect = this.bubbleWidget.getDomNode().getBoundingClientRect();
      const minDistanceCaret = this.getClosestDistance(
        e.event.posx,
        e.event.posy,
        caretRect
      );
      const minDistanceBubble = this.getClosestDistance(
        e.event.posx,
        e.event.posy,
        bubbleRect
      );
      const minDistance = Math.min(minDistanceCaret, minDistanceBubble);
      const isHovering = minDistance < HOVER_TOLERANCE;

      if (!this.bubbleWidgetAdded && isHovering) {
        this.editor.addContentWidget(this.bubbleWidget);
        this.bubbleWidgetAdded = true;
      } else if (this.bubbleWidgetAdded && !isHovering) {
        this.editor.removeContentWidget(this.bubbleWidget);
        this.bubbleWidgetAdded = false;
      }
    });
  }

  private getClosestDistance(posX: number, posY: number, rect: DOMRect) {
    if (
      posX > rect.left &&
      posX < rect.right &&
      posY > rect.top &&
      posY < rect.bottom
    ) {
      // We are inside rect, just return 0
      return 0;
    } else {
      const deltaX = Math.min(
        Math.abs(posX - rect.left),
        Math.abs(posX - rect.right)
      );
      const deltaY = Math.min(
        Math.abs(posY - rect.top),
        Math.abs(posY - rect.bottom)
      );
      return Math.max(deltaX, deltaY);
    }
  }

  /**
   * Removes this cursor from the editor
   */
  removeWidget() {
    this.editor.removeContentWidget(this);
    if (this.bubbleWidgetAdded) {
      this.editor.removeContentWidget(this.bubbleWidget);
    }
    if (this.mouseMoveListener) {
      this.mouseMoveListener.dispose();
    }
  }
}

export default CursorWidget;
