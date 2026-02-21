"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ColorPopover, { type ColorConfig } from "@/components/color-popover";
import { exportSvg, exportPng } from "@/lib/export";

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
  const [color, setColor] = useState<ColorConfig>({
    mode: "solid",
    solid: "#ffffff",
    gradientFrom: "#3b82f6",
    gradientTo: "#8b5cf6",
    gradientAngle: 90,
    bg: "black",
  });

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

  const exportOpts = {
    ascii,
    text,
    fontSize,
    letterSpacing,
    lineHeight,
    color,
    fontFamily: "Fira Mono",
  };

  const preRef = useRef<HTMLPreElement>(null);

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
          By{" "}
          <a
            href="https://darnadigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 underline hover:text-white transition-colors"
          >
            Darna Digital
          </a>
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
              <div className="flex items-center gap-2">
                <ColorPopover config={color} onChange={setColor} />
                <button
                  onClick={handleCopy}
                  className="rounded border border-neutral-800 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => exportSvg(exportOpts)}
                  className="rounded border border-neutral-800 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
                >
                  SVG
                </button>
                <button
                  onClick={() => exportPng(exportOpts)}
                  className="rounded border border-neutral-800 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
                >
                  PNG
                </button>
              </div>
            )}
          </div>
          <div
            className="overflow-x-auto rounded-lg p-6"
            style={{
              backgroundColor: color.bg === "transparent" ? "transparent" : color.bg,
              backgroundImage:
                color.bg === "transparent"
                  ? "repeating-conic-gradient(#1a1a1a 0% 25%, #262626 0% 50%)"
                  : "none",
              backgroundSize: color.bg === "transparent" ? "16px 16px" : "auto",
            }}
          >
            {loading ? (
              <p className="animate-pulse text-neutral-600">Generating...</p>
            ) : color.mode === "gradient" ? (
              <AsciiSvg
                ascii={ascii}
                fontSize={fontSize}
                letterSpacing={letterSpacing}
                lineHeight={lineHeight}
                color={color}
              />
            ) : (
              <pre
                ref={preRef}
                className="select-none whitespace-pre"
                style={{
                  fontFamily: "var(--font-fira-mono)",
                  fontSize: `${fontSize}px`,
                  letterSpacing: `${letterSpacing}px`,
                  lineHeight: `${lineHeight}%`,
                  color: color.solid,
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

function AsciiSvg({
  ascii,
  fontSize,
  letterSpacing,
  lineHeight: lh,
  color,
}: {
  ascii: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  color: ColorConfig;
}) {
  const lines = ascii.split("\n");
  const lineHeightPx = fontSize * (lh / 100);
  const charWidth = fontSize * 0.6 + letterSpacing;
  const maxLen = Math.max(...lines.map((l) => l.length));
  const width = Math.ceil(maxLen * charWidth) + 20;
  const height = Math.ceil(lines.length * lineHeightPx) + 20;

  const angle = color.gradientAngle;
  const rad = (angle * Math.PI) / 180;
  const x1 = 50 - 50 * Math.cos(rad);
  const y1 = 50 - 50 * Math.sin(rad);
  const x2 = 50 + 50 * Math.cos(rad);
  const y2 = 50 + 50 * Math.sin(rad);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      <defs>
        <linearGradient
          id="ascii-grad"
          x1={`${x1.toFixed(1)}%`}
          y1={`${y1.toFixed(1)}%`}
          x2={`${x2.toFixed(1)}%`}
          y2={`${y2.toFixed(1)}%`}
        >
          <stop offset="0%" stopColor={color.gradientFrom} />
          <stop offset="100%" stopColor={color.gradientTo} />
        </linearGradient>
      </defs>
      <text
        fill="url(#ascii-grad)"
        fontFamily="'Fira Mono', monospace"
        fontSize={fontSize}
        letterSpacing={letterSpacing}
        xmlSpace="preserve"
      >
        {lines.map((line, i) => (
          <tspan key={i} x="10" y={10 + (i + 1) * lineHeightPx}>
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  );
}
