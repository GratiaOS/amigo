import { redirect } from "next/navigation";

type Props = {
  params: { callsign: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

const DEFAULT_CALLSIGN = "@garden";

function pickParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default function CallsignEntry({ params, searchParams }: Props) {
  const segment = decodeURIComponent(params.callsign);

  if (segment.startsWith("@")) {
    redirect("/");
  }

  const slug = segment;
  const auto = pickParam(searchParams?.auto);
  const lang = pickParam(searchParams?.lang);

  const qs = new URLSearchParams();
  if (auto === "1") qs.set("auto", "1");
  if (lang) qs.set("lang", lang);

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/${DEFAULT_CALLSIGN}/${slug}${suffix}`);
}
