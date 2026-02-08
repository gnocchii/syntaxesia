"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextType from "./TextType";

export default function SyntaxesiaLobby() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  return (
    <main
      className="sx-grain relative min-h-screen overflow-hidden px-6 py-10 sm:px-10 flex"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(250,246,238,0.98), rgba(208,190,165,0.98) 52%, rgba(168,145,120,0.98) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 25%, rgba(255,255,255,0.45), rgba(255,255,255,0.0) 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[70vh] max-w-5xl"
        style={{
          borderRadius: "200px 200px 80px 80px",
          boxShadow:
            "inset 0 0 0 2px rgba(255,255,255,0.35), inset 0 -30px 80px rgba(110,85,60,0.25)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(210,190,165,0.5) 45%, rgba(160,135,110,0.55) 100%)",
          opacity: 0.7,
          zIndex: 1,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[18vw] max-w-[220px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(175,150,125,0.9))",
          boxShadow:
            "inset -10px 0 25px rgba(0,0,0,0.18), 0 20px 60px rgba(0,0,0,0.18)",
          borderTopRightRadius: "40px",
          zIndex: 2,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[18vw] max-w-[220px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(175,150,125,0.9))",
          boxShadow:
            "inset 10px 0 25px rgba(0,0,0,0.18), 0 20px 60px rgba(0,0,0,0.18)",
          borderTopLeftRadius: "40px",
          zIndex: 2,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-52"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0), rgba(90,70,55,0.25) 60%, rgba(70,55,45,0.38) 100%)",
        }}
      />
      <div
        className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-8 text-center"
        style={{ gap: "1.5rem", minHeight: "100%" }}
      >
        <header
          className="space-y-3"
          style={{ display: "grid", gap: "0.6rem", marginTop: "5rem" }}
        >
          <TextType
            text={["SYNTAXESIA"]}
            typingSpeed={90}
            pauseDuration={1500}
            showCursor
            cursorCharacter="_"
            deletingSpeed={50}
            loop={false}
            as="h1"
            className="font-semibold tracking-[0.34em] text-[rgb(var(--sx-ink))]"
            style={{ fontSize: "clamp(2.25rem, 7vw, 5rem)" }}
          />
          <p className="mx-auto max-w-xl text-sm text-[rgba(28,28,28,0.65)] sm:text-base">
            Paste your code and we&apos;ll turn it into a gallery of abstract art.
          </p>
        </header>

        <section
          className="w-full space-y-3"
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            htmlFor="code-input"
            className="text-xs uppercase tracking-[0.3em] text-[rgba(28,28,28,0.6)]"
          >
            Your Code
          </label>
          <textarea
            id="code-input"
            placeholder="Paste code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mx-auto h-[32vh] w-full max-w-[750px] rounded-3xl border border-[rgba(28,28,28,0.2)] bg-white/90 p-5 text-sm text-[rgb(var(--sx-ink))] shadow-[0_16px_40px_rgba(28,28,28,0.08)] outline-none transition focus:border-[rgba(28,28,28,0.5)]"
            style={{
              borderRadius: "28px",
              padding: "1.25rem",
              maxHeight: "420px",
              minHeight: "180px",
            }}
          />
          <button
            className="mx-auto inline-flex items-center justify-center rounded-full bg-[rgb(var(--sx-ink))] px-6 py-3 text-sm font-medium text-[rgb(var(--sx-bg))] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(28,28,28,0.25)]"
            onClick={() => {
              if (!code.trim()) {
                setStatus("Paste some code first.");
                return;
              }
              setStatus("");
              sessionStorage.setItem(
                "sx_job",
                JSON.stringify({ code, language: "JavaScript", chaos: 5 })
              );
              router.push("/generating");
            }}
          >
            Generate Art
          </button>
          {status && (
            <p className="text-center text-xs text-[rgba(28,28,28,0.65)]">
              {status}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
