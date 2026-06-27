import { Button } from "@/components/ui/button";
import { Activity } from "@/components/ui/activity";
import { useTranslations } from "next-intl";
import { NovoCalculoQuestionarioDinamicoQuestaoTitle } from "./NovoCalculoQuestionarioDinamicoQuestaoTitle";
import { useCallback, useMemo, useState } from "react";
import { LoaderIcon } from "lucide-react";
import { useNovoCalculo } from "@/hooks/useNovoCalculo";

export const NovoCalculoQuestionarioDinamicoQuestaoBoolean = ({
  onChange,
  questaoTitle,
  questaoSubtitle,
  crimeUuid,
}: {
  value: boolean | undefined;
  onChange?: (value: boolean | undefined) => Promise<void>;
  questaoTitle: string;
  questaoSubtitle: string | null;
  crimeUuid?: string;
}) => {
  const [changing, setChanging] = useState(false);
  const t = useTranslations("common");
  const { getParsedDispositivo } = useNovoCalculo();

  const parsedDispositivo = useMemo(() => {
    const parsed = getParsedDispositivo(crimeUuid);
    return parsed;
  }, [crimeUuid, getParsedDispositivo]);

  const handleOnChange = useCallback(
    async (value: boolean) => {
      setChanging(true);
      await onChange?.(value);
      setChanging(false);
    },
    [onChange]
  );
  return (
    <div className="flex flex-col justify-center items-center min-h-full">
      <NovoCalculoQuestionarioDinamicoQuestaoTitle
        title={questaoTitle}
        subtitle={questaoSubtitle}
        crime={parsedDispositivo}
      />
      <div className="flex gap-4 mt-14 w-xl max-w-full justify-center">
        <Button
          variant="outline"
          size="lg"
          className="cursor-pointer flex-1"
          onClick={() => handleOnChange(true)}
          disabled={changing}
        >
          <Activity mode={changing ? "visible" : "hidden"}>
            <LoaderIcon className="w-4 h-4 animate-spin" />
          </Activity>
          {t("yes")}
        </Button>
        <Button
          variant="outline-destructive"
          size="lg"
          className=" cursor-pointer flex-1"
          onClick={() => handleOnChange(false)}
          disabled={changing}
        >
          <Activity mode={changing ? "visible" : "hidden"}>
            <LoaderIcon className="w-4 h-4 animate-spin" />
          </Activity>
          {t("no")}
        </Button>
      </div>
    </div>
  );
};
