import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 });
    }

    const html = await response.text();

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) {
      return NextResponse.json({ error: "Extraction failed" }, { status: 400 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API key missing" }, { status: 500 });
    }

    const prompt = `
You are a professional growth marketer.

Repurpose this blog into:

1. 3 LinkedIn posts (educational, controversial, storytelling)
2. 3 Twitter/X hooks (first tweet only)
3. 1 SEO meta description (<160 characters)
4. 1 YouTube title + description

Avoid generic AI tone.
Make outputs clearly different in style.

Blog Content:
${article.textContent.slice(0, 2500)}
`;

    const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    return NextResponse.json({
      result: completion.choices[0].message.content,
    });

  } catch (error: any) {
    console.error("ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
