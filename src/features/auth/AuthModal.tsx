import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Eye, EyeSlash, X } from "@phosphor-icons/react";

import { authService } from "../../services/auth.service";
import type { LoginPayload, RegisterPayload } from "../../types/api";

import "./auth-modal.css";

export type AuthMode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ApiError {
  message?: string;
}

export function AuthModal({
  open,
  initialMode = "login",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setMode(initialMode);
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }, [open, initialMode]);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
  }

  function getErrorMessage(exception: unknown): string {
    if (axios.isAxiosError<ApiError>(exception)) {
      return (
        exception.response?.data?.message ??
        "Não foi possível concluir sua solicitação. Tente novamente."
      );
    }

    return "Ocorreu um erro inesperado. Tente novamente.";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Informe seu e-mail.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Informe um endereço de e-mail válido.");
      return;
    }

    if (!password) {
      setError("Informe sua senha.");
      return;
    }

    if (mode === "register") {
      if (!username.trim()) {
        setError("Informe seu nome de usuário.");
        return;
      }

      if (password.length < 8) {
        setError("Sua senha precisa ter pelo menos 8 caracteres.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const payload: LoginPayload = {
          email: email.trim(),
          password,
        };

        await authService.login(payload);
      } else {
        const normalizedUsername = username.trim().replace(/^@/, "");

        const payload: RegisterPayload = {
          name: normalizedUsername,
          username: normalizedUsername,
          email: email.trim().toLowerCase(),
          password,
        };

        await authService.register(payload);
      }

      onSuccess?.();
      onClose();
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="auth-dialog"
      aria-labelledby="auth-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <section className="auth-modal">
        <button
          type="button"
          className="auth-close-button"
          aria-label="Fechar autenticação"
          onClick={onClose}
        >
          <X size={19} weight="regular" />
        </button>

        <header className="auth-header">
          <div className="auth-tabs" role="tablist" aria-label="Autenticação">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Entrar
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={mode === "register" ? "active" : ""}
              onClick={() => switchMode("register")}
            >
              Criar conta
            </button>
          </div>

          <h2 className="auth-title" id="auth-title">
            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h2>

          <p className="auth-description">
            {mode === "login"
              ? "Faça seu login para acessar sua coleção e continuar explorando."
              : "Faça parte do universo da arte digital e comece sua coleção."}
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === "register" && (
            <div className="auth-field">
              <label htmlFor="auth-username">Nome de usuário</label>

              <input
                id="auth-username"
                name="username"
                autoComplete="username"
                placeholder="@seuusuario"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">E-mail</label>

            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Senha</label>

            <div className="auth-password-wrapper">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === "login" && (
            <div className="auth-forgot-password">
              <button
                type="button"
                onClick={() =>
                  setError(
                    "A recuperação de senha será disponibilizada em uma próxima etapa.",
                  )
                }
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou continue com</span>
        </div>

        <div className="auth-social-options">
          <button type="button" disabled title="Indisponível na demonstração">
            <span className="auth-google-mark">G</span>
            Continue com Google
          </button>

          <button type="button" disabled title="Indisponível na demonstração">
            <span className="auth-facebook-mark">f</span>
            Continue com Facebook
          </button>
        </div>

        <p className="auth-switch">
          {mode === "login" ? (
            <>
              Ainda não tem uma conta?{" "}
              <button type="button" onClick={() => switchMode("register")}>
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já possui uma conta?{" "}
              <button type="button" onClick={() => switchMode("login")}>
                Entrar
              </button>
            </>
          )}
        </p>
      </section>
    </dialog>
  );
}
