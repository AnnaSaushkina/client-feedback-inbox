import { describe, it, expect, vi, afterEach } from "vitest";
import { getImagesFromClipboard, readImageFiles } from "../utils/screenshots";

afterEach(() => vi.unstubAllGlobals());

describe("getImagesFromClipboard", () => {
  it("возвращает только файлы с типом image/*", () => {
    const imageFile = new File(["data"], "photo.png", { type: "image/png" });
    const textFile = new File(["text"], "doc.txt", { type: "text/plain" });

    const event = {
      clipboardData: {
        items: [
          { type: "image/png", getAsFile: () => imageFile },
          { type: "text/plain", getAsFile: () => textFile },
        ],
      },
    } as unknown as React.ClipboardEvent;

    const result = getImagesFromClipboard(event);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(imageFile);
  });

  it("возвращает пустой массив если нет изображений", () => {
    const event = {
      clipboardData: { items: [] },
    } as unknown as React.ClipboardEvent;

    expect(getImagesFromClipboard(event)).toHaveLength(0);
  });
});

describe("readImageFiles", () => {
  it("не вызывает onReady для пустого массива", () => {
    const onReady = vi.fn();
    readImageFiles([], onReady);
    expect(onReady).not.toHaveBeenCalled();
  });

  it("не вызывает onReady если нет изображений", () => {
    const textFile = new File(["text"], "doc.txt", { type: "text/plain" });
    const onReady = vi.fn();
    readImageFiles([textFile], onReady);
    expect(onReady).not.toHaveBeenCalled();
  });

  it("читает изображения и вызывает onReady с base64", () => {
    const file = new File([], "photo.png", { type: "image/png" });
    const onReady = vi.fn();

    class MockFileReader {
      result = "data:image/png;base64,abc123";
      onload: (() => void) | null = null;
      readAsDataURL() {
        this.onload?.();
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);
    readImageFiles([file], onReady);
    expect(onReady).toHaveBeenCalledWith(["data:image/png;base64,abc123"]);
  });
});
