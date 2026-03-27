"use client";

import { useRouter } from "next/navigation";
import { EXPERIMENTS, MAX_EXPERIMENT_ID, getExperiment } from "@/lib/experiments";
import { useSelectedExperiment } from "../context/experiment-context";
import { ExperimentQuerySync } from "./ExperimentQuerySync";
import { HttpSocketLab } from "./HttpSocketLab";
import { PingTracerouteLab } from "./PingTracerouteLab";
import { RpcXmlLab } from "./RpcXmlLab";
import { SubnettingInteractiveLab } from "./SubnettingInteractiveLab";
import { TcpSocketAppsLab } from "./TcpSocketAppsLab";
import { UdpProtocolsLab } from "./UdpProtocolsLab";
import { NsCongestionLab } from "./NsCongestionLab";
import { RoutingAlgorithmsLab } from "./RoutingAlgorithmsLab";
import { Rj45CrimpLab } from "./Rj45CrimpLab";
import { LanDevicesLab } from "./LanDevicesLab";
import { CliServicesLab } from "./CliServicesLab";
import { ArqProtocolsLab } from "./ArqProtocolsLab";
import { PlaceholderExperimentLab } from "./PlaceholderExperimentLab";
import { TcpEchoLab } from "./TcpEchoLab";

export function LabShell() {
  const { experimentId, setExperimentId } = useSelectedExperiment();
  const router = useRouter();
  const exp = getExperiment(experimentId);

  const pick = (id: number) => {
    setExperimentId(id);
    router.replace(`/?e=${id}`, { scroll: false });
  };

  return (
    <div className="mx-auto min-h-full w-full max-w-4xl flex-1 px-4 py-8 md:px-8 md:py-12">
      <ExperimentQuerySync />

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          Experiments
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-3xl">
          {exp?.title ?? "Lab"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          {MAX_EXPERIMENT_ID} experiments — visualization only here; open{" "}
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Docs</span> for theory and code.
        </p>

        <div
          className="mt-5 flex flex-wrap gap-1.5"
          role="tablist"
          aria-label={`Experiments 1 to ${MAX_EXPERIMENT_ID}`}
        >
          {EXPERIMENTS.map((e) => (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={experimentId === e.id}
              onClick={() => pick(e.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition sm:px-3 sm:text-xs ${
                experimentId === e.id
                  ? "bg-neutral-900 text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
                  : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              Experiment {e.id}
            </button>
          ))}
        </div>
      </div>

      <main className="pb-12">
        <div className="rounded-2xl border border-neutral-200 bg-white/80 shadow-sm ring-1 ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-neutral-800">
          {exp?.visual === "arqcombo" && <ArqProtocolsLab />}
          {exp?.visual === "tcpecho" && <TcpEchoLab />}
          {exp?.visual === "pingtrace" && <PingTracerouteLab />}
          {exp?.visual === "httpsocket" && <HttpSocketLab />}
          {exp?.visual === "rpcxml" && <RpcXmlLab />}
          {exp?.visual === "subnetting" && <SubnettingInteractiveLab />}
          {exp?.visual === "tcpapps" && <TcpSocketAppsLab />}
          {exp?.visual === "udptoys" && <UdpProtocolsLab />}
          {exp?.visual === "nsaimd" && <NsCongestionLab />}
          {exp?.visual === "routingalgo" && <RoutingAlgorithmsLab />}
          {exp?.visual === "rj45crimp" && <Rj45CrimpLab />}
          {exp?.visual === "landevices" && <LanDevicesLab />}
          {exp?.visual === "cliservices" && <CliServicesLab />}
          {exp?.visual === "placeholder" && <PlaceholderExperimentLab experiment={exp} />}
        </div>
      </main>
    </div>
  );
}
