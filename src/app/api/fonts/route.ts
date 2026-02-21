import { NextResponse } from "next/server";
import figlet from "figlet";

export async function GET() {
  const fonts = figlet.fontsSync();
  return NextResponse.json({ fonts });
}
