import React, { useRef } from "react";
import { default as MonacoEditor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import mapOperations, {
  printInternalOperations
} from "../functions/MapOperations";

const CodeEditor: React.FC = () => {
  const editorRef: React.MutableRefObject<
    monaco.editor.ICodeEditor | undefined
  > = useRef();

  const handleEditorDidMount = (
    valueGetter: Function,
    editor: monaco.editor.ICodeEditor
  ): void => {
    console.log("Editor has loaded!");
    editorRef.current = editor;

    const currentModel: monaco.editor.IEditorModel | null = editor.getModel();
    if (currentModel) {
      // Set the EOL of the editor model to LineFeed
      currentModel.pushEOL(monaco.editor.EndOfLineSequence.LF);
      currentModel.onDidChangeContent(
        (event: monaco.editor.IModelContentChangedEvent) => {
          const op = event.changes[0];
          printInternalOperations(mapOperations(op));
        }
      );
    } else {
      console.error("No current model in Monaco editorDidMount");
    }
  };

  return (
    <MonacoEditor
      height="75vh"
      width="80vw"
      language="javascript"
      editorDidMount={handleEditorDidMount}
    />
  );
};

export default CodeEditor;
