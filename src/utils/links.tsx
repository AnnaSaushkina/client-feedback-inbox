import React from "react";

// Парсит текст и оборачивает URL-ы в кликабельные ссылки.
// Отображает hostname вместо полного URL (например "github.com" вместо длинного адреса).
// e.stopPropagation() нужен, чтобы клик по ссылке не открывал TaskCard поверх.
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
    } catch {}
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
