import type { Nft } from "../../types/nft";
import { useMarketplaceStore } from "../../stores/marketplace-store";

interface NftCardProps {
  nft: Nft;
}

export function NftCard({ nft }: NftCardProps) {
  const { addToCart, toggleFavorite, isFavorite, isInCart } =
    useMarketplaceStore();

  const favorite = isFavorite(nft.id);
  const inCart = isInCart(nft.id);

  return (
    <article className="nft-card">
      <div className="nft-card-image">
        <img src={nft.image} alt={nft.name} loading="lazy" />

        <span className="nft-card-rarity">{nft.rarity}</span>

        <button
          type="button"
          className={`nft-card-favorite ${favorite ? "is-active" : ""}`}
          onClick={() => toggleFavorite(nft.id)}
          aria-label={
            favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          aria-pressed={favorite}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="nft-card-content">
        <div className="nft-card-info">
          <div>
            <h3 className="nft-card-title">{nft.name}</h3>
            <p className="nft-card-creator">por {nft.creator}</p>
          </div>

          <div className="nft-card-price">
            <span>Preço</span>
            <strong>{nft.price}</strong>
          </div>
        </div>

        <p className="nft-card-description">{nft.description}</p>

        <button
          type="button"
          className={`nft-card-buy ${inCart ? "is-added" : ""}`}
          onClick={() => addToCart(nft)}
          disabled={inCart}
        >
          {inCart ? "Adicionado ao carrinho ✓" : "Adicionar ao carrinho"}
        </button>
      </div>
    </article>
  );
}
