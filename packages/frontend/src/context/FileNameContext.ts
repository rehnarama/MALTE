import * as React from "react";
import { useState } from "react";
import createUseContext from "constate";

function useFileName() {
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [fileNames, setfileNames] = useState<string[]>([]);
  const [callbacks, setCallbacks] = useState<{
    onRemove?: (paths: string[]) => void;
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
    (paths: string[]) => {
      const newFiles = fileNames.slice();
      let newActiveFile: string | null = activeFileName;

      for (const path of paths) {
        const fileIndex = newFiles.findIndex(f => f === path);
        if (fileIndex >= 0) {
          newFiles.splice(fileIndex, 1);
          if (newActiveFile === path && newFiles.length > 0) {
            newActiveFile =
              fileIndex !== 0 ? newFiles[fileIndex - 1] : newFiles[fileIndex];
          }
        }
      }

      setActiveFileName(newFiles.length === 0 ? null : newActiveFile);
      setfileNames(newFiles);
      if (callbacks.onRemove) {
        callbacks.onRemove(paths);
      }
    },
    [callbacks, fileNames, activeFileName]
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
