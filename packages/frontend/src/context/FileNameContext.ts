import { useState } from "react";
import createUseContext from "constate";

function useFileName() {
  const [activeFileName, setActiveFileName] = useState("");
  const [fileToRemove, setFileToRemove] = useState("");
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

  const removeFile = (path: string) => {
    const fileIndex = fileNames.findIndex(f => f === path);
    if (fileIndex >= 0) {
      const newFiles = fileNames.slice();
      newFiles.splice(fileIndex, 1);

      if (activeFileName === path) {
        if (newFiles.length === 0) {
          setActiveFileName("");
        } else {
          const newActiveFile =
            fileIndex !== 0 ? newFiles[fileIndex - 1] : newFiles[fileIndex];
          setActiveFileName(newActiveFile);
        }
      }

      setfileNames(newFiles);
      setFileToRemove(path);
    }
  };

  return {
    activeFileName,
    changeActiveFileName,
    fileToRemove,
    removeFile,
    fileNames
  };
}

export const useFileNameContext = createUseContext(useFileName);
