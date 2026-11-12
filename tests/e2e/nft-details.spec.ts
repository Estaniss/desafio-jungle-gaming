
import { test, expect } from "@playwright/test";

test.describe("Marketplace - Detalhes do NFT", () => {
  test("deve abrir os detalhes de um NFT pelo catálogo", async ({ page }) => {
    await page.goto("/");

    const catalog = page.locator("#catalogo");
    await catalog.scrollIntoViewIfNeeded();

    const searchInput = catalog.getByRole("textbox", {
      name: "Buscar NFTs",
    });

    await searchInput.fill("Emerald Ape");

    const nftCard = catalog
      .locator(".kurio-nft-card")
      .filter({ hasText: "Emerald Ape #042" });

    await expect(nftCard).toHaveCount(1);

    await nftCard.getByRole("link").first().click();

    await expect(page).toHaveURL(/\/nft\/emerald-ape-042$/);

    await expect(
      page.getByRole("heading", {
        name: "Emerald Ape #042",
        level: 1,
      }),
    ).toBeVisible();

    await expect(page.getByText("1.19 ETH")).toBeVisible();
    await expect(page.getByText("NFT EXCLUSIVO")).toBeVisible();
    await expect(page.getByText("Sobre este NFT:")).toBeVisible();
  });

  test("deve abrir os detalhes ao acessar diretamente a URL", async ({
    page,
  }) => {
    await page.goto("/nft/emerald-ape-042");

    await expect(
      page.getByRole("heading", {
        name: "Emerald Ape #042",
        level: 1,
      }),
    ).toBeVisible();

    await expect(page.getByText("1.19 ETH")).toBeVisible();

    await expect(
      page.getByText("ID do token:"),
    ).toBeVisible();

    await expect(
      page.getByText("#0042"),
    ).toBeVisible();

    await expect(
      page.getByRole("tab", { name: "Detalhes do NFT" }),
    ).toBeVisible();
  });

  test("deve exibir a página 404 para um NFT inexistente", async ({
    page,
  }) => {
    await page.goto("/nft/nft-inexistente-123");

    await expect(
      page.getByRole("heading", {
        name: "NFT não encontrado",
      }),
    ).toBeVisible();

    await expect(page.getByText("404")).toBeVisible();

    await expect(
      page.getByText(
        "Esse item não existe ou não está mais disponível no marketplace.",
      ),
    ).toBeVisible();

    const backButton = page.getByRole("link", {
      name: "VOLTAR AO MARKETPLACE",
    });

    await expect(backButton).toBeVisible();

    await backButton.click();

    await expect(page).toHaveURL("/");
  });
});
