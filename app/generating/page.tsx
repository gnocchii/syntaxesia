"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type JobPayload = {
  code: string;
  language: string;
  chaos: number;
};

export default function GeneratingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState("Curating your exhibit...");

  const statusSteps = useMemo(
    () => [
      "Curating your exhibit...",
      "Interpreting structure...",
      "Mixing pigments...",
      "Hanging the work...",
    ],
    []
  );

  useEffect(() => {
    let isCancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const run = async () => {
      const raw = sessionStorage.getItem("sx_job");
      if (!raw) {
        setError("Missing submission. Please paste code first.");
        return;
      }

      let payload: JobPayload;
      try {
        payload = JSON.parse(raw) as JobPayload;
      } catch {
        setError("Invalid submission. Please paste code again.");
        return;
      }

      let stepIndex = 0;
      timer = setInterval(() => {
        stepIndex = (stepIndex + 1) % statusSteps.length;
        setStep(statusSteps[stepIndex]);
      }, 1200);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Request failed");
        }

        if (isCancelled) return;
        sessionStorage.setItem(
          "sx_result",
          JSON.stringify({
            imageUrl: data.imageDataUrl,
            promptUsed: data.promptUsed,
            signals: data.signals,
          })
        );
        router.push("/exhibit");
      } catch (err: any) {
        if (isCancelled) return;
        setError(err?.message || "Something went wrong. Check console.");
      } finally {
        if (timer) clearInterval(timer);
      }
    };

    run();

    return () => {
      isCancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [router, statusSteps]);

  return (
    <main
      className="sx-grain relative min-h-screen h-screen overflow-hidden"
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

      <section className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-center text-center -translate-y-[175px]">
        <div
          className="mb-3 overflow-hidden"
          style={{ width: "min(600px, 80vw)", height: "min(600px, 80vw)" }}
        >
          <img
            src="/brush.gif"
            alt="Animating brush"
            className="sx-brush-loader h-full w-full object-contain"
            style={{
              width: "100%",
              height: "calc(100% + 100px)",
              transform: "translate(0, 0)",
              display: "block",
            }}
          />
        </div>
        <p
          className="text-xs uppercase tracking-[0.28em] text-[rgba(28,28,28,0.6)]"
          style={{ marginTop: "-150px" }}
        >
          {step}
        </p>

        {error && (
          <div className="mt-5 max-w-xs rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[rgb(var(--sx-ink))] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[rgb(var(--sx-bg))]"
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
