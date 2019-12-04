import React, { useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";
import Editor from "../functions/Editor";
import ReactResizeDetector from "react-resize-detector";

const CodeEditor: React.FC = () => {
  const [width, setWidth] = React.useState<number | undefined>();
  const [height, setHeight] = React.useState<number | undefined>();

  const editorRef = useRef<Editor | undefined>();

  const handler = (_: Function, editor: editorType.ICodeEditor): void => {
    const e = new Editor(editor);
    e.initialize();
    editorRef.current = e;
  };

  function resizeTerminal(width: number, height: number) {
    setWidth(width);
    setHeight(height);
  }

  return (
    <>
      <ReactResizeDetector handleWidth handleHeight onResize={resizeTerminal} />
      <MonacoEditor
        width={width}
        height={height}
        language="javascript"
        editorDidMount={handler}
      />
    </>
  );
};

export default CodeEditor;
