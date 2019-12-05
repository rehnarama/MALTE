import { useState } from "react";
import createUseContext from "constate";

function useFileName() {
  const [fileName, setFileName] = useState("");
  const changeFileName = (newName: string) => setFileName(newName);
  return { fileName, changeFileName };
}

export const useFileNameContext = createUseContext(useFileName);
