"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ExhibitResult = {
  imageUrl: string;
  promptUsed?: string;
};

export default function ExhibitPage() {
  const router = useRouter();
  const [result, setResult] = useState<ExhibitResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("sx_result");
    if (!raw) return;
    try {
      setResult(JSON.parse(raw) as ExhibitResult);
    } catch {
      setResult(null);
    }
  }, []);

  return (
    <main
      className="sx-grain relative min-h-screen overflow-hidden px-6 py-10 sm:px-10 flex items-center justify-center"
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

      <section className="relative z-10 w-full max-w-4xl text-center">
        <h1 className="mb-6 text-sm uppercase tracking-[0.4em] text-[rgba(28,28,28,0.6)]">
          Exhibit
        </h1>

        {result?.imageUrl ? (
          <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-[rgba(28,28,28,0.15)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(28,28,28,0.18)]">
            <img
              src={result.imageUrl}
              alt="Generated art"
              className="w-full rounded-3xl border border-[rgba(28,28,28,0.1)]"
            />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/60 bg-white/80 p-8 text-center shadow-[0_24px_80px_rgba(28,28,28,0.18)] backdrop-blur">
            <p className="text-sm text-[rgba(28,28,28,0.7)]">
              No exhibit is ready yet. Generate a piece first.
            </p>
            <button
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[rgb(var(--sx-ink))] px-5 py-2 text-xs uppercase tracking-[0.24em] text-[rgb(var(--sx-bg))]"
              onClick={() => router.push("/")}
            >
              Back to Lobby
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
