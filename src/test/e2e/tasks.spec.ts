import { test, expect } from "@playwright/test";

test.describe("Основной функционал", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("отображает заголовок с датой и кнопку добавления", async ({ page }) => {
    await expect(page.getByRole("button", { name: /добавить задачу/i })).toBeVisible();
  });

  test("создаёт задачу через форму", async ({ page }) => {
    await page.getByRole("button", { name: /добавить задачу/i }).click();
    await page.getByPlaceholder("Кратко опишите задачу").fill("Тестовая задача E2E");
    await page.getByRole("dialog").getByRole("button", { name: "Создать" }).click();
    await expect(page.getByText("Тестовая задача E2E")).toBeVisible();
  });

  test("переключается между режимами Список и Канбан", async ({ page }) => {
    await page.getByText("Канбан").click();
    await expect(page.getByText("🟢 Можно взять в работу")).toBeVisible();
    await expect(page.getByText("🔵 В работе")).toBeVisible();
    await expect(page.getByText("💬 Ждём с ОС")).toBeVisible();

    await page.getByText("Список", { exact: true }).click();
    await expect(page.getByText("Активные задачи")).toBeVisible();
  });

  test("открывает карточку задачи по клику", async ({ page }) => {
    await page.getByRole("button", { name: /добавить задачу/i }).click();
    await page.getByPlaceholder("Кратко опишите задачу").fill("Задача для просмотра");
    await page.getByRole("dialog").getByRole("button", { name: "Создать" }).click();

    await page.getByText("Задача для просмотра").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("Задача для просмотра")).toBeVisible();
  });

  test("копирует отчёт в буфер обмена", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: /скопировать отчёт/i }).click();
    await expect(page.getByText("Отчёт скопирован")).toBeVisible();
  });
});
