import { Button } from "@/components/ui/button";
import { Activity } from "@/components/ui/activity";
import { Input } from "@/components/ui/input";
import { useNovoCalculo } from "@/hooks/useNovoCalculo";
import { LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NovoCalculoQuestionarioDinamicoQuestaoTitle } from "./NovoCalculoQuestionarioDinamicoQuestaoTitle";

const parseIntegerValue = (rawValue: string): number | undefined => {
  const normalized = rawValue.trim();

  if (normalized === "") {
    return undefined;
  }

  if (!/^-?\d+$/.test(normalized)) {
    return undefined;
  }

  return Number.parseInt(normalized, 10);
};

const parseDecimalValue = (rawValue: string): number | undefined => {
  const normalized = rawValue.trim();

  if (normalized === "") {
    return undefined;
  }

  const normalizedDecimal = normalized.replace(",", ".");

  if (!/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalizedDecimal)) {
    return undefined;
  }

  const parsed = Number.parseFloat(normalizedDecimal);

  return Number.isNaN(parsed) ? undefined : parsed;
};

export const NovoCalculoQuestionarioDinamicoQuestaoNumer = ({
  value,
  onChange,
  questaoTitle,
  questaoSubtitle,
  crimeUuid,
  allowDecimal = false,
}: {
  value: number | undefined;
  onChange?: (value: number | undefined) => Promise<void>;
  questaoTitle: string;
  questaoSubtitle: string | null;
  crimeUuid?: string;
  allowDecimal?: boolean;
}) => {
  const [changing, setChanging] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toString() ?? "");
  const tCommon = useTranslations("common");
  const { getParsedDispositivo } = useNovoCalculo();

  const parsedDispositivo = useMemo(() => {
    const parsed = getParsedDispositivo(crimeUuid);
    return parsed;
  }, [crimeUuid, getParsedDispositivo]);

  const parsedInputValue = useMemo(
    () =>
      allowDecimal
        ? parseDecimalValue(inputValue)
        : parseIntegerValue(inputValue),
    [allowDecimal, inputValue]
  );

  const canSubmit = inputValue.trim() === "" || parsedInputValue !== undefined;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }

    setChanging(true);
    try {
      await onChange?.(parsedInputValue);
    } finally {
      setChanging(false);
    }
  }, [canSubmit, onChange, parsedInputValue]);

  const handleInputEnter = useCallback(
    async (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      await handleSubmit();
    },
    [handleSubmit]
  );

  useEffect(() => {
    const nextValue = value?.toString() ?? "";
    setInputValue(nextValue);
  }, [value]);

  return (
    <div className="flex flex-col justify-center items-center min-h-full">
      <NovoCalculoQuestionarioDinamicoQuestaoTitle
        title={questaoTitle}
        subtitle={questaoSubtitle}
        crime={parsedDispositivo}
      />
      <div className="flex w-full max-w-xl gap-3 mt-14">
        <Input
          type="number"
          inputMode={allowDecimal ? "decimal" : "numeric"}
          step={allowDecimal ? "any" : 1}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleInputEnter}
          className="h-10"
          disabled={changing}
        />
        <Button
          size="lg"
          className="cursor-pointer"
          onClick={handleSubmit}
          disabled={changing || !canSubmit}
        >
          <Activity mode={changing ? "visible" : "hidden"}>
            <LoaderIcon className="w-4 h-4 animate-spin" />
          </Activity>
          {tCommon("next")}
        </Button>
      </div>
    </div>
  );
};
