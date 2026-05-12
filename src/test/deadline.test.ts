import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDeadlineColor, formatDeadline } from "../utils/deadline";

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
