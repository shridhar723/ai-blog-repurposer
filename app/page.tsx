"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const generateContent = async () => {
    if (!url) return alert("Enter a URL");

    setLoading(true);
    setOutput("");

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      const cleanedOutput = data.result
        .replace(/\[Link to Blog Post\]/gi, url)
        .replace(/\*\*/g, "")
        .replace(/\*/g, "");

      setOutput(cleanedOutput);
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        AI Blog Content Repurposer
      </h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Paste blog URL here..."
          className="border p-3 flex-1 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={generateContent}
          className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-md hover:opacity-90 transition duration-200 font-medium shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="animate-pulse">Generating...</span>
          ) : (
            "Generate"
          )}
        </button>
      </div>

      {loading && (
        <div className="text-center text-gray-500 mb-4">
          ⏳ Generating content... please wait
        </div>
      )}

      {output && (
        <div className="space-y-4">
          <div className="bg-black-50 p-4 rounded border">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Generated Content</h2>
              <button
                onClick={() => copyToClipboard(output)}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition"
              >
                Copy All
              </button>
            </div>

            <div className="whitespace-pre-wrap text-sm">
              {output.split(/(\s+)/).map((part, i) =>
                part.startsWith("http") ? (
                  <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {part}
                  </a>
                ) : (
                  part
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
