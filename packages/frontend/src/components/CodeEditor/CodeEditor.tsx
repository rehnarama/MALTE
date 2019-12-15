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

  const { activeFileName, setCallbacks } = useFileNameContext();
  useEffect(() => {
    setCallbacks({
      onRemove: paths => {
        if (editor) {
          for (const path of paths) {
            editor.closeBuffer(path);
          }
        }
      }
    });
  }, [editor, setCallbacks]);

  const handler = (_: Function, codeEditor: editorType.ICodeEditor): void => {
    const e = new Editor(codeEditor);
    e.initialize();
    setEditor(e);
  };

  useEffect(() => {
    if (editor && activeFileName !== null) {
      editor.openBuffer(activeFileName);
    }
  }, [activeFileName, editor]);

  function resizeTerminal(width: number, height: number) {
    setWidth(width);
    setHeight(height);
  }

  const showWelcomeScreen = activeFileName === null;
  const displayWelcomeScreen = showWelcomeScreen ? "inline-block" : "none";
  const displayEditor = !showWelcomeScreen ? "inline-block" : "none";

  return (
    <>
      <ReactResizeDetector handleWidth handleHeight onResize={resizeTerminal} />
      <div style={{ width, height, display: displayWelcomeScreen }}>
        <WelcomeScreen />
      </div>
      <div style={{ width, height, display: displayEditor }}>
        <MonacoEditor
          width={width}
          height={height}
          editorDidMount={handler}
          theme={darkTheme ? "dark" : "light"}
        />
      </div>
    </>
  );
};

export default CodeEditor;
