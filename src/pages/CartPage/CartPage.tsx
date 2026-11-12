import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash, ShoppingCart } from "@phosphor-icons/react";
import { nfts } from "../../data/nfts";
import { useMarketplaceStore } from "../../stores/marketplace-store";
import HomeBottomSections from "../../components/home/HomeBottomSections";
import "./cart.css";

const NETWORK_FEE = 0.016;

const recommendationIds = [
  "cosmic-bloom-118",
  "violet-nomad-314",
  "ivory-baron-088",
  "golden-beat-207",
  "golden-signal-160",
];

const formatEth = (value: number) => `${value.toFixed(3)} ETH`;

export default function CartPage() {
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const {
    cart,
    cartQuantities,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  } = useMarketplaceStore();

  const subtotal = cart.reduce((total, nft) => {
    const quantity = cartQuantities[nft.id] ?? 1;
    return total + nft.priceInEth * quantity;
  }, 0);

  const totalQuantity = cart.reduce(
    (total, nft) => total + (cartQuantities[nft.id] ?? 1),
    0,
  );

  const discount = 0;
  const networkFee = cart.length > 0 ? NETWORK_FEE : 0;
  const total = subtotal - discount + networkFee;

  const recommendations = useMemo(
    () =>
      recommendationIds
        .map((id) => nfts.find((nft) => nft.id === id))
        .filter(
          (nft): nft is (typeof nfts)[number] =>
            nft !== undefined && !cart.some((item) => item.id === nft.id),
        ),
    [cart],
  );

  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      setCouponMessage("Digite um código promocional.");
      return;
    }

    setCouponMessage(
      "Os códigos promocionais serão validados na etapa de pagamento.",
    );
  };

  if (cart.length === 0) {
    return (
      <>
        <main className="cart-page">
          <div className="cart-container">
            <div className="cart-breadcrumb">
              <Link to="/">Início</Link>
              <span>/</span>
              <Link to="/">Mercado</Link>
              <span>/</span>
              <span>Carrinho</span>
            </div>

            <section className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingCart size={38} weight="light" />
              </div>

              <h1>Seu carrinho está vazio</h1>

              <p>
                Explore o mercado KURIO e encontre peças digitais exclusivas
                para sua coleção.
              </p>

              <Link to="/" className="cart-primary-button">
                Explorar NFTs
              </Link>
            </section>
          </div>
        </main>

        <HomeBottomSections showEditorialSections={false} />
      </>
    );
  }

  return (
    <>
      <main className="cart-page">
        <div className="cart-container">
          <div className="cart-breadcrumb">
            <Link to="/">Início</Link>
            <span>/</span>
            <Link to="/">Mercado</Link>
            <span>/</span>
            <span>Carrinho</span>
          </div>

          <div className="cart-layout">
            <section className="cart-main-content">
              <div className="cart-table-header">
                <span>NFTs</span>
                <span>Preço</span>
                <span>Edições</span>
                <span>Total</span>
                <span aria-label="Ações" />
              </div>

              <div className="cart-items-list">
                {cart.map((nft) => {
                  const quantity = cartQuantities[nft.id] ?? 1;
                  const itemTotal = nft.priceInEth * quantity;

                  return (
                    <article className="cart-item" key={nft.id}>
                      <div className="cart-item-product">
                        <Link
                          to="/nft/$nftId"
                          params={{ nftId: nft.id }}
                          className="cart-item-image"
                        >
                          <img src={nft.image} alt={nft.name} />
                        </Link>

                        <div className="cart-item-info">
                          <Link
                            to="/nft/$nftId"
                            params={{ nftId: nft.id }}
                            className="cart-item-name"
                          >
                            {nft.name}
                          </Link>

                          <span className="cart-item-token">
                            ID do token: #{nft.id.match(/\d+/)?.[0] ?? nft.id}
                          </span>
                        </div>
                      </div>

                      <div className="cart-item-unit-price">{nft.price}</div>

                      <div className="cart-quantity">
                        <button
                          type="button"
                          aria-label={`Diminuir quantidade de ${nft.name}`}
                          disabled={quantity <= 1}
                          onClick={() =>
                            updateCartQuantity(nft.id, quantity - 1)
                          }
                        >
                          <Minus size={13} weight="bold" />
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          aria-label={`Aumentar quantidade de ${nft.name}`}
                          onClick={() =>
                            updateCartQuantity(nft.id, quantity + 1)
                          }
                        >
                          <Plus size={13} weight="bold" />
                        </button>
                      </div>

                      <strong className="cart-item-total">
                        {formatEth(itemTotal)}
                      </strong>

                      <button
                        type="button"
                        className="cart-remove-button"
                        aria-label={`Remover ${nft.name}`}
                        onClick={() => removeFromCart(nft.id)}
                      >
                        <Trash size={17} weight="light" />
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="cart-mobile-summary">
                <span>{totalQuantity} edições no carrinho</span>

                <button type="button" onClick={clearCart}>
                  <Trash size={14} />
                  Limpar carrinho
                </button>
              </div>
            </section>

            <aside className="cart-wallet-summary">
              <h2>Resumo da carteira</h2>

              <div className="cart-coupon">
                <label htmlFor="cart-coupon-input">Código promocional</label>

                <div className="cart-coupon-field">
                  <input
                    id="cart-coupon-input"
                    type="text"
                    placeholder="Digite o código promocional..."
                    value={coupon}
                    onChange={(event) => {
                      setCoupon(event.target.value);
                      setCouponMessage("");
                    }}
                  />

                  <button type="button" onClick={handleApplyCoupon}>
                    Aplicar
                  </button>
                </div>

                {couponMessage && (
                  <span className="cart-coupon-message">{couponMessage}</span>
                )}
              </div>

              <div className="cart-summary-lines">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatEth(subtotal)}</strong>
                </div>

                <div>
                  <span>Desconto do lançamento</span>
                  <strong>(-) {formatEth(discount)}</strong>
                </div>

                <div className="cart-network-line">
                  <span>Taxa de rede</span>

                  <div>
                    <strong>{formatEth(networkFee)}</strong>
                    <small>Taxa estimada</small>
                  </div>
                </div>
              </div>

              <div className="cart-summary-total">
                <span>Total</span>
                <strong>{formatEth(total)}</strong>
              </div>

              <Link to="/payment" className="cart-checkout-button">
                Conectar e finalizar
              </Link>

              <Link to="/" className="cart-continue-link">
                Continuar explorando
              </Link>
            </aside>
          </div>

          {recommendations.length > 0 && (
            <section className="cart-recommendations">
              <div className="cart-recommendations-heading">
                <h2>Colecionadores também viram</h2>
                <span />
              </div>

              <div className="cart-recommendations-grid">
                {recommendations.map((nft) => (
                  <Link
                    to="/nft/$nftId"
                    params={{ nftId: nft.id }}
                    className="cart-recommendation-card"
                    key={nft.id}
                  >
                    <div className="cart-recommendation-image">
                      <img src={nft.image} alt={nft.name} />
                    </div>

                    <span>{nft.name}</span>
                    <strong>{nft.price}</strong>
                  </Link>
                ))}
              </div>

              <div className="cart-recommendations-pagination">
                <span />
                <span className="active" />
                <span />
              </div>
            </section>
          )}
        </div>
      </main>

      <HomeBottomSections showEditorialSections={false} />
    </>
  );
}
