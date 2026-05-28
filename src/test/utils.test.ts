import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDeadlineColor, formatDeadline } from "../utils";
import { getImagesFromClipboard, readImageFiles } from "../utils";
import { isValidTransition, VALID_TRANSITIONS } from "../constants";

// --- deadline ---

const HOUR = 1000 * 60 * 60;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-11T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getDeadlineColor", () => {
  it("возвращает purple когда дедлайн не задан", () => {
    expect(getDeadlineColor(undefined)).toBe("purple");
  });

  it("возвращает red когда дедлайн просрочен", () => {
    const past = new Date(Date.now() - HOUR).toISOString();
    expect(getDeadlineColor(past)).toBe("red");
  });

  it("возвращает orange когда дедлайн через < 24 часов", () => {
    const soon = new Date(Date.now() + 2 * HOUR).toISOString();
    expect(getDeadlineColor(soon)).toBe("orange");
  });

  it("возвращает purple когда дедлайн через > 24 часов", () => {
    const later = new Date(Date.now() + 48 * HOUR).toISOString();
    expect(getDeadlineColor(later)).toBe("purple");
  });
});

describe("formatDeadline", () => {
  it("возвращает null когда дедлайн не задан", () => {
    expect(formatDeadline(undefined)).toBeNull();
  });

  it("возвращает строку для валидной даты", () => {
    const date = new Date("2026-05-20T10:00:00Z").toISOString();
    const result = formatDeadline(date);
    expect(typeof result).toBe("string");
    expect(result!.length).toBeGreaterThan(0);
  });
});

// --- screenshots ---

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

// --- taskTransitions ---

describe("граф переходов статусов", () => {
  it("переход в ту же колонку всегда валиден", () => {
    expect(isValidTransition("свободно", "свободно")).toBe(true);
    expect(isValidTransition("в_работе", "в_работе")).toBe(true);
    expect(isValidTransition("waiting_comment", "waiting_comment")).toBe(true);
    expect(isValidTransition("тестирование", "тестирование")).toBe(true);
  });

  it("свободно → в_работе разрешён", () => {
    expect(isValidTransition("свободно", "в_работе")).toBe(true);
  });

  it("в_работе → свободно разрешён", () => {
    expect(isValidTransition("в_работе", "свободно")).toBe(true);
  });

  it("в_работе → waiting_comment разрешён", () => {
    expect(isValidTransition("в_работе", "waiting_comment")).toBe(true);
  });

  it("waiting_comment → в_работе разрешён", () => {
    expect(isValidTransition("waiting_comment", "в_работе")).toBe(true);
  });

  it("в_работе → тестирование разрешён", () => {
    expect(isValidTransition("в_работе", "тестирование")).toBe(true);
  });

  it("тестирование → в_работе разрешён (баг найден, возврат в разработку)", () => {
    expect(isValidTransition("тестирование", "в_работе")).toBe(true);
  });

  it("свободно → waiting_comment запрещён", () => {
    expect(isValidTransition("свободно", "waiting_comment")).toBe(false);
  });

  it("waiting_comment → свободно запрещён", () => {
    expect(isValidTransition("waiting_comment", "свободно")).toBe(false);
  });

  it("свободно → тестирование запрещён", () => {
    expect(isValidTransition("свободно", "тестирование")).toBe(false);
  });

  it("waiting_comment → тестирование запрещён", () => {
    expect(isValidTransition("waiting_comment", "тестирование")).toBe(false);
  });

  it("тестирование → свободно запрещён", () => {
    expect(isValidTransition("тестирование", "свободно")).toBe(false);
  });

  it("тестирование → waiting_comment запрещён", () => {
    expect(isValidTransition("тестирование", "waiting_comment")).toBe(false);
  });

  it("граф симметричен только для разрешённых рёбер", () => {
    for (const [from, targets] of Object.entries(VALID_TRANSITIONS)) {
      for (const to of targets) {
        expect(isValidTransition(from as any, to)).toBe(true);
      }
    }
  });
});
