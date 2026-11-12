
import { test, expect } from "@playwright/test";

test.describe("Marketplace - Catálogo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  function catalog(page: import("@playwright/test").Page) {
    return page.locator("#catalogo");
  }

  function nftCards(page: import("@playwright/test").Page) {
    return catalog(page).locator(".kurio-nft-card");
  }

  async function selectAllCategories(
    page: import("@playwright/test").Page,
  ) {
    await catalog(page).locator(".kurio-filter-list button").first().click();
  }

  async function getCardPrices(page: import("@playwright/test").Page) {
    const prices = await nftCards(page)
      .locator(".kurio-nft-price")
      .allTextContents();

    return prices.map((price) =>
      Number.parseFloat(price.replace(",", ".").replace(/[^\d.]/g, "")),
    );
  }

  test("deve carregar a página inicial e exibir NFTs", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: /SEJA DONO DO FUTURO DA ARTE DIGITAL/i,
      }),
    ).toBeVisible();

    const marketplace = catalog(page);

    await marketplace.scrollIntoViewIfNeeded();

    await expect(
      marketplace.getByRole("heading", { name: "Coleções" }),
    ).toBeVisible();

    await expect(
      marketplace.getByRole("textbox", { name: "Buscar NFTs" }),
    ).toBeVisible();

    await expect(nftCards(page).first()).toBeVisible();

    expect(await nftCards(page).count()).toBeGreaterThan(0);
  });

  test("deve informar quando a busca não encontrar NFTs e permitir limpar filtros", async ({
    page,
  }) => {
    const marketplace = catalog(page);

    await marketplace.scrollIntoViewIfNeeded();

    const searchInput = marketplace.getByRole("textbox", {
      name: "Buscar NFTs",
    });

    await searchInput.fill("kurio-termo-inexistente-123");

    await expect(
      marketplace.getByText("Nenhum NFT encontrado."),
    ).toBeVisible();

    const clearButton = marketplace.getByRole("button", {
      name: "LIMPAR FILTROS",
    });

    await expect(clearButton).toBeVisible();
    await clearButton.click();

    await expect(
      marketplace.getByText("Nenhum NFT encontrado."),
    ).not.toBeVisible();

    await expect(nftCards(page).first()).toBeVisible();
  });

  test("deve adicionar um NFT ao carrinho", async ({ page }) => {
    await catalog(page).scrollIntoViewIfNeeded();

    const firstCard = nftCards(page).first();

    await expect(firstCard).toBeVisible();

    const addButton = firstCard.locator(".kurio-add-cart");

    await expect(addButton).toHaveText("ADICIONAR AO CARRINHO");

    await addButton.click();

    await expect(addButton).toHaveText("ADICIONADO AO CARRINHO");
    await expect(addButton).toBeDisabled();
  });

  test("deve encontrar um NFT existente pela busca", async ({ page }) => {
    const marketplace = catalog(page);

    await marketplace.scrollIntoViewIfNeeded();

    await marketplace
      .getByRole("textbox", { name: "Buscar NFTs" })
      .fill("Emerald Ape");

  await expect(nftCards(page)).toHaveCount(1);

    await expect(
      nftCards(page).getByText("Emerald Ape #042"),
    ).toBeVisible();
  });

  test("deve filtrar NFTs por categoria", async ({ page }) => {
    const marketplace = catalog(page);

    await marketplace.scrollIntoViewIfNeeded();

    await marketplace
      .locator(".kurio-filter-list")
      .getByRole("button", { name: /Música/ })
      .click();

    await expect(nftCards(page)).toHaveCount(5);

    await expect(
      nftCards(page).first().getByText("Golden Beat #207"),
    ).toBeVisible();
  });

  test("deve filtrar NFTs pela rede Solana", async ({ page }) => {
    const marketplace = catalog(page);

    await marketplace.scrollIntoViewIfNeeded();

    await selectAllCategories(page);

    await marketplace
      .locator(".kurio-filter-section")
      .nth(1)
      .getByRole("button", { name: /Solana/ })
      .click();

    await expect(nftCards(page)).toHaveCount(5);

    await expect(
      nftCards(page).getByText("Cosmic Bloom #118"),
    ).toBeVisible();
  });

  test("deve combinar categoria, rede e busca", async ({ page }) => {
    const marketplace = catalog(page);

    await marketplace.scrollIntoViewIfNeeded();

    await marketplace
      .locator(".kurio-filter-list")
      .getByRole("button", { name: /Música/ })
      .click();

    await marketplace
      .locator(".kurio-filter-section")
      .nth(1)
      .getByRole("button", { name: /Solana/ })
      .click();

    await marketplace
      .getByRole("textbox", { name: "Buscar NFTs" })
      .fill("Golden");

    await expect(nftCards(page)).toHaveCount(4);

await expect(
  nftCards(page).getByText("Golden Beat #207"),
).toBeVisible();

await expect(
  nftCards(page).getByText("Golden Signal #160"),
).toHaveCount(3);
  });

  test("deve ordenar os NFTs pelo menor e maior preço", async ({ page }) => {
    const marketplace = catalog(page);

    await marketplace.scrollIntoViewIfNeeded();

    await selectAllCategories(page);

    const sortSelect = marketplace.locator(".kurio-sort select");

    await sortSelect.selectOption("price-asc");

    let prices = await getCardPrices(page);

    expect(prices.length).toBeGreaterThan(0);

    expect(prices[0]).toBe(0.39);

    await sortSelect.selectOption("price-desc");

    prices = await getCardPrices(page);

    expect(prices[0]).toBe(1.99);
  });

  test("deve navegar entre as páginas do catálogo", async ({ page }) => {
    const marketplace = catalog(page);

    await marketplace.scrollIntoViewIfNeeded();

    await selectAllCategories(page);

    await expect(nftCards(page)).toHaveCount(9);

    const firstPageFirstNft = await nftCards(page)
      .first()
      .locator(".kurio-nft-name")
      .innerText();

    await marketplace.getByRole("button", { name: "2", exact: true }).click();

    await expect(nftCards(page)).toHaveCount(2);

    await expect(
      marketplace.getByRole("button", { name: "Página anterior" }),
    ).toBeEnabled();

    const secondPageFirstNft = await nftCards(page)
      .first()
      .locator(".kurio-nft-name")
      .innerText();

    expect(secondPageFirstNft).not.toBe(firstPageFirstNft);

    await marketplace
      .getByRole("button", { name: "Página anterior" })
      .click();

    await expect(nftCards(page)).toHaveCount(9);

    await expect(
      nftCards(page).first().locator(".kurio-nft-name"),
    ).toHaveText(firstPageFirstNft);
  });
});
