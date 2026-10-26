import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowClockwise,
  ArrowUpRight,
  DiscordLogo,
  SignOut,
} from "@phosphor-icons/react";
import { site, type Language } from "../data/site";
import { ToolHeading } from "./Shell";

export type DiscordUser = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  profileUrl: string;
};
type AuthState = {
  user: DiscordUser | null;
  configured: boolean;
  loading: boolean;
  error: boolean;
  expiresAt: number | null;
};
type Auth = AuthState & { refresh: () => void; logout: () => Promise<boolean> };
const AuthContext = createContext<Auth | null>(null);
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("Missing AuthProvider");
  return auth;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    configured: false,
    loading: true,
    error: false,
    expiresAt: null,
  });
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 10000);
    setState((s) => ({ ...s, loading: true, error: false }));
    fetch("/api/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (typeof data.configured !== "boolean") throw new Error();
        if (active)
          setState({
            user: data.user || null,
            configured: data.configured,
            loading: false,
            error: false,
            expiresAt: data.expiresAt || null,
          });
      })
      .catch(() => {
        if (active)
          setState({
            user: null,
            configured: false,
            loading: false,
            error: true,
            expiresAt: null,
          });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [reload]);
  useEffect(() => {
    if (!state.expiresAt) return;
    const timeout = setTimeout(
      () => setState((s) => ({ ...s, user: null, expiresAt: null })),
      Math.max(0, state.expiresAt - Date.now()),
    );
    return () => clearTimeout(timeout);
  }, [state.expiresAt]);
  const refresh = useCallback(() => setReload((n) => n + 1), []);
  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) return false;
      setState((s) => ({ ...s, user: null, expiresAt: null }));
      return true;
    } catch {
      return false;
    }
  };
  return (
    <AuthContext.Provider value={{ ...state, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthControl({ lang }: { lang: Language }) {
  const { user, loading } = useAuth();
  return user ? (
    <a
      className="account-control"
      href="/account"
      aria-label={`${lang === "id" ? "Akun" : "Account"}: ${user.name}`}
    >
      <img src={user.avatar} alt="" width="30" height="30" />
      <span>{user.name}</span>
    </a>
  ) : (
    <a
      className="login-control"
      href={`/login?returnTo=${encodeURIComponent(window.location.pathname)}`}
      aria-label={
        lang === "id" ? "Masuk dengan Discord" : "Sign in with Discord"
      }
      aria-busy={loading}
    >
      <DiscordLogo size={18} weight="fill" />
      <span>{lang === "id" ? "Masuk" : "Sign in"}</span>
    </a>
  );
}

const authErrors: Record<string, [string, string]> = {
  cancelled: [
    "Login dibatalkan. Kamu bisa mencoba lagi kapan saja.",
    "Sign-in was cancelled. You can try again anytime.",
  ],
  invalid_state: [
    "Tautan login sudah kedaluwarsa atau tidak valid. Mulai login lagi.",
    "This sign-in link has expired or is invalid. Please start again.",
  ],
  discord_unavailable: [
    "Discord belum dapat dihubungi. Silakan coba lagi.",
    "Discord is unavailable. Please try again.",
  ],
  not_configured: [
    "Login komunitas belum tersedia. Silakan kembali nanti.",
    "Community sign-in is not available yet. Please check back later.",
  ],
};

export function LoginPage({
  lang,
  gated = false,
}: {
  lang: Language;
  gated?: boolean;
}) {
  const auth = useAuth();
  const id = lang === "id";
  const params = new URLSearchParams(window.location.search);
  const returnTo = gated
    ? window.location.pathname
    : params.get("returnTo") || "/account";
  const message = authErrors[params.get("error") || ""];
  return (
    <main className="tool-page wrap login-page">
      <ToolHeading
        lang={lang}
        title={
          id ? "Masuk, lalu ikut ceritanya." : "Sign in. Be part of the story."
        }
        body={
          gated
            ? id
              ? "Masuk dengan akun Discord untuk menggunakan alat komunitas ini."
              : "Sign in with Discord to use this community tool."
            : id
              ? `Satu akun Discord untuk terhubung dengan ${site.name}.`
              : `Connect with ${site.name} using your Discord account.`
        }
      />
      <div className="login-card">
        <DiscordLogo className="login-brand" size={44} weight="fill" />
        <h2>{id ? "Akunmu, identitasmu." : "Your account. Your identity."}</h2>
        <p>
          {id
            ? "Kami hanya meminta identitas dasar: nama, username, dan avatar Discord. Proses login berlangsung di Discord."
            : "We only request your basic identity: name, username, and Discord avatar. Sign-in happens on Discord."}
        </p>
        {message && (
          <p className="notice" role="alert">
            {message[id ? 0 : 1]}
          </p>
        )}
        {auth.loading ? (
          <p role="status">
            {id ? "Memeriksa sesi…" : "Checking your session…"}
          </p>
        ) : auth.user ? (
          <a className="button primary" href="/account">
            {id ? "Buka akun" : "View account"}
          </a>
        ) : auth.error ? (
          <>
            <p role="status">
              {id
                ? "Layanan login belum dapat dimuat."
                : "Sign-in is currently unavailable."}
            </p>
            <button className="button secondary" onClick={auth.refresh}>
              <ArrowClockwise size={18} />
              {id ? "Coba lagi" : "Retry"}
            </button>
          </>
        ) : auth.configured ? (
          <a
            className="button primary"
            href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
          >
            <DiscordLogo size={20} weight="fill" />
            {id ? "Masuk dengan Discord" : "Sign in with Discord"}
            <ArrowUpRight size={16} />
          </a>
        ) : (
          <p className="notice" role="status">
            {id
              ? "Login komunitas belum tersedia. Silakan kembali nanti."
              : "Community sign-in is not available yet. Please check back later."}
          </p>
        )}
      </div>
    </main>
  );
}

export function RequireLogin({
  children,
  lang,
}: {
  children: ReactNode;
  lang: Language;
}) {
  const { user } = useAuth();
  return user ? children : <LoginPage lang={lang} gated />;
}

export function AccountPage({ lang }: { lang: Language }) {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const id = lang === "id";
  if (!user) return <LoginPage lang={lang} />;
  return (
    <main className="tool-page wrap">
      <ToolHeading
        lang={lang}
        title={id ? "Akun komunitasmu." : "Your community account."}
        body={
          id
            ? "Identitas ini terhubung melalui akun Discord milikmu."
            : "This identity is connected through your Discord account."
        }
      />
      <section className="account-card">
        <img
          className="account-avatar"
          src={user.avatar}
          alt={user.name}
          width="96"
          height="96"
        />
        <div>
          <h2>{user.name}</h2>
          <p>@{user.username}</p>
          <small>Discord ID: {user.id}</small>
        </div>
        <a
          className="button secondary"
          href={user.profileUrl}
          target="_blank"
          rel="noreferrer"
        >
          {id ? "Profil Discord" : "Discord profile"}
          <ArrowUpRight size={16} />
        </a>
        <button
          className="button secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(false);
            const ok = await logout();
            if (!ok) setError(true);
            setBusy(false);
          }}
        >
          <SignOut size={18} />
          {busy
            ? id
              ? "Keluar…"
              : "Signing out…"
            : id
              ? "Keluar dari website"
              : "Sign out"}
        </button>
        {error && (
          <p role="alert" className="error">
            {id
              ? "Belum berhasil keluar. Silakan coba lagi."
              : "Could not sign out. Please try again."}
          </p>
        )}
      </section>
    </main>
  );
}
