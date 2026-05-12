const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?|avif)$/i;

export function readImageFiles(
  files: File[],
  onReady: (base64s: string[]) => void,
): void {
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
