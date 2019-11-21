import React, { useRef, useState } from "react";
import { ControlledEditor as MonacoEditor } from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";
import mapOperations, {
  printInternalOperations
} from "../functions/MapOperations";
import RGA from "rga/dist/RGA";
import Socket from "../functions/Socket";

const CodeEditor: React.FC = () => {
  const editorRef: React.MutableRefObject<
    editorType.ICodeEditor | undefined
  > = useRef();
  const [value, setValue] = useState("");

  const handleEditorDidMount = (
    valueGetter: Function,
    editor: editorType.ICodeEditor
  ): void => {
    console.log("Editor has loaded!");
    editorRef.current = editor;

    const socket = Socket.getInstance().getSocket();
    socket.on("open-buffer", (data: { path: string; content: RGA }) => {
      setValue(RGA.fromRGA(data.content).toString());
    });
    socket.emit("join-buffer", { path: "tmp.js" });

    const currentModel: editorType.IEditorModel | null = editor.getModel();
    if (currentModel) {
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
      language="javascript"
      value={value}
      editorDidMount={handleEditorDidMount}
      onChange={handleEditorChange}
    />
  );
};

export default CodeEditor;
