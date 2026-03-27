"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { BundledLabSources } from "@/lib/bundled-lab-sources";
import { experimentCodeLabel } from "@/lib/experiment-code-label";
import { getDiagramAsset } from "@/lib/experiment-diagram-assets";
import { getSampleIo } from "@/lib/experiment-sample-io";
import type { Experiment } from "@/lib/experiments";
import { EXPERIMENTS, resolveExperimentCodeSource } from "@/lib/experiments";
import { useSelectedExperiment } from "@/app/context/experiment-context";

type Props = {
  experiment: Experiment;
  bundled: BundledLabSources;
};

export function DocsView({ experiment, bundled }: Props) {
  const { setExperimentId } = useSelectedExperiment();

  useEffect(() => {
    setExperimentId(experiment.id);
  }, [experiment.id, setExperimentId]);

  const codeText = resolveExperimentCodeSource(experiment, bundled);
  const sampleBlocks = getSampleIo(experiment.id);
  const diagramAsset = getDiagramAsset(experiment.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
      <nav className="mb-8 text-xs text-neutral-500 dark:text-neutral-400">
        <Link
          href={`/?e=${experiment.id}`}
          className="font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          ← Back to experiment {experiment.id} (visual)
        </Link>
      </nav>

      <header className="border-b border-neutral-200 pb-8 dark:border-neutral-800">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
          Lab documentation · Experiment {experiment.id} of {EXPERIMENTS.length}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {experiment.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          This page is the full write-up: aim, theory, diagram, steps, <strong className="font-medium text-neutral-800 dark:text-neutral-200">example commands</strong> with{" "}
          <strong className="font-medium text-neutral-800 dark:text-neutral-200">sample output</strong> for your lab record, then the program listing and expected takeaway. The home page
          shows the interactive visual only.
        </p>
      </header>

      <article className="mt-10 space-y-12 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-[var(--card)]">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">1. Aim</h2>
          <ul className="mt-4 list-inside list-disc space-y-2.5 text-neutral-700 dark:text-neutral-300">
            {experiment.aim.map((a, i) => (
              <li key={i} className="ps-1">
                {a}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-[var(--card)]">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">2. Theory</h2>
          <p className="mt-4 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{experiment.theory}</p>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-[var(--card)]">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">3. Diagram</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Figure (SVG): quick visual. Below it, the same idea is repeated as monospace text for copy-paste into notes.
          </p>
          {diagramAsset && (
            <figure className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-600 dark:bg-neutral-100">
              <Image
                src={diagramAsset.src}
                alt={diagramAsset.alt}
                width={840}
                height={400}
                className="mx-auto h-auto w-full max-w-3xl object-contain"
                unoptimized
              />
              <figcaption className="mt-4 border-t border-neutral-200 pt-4 text-center text-xs leading-relaxed text-neutral-600 dark:border-neutral-400 dark:text-neutral-700">
                {diagramAsset.alt}
              </figcaption>
            </figure>
          )}
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Text diagram</h3>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200">
            {experiment.diagram}
          </pre>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-[var(--card)]">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">4. Procedure (lab steps)</h2>
          <ol className="mt-4 list-inside list-decimal space-y-2.5 text-neutral-700 dark:text-neutral-300">
            {experiment.procedure.map((p, i) => (
              <li key={i} className="ps-1">
                {p}
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-6 shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/20 dark:to-[var(--card)]">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">5. Commands &amp; sample I/O</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Run these from the project root unless noted. Output below is representative: your byte counts, RTTs, or timestamps may differ slightly (especially with network experiments).
          </p>

          {sampleBlocks.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-neutral-600 dark:border-neutral-600 dark:bg-neutral-900/50 dark:text-neutral-400">
              Add concrete CLI steps from your institute manual; this catalog entry is conceptual only.
            </p>
          ) : (
            <div className="mt-8 space-y-10">
              {sampleBlocks.map((block, i) => (
                <div
                  key={`${experiment.title}-${block.title}-${String(i)}`}
                  className="rounded-xl border border-neutral-200/90 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-950/80"
                >
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{block.title}</h3>
                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Input</p>
                      <pre className="mt-2 max-h-[min(24rem,55vh)] overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-100 dark:border-slate-700 md:text-xs">
                        {block.input}
                      </pre>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Sample output</p>
                      <pre className="mt-2 max-h-[min(24rem,55vh)] overflow-auto whitespace-pre-wrap rounded-lg border border-emerald-900/30 bg-emerald-950/90 p-4 font-mono text-[11px] leading-relaxed text-emerald-50 dark:border-emerald-800/50 md:text-xs">
                        {block.output}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-[var(--card)]">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">6. Code (reference)</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">{experimentCodeLabel(experiment.id)}</p>
          <pre className="mt-4 max-h-[min(32rem,60vh)] overflow-auto whitespace-pre-wrap rounded-xl bg-neutral-900 p-4 font-mono text-xs leading-relaxed text-neutral-100">
            {codeText}
          </pre>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900/50">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">7. Expected result</h2>
          <p className="mt-4 text-neutral-700 dark:text-neutral-300">{experiment.result}</p>
        </section>
      </article>
    </div>
  );
}
