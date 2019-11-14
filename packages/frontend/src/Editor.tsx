import * as React from "react";
import {default as Monaco} from '@monaco-editor/react';


const Editor: React.FC = () => {
  return <Monaco height="60vh" width="50vw" language="javascript" />;
}
export default Editor;
