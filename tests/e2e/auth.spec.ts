
import { test, expect } from "@playwright/test";

test.describe("Marketplace - Autenticação", () => {
  async function openLogin(page: import("@playwright/test").Page) {
    await page.goto("/");

    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    return page.getByRole("dialog");
  }

  async function login(
    dialog: import("@playwright/test").Locator,
    email: string,
    password: string,
  ) {
    await dialog.locator("#auth-email").fill(email);
    await dialog.locator("#auth-password").fill(password);

    await dialog
      .locator(".auth-submit-button")
      .click();
  }

  test("deve abrir e fechar a modal de autenticação", async ({ page }) => {
    const dialog = await openLogin(page);

    await expect(dialog).toBeVisible();

    await expect(
      dialog.getByRole("heading", {
        name: "Bem-vindo de volta",
      }),
    ).toBeVisible();

    await expect(dialog.locator("#auth-email")).toBeVisible();
    await expect(dialog.locator("#auth-password")).toBeVisible();

    await dialog
      .getByRole("button", { name: "Fechar autenticação" })
      .click();

    await expect(dialog).not.toBeVisible();
  });


  test("deve exibir erro ao informar credenciais inválidas", async ({
    page,
  }) => {
    const dialog = await openLogin(page);

    await login(dialog, "alex@kurio.demo", "senha-incorreta");

    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("alert")).toBeVisible();

    await expect(
      dialog.getByRole("heading", {
        name: "Bem-vindo de volta",
      }),
    ).toBeVisible();
  });

  test("deve validar o formato do e-mail", async ({ page }) => {
    const dialog = await openLogin(page);

    await dialog.locator("#auth-email").fill("email-invalido");
    await dialog.locator("#auth-password").fill("Kurio123!");

    await dialog.locator(".auth-submit-button").click();

    await expect(dialog.getByRole("alert")).toHaveText(
      "Informe um endereço de e-mail válido.",
    );
  });

  test("deve cadastrar um novo usuário", async ({ page }) => {
    const dialog = await openLogin(page);

    await dialog
      .getByRole("tab", { name: "Criar conta" })
      .click();

    await expect(
      dialog.getByRole("heading", {
        name: "Crie sua conta",
      }),
    ).toBeVisible();

    await dialog.locator("#auth-username").fill("colecionadorteste");
    await dialog.locator("#auth-email").fill("novo@kurio.demo");
    await dialog.locator("#auth-password").fill("Kurio123!");

    await dialog
      .locator(".auth-submit-button")
      .click();

    await expect(dialog).not.toBeVisible();

    await expect(
      page.locator(".header-user-name"),
    ).toHaveText("colecionadorteste");

    await expect(
      page.getByRole("button", { name: "Sair" }),
    ).toBeVisible();
  });

  test("deve encerrar a sessão ao fazer logout", async ({ page }) => {
    const dialog = await openLogin(page);

    await login(dialog, "alex@kurio.demo", "Kurio123!");

    await expect(page.locator(".header-user-name")).toHaveText("Alex");

    await page.getByRole("button", { name: "Sair" }).click();

    await expect(
      page.getByRole("button", { name: "Entrar", exact: true }),
    ).toBeVisible();

    await expect(page.locator(".header-user-name")).not.toBeVisible();

    const token = await page.evaluate(() =>
      localStorage.getItem("kurio-access-token"),
    );

    expect(token).toBeNull();
  });

  test("deve permitir alternar entre usuários após logout", async ({
    page,
  }) => {
    let dialog = await openLogin(page);

    await login(dialog, "alex@kurio.demo", "Kurio123!");

    await expect(page.locator(".header-user-name")).toHaveText("Alex");

    await page.getByRole("button", { name: "Sair" }).click();

    await expect(
      page.getByRole("button", { name: "Entrar", exact: true }),
    ).toBeVisible();

    dialog = await openLogin(page);

    await login(dialog, "jordan@kurio.demo", "Kurio123!");

    await expect(page.locator(".header-user-name")).toHaveText("Jordan");
  });
});
