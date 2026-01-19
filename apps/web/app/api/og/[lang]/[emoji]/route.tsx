import { detectLang, renderOg } from "../../render";

export const runtime = "edge";

type RouteParams = {
  params: { lang: string; emoji: string };
};

export async function GET(request: Request, { params }: RouteParams) {
  const emoji = decodeURIComponent(params.emoji || "💖");
  const lang = detectLang(params.lang || request.headers.get("accept-language"));
  return renderOg(emoji, lang);
}
