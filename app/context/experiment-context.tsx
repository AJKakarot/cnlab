"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { MAX_EXPERIMENT_ID } from "@/lib/experiments";

const Ctx = createContext<{
  experimentId: number;
  setExperimentId: (id: number) => void;
} | null>(null);

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [experimentId, setExperimentIdState] = useState(1);

  const setExperimentId = useCallback((id: number) => {
    if (id >= 1 && id <= MAX_EXPERIMENT_ID) setExperimentIdState(id);
  }, []);

  return (
    <Ctx.Provider value={{ experimentId, setExperimentId }}>{children}</Ctx.Provider>
  );
}

export function useSelectedExperiment() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSelectedExperiment requires ExperimentProvider");
  return v;
}
