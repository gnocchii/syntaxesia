"use client";

import { useState } from "react";


export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [chaos, setChaos] = useState(5);

  const [status, setStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [promptUsed, setPromptUsed] = useState("");

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 900 }}>
      <h1 style={{ marginBottom: 8 }}>Code Psyche Generator</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>
        Paste code → generate cute-chaotic post-contemporary abstract art.
      </p>

      <textarea
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={12}
        style={{
          width: "100%",
          marginBottom: 16,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 12,
        }}
      />

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, opacity: 0.7 }}>Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option>JavaScript</option>
            <option>Python</option>
            <option>Rust</option>
            <option>C</option>
            <option>Java</option>
            <option>HTML</option>
            <option>CSS</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, opacity: 0.7 }}>
            Chaos: {chaos}/10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={chaos}
            onChange={(e) => setChaos(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <button
          style={{
            padding: "12px 16px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={async () => {
            try {
              setStatus("Generating image...");
              setImageUrl("");
              setPromptUsed("");

              const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language, chaos }),
              });

              const data = await res.json();

              if (!res.ok) {
                setStatus(`❌ ${data.error || "Request failed"}`);
                return;
              }

              setImageUrl(data.imageDataUrl);
              setPromptUsed(data.promptUsed);
              setStatus("✅ Image generated!");
            } catch (error) {
              console.error(error);
              setStatus("❌ Something went wrong. Check console.");
            }
          }}
        >
          Generate Art
        </button>
      </div>

      {status && (
        <p style={{ marginTop: 0, marginBottom: 16 }}>
          {status}
        </p>
      )}

      {imageUrl && (
        <div style={{ marginTop: 12 }}>
          <img
            src={imageUrl}
            alt="Generated art"
            style={{
              width: "100%",
              maxWidth: 512,
              height: "auto",
              borderRadius: 16,
              border: "1px solid #eee",
            }}
          />
        </div>
      )}

      {promptUsed && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer" }}>Prompt used</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, opacity: 0.85 }}>
            {promptUsed}
          </pre>
        </details>
      )}
    </main>
  );
}