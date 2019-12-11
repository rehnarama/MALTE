import * as React from "react";
import { useState } from "react";
import createUseContext from "constate";

function useFileName() {
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [fileNames, setfileNames] = useState<string[]>([]);
  const [callbacks, setCallbacks] = useState<{
    onRemove?: (path: string) => void;
  }>({});

  const changeActiveFileName = React.useCallback(
    (newName: string) => {
      if (newName !== activeFileName) {
        if (!fileNames.includes(newName)) {
          const newFiles = fileNames.slice();
          newFiles.push(newName);
          setfileNames(newFiles);
        }
        setActiveFileName(newName);
      }
    },
    [activeFileName, fileNames]
  );

  const removeFile = React.useCallback(
    (path: string) => {
      const fileIndex = fileNames.findIndex(f => f === path);
      if (fileIndex >= 0) {
        const newFiles = fileNames.slice();
        newFiles.splice(fileIndex, 1);

        if (activeFileName === path) {
          if (newFiles.length === 0) {
            setActiveFileName(null);
          } else {
            const newActiveFile =
              fileIndex !== 0 ? newFiles[fileIndex - 1] : newFiles[fileIndex];
            setActiveFileName(newActiveFile);
          }
        }

        setfileNames(newFiles);
        if (callbacks.onRemove) {
          callbacks.onRemove(path);
        }
      }
    },
    [callbacks.onRemove, fileNames, activeFileName]
  );

  return {
    activeFileName,
    changeActiveFileName,
    removeFile,
    fileNames,
    setCallbacks
  };
}

export const useFileNameContext = createUseContext(useFileName);
