import { SeeuReportDuracao } from "@/types/calculadora";
import { Input } from "../../input";
import { FormLabel } from "../../form";
import { useTranslations } from "next-intl";

export const SeeuDurationInput = ({
  value,
  onChange,
  onBlur,
}: {
  value: SeeuReportDuracao;
  onChange: (value: SeeuReportDuracao) => void;
  onBlur?: () => void;
}) => {
  const t = useTranslations("duracaoInput");
  return (
    <div className="flex gap-2">
      <div className="flex gap-2">
        <FormLabel>{t("anos")}</FormLabel>
        <Input
          value={value.anos}
          onBlur={onBlur}
          type="number"
          onChange={(e) =>
            onChange({
              ...value,
              anos: Number(e.target.value),
            })
          }
        />
      </div>
      <div className="flex gap-2">
        <FormLabel>{t("meses")}</FormLabel>
        <Input
          value={value.meses}
          onBlur={onBlur}
          type="number"
          onChange={(e) =>
            onChange({
              ...value,
              meses: Number(e.target.value),
            })
          }
        />
      </div>
      <div className="flex  gap-2">
        <FormLabel>{t("dias")}</FormLabel>
        <Input
          value={value.dias}
          onBlur={onBlur}
          type="number"
          onChange={(e) =>
            onChange({
              ...value,
              dias: Number(e.target.value),
            })
          }
        />
      </div>
    </div>
  );
};
