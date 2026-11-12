import { useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle, EnvelopeSimple, X } from "@phosphor-icons/react";
import { useMarketplaceStore } from "../../stores/marketplace-store";
import HomeBottomSections from "../../components/home/HomeBottomSections";
import "./payment.css";

type WalletOption = "MetaMask" | "WalletConnect" | "Coinbase Wallet";

type PaymentForm = {
  displayName: string;
  username: string;
  network: string;
  profileName: string;
  walletAddress: string;
  secondaryWallet: string;
  walletType: string;
  referralCode: string;
  email: string;
  ensName: string;
  observation: string;
};

type ConfirmationOrder = {
  orderId: string;
  date: string;
  wallet: string;
  network: string;
  subtotal: number;
  networkFee: number;
  total: number;
  items: {
    id: string;
    name: string;
    image: string;
    quantity: number;
    itemTotal: number;
  }[];
};

const NETWORK_FEE = 0.016;

const walletOptions: WalletOption[] = [
  "MetaMask",
  "WalletConnect",
  "Coinbase Wallet",
];

const initialForm: PaymentForm = {
  displayName: "",
  username: "",
  network: "",
  profileName: "",
  walletAddress: "",
  secondaryWallet: "",
  walletType: "",
  referralCode: "",
  email: "",
  ensName: ".eth",
  observation: "",
};

const formatEth = (value: number) =>
  `${Number(value.toFixed(3)).toString()} ETH`;

export default function PaymentPage() {
  const [form, setForm] = useState<PaymentForm>(initialForm);
  const [selectedWallet, setSelectedWallet] =
    useState<WalletOption>("Coinbase Wallet");
  const [useAnotherWallet, setUseAnotherWallet] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationOrder | null>(
    null,
  );
  const [explorerNotice, setExplorerNotice] = useState(false);

  const cart = useMarketplaceStore((state) => state.cart);
  const cartQuantities = useMarketplaceStore((state) => state.cartQuantities);
  const clearCart = useMarketplaceStore((state) => state.clearCart);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, nft) => total + nft.priceInEth * (cartQuantities[nft.id] ?? 1),
        0,
      ),
    [cart, cartQuantities],
  );

  const networkFee = cart.length > 0 ? NETWORK_FEE : 0;
  const total = subtotal + networkFee;

  const updateField = (field: keyof PaymentForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const orderId = `KUR-${Date.now().toString().slice(-8)}`;

    const order: ConfirmationOrder = {
      orderId,
      date: new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      wallet: selectedWallet,
      network: form.network,
      subtotal,
      networkFee,
      total,
      items: cart.map((nft) => {
        const quantity = cartQuantities[nft.id] ?? 1;

        return {
          id: nft.id,
          name: nft.name,
          image: nft.image,
          quantity,
          itemTotal: nft.priceInEth * quantity,
        };
      }),
    };

    setConfirmation(order);
    setExplorerNotice(false);
    clearCart();
  };

  if (confirmation) {
    return (
      <main className="payment-page payment-confirmation-page">
        <div className="payment-confirmation-overlay">
          <section
            className="payment-confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
          >
            <Link
              to="/"
              className="payment-confirmation-close"
              aria-label="Fechar confirmação"
            >
              <X size={17} weight="regular" />
            </Link>

            <div className="payment-confirmation-icon">
              <EnvelopeSimple size={48} weight="regular" />
              <span>
                THANK
                <br />
                YOU
              </span>
            </div>

            <h2 id="confirmation-title">
              Seus NFTs agora estão na sua carteira
            </h2>

            <div className="payment-confirmation-metadata">
              <div>
                <span>ID do pedido</span>
                <strong>{confirmation.orderId}</strong>
              </div>

              <div>
                <span>Data</span>
                <strong>{confirmation.date}</strong>
              </div>

              <div>
                <span>Total</span>
                <strong>{formatEth(confirmation.total)}</strong>
              </div>

              <div>
                <span>Carteira</span>
                <strong>{confirmation.wallet}</strong>
              </div>
            </div>

            <div className="payment-confirmation-details">
              <h3>Detalhes do pedido</h3>

              <div className="payment-confirmation-columns">
                <span>NFTs</span>
                <span>Edições</span>
                <span>Subtotal</span>
              </div>

              <div className="payment-confirmation-items">
                {confirmation.items.map((item) => (
                  <div className="payment-confirmation-item" key={item.id}>
                    <div className="payment-confirmation-product">
                      <img src={item.image} alt={item.name} />

                      <div>
                        <strong>{item.name}</strong>
                        <span>ID do token: #{item.id}</span>
                      </div>
                    </div>

                    <span className="payment-confirmation-quantity">
                      (x {item.quantity})
                    </span>

                    <strong className="payment-confirmation-price">
                      {formatEth(item.itemTotal)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="payment-confirmation-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatEth(confirmation.subtotal)}</strong>
                </div>

                <div>
                  <span>Taxa de rede</span>
                  <strong>{formatEth(confirmation.networkFee)}</strong>
                </div>

                <div className="payment-confirmation-grand-total">
                  <span>Total</span>
                  <strong>{formatEth(confirmation.total)}</strong>
                </div>
              </div>
            </div>

            <div className="payment-confirmation-status">
              <CheckCircle size={15} weight="fill" />
              <span>Pedido registrado com sucesso.</span>
            </div>

            <p className="payment-confirmation-message">
              Esta é uma confirmação demonstrativa do pedido. Nenhuma transação
              real foi enviada à blockchain.
            </p>

            <button
              type="button"
              className="payment-confirmation-explorer"
              onClick={() => setExplorerNotice(true)}
            >
              Ver no Etherscan
            </button>

            {explorerNotice && (
              <p className="payment-confirmation-notice" role="status">
                O pedido é simulado e ainda não possui registro no Etherscan.
              </p>
            )}

            <div className="payment-confirmation-bottom" />
          </section>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="payment-page">
        <div className="payment-container">
          <nav className="payment-breadcrumb" aria-label="Navegação">
            <Link to="/">Início</Link>
            <span>/</span>
            <Link to="/">Mercado</Link>
            <span>/</span>
            <span>Pagamento</span>
          </nav>

          <div className="payment-empty">
            <h1>Seu carrinho está vazio</h1>
            <p>Adicione NFTs ao carrinho para continuar com o pagamento.</p>
            <Link to="/" className="payment-empty-button">
              Explorar NFTs
            </Link>
          </div>
        </div>

        <HomeBottomSections showEditorialSections={false} />
      </main>
    );
  }

  return (
    <main className="payment-page">
      <div className="payment-container">
        <nav className="payment-breadcrumb" aria-label="Navegação">
          <Link to="/">Início</Link>
          <span>/</span>
          <Link to="/">Mercado</Link>
          <span>/</span>
          <span>Pagamento</span>
        </nav>

        <form className="payment-form-layout" onSubmit={handleSubmit}>
          <section className="payment-profile">
            <h1>Perfil do colecionador</h1>

            <div className="payment-fields-grid">
              <div className="payment-field">
                <label htmlFor="displayName">
                  Nome de exibição<span>*</span>
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  value={form.displayName}
                  onChange={(event) =>
                    updateField("displayName", event.target.value)
                  }
                  placeholder="Seu nome de exibição"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="username">
                  Nome de usuário<span>*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={(event) =>
                    updateField("username", event.target.value)
                  }
                  placeholder="Seu nome de usuário"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="network">
                  Rede<span>*</span>
                </label>
                <select
                  id="network"
                  name="network"
                  value={form.network}
                  onChange={(event) =>
                    updateField("network", event.target.value)
                  }
                  required
                >
                  <option value="">Selecione uma rede</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Base">Base</option>
                </select>
              </div>

              <div className="payment-field">
                <label htmlFor="profileName">
                  Nome do perfil<span>*</span>
                </label>
                <input
                  id="profileName"
                  name="profileName"
                  value={form.profileName}
                  onChange={(event) =>
                    updateField("profileName", event.target.value)
                  }
                  placeholder="Nome do perfil"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="walletAddress">
                  Endereço da carteira<span>*</span>
                </label>
                <input
                  id="walletAddress"
                  name="walletAddress"
                  value={form.walletAddress}
                  onChange={(event) =>
                    updateField("walletAddress", event.target.value)
                  }
                  placeholder="Endereço 0x da carteira"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="secondaryWallet">
                  ENS ou carteira secundária (opcional)
                </label>
                <input
                  id="secondaryWallet"
                  name="secondaryWallet"
                  value={form.secondaryWallet}
                  onChange={(event) =>
                    updateField("secondaryWallet", event.target.value)
                  }
                  placeholder="ENS ou carteira secundária"
                />
              </div>

              <div className="payment-field">
                <label htmlFor="walletType">
                  Tipo de carteira<span>*</span>
                </label>
                <select
                  id="walletType"
                  name="walletType"
                  value={form.walletType}
                  onChange={(event) =>
                    updateField("walletType", event.target.value)
                  }
                  required
                >
                  <option value="">Selecione uma carteira</option>
                  {walletOptions.map((wallet) => (
                    <option key={wallet} value={wallet}>
                      {wallet}
                    </option>
                  ))}
                </select>
              </div>

              <div className="payment-field">
                <label htmlFor="referralCode">
                  Código de indicação<span>*</span>
                </label>
                <input
                  id="referralCode"
                  name="referralCode"
                  value={form.referralCode}
                  onChange={(event) =>
                    updateField("referralCode", event.target.value)
                  }
                  placeholder="Código de indicação"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="email">
                  E-mail<span>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="ensName">
                  Nome ENS<span>*</span>
                </label>
                <select
                  id="ensName"
                  name="ensName"
                  value={form.ensName}
                  onChange={(event) =>
                    updateField("ensName", event.target.value)
                  }
                >
                  <option value=".eth">.eth</option>
                  <option value=".xyz">.xyz</option>
                  <option value=".art">.art</option>
                </select>
              </div>
            </div>

            <label className="payment-another-wallet">
              <input
                type="checkbox"
                checked={useAnotherWallet}
                onChange={(event) => setUseAnotherWallet(event.target.checked)}
              />
              <span>Usar outra carteira?</span>
            </label>

            {useAnotherWallet && (
              <div className="payment-another-wallet-field">
                <label htmlFor="anotherWalletAddress">
                  Endereço da outra carteira
                </label>
                <input
                  id="anotherWalletAddress"
                  value={form.secondaryWallet}
                  onChange={(event) =>
                    updateField("secondaryWallet", event.target.value)
                  }
                  placeholder="Informe o endereço da carteira"
                />
              </div>
            )}

            <div className="payment-observation">
              <label htmlFor="observation">
                Observação do colecionador (opcional)
              </label>
              <textarea
                id="observation"
                name="observation"
                value={form.observation}
                onChange={(event) =>
                  updateField("observation", event.target.value)
                }
              />
            </div>
          </section>

          <aside className="payment-order">
            <div className="payment-order-title">
              <h2>Seus NFTs</h2>
            </div>

            <div className="payment-order-columns">
              <span>NFTs</span>
              <span>Subtotal</span>
            </div>

            <div className="payment-order-list">
              {cart.map((nft) => {
                const quantity = cartQuantities[nft.id] ?? 1;
                const itemTotal = nft.priceInEth * quantity;

                return (
                  <div className="payment-order-card" key={nft.id}>
                    <img src={nft.image} alt={nft.name} />

                    <div className="payment-order-card-info">
                      <strong>{nft.name}</strong>
                      <span>
                        ID do token: #{nft.id} (x {quantity})
                      </span>
                    </div>

                    <strong className="payment-order-card-price">
                      {formatEth(itemTotal)}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="payment-promo-caption">
              Tem um código promocional? Aplique aqui
            </div>

            <div className="payment-order-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatEth(subtotal)}</strong>
              </div>

              <div>
                <span>Desconto do lançamento</span>
                <strong>(-) 0.000 ETH</strong>
              </div>

              <div className="payment-network-fee">
                <span>Taxa de rede</span>
                <div>
                  <strong>{formatEth(networkFee)}</strong>
                  <small>Taxa estimada</small>
                </div>
              </div>
            </div>

            <div className="payment-final-total">
              <strong>Total</strong>
              <strong>{formatEth(total)}</strong>
            </div>

            <div className="payment-wallet-selection">
              <h3>Carteira e rede</h3>

              <div className="payment-wallet-options">
                {walletOptions.map((wallet) => (
                  <label
                    key={wallet}
                    className={`payment-wallet-choice ${
                      selectedWallet === wallet ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedWallet"
                      value={wallet}
                      checked={selectedWallet === wallet}
                      onChange={() => setSelectedWallet(wallet)}
                    />
                    <span className="payment-radio-indicator" />
                    <span>{wallet}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="payment-confirm-button">
              Confirmar compra
            </button>

            <p className="payment-simulation-note">
              Compra demonstrativa. Nenhum pagamento real será realizado.
            </p>
          </aside>
        </form>
      </div>

      <HomeBottomSections showEditorialSections={false} />
    </main>
  );
}
