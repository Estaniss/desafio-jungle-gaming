import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Copy, Plus, Trash, Wallet as WalletIcon } from "@phosphor-icons/react";

import { AccountLayout } from "../../components/account/AccountLayout";
import { walletService } from "../../services/wallet.service";
import type { CreateWalletPayload, Wallet } from "../../types/api";

import "./wallets-page.css";

interface WalletForm {
  displayName: string;
  nickname: string;
  network: CreateWalletPayload["network"];
  profileName: string;
  address: string;
  secondaryEns: string;
  provider: CreateWalletPayload["provider"];
  referralCode: string;
  email: string;
  ensName: string;
}

const emptyForm: WalletForm = {
  displayName: "",
  nickname: "",
  network: "" as CreateWalletPayload["network"],
  profileName: "",
  address: "",
  secondaryEns: "",
  provider: "" as CreateWalletPayload["provider"],
  referralCode: "",
  email: "",
  ensName: "",
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [form, setForm] = useState<WalletForm>(emptyForm);
  const [secondaryForm, setSecondaryForm] = useState<WalletForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [addingSecondary, setAddingSecondary] = useState(false);
  const [sameAsPrimary, setSameAsPrimary] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWallets() {
      try {
        const data = await walletService.getWallets();

        if (active) {
          setWallets(data);
        }
      } catch {
        if (active) {
          setError("Não foi possível carregar suas carteiras.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWallets();

    return () => {
      active = false;
    };
  }, []);

  const primaryWallet =
    wallets.find((wallet) => wallet.isPrimary) ?? wallets[0];

  const secondaryWallets = wallets.filter(
    (wallet) => wallet.id !== primaryWallet?.id,
  );

  const shouldShowPrimaryForm = !primaryWallet || showForm;

  function updateForm<K extends keyof WalletForm>(
    field: K,
    value: WalletForm[K],
    secondary = false,
  ) {
    if (secondary) {
      setSecondaryForm((current) => ({
        ...current,
        [field]: value,
      }));
    } else {
      setForm((current) => ({
        ...current,
        [field]: value,
      }));
    }

    setError("");
    setSuccess("");
  }

  function validateWallet(data: WalletForm) {
    const requiredFields = [
      data.displayName,
      data.nickname,
      data.network,
      data.profileName,
      data.address,
      data.provider,
      data.referralCode,
      data.email,
      data.ensName,
    ];

    if (requiredFields.some((field) => !String(field).trim())) {
      return "Preencha todos os campos obrigatórios.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      return "Informe um e-mail válido.";
    }

    return "";
  }

  async function saveWallet(
    event: FormEvent<HTMLFormElement>,
    data: WalletForm,
    secondary = false,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateWallet(data);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload: CreateWalletPayload = {
        name: data.nickname.trim(),
        displayName: data.displayName.trim(),
        network: data.network,
        profileName: data.profileName.trim(),
        address: data.address.trim(),
        secondaryEns: data.secondaryEns.trim(),
        provider: data.provider,
        referralCode: data.referralCode.trim(),
        email: data.email.trim(),
        ensName: `${data.ensName.trim()}.eth`,
      };

      const created = await walletService.addWallet(payload);

      setWallets((current) => [...current, created]);

      setSuccess(
        secondary
          ? "Carteira secundária adicionada."
          : "Carteira principal adicionada.",
      );

      if (secondary) {
        setSecondaryForm(emptyForm);
        setAddingSecondary(false);
        setSameAsPrimary(false);
      } else {
        setForm(emptyForm);
        setShowForm(false);
      }
    } catch (exception) {
      if (axios.isAxiosError(exception)) {
        setError(
          exception.response?.data?.message ??
            "Não foi possível salvar a carteira.",
        );
      } else {
        setError("Ocorreu um erro ao salvar a carteira.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeWallet(walletId: string) {
    const confirmed = window.confirm("Deseja realmente remover esta carteira?");

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await walletService.removeWallet(walletId);

      setWallets((current) =>
        current.filter((wallet) => wallet.id !== walletId),
      );

      setSuccess("Carteira removida.");
    } catch {
      setError("Não foi possível remover esta carteira.");
    }
  }

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setSuccess("Endereço copiado.");
      setError("");
    } catch {
      setError("Não foi possível copiar o endereço.");
      setSuccess("");
    }
  }

  function renderWalletFields(data: WalletForm, secondary = false) {
    const suffix = secondary ? "-secondary" : "-primary";

    return (
      <div className="wallet-fields-grid">
        <div className="wallet-field">
          <label htmlFor={`wallet-display-name${suffix}`}>
            Nome de exibição <span>*</span>
          </label>

          <input
            id={`wallet-display-name${suffix}`}
            value={data.displayName}
            onChange={(event) =>
              updateForm("displayName", event.target.value, secondary)
            }
            placeholder="Nome de exibição"
            required
          />
        </div>

        <div className="wallet-field">
          <label htmlFor={`wallet-nickname${suffix}`}>
            Apelido da carteira <span>*</span>
          </label>

          <input
            id={`wallet-nickname${suffix}`}
            value={data.nickname}
            onChange={(event) =>
              updateForm("nickname", event.target.value, secondary)
            }
            placeholder="Apelido da carteira"
            required
          />
        </div>

        <div className="wallet-field">
          <label htmlFor={`wallet-network${suffix}`}>
            Rede <span>*</span>
          </label>

          <select
            id={`wallet-network${suffix}`}
            value={data.network}
            onChange={(event) =>
              updateForm(
                "network",
                event.target.value as WalletForm["network"],
                secondary,
              )
            }
            required
          >
            <option value="" disabled>
              Selecione uma rede
            </option>
            <option value="Ethereum">Ethereum</option>
            <option value="Polygon">Polygon</option>
            <option value="Base">Base</option>
          </select>
        </div>

        <div className="wallet-field">
          <label htmlFor={`wallet-profile-name${suffix}`}>
            Nome do perfil <span>*</span>
          </label>

          <input
            id={`wallet-profile-name${suffix}`}
            value={data.profileName}
            onChange={(event) =>
              updateForm("profileName", event.target.value, secondary)
            }
            placeholder="Nome do perfil"
            required
          />
        </div>

        <div className="wallet-field">
          <label htmlFor={`wallet-address${suffix}`}>
            Endereço da carteira <span>*</span>
          </label>

          <input
            id={`wallet-address${suffix}`}
            value={data.address}
            onChange={(event) =>
              updateForm("address", event.target.value, secondary)
            }
            placeholder="Endereço 0x da carteira"
            spellCheck={false}
            required
          />
        </div>

        <div className="wallet-field">
          <label htmlFor={`wallet-secondary-ens${suffix}`}>
            ENS ou carteira secundária (opcional)
          </label>

          <input
            id={`wallet-secondary-ens${suffix}`}
            value={data.secondaryEns}
            onChange={(event) =>
              updateForm("secondaryEns", event.target.value, secondary)
            }
            placeholder="ENS ou carteira secundária (opcional)"
          />
        </div>

        <div className="wallet-field">
          <label htmlFor={`wallet-provider${suffix}`}>
            Tipo de carteira <span>*</span>
          </label>

          <select
            id={`wallet-provider${suffix}`}
            value={data.provider}
            onChange={(event) =>
              updateForm(
                "provider",
                event.target.value as WalletForm["provider"],
                secondary,
              )
            }
            required
          >
            <option value="" disabled>
              Selecione uma carteira
            </option>
            <option value="MetaMask">MetaMask</option>
            <option value="WalletConnect">WalletConnect</option>
            <option value="Coinbase Wallet">Coinbase Wallet</option>
          </select>
        </div>

        <div className="wallet-field">
          <label htmlFor={`wallet-referral${suffix}`}>
            Código de indicação <span>*</span>
          </label>

          <input
            id={`wallet-referral${suffix}`}
            value={data.referralCode}
            onChange={(event) =>
              updateForm("referralCode", event.target.value, secondary)
            }
            placeholder="Código de indicação"
            required
          />
        </div>

        <div className="wallet-field">
          <label htmlFor={`wallet-email${suffix}`}>
            E-mail <span>*</span>
          </label>

          <input
            id={`wallet-email${suffix}`}
            type="email"
            value={data.email}
            onChange={(event) =>
              updateForm("email", event.target.value, secondary)
            }
            placeholder="E-mail"
            required
          />
        </div>

        <div className="wallet-field">
          <label htmlFor={`wallet-ens${suffix}`}>
            Nome ENS <span>*</span>
          </label>

          <div className="wallet-ens-input">
            <select aria-label="Extensão ENS" value=".eth" disabled>
              <option value=".eth">.eth</option>
            </select>

            <input
              id={`wallet-ens${suffix}`}
              value={data.ensName}
              onChange={(event) =>
                updateForm("ensName", event.target.value, secondary)
              }
              placeholder=" "
              required
            />
          </div>
        </div>
      </div>
    );
  }

  function renderWalletCard(wallet: Wallet, primary = false) {
    return (
      <article className="wallet-card" key={wallet.id}>
        <div className="wallet-card-icon">
          <WalletIcon size={20} />
        </div>

        <div className="wallet-card-info">
          <strong>{wallet.name}</strong>

          <span>
            {wallet.network} · {wallet.provider}
          </span>

          <div className="wallet-address">
            <span>{wallet.address}</span>

            <button
              type="button"
              aria-label="Copiar endereço da carteira"
              onClick={() => void copyAddress(wallet.address)}
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="wallet-remove-button"
          aria-label={
            primary ? "Remover carteira principal" : `Remover ${wallet.name}`
          }
          onClick={() => void removeWallet(wallet.id)}
        >
          <Trash size={16} />
        </button>
      </article>
    );
  }

  const secondaryData: WalletForm =
    sameAsPrimary && primaryWallet
      ? {
          ...secondaryForm,
          displayName: primaryWallet.name,
          nickname: `${primaryWallet.name} secundária`,
          address: primaryWallet.address,
          network: primaryWallet.network,
          provider: primaryWallet.provider,
        }
      : secondaryForm;

  return (
    <AccountLayout>
      <div className="wallets-page-content">
        <header className="wallet-page-header">
          <h1>Carteiras</h1>
        </header>

        {error && (
          <p className="account-feedback error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="account-feedback success" role="status">
            {success}
          </p>
        )}

        <section className="wallet-section">
          <div className="wallet-section-heading">
            <div>
              <h2>Carteira principal</h2>
              <p>
                Estas carteiras ficam disponíveis no pagamento e para receber
                NFTs comprados.
              </p>
            </div>

            <button
              type="button"
              className="wallet-add-button"
              onClick={() => {
                setShowForm(true);
                setError("");
                setSuccess("");
              }}
            >
              <Plus size={14} />
              Adicionar
            </button>
          </div>

          {loading ? (
            <div className="account-loading">Carregando carteiras...</div>
          ) : (
            <>
              {primaryWallet && renderWalletCard(primaryWallet, true)}

              {shouldShowPrimaryForm && (
                <form
                  className="wallet-form"
                  onSubmit={(event) => void saveWallet(event, form)}
                >
                  {renderWalletFields(form)}

                  <div className="wallet-form-actions">
                    <button
                      type="submit"
                      className="account-primary-button"
                      disabled={saving}
                    >
                      {saving ? "Salvando..." : "Salvar carteira"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>

        <section className="wallet-section wallet-secondary-section">
          <div className="wallet-section-heading wallet-secondary-heading">
            <div>
              <h2>Carteira secundária</h2>
              <p>
                {secondaryWallets.length
                  ? "Suas carteiras secundárias cadastradas."
                  : "Você ainda não adicionou uma carteira secundária."}
              </p>
            </div>

            <div className="wallet-secondary-controls">
              <label className="wallet-same-primary">
                <input
                  type="checkbox"
                  checked={sameAsPrimary}
                  onChange={(event) => setSameAsPrimary(event.target.checked)}
                  disabled={!primaryWallet}
                />

                <span>Igual à carteira principal</span>
              </label>

              <button
                type="button"
                className="wallet-add-button"
                onClick={() => {
                  setAddingSecondary(true);
                  setError("");
                  setSuccess("");
                }}
              >
                <Plus size={14} />
                Adicionar
              </button>
            </div>
          </div>

          {addingSecondary && (
            <form
              className="wallet-form wallet-secondary-form"
              onSubmit={(event) => void saveWallet(event, secondaryData, true)}
            >
              {renderWalletFields(secondaryData, true)}

              <div className="wallet-form-actions">
                <button
                  type="submit"
                  className="account-primary-button"
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar carteira"}
                </button>
              </div>
            </form>
          )}

          {!loading && secondaryWallets.length > 0 && (
            <div className="wallet-list">
              {secondaryWallets.map((wallet) => renderWalletCard(wallet))}
            </div>
          )}
        </section>
      </div>
    </AccountLayout>
  );
}
