import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  UserCircle,
  Wallet,
  ChartLineUp,
  Heart,
  Tag,
  DownloadSimple,
  Headset,
  SignOut,
} from "@phosphor-icons/react";

import "./account-layout.css";
import { useAuthStore } from "../../stores/auth-store";
import { authService } from "../../services/auth.service";

interface AccountLayoutProps {
  children: ReactNode;
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);

  async function handleLogout() {
    await authService.logout();
    window.location.href = "/";
  }

  return (
    <main className="account-page">
      <div className="account-container">
        <aside className="account-sidebar">
          <div className="account-sidebar-heading">
            <span>ÁREA DO COLECIONADOR</span>
            <h2>Meu perfil</h2>
          </div>

          <nav className="account-navigation" aria-label="Menu da conta">
            <Link
              to="/profile"
              className={`account-nav-item ${pathname === "/profile" ? "active" : ""}`}
            >
              <UserCircle size={18} />
              <span>Dados do perfil</span>
            </Link>

            <Link
              to="/wallets"
              className={`account-nav-item ${pathname === "/wallets" ? "active" : ""}`}
            >
              <Wallet size={18} />
              <span>Carteiras</span>
            </Link>

            <button type="button" className="account-nav-item" disabled>
              <ChartLineUp size={18} />
              <span>Atividade</span>
            </button>

            <button type="button" className="account-nav-item" disabled>
              <Heart size={18} />
              <span>Lista de interesse</span>
            </button>

            <button type="button" className="account-nav-item" disabled>
              <Tag size={18} />
              <span>Ofertas</span>
            </button>

            <button type="button" className="account-nav-item" disabled>
              <DownloadSimple size={18} />
              <span>Arquivos baixados</span>
            </button>

            <button type="button" className="account-nav-item" disabled>
              <Headset size={18} />
              <span>Suporte</span>
            </button>
          </nav>

          <div className="account-sidebar-footer">
            <div className="account-sidebar-user">
              <span className="account-user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() ?? "K"}
              </span>

              <div>
                <strong>{user?.name ?? "Colecionador"}</strong>
                <span>@{user?.username ?? "kurio"}</span>
              </div>
            </div>

            <button
              type="button"
              className="account-logout-button"
              onClick={() => void handleLogout()}
            >
              <SignOut size={17} />
              Sair
            </button>
          </div>
        </aside>

        <section className="account-main">{children}</section>
      </div>
    </main>
  );
}
