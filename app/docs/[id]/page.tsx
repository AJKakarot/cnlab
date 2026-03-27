import { notFound } from "next/navigation";
import { loadBundledLabSources } from "@/lib/bundled-lab-sources";
import { DocsView } from "./DocsView";
import { EXPERIMENTS, getExperiment, MAX_EXPERIMENT_ID } from "@/lib/experiments";

export function generateStaticParams() {
  return EXPERIMENTS.map((e) => ({ id: String(e.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id, 10);
  const exp = getExperiment(id);
  return {
    title: exp ? `Exp ${id}: ${exp.title} — Docs` : "Docs",
    description: exp?.theory.slice(0, 160),
  };
}

export default async function DocsPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id) || id < 1 || id > MAX_EXPERIMENT_ID) notFound();
  const exp = getExperiment(id);
  if (!exp) notFound();

  const bundled = await loadBundledLabSources();

  return <DocsView experiment={exp} bundled={bundled} />;
}
