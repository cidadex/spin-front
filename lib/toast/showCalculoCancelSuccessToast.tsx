"use client";

import { X } from "lucide-react";
import { toast } from "sonner";
export function showCalculoCancelSuccessToast(
  message: string,
  options?: { dismissLabel?: string }
) {
  const dismissLabel = options?.dismissLabel ?? "Fechar";

  toast.custom(
    (id) => (
      <div
        className="pointer-events-auto flex w-[min(100vw-2rem,26rem)] items-center gap-3 rounded-lg bg-[#1e2530] py-3 pl-3 pr-2 shadow-lg animate-in fade-in-0 slide-in-from-right-8 duration-300"
        role="status"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#2b3e7a]">
          <span className="material-symbols-outlined text-[22px] leading-none text-sky-300">
            check
          </span>
        </div>
        <p className="min-w-0 flex-1 text-sm font-medium text-[#9ca3af]">
          {message}
        </p>
        <button
          type="button"
          className="shrink-0 rounded-md p-1.5 text-[#9ca3af] transition-colors hover:bg-white/5 hover:text-gray-200"
          aria-label={dismissLabel}
          onClick={() => toast.dismiss(id)}
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
    ),
    {
      duration: 3000,
      position: "top-right",
      unstyled: true,
    }
  );
}
