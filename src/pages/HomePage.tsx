import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { nfts, collectionCategories, networks } from "../data/nfts";
import { useMarketplaceStore } from "../stores/marketplace-store";
import HomeBottomSections from "../components/home/HomeBottomSections";

type CatalogTab = "Todos os NFTs" | "Novos lançamentos" | "Em alta";

type SortOption = "default" | "price-asc" | "price-desc";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Arte digital");
  const [selectedNetwork, setSelectedNetwork] = useState("Todas");
  const [activeTab, setActiveTab] = useState<CatalogTab>("Todos os NFTs");
  const [sort, setSort] = useState<SortOption>("default");
  const [minPrice, setMinPrice] = useState(0.02);
  const [maxPrice, setMaxPrice] = useState(12.3);
  const [page, setPage] = useState(1);

  const { addToCart, toggleFavorite, isFavorite, isInCart } =
    useMarketplaceStore();

  const filteredNfts = useMemo(() => {
    let result = [...nfts];

    if (category !== "Todas") {
      result = result.filter((nft) => nft.category === category);
    }

    if (selectedNetwork !== "Todas") {
      result = result.filter((nft) => nft.network === selectedNetwork);
    }

    if (search.trim()) {
      const term = search.trim().toLocaleLowerCase("pt-BR");

      result = result.filter((nft) =>
        [
          nft.name,
          nft.creator,
          nft.description,
          nft.category,
          nft.rarity,
          nft.network,
        ].some((field) => field.toLocaleLowerCase("pt-BR").includes(term)),
      );
    }

    result = result.filter(
      (nft) => nft.priceInEth >= minPrice && nft.priceInEth <= maxPrice,
    );

    if (activeTab === "Novos lançamentos") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (activeTab === "Em alta") {
      result.sort((a, b) => b.popularityScore - a.popularityScore);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    if (sort === "price-asc") {
      result.sort((a, b) => a.priceInEth - b.priceInEth);
    } else if (sort === "price-desc") {
      result.sort((a, b) => b.priceInEth - a.priceInEth);
    }

    return result;
  }, [category, selectedNetwork, search, minPrice, maxPrice, activeTab, sort]);

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filteredNfts.length / pageSize));

  const visibleNfts = filteredNfts.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  function selectCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleNetwork(value: string) {
    setSelectedNetwork(selectedNetwork === value ? "Todas" : value);
    setPage(1);
  }

  function handleMinPrice(value: number) {
    setMinPrice(Math.min(value, maxPrice));
    setPage(1);
  }

  function handleMaxPrice(value: number) {
    setMaxPrice(Math.max(value, minPrice));
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setCategory("Todas");
    setSelectedNetwork("Todas");
    setActiveTab("Todos os NFTs");
    setSort("default");
    setMinPrice(0.02);
    setMaxPrice(12.3);
    setPage(1);
  }

  return (
    <main className="kurio-page">
      {/* HERO */}
      <section className="kurio-hero">
        <div className="kurio-hero-copy">
          <span className="kurio-eyebrow">Bem-vindo à Kurio</span>

          <h1>
            SEJA DONO DO FUTURO
            <br />
            DA ARTE DIGITAL
          </h1>

          <p>
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>

          <a className="kurio-button" href="#catalogo">
            EXPLORAR
          </a>

          <div className="kurio-hero-dots" aria-label="Destaque 1 de 3">
            <span className="active" />
            <span />
            <span />
          </div>
        </div>

        <div className="kurio-hero-art">
          <img
            src="/assets/8459204731e6eba9d474cbc8ebc37071360d3ba5.png"
            alt="Emerald Ape, personagem da coleção Kurio"
          />
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="kurio-marketplace" id="catalogo">
        <aside className="kurio-sidebar">
          <div className="kurio-filter-panel">
            <h2>Coleções</h2>

            <div className="kurio-filter-list">
              <button
                className={`kurio-filter-option ${
                  category === "Todas" ? "selected" : ""
                }`}
                onClick={() => selectCategory("Todas")}
                type="button"
              >
                <span>Todas</span>
                <span>({nfts.length})</span>
              </button>

              {collectionCategories.map((item) => (
                <button
                  className={`kurio-filter-option ${
                    category === item.name ? "selected" : ""
                  }`}
                  key={item.name}
                  onClick={() => selectCategory(item.name)}
                  type="button"
                >
                  <span>{item.name}</span>
                  <span>({item.count})</span>
                </button>
              ))}
            </div>

            {/* PREÇO */}
            <div className="kurio-filter-section">
              <h2>Faixa de preço</h2>

              <div className="kurio-range-inputs">
                <input
                  aria-label="Preço mínimo"
                  max={12.3}
                  min={0.02}
                  onChange={(event) =>
                    handleMinPrice(Number(event.target.value))
                  }
                  step={0.01}
                  type="range"
                  value={minPrice}
                />

                <input
                  aria-label="Preço máximo"
                  max={12.3}
                  min={0.02}
                  onChange={(event) =>
                    handleMaxPrice(Number(event.target.value))
                  }
                  step={0.01}
                  type="range"
                  value={maxPrice}
                />
              </div>

              <p className="kurio-price-range">
                Preço: {minPrice.toFixed(2).replace(".", ",")} –{" "}
                {maxPrice.toFixed(2).replace(".", ",")} ETH
              </p>

              <button
                className="kurio-button kurio-button-small"
                onClick={() => setPage(1)}
                type="button"
              >
                Aplicar
              </button>
            </div>

            {/* REDES */}
            <div className="kurio-filter-section">
              <h2>Rede</h2>

              <button
                className={`kurio-filter-option ${
                  selectedNetwork === "Todas" ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedNetwork("Todas");
                  setPage(1);
                }}
                type="button"
              >
                <span>Todas</span>
              </button>

              {networks.map((network) => (
                <button
                  className={`kurio-filter-option ${
                    selectedNetwork === network.name ? "selected" : ""
                  }`}
                  key={network.name}
                  onClick={() => handleNetwork(network.name)}
                  type="button"
                >
                  <span>{network.name}</span>
                  <span>({network.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* NFT EM DESTAQUE */}
          <div className="kurio-featured">
            <h2>NFT EM DESTAQUE</h2>
            <span className="kurio-featured-label">OFERTA LIMITADA</span>

            <img
              src="/assets/2986a7cb16d09de8970824d2dd58bf0bb021702c.png"
              alt="Sage Nomad em destaque"
            />

            <div className="kurio-featured-info">
              <strong>Sage Nomad #009</strong>
              <span>1.69 ETH</span>
            </div>
          </div>
        </aside>

        {/* CATÁLOGO */}
        <div className="kurio-catalog">
          <div className="kurio-catalog-toolbar">
            <div className="kurio-tabs" role="tablist" aria-label="Categorias">
              {(
                [
                  "Todos os NFTs",
                  "Novos lançamentos",
                  "Em alta",
                ] as CatalogTab[]
              ).map((tab) => (
                <button
                  aria-selected={activeTab === tab}
                  className={`kurio-tab ${activeTab === tab ? "active" : ""}`}
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSort("default");
                    setPage(1);
                  }}
                  role="tab"
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>

            <label className="kurio-sort">
              <span>Ordenar por:</span>

              <select
                onChange={(event) => {
                  setSort(event.target.value as SortOption);
                  setPage(1);
                }}
                value={sort}
              >
                <option value="default">Recomendados</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
            </label>
          </div>

          {/* BUSCA */}
          <div className="kurio-search">
            <span aria-hidden="true">⌕</span>

            <input
              aria-label="Buscar NFTs"
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Buscar NFTs, coleções ou criadores..."
              value={search}
            />

            {search && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => handleSearch("")}
              >
                ×
              </button>
            )}
          </div>

          {/* RESULTADOS */}
          <div className="kurio-nft-grid">
            {visibleNfts.map((nft) => {
              const favorite = isFavorite(nft.id);
              const inCart = isInCart(nft.id);

              return (
                <article className="kurio-nft-card" key={nft.id}>
                  <div className="kurio-nft-image-wrap">
                    {/* ÚNICA ALTERAÇÃO: imagem abre os detalhes */}
                    <Link
                      to="/nft/$nftId"
                      params={{ nftId: nft.id }}
                      className="kurio-nft-details-link"
                    >
                      <img
                        alt={nft.name}
                        className="kurio-nft-image"
                        loading="lazy"
                        src={nft.image}
                      />
                    </Link>

                    <button
                      aria-label={
                        favorite
                          ? `Remover ${nft.name} dos favoritos`
                          : `Adicionar ${nft.name} aos favoritos`
                      }
                      aria-pressed={favorite}
                      className={`kurio-favorite ${
                        favorite ? "favorited" : ""
                      }`}
                      onClick={() => toggleFavorite(nft.id)}
                      type="button"
                    >
                      {favorite ? "♥" : "♡"}
                    </button>
                  </div>

                  {/* ÚNICA ALTERAÇÃO: nome abre os detalhes */}
                  <div className="kurio-nft-info">
                    <Link
                      to="/nft/$nftId"
                      params={{ nftId: nft.id }}
                      className="kurio-nft-details-link"
                    >
                      <div className="kurio-nft-name">{nft.name}</div>
                    </Link>

                    <div className="kurio-nft-price">{nft.price}</div>
                  </div>

                  <button
                    className="kurio-add-cart"
                    disabled={inCart}
                    onClick={() => addToCart(nft)}
                    type="button"
                  >
                    {inCart
                      ? "ADICIONADO AO CARRINHO"
                      : "ADICIONAR AO CARRINHO"}
                  </button>
                </article>
              );
            })}
          </div>

          {/* RESULTADO VAZIO */}
          {visibleNfts.length === 0 && (
            <div className="kurio-empty">
              <strong>Nenhum NFT encontrado.</strong>

              <p>Experimente alterar os filtros ou o termo da busca.</p>

              <button
                className="kurio-button"
                onClick={clearFilters}
                type="button"
              >
                LIMPAR FILTROS
              </button>
            </div>
          )}

          {/* PAGINAÇÃO */}
          {filteredNfts.length > 0 && (
            <nav className="kurio-pagination" aria-label="Paginação">
              <button
                aria-label="Página anterior"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                type="button"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    aria-current={page === number ? "page" : undefined}
                    className={page === number ? "active" : ""}
                    key={number}
                    onClick={() => setPage(number)}
                    type="button"
                  >
                    {number}
                  </button>
                ),
              )}

              <button
                aria-label="Próxima página"
                disabled={page === totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                type="button"
              >
                ›
              </button>
            </nav>
          )}
        </div>
      </section>
      <HomeBottomSections />
    </main>
  );
}
