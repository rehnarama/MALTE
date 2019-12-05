import { useState } from "react";
import createUseContext from "constate";

function useFileName() {
  const [activeFileName, setActiveFileName] = useState("");
  const [fileNames, setfileNames] = useState<string[]>([]);
  const changeActiveFileName = (newName: string) => {
    if (newName !== activeFileName) {
      if (!fileNames.includes(newName)) {
        const newFiles = fileNames.slice();
        newFiles.push(newName);
        setfileNames(newFiles);
      }
      setActiveFileName(newName);
    }
  };
  return { activeFileName, fileNames, changeActiveFileName };
}

export const useFileNameContext = createUseContext(useFileName);
