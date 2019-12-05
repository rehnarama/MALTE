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
  const { fileName } = useFileNameContext();

  const handler = (_: Function, editor: editorType.ICodeEditor): void => {
    const e = new Editor(editor);
    e.initialize();
    setEditor(e);
  };

  useEffect(() => {
    if (editor) {
      editor.openBuffer(fileName);
    }
  }, [fileName, editor]);

  function resizeTerminal(width: number, height: number) {
    setWidth(width);
    setHeight(height);
  }
  if (fileName === "") {
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
        <MonacoEditor
          width={width}
          height={height}
          editorDidMount={handler}
          theme={darkTheme ? "dark" : "light"}
        />
      </>
    );
  }
};

export default CodeEditor;
