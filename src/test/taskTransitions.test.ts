import { describe, it, expect } from "vitest";
import { isValidTransition, VALID_TRANSITIONS } from "../constants/taskTransitions";

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
