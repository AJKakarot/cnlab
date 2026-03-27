import { Suspense } from "react";
import { LabShell } from "./components/LabShell";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-w-0 max-w-4xl flex-1 items-center justify-center px-3 py-16 text-sm text-neutral-500 sm:px-4 sm:py-20 dark:text-neutral-400">
          Loading lab…
        </div>
      }
    >
      <LabShell />
    </Suspense>
  );
}
