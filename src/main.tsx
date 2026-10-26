import { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { IconContext } from "@phosphor-icons/react";
import { copy, site, type Language } from "./data/site";
import { Footer, Header } from "./components/Shell";
import Home from "./components/Home";
import {
  AuthProvider,
  RequireLogin,
  LoginPage,
  AccountPage,
} from "./components/Auth";
import "./styles.css";

const Twibbon = lazy(() => import("./components/Twibbon"));
const CommunityForm = lazy(() => import("./components/CommunityForm"));
const Webhook = lazy(() => import("./components/Webhook"));

function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      return localStorage.getItem("community-lang") === "en" ? "en" : "id";
    } catch {
      return "id";
    }
  });
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("community-lang", lang);
    } catch {
      /* Language still works when storage is blocked. */
    }
    const title =
      path === "/twibbon"
        ? "Twibbon Studio"
        : path === "/forms/public"
          ? copy[lang].toolNames[1]
          : path === "/webhooks/editor"
            ? "Webhook Studio"
            : site.tagline;
    document.title = `${site.name} | ${title}`;
  }, [lang, path]);
  return (
    <AuthProvider>
      <IconContext.Provider value={{ weight: "regular" }}>
        <a className="skip-link" href="#content">
          {lang === "id" ? "Lewati ke konten" : "Skip to content"}
        </a>
        <Header lang={lang} setLang={setLang} tool={path !== "/"} />
        <div id="content" tabIndex={-1}>
          <Suspense
            fallback={
              <main className="tool-page wrap" aria-busy="true">
                <div className="loading-block" />
                <p role="status">
                  {lang === "id" ? "Menyiapkan halaman…" : "Loading page…"}
                </p>
              </main>
            }
          >
            {path === "/" ? (
              <Home lang={lang} />
            ) : path === "/twibbon" ? (
              <RequireLogin lang={lang}>
                <Twibbon lang={lang} />
              </RequireLogin>
            ) : path === "/forms/public" ? (
              <RequireLogin lang={lang}>
                <CommunityForm lang={lang} />
              </RequireLogin>
            ) : path === "/webhooks/editor" ? (
              <RequireLogin lang={lang}>
                <Webhook lang={lang} />
              </RequireLogin>
            ) : path === "/login" ? (
              <LoginPage lang={lang} />
            ) : path === "/account" ? (
              <AccountPage lang={lang} />
            ) : (
              <main className="tool-page wrap not-found">
                <span>404</span>
                <h1>
                  {lang === "id"
                    ? "Halaman belum ditemukan."
                    : "Page not found."}
                </h1>
                <a href="/" className="button primary">
                  {copy[lang].nav[0]}
                </a>
              </main>
            )}
          </Suspense>
        </div>
        <Footer lang={lang} />
      </IconContext.Provider>
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
