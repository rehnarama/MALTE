import React, { useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";
import Editor from "../../functions/Editor";
import ReactResizeDetector from "react-resize-detector";
import WelcomeScreen from "./WelcomeScreen";
import { useFileNameContext } from "../../context/FileNameContext";

interface Props {
  darkTheme: boolean;
}

const CodeEditor: React.FC<Props> = (props: Props) => {
  const { darkTheme } = props;
  const [width, setWidth] = React.useState<number | undefined>();
  const [height, setHeight] = React.useState<number | undefined>();
  const [editor, setEditor] = React.useState<Editor | undefined>();
  const { activeFileName, fileToRemove } = useFileNameContext();

  const handler = (_: Function, codeEditor: editorType.ICodeEditor): void => {
    if (editor) {
      editor.changeEditorInstance(codeEditor);
    } else {
      const e = new Editor(codeEditor);
      e.initialize();
      setEditor(e);
    }
  };

  useEffect(() => {
    if (editor && fileToRemove !== "") {
      editor.closeBuffer(fileToRemove);
    }
  }, [fileToRemove, editor]);

  useEffect(() => {
    if (editor && activeFileName !== "") {
      editor.openBuffer(activeFileName);
    }

    if (activeFileName === "" && editor) {
      editor.dispose();
    }
  }, [activeFileName, editor]);

  function resizeTerminal(width: number, height: number) {
    setWidth(width);
    setHeight(height);
  }

  return (
    <>
      <ReactResizeDetector handleWidth handleHeight onResize={resizeTerminal} />
      {activeFileName === "" ? (
        <WelcomeScreen />
      ) : (
        <MonacoEditor
          width={width}
          height={height}
          editorDidMount={handler}
          theme={darkTheme ? "dark" : "light"}
        />
      )}
    </>
  );
};

export default CodeEditor;
