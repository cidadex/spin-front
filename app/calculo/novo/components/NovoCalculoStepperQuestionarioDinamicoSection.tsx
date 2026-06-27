"use client";
import { useState } from "react";
import { Activity } from "@/components/ui/activity";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CalculadoraVariavelRespondida } from "@/types/calculadora";
import { NovoCalculoStepperSidebarSubItem } from "./NovoCalculoStepperSidebarSubItem";
import { CalculationVariavelTypeEnum } from "@/types/enums";
import { useNovoCalculo } from "@/hooks/useNovoCalculo";

export const NovoCalculoStepperQuestionarioDinamicoSection = () => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const { variaveisRespondidas } = useNovoCalculo();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center pl-3 mb-2">
        <span className="text-xs font-medium">
          {t("calculo.questionarioDinamico.stepTitle")}
        </span>
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer"
          onClick={() => setOpen((openState) => !openState)}
        >
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Activity mode={open ? "visible" : "hidden"}>
          <div className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            {variaveisRespondidas.map((variavel) => (
              <NovoCalculoStepperSidebarSubItem
                key={variavel.uuid}
                label={variavel.pergunta}
                value={getValueFromVariable(variavel, t)}
              />
            ))}
          </div>
        </Activity>
        <Activity mode={open ? "visible" : "hidden"}>
          <NovoCalculoStepperQuestionarioDinamicoCrimesSection />
        </Activity>
      </div>
    </div>
  );
};

export const NovoCalculoStepperQuestionarioDinamicoCrimesSection = () => {
  const { upperboundCrimes, getParsedDispositivo } = useNovoCalculo();
  const t = useTranslations();

  const crimesWithVariaveisRespondidas = upperboundCrimes.filter(
    (crime) => crime.variaveis_respondidas.length > 0
  );

  return (
    <>
      {crimesWithVariaveisRespondidas.map((crime) => (
        <div
          key={crime.crime_id}
          className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
        >
          <div className="flex gap-2 items-baseline text-sm">
            {getParsedDispositivo(crime.crime_id).descricao}
            <small>{getParsedDispositivo(crime.crime_id).codigo}</small>
          </div>
          {crime.variaveis_respondidas.map((variavel) => (
            <NovoCalculoStepperSidebarSubItem
              key={variavel.uuid}
              label={variavel.pergunta}
              value={getValueFromVariable(variavel, t)}
            />
          ))}
        </div>
      ))}
    </>
  );
};

const getValueFromVariable = (
  variavel: CalculadoraVariavelRespondida,
  t: (key: string) => string
) => {
  if (variavel.tipo === CalculationVariavelTypeEnum.Boolean) {
    return variavel.valor ? t("common.yes") : t("common.no");
  }

  return String(variavel.valor);
};
