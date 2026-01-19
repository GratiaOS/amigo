import { detectLang, renderOg } from "./render";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emoji = searchParams.get("emoji") || "💖";
  const lang = detectLang(searchParams.get("lang") || request.headers.get("accept-language"));
  return renderOg(emoji, lang);
}
