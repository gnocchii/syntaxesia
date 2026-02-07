"use client";
import React, { useMemo, useState } from "react";

type Props = {
  /**
   * Called when user submits a repo URL.
   * You likely want to kick off your backend pipeline and then route to the gallery scene.
   */
  onSubmitRepo: (repoUrl: string) => Promise<void> | void;

  /** Optional: show/hide the overlay if you want to fade it out once the gallery loads */
  visible?: boolean;

  /** Optional: prefill */
  defaultRepoUrl?: string;
};

function isLikelyGithubRepoUrl(url: string) {
  try {
    const u = new URL(url.trim());
    if (!["github.com", "www.github.com"].includes(u.hostname)) return false;
    // Expect /owner/repo at minimum
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return false;
    // reject obviously-not-repo routes
    const banned = new Set(["features", "pricing", "about", "login", "signup", "explore"]);
    if (banned.has(parts[0])) return false;
    return true;
  } catch {
    return false;
  }
}

export default function SyntaxesiaLobby({
  onSubmitRepo,
  visible = true,
  defaultRepoUrl = "",
}: Props) {
  const [repoUrl, setRepoUrl] = useState(defaultRepoUrl);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = useMemo(() => isLikelyGithubRepoUrl(repoUrl), [repoUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);

    if (!valid) {
      setError(
        "Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)."
      );
      return;
    }

    try {
      setLoading(true);
      await onSubmitRepo(repoUrl.trim());
    } catch (err: any) {
      setError(err?.message || "Something went wrong while curating your exhibition.");
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex min-h-screen flex-col bg-[#0b0b0f]">
      {/* vignette + grain */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(171,141,87,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_80%_10%,rgba(255,255,255,0.10),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/80" />
      <div className="sx-grain pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light" />

      {/* top bar */}
      <header className="pointer-events-auto mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-baseline gap-3">
          <div className="tracking-[0.35em] text-xs font-medium text-white/80">SYNTAXESIA</div>
          <div className="hidden sm:block text-[10px] text-white/50 tracking-[0.28em]">
            VIRTUAL MUSEUM OF CODE
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-[11px] tracking-[0.22em] text-white/75">
          <button className="hover:text-white transition">ABOUT</button>
          <button className="hover:text-white transition">AUDIO GUIDE</button>
          <button className="hover:text-white transition">EXHIBITIONS</button>
        </nav>

        <div className="text-[10px] tracking-[0.28em] text-white/60">EST. 2026</div>
      </header>

      {/* center placard */}
      <main className="pointer-events-auto mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 pb-16 pt-10 sm:px-10 sm:pb-20 sm:pt-12">
        <div className="w-full max-w-2xl -mt-10 sm:-mt-14">
          <div className="sx-placard rounded-3xl p-8 sm:p-12 shadow-[0_28px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/10 bg-white/[0.92]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[rgb(var(--sx-ink))]">
                  SYNTAXESIA
                </h1>
                <p className="mt-3 text-[15px] sm:text-base leading-relaxed text-black/70">
                  Paste a GitHub repository. We’ll transform its files into post-modern works,
                  hang them in a virtual gallery, and write placards with a perfectly
                  insufferable docent voice.
                </p>
              </div>

              {/* little “seal” */}
              <div className="shrink-0 rounded-full border border-black/10 bg-white/70 px-3.5 py-2 text-[10px] tracking-[0.25em] text-black/70 shadow-sm">
                CURATED
              </div>
            </div>

            <div className="mt-7 border-t border-black/10 pt-6">
              <div className="text-[11px] tracking-[0.25em] text-black/55">REPOSITORY ACCESSION</div>

              <form onSubmit={handleSubmit} className="mt-4">
                <label className="sr-only" htmlFor="repoUrl">
                  GitHub repo URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="repoUrl"
                    value={repoUrl}
                    onChange={(e) => {
                      setRepoUrl(e.target.value);
                      if (touched) setError(null);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full rounded-2xl border border-black/15 bg-white/75 px-5 py-4 text-[15px] outline-none shadow-sm
                               placeholder:text-black/35 focus:border-[rgba(171,141,87,0.7)] focus:ring-4 focus:ring-[rgba(171,141,87,0.22)]"
                  />

                  <button
                    type="submit"
                    disabled={!valid || loading}
                    className="rounded-2xl px-6 py-4 text-[13px] tracking-[0.14em] uppercase
                               disabled:opacity-50 disabled:cursor-not-allowed
                               bg-[rgba(171,141,87,0.95)] text-white hover:bg-[rgba(171,141,87,1)]
                               transition shadow-md active:translate-y-[1px]"
                  >
                    {loading ? "Curating…" : "Curate Exhibition"}
                  </button>
                </div>

                <div className="mt-3 min-h-[18px]">
                  {error ? (
                    <p className="text-xs text-red-700">{error}</p>
                  ) : touched && repoUrl.length > 0 && !valid ? (
                    <p className="text-xs text-black/55">
                      Tip: needs at least <span className="font-medium">github.com/owner/repo</span>.
                    </p>
                  ) : (
                    <p className="text-xs text-black/50">
                      Private repos aren’t supported unless your backend is authenticated.
                    </p>
                  )}
                </div>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px] text-black/60">
                <span className="rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 shadow-sm">🖼️ DALL-E artworks</span>
                <span className="rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 shadow-sm">🏷️ Witty placards</span>
                <span className="rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 shadow-sm">🔊 British audio guide</span>

                <button
                  type="button"
                  className="ml-auto rounded-full border border-black/10 bg-white/65 px-4 py-2 text-[12px] tracking-wide text-black/70 shadow-sm hover:bg-white/80 transition"
                  onClick={() => setRepoUrl("https://github.com/vercel/next.js")}
                >
                  Try an example
                </button>
              </div>
            </div>
          </div>

          {/* small footer note */}
          <p className="mt-7 text-[10px] tracking-[0.22em] text-white/70">
            PLEASE DO NOT TOUCH THE ART. (YOU MAY, HOWEVER, CLICK THE SPEAKER ICON.)
          </p>
        </div>
      </main>
    </div>
  );
}
