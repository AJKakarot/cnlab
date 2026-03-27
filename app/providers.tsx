"use client";

import { ExperimentProvider } from "./context/experiment-context";
import { ThemeProvider } from "./context/theme-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ExperimentProvider>{children}</ExperimentProvider>
    </ThemeProvider>
  );
}
