import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Fetch blog page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch blog URL" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Lightweight content extraction (Vercel-safe)
    const cleanText = html
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1200); // limit content for speed

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const prompt = `
Repurpose this blog into:

1. 3 LinkedIn posts (educational, controversial, storytelling)
2. 3 Twitter/X hooks (first tweet only)
3. 1 SEO meta description (under 160 characters)
4. 1 YouTube title + description

Return plain text only.
No markdown.
No asterisks.
No placeholder text.
Make each variation clearly different.

Blog:
${cleanText}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 700,
    });

    return NextResponse.json({
      result: completion.choices[0].message.content,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
