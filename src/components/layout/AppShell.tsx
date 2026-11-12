import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { MagnifyingGlass, ShoppingBag } from "@phosphor-icons/react";

import { useMarketplaceStore } from "../../stores/marketplace-store";
import { useAuthStore } from "../../stores/auth-store";
import { authService } from "../../services/auth.service";
import { AuthModal, type AuthMode } from "../../features/auth/AuthModal";

export function AppShell() {
  const { cart } = useMarketplaceStore();
  const { pathname } = useLocation();

  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const isMarketActive = pathname !== "/";
  const totalCartItems = cart.length;

  useEffect(() => {
    void authService.restoreSession();
  }, []);

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  async function handleLogout() {
    await authService.logout();
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="site-brand" aria-label="Kurio - Início">
            KURIO<span>.</span>
          </Link>

          <nav className="main-navigation" aria-label="Navegação principal">
            <Link
              to="/"
              className="nav-link"
              activeProps={{ className: "nav-link active" }}
            >
              Início
            </Link>

            <a
              href="/#drops"
              className={`nav-link ${isMarketActive ? "active" : ""}`}
              aria-current={isMarketActive ? "page" : undefined}
            >
              Mercado
            </a>

            <a href="/#creators" className="nav-link">
              Criadores
            </a>

            <a href="/#how-it-works" className="nav-link">
              Aprenda
            </a>
          </nav>

          <div className="header-actions">
            <a
              href="/#drops"
              className="header-icon-button"
              aria-label="Buscar NFTs"
            >
              <MagnifyingGlass size={21} weight="regular" />
            </a>

            <Link
              to="/cart"
              className="header-icon-button cart-header-button"
              aria-label={`Carrinho com ${totalCartItems} itens`}
            >
              <ShoppingBag size={21} weight="regular" />

              {totalCartItems > 0 && (
                <span className="cart-count">{totalCartItems}</span>
              )}
            </Link>

            {!isLoading && isAuthenticated && user ? (
              <div className="header-authenticated">
                <Link to="/profile" className="header-account-link">
                  Minha conta
                </Link>

                <Link to="/wallets" className="header-account-link">
                  Carteiras
                </Link>

                <span className="header-user-name">
                  {user.name.split(" ")[0]}
                </span>

                <button
                  type="button"
                  className="header-login-button"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="header-login-button"
                onClick={() => openAuth("login")}
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="app-content">
        <Outlet />
      </div>

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
