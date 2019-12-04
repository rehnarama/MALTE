import React, { useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";
import Editor from "../functions/Editor";
import classes from "./CodeEditor.module.css";

const CodeEditor: React.FC = () => {
  const editorRef = useRef<Editor | undefined>();
  const [fileName, setFileName] = React.useState("");

  const handler = (_: Function, editor: editorType.ICodeEditor): void => {
    const e = new Editor(editor);
    e.initialize(setFileName);
    editorRef.current = e;
  };

  return (
    <>
      <div className={classes.filename}>{fileName}</div>
      <MonacoEditor language="javascript" editorDidMount={handler} />
    </>
  );
};

export default CodeEditor;
