import React, { useRef, useState } from "react";
import { ControlledEditor as MonacoEditor } from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";
import mapOperations, {
  printInternalOperations
} from "../functions/MapOperations";
import RGA from "rga/dist/RGA";

const CodeEditor: React.FC<{ socket: SocketIOClient.Socket }> = ({
  socket
}) => {
  const editorRef: React.MutableRefObject<
    editorType.ICodeEditor | undefined
  > = useRef();
  const [value, setValue] = useState("");

  socket.on("open-buffer", (data: { path: string; content: RGA }) => {
    setValue(RGA.fromRGA(data.content).toString());
  });

  const handleEditorDidMount = (
    valueGetter: Function,
    editor: editorType.ICodeEditor
  ): void => {
    console.log("Editor has loaded!");
    editorRef.current = editor;

    const currentModel: editorType.IEditorModel | null = editor.getModel();
    if (currentModel) {
      // Set the EOL of the editor model to LineFeed
      currentModel.onDidChangeContent(
        (event: editorType.IModelContentChangedEvent) => {
          const op = event.changes[0];
          printInternalOperations(mapOperations(op));
        }
      );
    } else {
      console.error("No current model in Monaco editorDidMount");
    }
  };

  const handleEditorChange = (
    _: editorType.IModelContentChangedEvent,
    value: string | undefined
  ): string | undefined => {
    return value ? value.replace("\r\n", "\n") : undefined;
  };

  return (
    <MonacoEditor
      height="75vh"
      width="80vw"
      language="javascript"
      value={value}
      editorDidMount={handleEditorDidMount}
      onChange={handleEditorChange}
    />
  );
};

export default CodeEditor;
