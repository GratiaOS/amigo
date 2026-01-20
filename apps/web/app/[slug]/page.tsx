import { redirect } from "next/navigation";

type Props = {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

function pickParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default function ShortLinkEntry({ params, searchParams }: Props) {
  const slug = params.slug;
  const callsign = "@garden";

  const auto = pickParam(searchParams?.auto);
  const lang = pickParam(searchParams?.lang);

  const qs = new URLSearchParams();
  if (auto === "1") qs.set("auto", "1");
  if (lang) qs.set("lang", lang);

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/${callsign}/${slug}${suffix}`);
}
