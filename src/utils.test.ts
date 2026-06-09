import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getDeadlineColor,
  formatDeadline,
  getImagesFromClipboard,
  readImageFiles,
} from "./utils";
import { isValidTransition, VALID_TRANSITIONS } from "./constants";

const HOUR = 1000 * 60 * 60;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-11T12:00:00Z"));
});

afterEach(() => vi.useRealTimers());

describe("getDeadlineColor", () => {
  it("возвращает purple когда дедлайн не задан", () => {
    expect(getDeadlineColor(undefined)).toBe("purple");
  });

  it("возвращает red когда дедлайн просрочен", () => {
    expect(getDeadlineColor(new Date(Date.now() - HOUR).toISOString())).toBe(
      "red",
    );
  });

  it("возвращает orange когда дедлайн через < 24 часов", () => {
    expect(
      getDeadlineColor(new Date(Date.now() + 2 * HOUR).toISOString()),
    ).toBe("orange");
  });

  it("возвращает purple когда дедлайн через > 24 часов", () => {
    expect(
      getDeadlineColor(new Date(Date.now() + 48 * HOUR).toISOString()),
    ).toBe("purple");
  });
});

describe("formatDeadline", () => {
  it("возвращает null когда дедлайн не задан", () => {
    expect(formatDeadline(undefined)).toBeNull();
  });

  it("возвращает строку для валидной даты", () => {
    const result = formatDeadline(
      new Date("2026-05-20T10:00:00Z").toISOString(),
    );
    expect(typeof result).toBe("string");
    expect(result!.length).toBeGreaterThan(0);
  });
});

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
    const onReady = vi.fn();
    readImageFiles(
      [new File(["text"], "doc.txt", { type: "text/plain" })],
      onReady,
    );
    expect(onReady).not.toHaveBeenCalled();
  });

  it("читает изображения и вызывает onReady с base64", () => {
    class MockFileReader {
      result = "data:image/png;base64,abc123";
      onload: (() => void) | null = null;
      readAsDataURL() {
        this.onload?.();
      }
    }
    vi.stubGlobal("FileReader", MockFileReader);

    const onReady = vi.fn();
    readImageFiles([new File([], "photo.png", { type: "image/png" })], onReady);
    expect(onReady).toHaveBeenCalledWith(["data:image/png;base64,abc123"]);
  });
});

describe("граф переходов статусов", () => {
  it("переход в ту же колонку всегда валиден", () => {
    expect(isValidTransition("свободно", "свободно")).toBe(true);
    expect(isValidTransition("в_работе", "в_работе")).toBe(true);
    expect(isValidTransition("ожидание", "ожидание")).toBe(true);
    expect(isValidTransition("тестирование", "тестирование")).toBe(true);
  });

  it("разрешённые переходы", () => {
    expect(isValidTransition("свободно", "в_работе")).toBe(true);
    expect(isValidTransition("в_работе", "свободно")).toBe(true);
    expect(isValidTransition("в_работе", "ожидание")).toBe(true);
    expect(isValidTransition("ожидание", "в_работе")).toBe(true);
    expect(isValidTransition("в_работе", "тестирование")).toBe(true);
    expect(isValidTransition("тестирование", "в_работе")).toBe(true);
  });

  it("запрещённые переходы", () => {
    expect(isValidTransition("свободно", "ожидание")).toBe(false);
    expect(isValidTransition("ожидание", "свободно")).toBe(false);
    expect(isValidTransition("свободно", "тестирование")).toBe(false);
    expect(isValidTransition("ожидание", "тестирование")).toBe(false);
    expect(isValidTransition("тестирование", "свободно")).toBe(false);
    expect(isValidTransition("тестирование", "ожидание")).toBe(false);
  });

  it("граф симметричен только для разрешённых рёбер", () => {
    for (const [from, targets] of Object.entries(VALID_TRANSITIONS)) {
      for (const to of targets) {
        expect(
          isValidTransition(from as import("./types").TaskStatus, to),
        ).toBe(true);
      }
    }
  });
});
