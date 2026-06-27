import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { CalendarIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useMaskInput } from "use-mask-input";
import { NovoCalculoQuestionarioDinamicoQuestaoTitle } from "./NovoCalculoQuestionarioDinamicoQuestaoTitle";

const formatDateToInputValue = (date: Date | undefined) => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const NovoCalculoQuestionarioDinamicoQuestaoDate = ({
  date,
  onChange,
  questaoTitle,
  questaoSubtitle,
}: {
  date: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  questaoTitle: string;
  questaoSubtitle: string;
}) => {
  const t = useTranslations("calculo.questionarioDinamico.dateInput");
  const ref = useMaskInput({ mask: "99/99/9999" });
  const [textInput, setTextInput] = useState(formatDateToInputValue(date));

  const handleTextChange = useCallback(() => {
    const value = textInput;
    const [day, month, year] = value.split("/").map(Number);

    if (
      !isNaN(day) &&
      !isNaN(month) &&
      !isNaN(year) &&
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12
    ) {
      const newDate = new Date(year, month - 1, day);
      if (!isNaN(newDate.getTime())) {
        onChange?.(newDate);
      }
    } else if (value === "") {
      onChange?.(undefined);
    }
  }, [onChange, textInput]);

  const handleClear = useCallback(() => {
    setTextInput("");
    onChange?.(undefined);
  }, [onChange]);

  useEffect(() => {
    const formattedDate = formatDateToInputValue(date);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTextInput(formattedDate);
  }, [date]);

  return (
    <div className="flex flex-col justify-center items-center py-4 min-h-full">
      <NovoCalculoQuestionarioDinamicoQuestaoTitle
        title={questaoTitle}
        subtitle={questaoSubtitle}
        crime={{
          codigo: "",
          descricao: "",
        }}
      />
      <div className="bg-red flex flex-col gap-2 max-w-xl w-full mt-6">
        <div className="flex flex-col gap-2">
          <Label>{t("label")}</Label>
          <InputGroup className="h-18">
            <InputGroupInput
              placeholder={t("placeholder")}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onBlur={() => handleTextChange()}
              ref={ref}
            />
            <InputGroupAddon>
              <CalendarIcon />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Button size="icon-sm" variant="ghost" onClick={handleClear}>
                <XIcon />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <Card className="w-full pb-0">
          <CardContent>
            <Calendar
              captionLayout="dropdown"
              className="mx-auto"
              mode="single"
              selected={date}
              onSelect={(date) => {
                onChange?.(date);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
