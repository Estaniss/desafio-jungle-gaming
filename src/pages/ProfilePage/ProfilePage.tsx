import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { FloppyDisk, Image, Trash, UploadSimple } from "@phosphor-icons/react";

import { AccountLayout } from "../../components/account/AccountLayout";
import { profileService } from "../../services/profile.service";
import { useAuthStore } from "../../stores/auth-store";
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "../../types/api";

import "./profile-page.css";

interface ProfileForm {
  displayName: string;
  username: string;
  email: string;
  ensName: string;
  ensExtension: ".eth";
  walletNickname: string;
  avatar: string;
}

const initialForm: ProfileForm = {
  displayName: "",
  username: "",
  email: "",
  ensName: "",
  ensExtension: ".eth",
  walletNickname: "",
  avatar: "",
};

export default function ProfilePage() {
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const profile = await profileService.getProfile();

        if (!active) return;

        setForm({
          displayName: profile.displayName ?? "",
          username: profile.username ?? "",
          email: profile.email ?? "",
          ensName: (profile.ensName ?? "").replace(/\.eth$/i, ""),
          ensExtension: ".eth",
          walletNickname: profile.walletNickname ?? "",
          avatar: profile.avatar ?? "",
        });
      } catch {
        if (active) {
          setError("Não foi possível carregar seu perfil.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof ProfileForm>(
    field: K,
    value: ProfileForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("avatar", reader.result);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function validatePassword() {
    const passwordFieldsFilled = [
      currentPassword,
      newPassword,
      confirmPassword,
    ].some(Boolean);

    if (!passwordFieldsFilled) return true;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Preencha os três campos de alteração de senha.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("A confirmação da nova senha não corresponde.");
      return false;
    }

    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.displayName.trim() || !form.username.trim()) {
      setError("Preencha os campos obrigatórios.");
      return;
    }

    if (!validatePassword()) return;

    setSaving(true);

    try {
      const payload: UpdateProfilePayload = {
        displayName: form.displayName.trim(),
        username: form.username.trim().replace(/^@/, ""),
        ensName: form.ensName.trim()
          ? `${form.ensName.trim()}${form.ensExtension}`
          : "",
        walletNickname: form.walletNickname.trim(),
        avatar: form.avatar,
      };

      const updated = await profileService.updateProfile(payload);

      if (currentUser) {
        setUser({
          ...currentUser,
          name: updated.displayName,
          username: updated.username,
          email: updated.email,
          avatar: updated.avatar,
        });
      }

      if (currentPassword && newPassword && confirmPassword) {
        const passwordPayload = {
          currentPassword,
          newPassword,
          confirmPassword,
        } as ChangePasswordPayload;

        setChangingPassword(true);

        await profileService.changePassword(passwordPayload);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setSuccess("Seus dados foram salvos com sucesso.");
    } catch (exception) {
      if (axios.isAxiosError(exception)) {
        setError(
          exception.response?.data?.message ??
            "Não foi possível salvar as alterações.",
        );
      } else {
        setError("Ocorreu um erro ao salvar seu perfil.");
      }
    } finally {
      setSaving(false);
      setChangingPassword(false);
    }
  }

  return (
    <AccountLayout>
      <div className="profile-page-content">
        <header className="account-content-header">
          <h1>Perfil do colecionador</h1>
        </header>

        {loading ? (
          <div className="account-loading">Carregando seu perfil...</div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-fields-grid">
              <div className="profile-field">
                <label htmlFor="profile-display-name">
                  Nome de exibição <span>*</span>
                </label>

                <input
                  id="profile-display-name"
                  value={form.displayName}
                  onChange={(event) =>
                    updateField("displayName", event.target.value)
                  }
                  placeholder="Seu nome de exibição"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-username">
                  Nome de usuário <span>*</span>
                </label>

                <div className="profile-input-prefix">
                  <span>@</span>

                  <input
                    id="profile-username"
                    value={form.username}
                    onChange={(event) =>
                      updateField("username", event.target.value)
                    }
                    placeholder="seuusuario"
                    required
                  />
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">
                  E-mail <span>*</span>
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  disabled
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-ens">
                  Nome ENS <span>*</span>
                </label>

                <div className="profile-ens-input">
                  <select
                    aria-label="Extensão ENS"
                    value={form.ensExtension}
                    onChange={(event) =>
                      updateField("ensExtension", event.target.value as ".eth")
                    }
                  >
                    <option value=".eth">.eth</option>
                  </select>

                  <input
                    id="profile-ens"
                    value={form.ensName}
                    onChange={(event) =>
                      updateField(
                        "ensName",
                        event.target.value.replace(/\.eth$/i, ""),
                      )
                    }
                    placeholder="seunome"
                  />
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="profile-wallet-nickname">
                  Apelido da carteira <span>*</span>
                </label>

                <input
                  id="profile-wallet-nickname"
                  value={form.walletNickname}
                  onChange={(event) =>
                    updateField("walletNickname", event.target.value)
                  }
                  placeholder="Minha carteira"
                />
              </div>

              <div className="profile-field profile-avatar-field">
                <label>Avatar</label>

                <div className="profile-avatar-controls">
                  <div className="profile-avatar-preview">
                    {form.avatar ? (
                      <img src={form.avatar} alt="Avatar do colecionador" />
                    ) : (
                      <Image size={26} weight="light" />
                    )}
                  </div>

                  <div className="profile-avatar-actions">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      hidden
                    />

                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <UploadSimple size={15} />
                      Alterar
                    </button>

                    <button
                      type="button"
                      className="profile-avatar-remove"
                      onClick={() => {
                        updateField("avatar", "");

                        if (avatarInputRef.current) {
                          avatarInputRef.current.value = "";
                        }
                      }}
                    >
                      <Trash size={15} />
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <section className="profile-password-section">
              <h2>Alterar senha</h2>

              <div className="profile-password-fields">
                <div className="profile-field">
                  <label htmlFor="current-password">Senha atual</label>

                  <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="new-password">Nova senha</label>

                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="confirm-password">Confirmar nova senha</label>

                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
              </div>
            </section>

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

            <div className="profile-form-actions">
              <button
                type="submit"
                className="account-primary-button"
                disabled={saving || changingPassword}
              >
                <FloppyDisk size={17} />

                {saving || changingPassword ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AccountLayout>
  );
}
