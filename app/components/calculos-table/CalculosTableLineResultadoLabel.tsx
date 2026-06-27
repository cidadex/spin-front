import { Badge, badgeVariants } from "@/components/ui/badge";
import { CalculationResultEnum } from "@/types/enums";
import { type VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const calculosTableLineResultadoLabelVariantsMap: Record<
  CalculationResultEnum,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  [CalculationResultEnum.Commutable]: "primary",
  [CalculationResultEnum.Pardonable]: "secondary-success",
  [CalculationResultEnum.NoReduction]: "secondary-destructive",
  [CalculationResultEnum.PendingInfo]: "warning",
};

export const CalculosTableLineResultadoLabel = ({
  resultado,
}: {
  resultado: CalculationResultEnum | null;
}) => {
  const variant = !resultado
    ? "secondary"
    : calculosTableLineResultadoLabelVariantsMap[resultado];

  const t = useTranslations();

  const label = useMemo(() => {
    switch (resultado) {
      case CalculationResultEnum.Commutable:
        return t("calculosPage.table.resultLabels.commutable");
      case CalculationResultEnum.Pardonable:
        return t("calculosPage.table.resultLabels.pardonable");
      case CalculationResultEnum.NoReduction:
        return t("calculosPage.table.resultLabels.noReduction");
      case CalculationResultEnum.PendingInfo:
        return t("calculosPage.table.resultLabels.pendingInfo");
      default:
        return t("calculosPage.table.resultLabels.noResult");
    }
  }, [t, resultado]);

  const icon = useMemo(() => {
    switch (resultado) {
      case CalculationResultEnum.Commutable:
        return "check";
      case CalculationResultEnum.Pardonable:
        return "check";
      case CalculationResultEnum.NoReduction:
        return "cancel";
      case CalculationResultEnum.PendingInfo:
        return "schedule";
      default:
        return "info";
    }
  }, [resultado]);

  return (
    <Badge variant={variant} className="text-sm rounded-sm">
      <i className="material-symbols-outlined material-symbols-outlined-sized text-inherit text-sm">
        {icon}
      </i>
      {label}
    </Badge>
  );
};
