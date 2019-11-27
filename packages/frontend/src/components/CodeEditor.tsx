import React, { useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { editor as editorType } from "monaco-editor";
import { RGAJSON } from "rga/dist/RGA";
import Socket from "../functions/Socket";
import File from "../functions/File";

const CodeEditor: React.FC = () => {
  const editorRef = useRef<editorType.ICodeEditor | undefined>();
  const filesRef = useRef<File>();

  const handleEditorDidMount = (
    valueGetter: Function,
    editor: editorType.ICodeEditor
  ): void => {
    editorRef.current = editor;

    const currentModel: editorType.IEditorModel | null = editor.getModel();
    if (currentModel) {
      currentModel.pushEOL(0);
      const socket = Socket.getInstance().getSocket();
      socket.on("open-buffer", (data: { path: string; content: RGAJSON }) => {
        if (filesRef.current !== undefined) {
          // Close previously open file
          filesRef.current.close();
        }
        const file = new File(data.path, data.content, currentModel);
        filesRef.current = file;
      });
      socket.emit("join-buffer", { path: "tmp.js" });
    } else {
      console.error("No current model in Monaco editorDidMount");
    }
  };

  return (
    <MonacoEditor language="javascript" editorDidMount={handleEditorDidMount} />
  );
};

export default CodeEditor;
