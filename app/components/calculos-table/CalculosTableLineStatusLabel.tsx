import { CalculationStatusEnum } from "@/types/enums";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export const CalculosTableLineStatusLabel = ({
  resultado,
}: {
  resultado: CalculationStatusEnum | null;
}) => {
  const { styleClasses, dotClasses } = useMemo(() => {
    let styleClasses = "";
    let dotClasses = "";
    switch (resultado) {
      case CalculationStatusEnum.Completed:
        styleClasses = "text-gray-700";
        dotClasses = "bg-gray-400";
        break;
      case CalculationStatusEnum.Canceled:
        styleClasses = "text-red-900";
        dotClasses = "bg-red-600";
        break;
      case CalculationStatusEnum.Open:
      case CalculationStatusEnum.InProgress:
        styleClasses = "text-green-800";
        dotClasses = "bg-green-500";
        break;
      default:
        styleClasses = "text-gray-800";
        dotClasses = "bg-gray-800";
        break;
    }

    return {
      styleClasses,
      dotClasses,
    };
  }, [resultado]);

  const t = useTranslations();

  const label = useMemo(() => {
    switch (resultado) {
      case CalculationStatusEnum.Canceled:
        return t("calculosPage.table.statusLabels.canceled");
      case CalculationStatusEnum.Completed:
        return t("calculosPage.table.statusLabels.completed");
      case CalculationStatusEnum.Open:
      case CalculationStatusEnum.InProgress:
        return t("calculosPage.table.statusLabels.inProgress");
      default:
        return t("calculosPage.table.statusLabels.noResult");
    }
  }, [t, resultado]);

  return (
    <div
      className={`text-[13px] flex gap-2 items-center justify-center leading-none font-semibold ${styleClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotClasses}`}></span>
      {label}
    </div>
  );
};
