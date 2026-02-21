"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [font, setFont] = useState("ANSI Shadow");
  const [fonts, setFonts] = useState<string[]>([]);
  const [ascii, setAscii] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Style controls
  const [letterSpacing, setLetterSpacing] = useState(-1);
  const [lineHeight, setLineHeight] = useState(125);
  const [fontSize, setFontSize] = useState(14);

  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    fetch("/api/fonts")
      .then((res) => res.json())
      .then((data) => setFonts(data.fonts))
      .catch(() => {});
  }, []);

  const generate = useCallback(async (value: string, selectedFont: string) => {
    if (!value.trim()) {
      setAscii("");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, font: selectedFont }),
      });
      const data = await res.json();
      if (data.ascii) {
        setAscii(data.ascii);
      }
    } catch {
      setAscii("Error generating ASCII art");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    generate(value, font);
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = e.target.value;
    setFont(selectedFont);
    generate(textRef.current, selectedFont);
  };

  const handleCopy = async () => {
    if (!ascii) return;
    await navigator.clipboard.writeText(ascii);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-950 px-4 py-16 font-mono text-white">
      <header className="mb-12 text-center">
        <pre
          className="text-neutral-400 select-none whitespace-pre"
          style={{
            fontFamily: "var(--font-fira-mono)",
            fontSize: "14px",
            letterSpacing: "-1px",
            lineHeight: "125%",
          }}
        >
          {`█████╗ ███████╗ ██████╗██╗██╗
██╔══██╗██╔════╝██╔════╝██║██║
███████║███████╗██║     ██║██║
██╔══██║╚════██║██║     ██║██║
██║  ██║███████║╚██████╗██║██║
╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝`}
        </pre>
        <p className="mt-4 text-sm text-neutral-600">
          By Darna Digital
        </p>
      </header>

      <div className="w-full max-w-2xl space-y-4">
        <div>
          <label htmlFor="text-input" className="mb-2 block text-sm text-neutral-500">
            Text
          </label>
          <textarea
            id="text-input"
            rows={3}
            value={text}
            onChange={handleChange}
            placeholder="Hello"
            autoFocus
            className="w-full resize-y rounded-lg border border-neutral-800 bg-black px-4 py-3 text-lg text-white placeholder-neutral-700 outline-none transition-colors focus:border-neutral-600"
          />
        </div>

        <div>
          <label htmlFor="font-select" className="mb-2 block text-sm text-neutral-500">
            Font
          </label>
          <select
            id="font-select"
            value={font}
            onChange={handleFontChange}
            className="w-full appearance-none rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-neutral-600"
          >
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Style controls */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm text-neutral-500">
              Letter Spacing
              <span className="ml-2 text-neutral-600">{letterSpacing}px</span>
            </label>
            <input
              type="range"
              min={-3}
              max={2}
              step={0.5}
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
              className="w-full accent-neutral-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-500">
              Line Height
              <span className="ml-2 text-neutral-600">{lineHeight}%</span>
            </label>
            <input
              type="range"
              min={80}
              max={200}
              step={5}
              value={lineHeight}
              onChange={(e) => setLineHeight(parseInt(e.target.value))}
              className="w-full accent-neutral-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-neutral-500">
              Font Size
              <span className="ml-2 text-neutral-600">{fontSize}px</span>
            </label>
            <input
              type="range"
              min={6}
              max={24}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-neutral-500"
            />
          </div>
        </div>
      </div>

      {(ascii || loading) && (
        <div className="mt-8 w-full max-w-5xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600">Output</span>
            {ascii && (
              <button
                onClick={handleCopy}
                className="rounded border border-neutral-800 px-3 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg bg-black p-6">
            {loading ? (
              <p className="animate-pulse text-neutral-600">Generating...</p>
            ) : (
              <pre
                className="text-white select-none whitespace-pre"
                style={{
                  fontFamily: "var(--font-fira-mono)",
                  fontSize: `${fontSize}px`,
                  letterSpacing: `${letterSpacing}px`,
                  lineHeight: `${lineHeight}%`,
                }}
              >
                {ascii}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
