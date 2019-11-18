import React, { useRef } from "react";
import {default as Monaco} from '@monaco-editor/react';
import mapOperations, { printInternalOperations } from "../functions/MapOperations";


const CodeEditor: React.FC = () => {
  const editorRef = useRef();


  const handleEditorDidMount = (valueGetter: any, editor: any) => {
    console.log("Editor has loaded!");
    editorRef.current = editor;
    editor.getModel().onDidChangeContent((event: any) => {
      const op = event.changes[0];
      printInternalOperations(mapOperations(op));
    })
  }

  return <Monaco 
    height="75vh"
    width="80vw"
    language="javascript"
    editorDidMount={handleEditorDidMount}
  />;
}

export default CodeEditor;