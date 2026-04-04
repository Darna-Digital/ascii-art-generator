import { NextRequest, NextResponse } from "next/server";
import figlet, { type FontName } from "figlet";

export async function POST(request: NextRequest) {
  try {
    const { text, font } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const selectedFont = (font as FontName) || "ANSI Shadow";
    const lines = text.split("\n");

    const results = await Promise.all(
      lines.map(
        (line: string) =>
          new Promise<string>((resolve, reject) => {
            if (!line.trim()) {
              resolve("");
              return;
            }
            figlet.text(line, { font: selectedFont }, (err, result) => {
              if (err) reject(err);
              else resolve(result || "");
            });
          })
      )
    );

    const ascii = results.join("\n\n");

    return NextResponse.json({ ascii });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate ASCII art" },
      { status: 500 }
    );
  }
}
