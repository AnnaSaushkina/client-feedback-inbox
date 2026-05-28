import React from "react";

// --- deadline ---

const HOURS_IN_DAY = 24;
const MS_IN_HOUR = 1000 * 60 * 60;

export const getDeadlineColor = (deadline?: string): string => {
  if (!deadline) return "purple";
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / MS_IN_HOUR;
  if (hoursLeft < 0) return "red";
  if (hoursLeft < HOURS_IN_DAY) return "orange";
  return "purple";
};

export const formatDeadline = (deadline?: string): string | null => {
  if (!deadline) return null;
  return new Date(deadline).toLocaleString("ru", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- links ---

export function renderWithLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const url = match[0];
    let shortText = url;
    try {
      shortText = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      // невалидный URL — оставляем полный текст
    }
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{ color: "#4096ff" }}
      >
        {shortText}
      </a>,
    );
    lastIndex = match.index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// --- screenshots ---

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?|avif)$/i;

export function readImageFiles(files: File[], onReady: (base64s: string[]) => void): void {
  const imageFiles = files.filter(
    (f) => f.type.startsWith("image/") || IMAGE_EXTENSIONS.test(f.name),
  );
  if (!imageFiles.length) return;
  let done = 0;
  const results: string[] = new Array(imageFiles.length);
  imageFiles.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = () => {
      results[i] = reader.result as string;
      if (++done === imageFiles.length) onReady(results);
    };
    reader.readAsDataURL(file);
  });
}

export function getImagesFromClipboard(e: React.ClipboardEvent): File[] {
  const files: File[] = [];
  for (const item of e.clipboardData.items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  return files;
}
