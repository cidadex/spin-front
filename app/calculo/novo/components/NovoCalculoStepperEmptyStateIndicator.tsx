"use client";
import { useTranslations } from "next-intl";

export const NovoCalculoStepperEmptyStateIndicator = () => {
  const t = useTranslations("calculo.novoCalculo");
  return (
    <>
      <div className="p-4">
        <div className="flex-1 p-4 pt-12 flex flex-col items-center justify-center gap-3 rounded-xl border-[#9CA3AF] bg-linear-to-b from-[#F3F4F6] to-[#FFFFFF] to-60% rounded-b-none border-dashed border-t">
          <span className="material-symbols-outlined text-gray-400 text-6xl">
            list_alt
          </span>
          <strong className="text-center text-xs font-bold text-gray-700">
            {t("emptyState.title")}
          </strong>
          <p className="text-gray-500 text-xs text-center font-medium">
            {t("emptyState.description")}
          </p>
        </div>
      </div>
    </>
  );
};
