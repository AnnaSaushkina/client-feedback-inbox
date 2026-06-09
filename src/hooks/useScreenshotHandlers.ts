import { useRef } from "react";
import { readImageFiles, getImagesFromClipboard } from "../utils";

export function useScreenshotHandlers(onAdd: (base64s: string[]) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = getImagesFromClipboard(e);
    if (files.length) readImageFiles(files, onAdd);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    readImageFiles(Array.from(e.target.files), onAdd);
    e.target.value = "";
  };

  return { fileInputRef, handlePaste, handleFileUpload };
}
