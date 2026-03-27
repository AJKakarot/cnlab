"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MAX_EXPERIMENT_ID } from "@/lib/experiments";
import { useSelectedExperiment } from "../context/experiment-context";

export function ExperimentQuerySync() {
  const sp = useSearchParams();
  const { setExperimentId } = useSelectedExperiment();

  useEffect(() => {
    const raw = sp.get("e");
    if (raw == null) return;
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= MAX_EXPERIMENT_ID) setExperimentId(n);
  }, [sp, setExperimentId]);

  return null;
}
