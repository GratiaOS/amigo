import { redirect } from "next/navigation";

type Props = {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

const DEFAULT_CALLSIGN = "@garden";

function pickParam(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function LegacyRoom({ params, searchParams }: Props) {
  const slug = params.slug;

  const auto = pickParam(searchParams?.auto);
  const lang = pickParam(searchParams?.lang);

  const qs = new URLSearchParams();
  if (auto === "1") qs.set("auto", "1");
  if (lang) qs.set("lang", lang);

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/${DEFAULT_CALLSIGN}/${slug}${suffix}`);
}
