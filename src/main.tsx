import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { IconContext } from "@phosphor-icons/react";
import { copy, site, type Language } from "./data/site";
import { Footer, Header } from "./components/Shell";
import Home from "./components/Home";
import { Opening, shouldPlayOpening } from "./components/Opening";
import {
  AuthProvider,
  LoginPage,
  AccountPage,
} from "./components/Auth";
import "./styles.css";

const Information = lazy(() => import("./components/Information"));
const SharePreview = lazy(() => import("./components/SharePreview"));

function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      return localStorage.getItem("community-lang") === "en" ? "en" : "id";
    } catch {
      return "id";
    }
  });
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const [opening, setOpening] = useState(() => path === "/" && shouldPlayOpening());
  const completeOpening = useCallback(() => {
    const returnFocus = document.activeElement?.closest(".opening");
    setOpening(false);
    if (returnFocus) {
      requestAnimationFrame(() => document.getElementById("content")?.focus({ preventScroll: true }));
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("community-lang", lang);
    } catch {
      /* Language still works when storage is blocked. */
    }
    const title =
      path === "/preview-discord"
        ? (lang === "id" ? "Pratinjau Discord" : "Discord preview")
        : path === "/information"
          ? copy[lang].information
          : site.tagline;
    document.title = `${site.name} | ${title}`;
  }, [lang, path]);
  return (
    <AuthProvider>
      <IconContext.Provider value={{ weight: "regular" }}>
        <div inert={opening}>
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
                <Home lang={lang} ready={!opening} />
              ) : path === "/information" ? (
                <Information lang={lang} />
              ) : path === "/preview-discord" ? (
                <SharePreview lang={lang} />
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
        </div>
        {opening && <Opening lang={lang} onComplete={completeOpening} />}
      </IconContext.Provider>
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
