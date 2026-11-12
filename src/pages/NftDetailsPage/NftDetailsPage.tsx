import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import "./nft-details.css";
import { nfts } from "../../data/nfts";
import { useMarketplaceStore } from "../../stores/marketplace-store";
import HomeBottomSections from "../../components/home/HomeBottomSections";

type DetailsTab = "details" | "reviews";

const collectionRecommendations = [
  "cosmic-bloom-118",
  "violet-nomad-314",
  "ivory-baron-088",
  "golden-beat-207",
  "golden-signal-160",
];

export default function NftDetailsPage() {
  const params = useParams({ strict: false }) as {
    nftId?: string;
  };

  const [activeTab, setActiveTab] = useState<DetailsTab>("details");
  const [quantity, setQuantity] = useState(1);

  const nft = nfts.find((item) => item.id === params.nftId);

  const { addToCart, toggleFavorite, isFavorite, isInCart } =
    useMarketplaceStore();

  if (!nft) {
    return (
      <>
        <main className="nft-not-found">
          <span>404</span>
          <h1>NFT não encontrado</h1>
          <p>
            Esse item não existe ou não está mais disponível no marketplace.
          </p>
          <Link to="/" className="kurio-button">
            VOLTAR AO MARKETPLACE
          </Link>
        </main>

        <HomeBottomSections />
      </>
    );
  }

  const favorite = isFavorite(nft.id);
  const inCart = isInCart(nft.id);

  const recommendations = collectionRecommendations
    .map((id) => nfts.find((item: any) => item.id === id))
    .filter(
      (item: any): item is (typeof nfts)[number] =>
        Boolean(item) && item.id !== nft.id,
    );

  const handleAddToCart = () => {
    for (let index = 0; index < quantity; index += 1) {
      addToCart(nft);
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareUrl = encodeURIComponent(currentUrl);
  const shareTitle = encodeURIComponent(nft.name);

  return (
    <>
      <main className="nft-details-page">
        {/* Breadcrumb */}
        <div className="nft-details-breadcrumb">
          <Link to="/">Início</Link>
          <span>/</span>
          <Link to="/">Mercado</Link>
          <span>/</span>
          <strong>{nft.name}</strong>
        </div>

        {/* Informações principais */}
        <section className="nft-product-section">
          {/* Galeria */}
          <div className="nft-product-gallery">
            <div className="nft-gallery-thumbnails">
              {[1, 2, 3, 4].map((item) => (
                <button
                  type="button"
                  className={`nft-gallery-thumbnail ${
                    item === 1 ? "active" : ""
                  }`}
                  key={item}
                  aria-label={`Visualização ${item} de ${nft.name}`}
                >
                  <img src={nft.image} alt="" />
                </button>
              ))}
            </div>

            <div className="nft-gallery-main">
              <img src={nft.image} alt={nft.name} />

              <span className="nft-gallery-zoom" aria-hidden="true">
                ⌕
              </span>
            </div>
          </div>

          {/* Informações do NFT */}
          <div className="nft-product-information">
            <span className="nft-details-eyebrow">NFT EXCLUSIVO</span>

            <h1>{nft.name}</h1>

            <div className="nft-product-rating">
              <span aria-label="Avaliação dos colecionadores">★★★★★</span>
              <p>19 avaliações de colecionadores</p>
            </div>

            <div className="nft-product-price">
              <span>Preço atual</span>
              <strong>{nft.price}</strong>
            </div>

            <div className="nft-details-description">
              <h2>Sobre este NFT:</h2>
              <p>{nft.description}</p>
            </div>

            {/* Edição */}
            <div className="nft-edition-section">
              <span>Edição:</span>

              <div className="nft-edition-options">
                <button type="button" className="selected">
                  1/1
                </button>
                <button type="button">1/10</button>
                <button type="button">1/50</button>
                <button type="button">ABERTA</button>
              </div>
            </div>

            {/* Compra e favoritos */}
            <div className="nft-purchase-actions">
              <div className="nft-quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  aria-label="Diminuir quantidade"
                  disabled={quantity <= 1}
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="nft-details-buy"
                onClick={handleAddToCart}
                disabled={inCart}
              >
                {inCart ? "ADICIONADO AO CARRINHO ✓" : "COMPRAR"}
              </button>

              <button
                type="button"
                className={`nft-details-favorite ${
                  favorite ? "favorited" : ""
                }`}
                onClick={() => toggleFavorite(nft.id)}
                aria-pressed={favorite}
              >
                {favorite ? "♥" : "♡"} {favorite ? "Favoritado" : "Favoritar"}
              </button>
            </div>

            {/* Metadados */}
            <div className="nft-product-metadata">
              <p>
                <span>ID do token:</span>
                <strong>
                  #{nft.id === "emerald-ape-042" ? "0042" : nft.id}
                </strong>
              </p>

              <p>
                <span>Coleção:</span>
                <strong>Kurio Apes</strong>
              </p>

              <p>
                <span>Atributos:</span>
                <strong>
                  {nft.rarity}, {nft.category}
                </strong>
              </p>
            </div>

            {/* Compartilhamento */}
            <div className="nft-product-share">
              <span>Compartilhar este NFT:</span>

              <div>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Compartilhar no LinkedIn"
                >
                  in
                </a>

                <a
                  href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}
                  aria-label="Compartilhar por e-mail"
                >
                  ✉
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Compartilhar no X"
                >
                  𝕏
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Abas de informações */}
        <section className="nft-information-section">
          <div className="nft-information-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "details"}
              className={activeTab === "details" ? "active" : ""}
              onClick={() => setActiveTab("details")}
            >
              Detalhes do NFT
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "reviews"}
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              Avaliações de colecionadores (19)
            </button>
          </div>

          {activeTab === "details" ? (
            <div className="nft-information-content">
              <p>
                {nft.name} é uma obra digital da coleção Kurio Editions. Cada
                atributo fica armazenado nos metadados do token e verificado na
                Ethereum. A obra explora identidade, movimento e luz em um mundo
                digital sem fronteiras.
              </p>

              <p>
                A propriedade inclui a arte em alta resolução, lançamentos
                exclusivos para colecionadores e um registro permanente de
                procedência registrada na rede. O criador recebe 5% de direitos
                autorais nas vendas secundárias, apoiando novos trabalhos e
                lançamentos da comunidade.
              </p>

              <div className="nft-information-metadata">
                <div>
                  <strong>Rede</strong>
                  <p>
                    Cunhado na Ethereum com procedência imutável e metadados
                    armazenados no IPFS.
                  </p>
                </div>

                <div>
                  <strong>Contrato</strong>
                  <p>
                    Direitos autorais do criador: 5% nas vendas secundárias,
                    pagos automaticamente pelos mercados compatíveis.
                  </p>
                </div>

                <div>
                  <strong>Direitos autorais</strong>
                  <p>
                    0x7A42...19E8 · Contrato inteligente ERC-721 verificado.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="nft-reviews-content">
              <div className="nft-reviews-summary">
                <strong>19 avaliações de colecionadores</strong>
                <span>★★★★★</span>
              </div>

              <p>
                As avaliações desta coleção ajudam os colecionadores a conhecer
                a experiência de quem já acompanha os NFTs da Kurio.
              </p>
            </div>
          )}
        </section>

        {/* Mais NFTs da coleção */}
        <section className="nft-more-section">
          <div className="nft-more-heading">
            <h2>Mais desta coleção</h2>
            <Link to="/">Ver marketplace →</Link>
          </div>

          <div className="nft-more-grid">
            {recommendations.map((item) => (
              <Link
                key={item.id}
                to="/nft/$nftId"
                params={{ nftId: item.id }}
                className="nft-more-card"
              >
                <img src={item.image} alt={item.name} />

                <div>
                  <strong>{item.name}</strong>
                  <span>{item.price}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="nft-more-pagination" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
          </div>
        </section>
      </main>

      {/* Benefícios, newsletter e footer */}
      <HomeBottomSections showEditorialSections={false} />
    </>
  );
}
