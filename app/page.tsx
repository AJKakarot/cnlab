import { Suspense } from "react";
import { LabShell } from "./components/LabShell";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex max-w-4xl flex-1 items-center justify-center px-4 py-20 text-sm text-neutral-500 dark:text-neutral-400">
          Loading lab…
        </div>
      }
    >
      <LabShell />
    </Suspense>
  );
}
