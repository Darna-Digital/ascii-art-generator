"use client";

import { useState, useRef, useEffect } from "react";

export type ColorMode = "solid" | "gradient";

export type BgColor = "black" | "white" | "transparent";

export interface ColorConfig {
  mode: ColorMode;
  solid: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  bg: BgColor;
}

const SOLID_PRESETS = [
  "#ffffff",
  "#a3a3a3",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const GRADIENT_PRESETS: { from: string; to: string; label: string }[] = [
  { from: "#ef4444", to: "#f97316", label: "Sunset" },
  { from: "#8b5cf6", to: "#ec4899", label: "Purple Pink" },
  { from: "#06b6d4", to: "#3b82f6", label: "Ocean" },
  { from: "#22c55e", to: "#eab308", label: "Lime Gold" },
  { from: "#3b82f6", to: "#8b5cf6", label: "Blue Violet" },
  { from: "#ec4899", to: "#ef4444", label: "Rose Red" },
  { from: "#f97316", to: "#eab308", label: "Warm" },
  { from: "#06b6d4", to: "#22c55e", label: "Teal Green" },
  { from: "#ffffff", to: "#a3a3a3", label: "Silver" },
  { from: "#3b82f6", to: "#22c55e", label: "Cool Mint" },
];

interface Props {
  config: ColorConfig;
  onChange: (config: ColorConfig) => void;
}

export default function ColorPopover({ config, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const previewStyle =
    config.mode === "solid"
      ? { backgroundColor: config.solid }
      : {
          background: `linear-gradient(${config.gradientAngle}deg, ${config.gradientFrom}, ${config.gradientTo})`,
        };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded border border-neutral-800 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
      >
        <span
          className="inline-block h-3 w-3 rounded-sm border border-neutral-700"
          style={previewStyle}
        />
        Color
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-neutral-800 bg-neutral-900 p-4 shadow-xl">
          {/* Mode tabs */}
          <div className="mb-4 flex rounded-md border border-neutral-800 text-xs">
            <button
              onClick={() => onChange({ ...config, mode: "solid" })}
              className={`flex-1 rounded-l-md px-3 py-1.5 transition-colors ${
                config.mode === "solid"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => onChange({ ...config, mode: "gradient" })}
              className={`flex-1 rounded-r-md px-3 py-1.5 transition-colors ${
                config.mode === "gradient"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              Gradient
            </button>
          </div>

          {config.mode === "solid" ? (
            <>
              {/* Solid presets */}
              <div className="mb-3 grid grid-cols-5 gap-2">
                {SOLID_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChange({ ...config, solid: color })}
                    className={`h-8 w-full rounded border transition-transform hover:scale-110 ${
                      config.solid === color
                        ? "border-white"
                        : "border-neutral-700"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {/* Custom color input */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.solid}
                  onChange={(e) => onChange({ ...config, solid: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border border-neutral-700 bg-transparent"
                />
                <input
                  type="text"
                  value={config.solid}
                  onChange={(e) => onChange({ ...config, solid: e.target.value })}
                  className="flex-1 rounded border border-neutral-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-neutral-600"
                />
              </div>
            </>
          ) : (
            <>
              {/* Gradient presets */}
              <div className="mb-3 grid grid-cols-5 gap-2">
                {GRADIENT_PRESETS.map((g) => (
                  <button
                    key={g.label}
                    onClick={() =>
                      onChange({
                        ...config,
                        gradientFrom: g.from,
                        gradientTo: g.to,
                      })
                    }
                    title={g.label}
                    className={`h-8 w-full rounded border transition-transform hover:scale-110 ${
                      config.gradientFrom === g.from &&
                      config.gradientTo === g.to
                        ? "border-white"
                        : "border-neutral-700"
                    }`}
                    style={{
                      background: `linear-gradient(${config.gradientAngle}deg, ${g.from}, ${g.to})`,
                    }}
                  />
                ))}
              </div>
              {/* Custom gradient inputs */}
              <div className="mb-3 flex items-center gap-2">
                <div className="flex flex-1 items-center gap-1.5">
                  <input
                    type="color"
                    value={config.gradientFrom}
                    onChange={(e) =>
                      onChange({ ...config, gradientFrom: e.target.value })
                    }
                    className="h-7 w-7 cursor-pointer rounded border border-neutral-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.gradientFrom}
                    onChange={(e) =>
                      onChange({ ...config, gradientFrom: e.target.value })
                    }
                    className="w-full rounded border border-neutral-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-neutral-600"
                  />
                </div>
                <span className="text-neutral-600 text-xs">to</span>
                <div className="flex flex-1 items-center gap-1.5">
                  <input
                    type="color"
                    value={config.gradientTo}
                    onChange={(e) =>
                      onChange({ ...config, gradientTo: e.target.value })
                    }
                    className="h-7 w-7 cursor-pointer rounded border border-neutral-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.gradientTo}
                    onChange={(e) =>
                      onChange({ ...config, gradientTo: e.target.value })
                    }
                    className="w-full rounded border border-neutral-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-neutral-600"
                  />
                </div>
              </div>
              {/* Angle control */}
              <div>
                <label className="mb-1 block text-xs text-neutral-500">
                  Angle <span className="text-neutral-600">{config.gradientAngle}°</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={15}
                  value={config.gradientAngle}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      gradientAngle: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-neutral-500"
                />
              </div>
            </>
          )}
          {/* Background */}
          <div className="mt-4 border-t border-neutral-800 pt-4">
            <label className="mb-2 block text-xs text-neutral-500">Background</label>
            <div className="flex gap-2">
              {(["black", "white", "transparent"] as BgColor[]).map((bg) => {
                const isActive = config.bg === bg;
                const textColor = bg === "white" ? "text-black" : "text-white";
                return (
                  <button
                    key={bg}
                    onClick={() => onChange({ ...config, bg })}
                    className={`flex-1 rounded border px-3 py-1.5 text-xs transition-colors ${textColor} ${
                      isActive ? "border-white" : "border-neutral-700"
                    }`}
                    style={{
                      background:
                        bg === "transparent"
                          ? "repeating-conic-gradient(#333 0% 25%, #555 0% 50%) 50% / 10px 10px"
                          : bg,
                    }}
                  >
                    {bg === "transparent" ? "None" : bg.charAt(0).toUpperCase() + bg.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
