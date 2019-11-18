import * as React from "react";
import {default as Monaco} from '@monaco-editor/react';


const CodeEditor: React.FC = () => {
  return <Monaco height="75vh" width="80vw" language="javascript" />;
}

export default CodeEditor;