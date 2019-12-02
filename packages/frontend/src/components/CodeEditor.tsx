import React, { useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";
import Editor from "../functions/Editor";

const CodeEditor: React.FC = () => {
  const editorRef = useRef<Editor | undefined>();

  const handler = (_: Function, editor: editorType.ICodeEditor): void => {
    console.log("Editor has loaded!");
    const e = new Editor(editor);
    e.initialize();
    editorRef.current = e;
  };

  return <MonacoEditor language="javascript" editorDidMount={handler} />;
};

export default CodeEditor;
