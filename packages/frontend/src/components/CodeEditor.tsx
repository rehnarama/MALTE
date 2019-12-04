import React, { useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";
import Editor from "../functions/Editor";
import classes from "./CodeEditor.module.css";
import ReactResizeDetector from "react-resize-detector";

const CodeEditor: React.FC = () => {
  const [width, setWidth] = React.useState<number | undefined>();
  const [height, setHeight] = React.useState<number | undefined>();

  const editorRef = useRef<Editor | undefined>();
  const [fileName, setFileName] = React.useState("");

  const handler = (_: Function, editor: editorType.ICodeEditor): void => {
    const e = new Editor(editor);
    e.initialize(setFileName);
    editorRef.current = e;
  };

  function resizeTerminal(width: number, height: number) {
    /* console.log(width, height); */
    setWidth(width);
    setHeight(height);
  }

  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "min-content 1fr"
      }}
    >
      <div className={classes.tabBar}>
        <p className={classes.fileName}>{fileName}</p>
      </div>
      <div style={{ minWidth: 0, minHeight: 0 }}>
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={resizeTerminal}
        />
        <MonacoEditor
          width={width}
          height={height}
          language="javascript"
          editorDidMount={handler}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
