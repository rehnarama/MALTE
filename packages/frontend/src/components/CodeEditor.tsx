import React, { useRef } from "react";
import {default as Monaco, monaco} from '@monaco-editor/react';
import mapOperations, { printInternalOperations } from "../functions/MapOperations";


const CodeEditor: React.FC = () => {
  const editorRef = useRef();


  const handleEditorDidMount = (valueGetter: any, editor: any) => {
    console.log("Editor has loaded!");
    editorRef.current = editor;

    // Set the EOL of the editor model to LineFeed
    monaco.init().then(monacoInstance => {
      editor.getModel().pushEOL(monacoInstance.editor.EndOfLineSequence.LF);
    });

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
