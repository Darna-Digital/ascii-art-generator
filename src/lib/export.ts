import type { ColorConfig } from "@/components/color-popover";

export interface ExportOptions {
  ascii: string;
  text: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  color: ColorConfig;
  fontFamily: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\n/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "ascii-art";
}

function buildSvg(opts: ExportOptions): { svg: string; width: number; height: number } {
  const lines = opts.ascii.split("\n");
  const charWidth = opts.fontSize * 0.6 + opts.letterSpacing;
  const lineHeightPx = opts.fontSize * (opts.lineHeight / 100);

  const maxLineLen = Math.max(...lines.map((l) => l.length));
  const width = Math.ceil(maxLineLen * charWidth) + 40;
  const height = Math.ceil(lines.length * lineHeightPx) + 40;

  const gradientId = "ascii-grad";

  let defs = "";
  let fillAttr: string;

  if (opts.color.mode === "gradient") {
    const angle = opts.color.gradientAngle;
    const rad = (angle * Math.PI) / 180;
    const x1 = 50 - 50 * Math.cos(rad);
    const y1 = 50 - 50 * Math.sin(rad);
    const x2 = 50 + 50 * Math.cos(rad);
    const y2 = 50 + 50 * Math.sin(rad);

    defs = `<defs><linearGradient id="${gradientId}" x1="${x1.toFixed(1)}%" y1="${y1.toFixed(1)}%" x2="${x2.toFixed(1)}%" y2="${y2.toFixed(1)}%"><stop offset="0%" stop-color="${opts.color.gradientFrom}"/><stop offset="100%" stop-color="${opts.color.gradientTo}"/></linearGradient></defs>`;
    fillAttr = `url(#${gradientId})`;
  } else {
    fillAttr = opts.color.solid;
  }

  const escapedLines = lines
    .map((line, i) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
      const y = 20 + (i + 1) * lineHeightPx;
      return `<tspan x="20" y="${y.toFixed(1)}">${escaped}</tspan>`;
    })
    .join("");

  const bg = opts.color.bg;
  const bgRect =
    bg === "transparent"
      ? ""
      : `<rect width="100%" height="100%" fill="${bg === "white" ? "#ffffff" : "#000000"}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}${bgRect}<text fill="${fillAttr}" font-family="${opts.fontFamily}, monospace" font-size="${opts.fontSize}" letter-spacing="${opts.letterSpacing}" xml:space="preserve">${escapedLines}</text></svg>`;

  return { svg, width, height };
}

export function exportSvg(opts: ExportOptions): void {
  const { svg } = buildSvg(opts);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  download(blob, `${slugify(opts.text)}.svg`);
}

export function exportPng(opts: ExportOptions): void {
  const { svg, width, height } = buildSvg(opts);

  const canvas = document.createElement("canvas");
  const scale = 2; // retina
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (blob) download(blob, `${slugify(opts.text)}.png`);
    }, "image/png");
  };

  img.src = url;
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
