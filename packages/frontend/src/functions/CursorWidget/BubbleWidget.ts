import * as monaco from "monaco-editor";
import reactMonaco from "../Monaco";
import classes from "./Widget.module.css";

const WIDGET_PREFIX = "bubble";

/**
 * A Monaco Content Widget that represents the "bubble" over another persons
 * cursor
 */
class BubbleWidget implements monaco.editor.IContentWidget {
  private userId: string;

  private domNode: HTMLElement;

  private position: monaco.IPosition = { column: 0, lineNumber: 0 };

  /**
   * @param userId This will be displayed inside the bubble
   * @param color This will be the background color of the bubble
   */
  public constructor(userId: string, color = "#f44336") {
    this.userId = userId;

    this.domNode = document.createElement("div");
    this.domNode.className = `${classes.widget} ${classes.bubble}`;
    this.domNode.innerHTML = userId;
    this.domNode.style.background = color;
    this.domNode.style.padding = "8px";
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
          .ContentWidgetPositionPreference.ABOVE,
        reactMonaco.getInstance().getEditorNamespace()
          .ContentWidgetPositionPreference.BELOW
      ]
    };
  }

  /**
   * Updates this widget with a new monaco position
   * @param position The position to update to
   */
  updatePosition(position: monaco.IPosition) {
    this.position = position;
  }
}

export default BubbleWidget;
