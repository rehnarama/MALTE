import React, { useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";
import Editor from "../../functions/Editor";
import ReactResizeDetector from "react-resize-detector";
import WelcomeScreen from "./WelcomeScreen";
import { useFileNameContext } from "../../context/FileNameContext";

const CodeEditor: React.FC = () => {
  const [width, setWidth] = React.useState<number | undefined>();
  const [height, setHeight] = React.useState<number | undefined>();
  const [editor, setEditor] = React.useState<Editor | undefined>();
  const { activeFileName, fileToRemove } = useFileNameContext();

  const handler = (_: Function, editor: editorType.ICodeEditor): void => {
    const e = new Editor(editor);
    e.initialize();
    setEditor(e);
  };

  useEffect(() => {
    if (editor && activeFileName !== "") {
      editor.openBuffer(activeFileName);
    }
  }, [activeFileName, editor]);

  useEffect(() => {
    if (editor && fileToRemove !== "") {
      editor.closeBuffer(fileToRemove);
    }
  }, [fileToRemove, editor]);

  function resizeTerminal(width: number, height: number) {
    setWidth(width);
    setHeight(height);
  }

  if (activeFileName === "") {
    return (
      <>
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={resizeTerminal}
        />
        <WelcomeScreen />
      </>
    );
  } else {
    return (
      <>
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={resizeTerminal}
        />
        <MonacoEditor width={width} height={height} editorDidMount={handler} />
      </>
    );
  }
};

export default CodeEditor;
