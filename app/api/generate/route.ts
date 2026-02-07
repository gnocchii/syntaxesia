import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const { code, language, chaos } = await req.json();

    const codeSnippet = String(code ?? "").slice(0, 1800);

    const prompt = `
Post-contemporary abstract digital artwork.
Inspired by ${language} code. Chaos intensity ${chaos}/10.
Soft rounded organic forms colliding with sharp digital fractures,
pastel gradients fused with neon interruptions, subtle glitch textures,
gallery-quality lighting, ultra-detailed, contemporary art exhibition piece.
Use the following code only as emotional texture (do not render any text):
${codeSnippet}
`.trim();

    const result = await client.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      n: 1,
      response_format: "b64_json",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "No image returned" }, { status: 500 });
    }

    return NextResponse.json({
      imageDataUrl: `data:image/png;base64,${b64}`,
      promptUsed: prompt,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
