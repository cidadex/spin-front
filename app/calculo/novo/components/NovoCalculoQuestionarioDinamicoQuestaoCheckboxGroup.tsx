"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Item, ItemContent, ItemMedia } from "@/components/ui/item";
import { LoaderIcon } from "lucide-react";
import { Activity } from "@/components/ui/activity";
import { NovoCalculoQuestionarioDinamicoQuestaoTitle } from "./NovoCalculoQuestionarioDinamicoQuestaoTitle";
import { useNovoCalculo } from "@/hooks/useNovoCalculo";
import { useTranslations } from "next-intl";
export interface CheckboxGroupOpcao {
  id: string;
  label: string;
}

interface Props {
  questaoTitle: string;
  questaoSubtitle?: string | null;
  opcoes: CheckboxGroupOpcao[];
  labelNenhuma?: string;
  /** value = true se qualquer inciso marcado; false se "Nenhuma". selectedLabels = labels dos incisos escolhidos. */
  onChange: (value: boolean, selectedLabels: string[]) => Promise<void>;
  crimeUuid?: string;
}

export const NovoCalculoQuestionarioDinamicoQuestaoCheckboxGroup = ({
  questaoTitle,
  questaoSubtitle,
  opcoes,
  labelNenhuma = "Nenhuma das anteriores",
  onChange,
  crimeUuid,
}: Props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [nenhumaSelected, setNenhumaSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getParsedDispositivo } = useNovoCalculo();
  const tCommon = useTranslations("common");
  const parsedDispositivo = useMemo(
    () => getParsedDispositivo(crimeUuid),
    [crimeUuid, getParsedDispositivo]
  );

  const hasSelection = selected.size > 0 || nenhumaSelected;

  const toggleOpcao = useCallback((id: string) => {
    setNenhumaSelected(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleNenhuma = useCallback(() => {
    setSelected(new Set());
    setNenhumaSelected((prev) => !prev);
  }, []);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    const selectedLabels = Array.from(selected)
      .map((id) => opcoes.find((o) => o.id === id)?.label ?? id);
    await onChange(selected.size > 0, selectedLabels);
    setLoading(false);
  }, [onChange, selected, opcoes]);

  return (
    <div className="flex flex-col justify-center items-center py-4 min-h-full">
      <NovoCalculoQuestionarioDinamicoQuestaoTitle
        title={questaoTitle}
        subtitle={questaoSubtitle ?? null}
        crime={parsedDispositivo}
      />

      <div className="max-w-xl w-full flex flex-col gap-3 mt-6">
        {opcoes.map((opcao) => (
          <Item
            key={opcao.id}
            onClick={() => toggleOpcao(opcao.id)}
            variant={selected.has(opcao.id) ? "selected" : "outline"}
            className="cursor-pointer"
          >
            <ItemMedia>
              <Checkbox
                checked={selected.has(opcao.id)}
                onCheckedChange={() => toggleOpcao(opcao.id)}
                className="rounded-sm"
              />
            </ItemMedia>
            <ItemContent>{opcao.label}</ItemContent>
          </Item>
        ))}

        <div className="border-t border-white/10 pt-3">
          <Item
            onClick={toggleNenhuma}
            variant={nenhumaSelected ? "selected" : "outline"}
            className="cursor-pointer"
          >
            <ItemMedia>
              <Checkbox
                checked={nenhumaSelected}
                onCheckedChange={toggleNenhuma}
                className="rounded-sm"
              />
            </ItemMedia>
            <ItemContent className="text-gray-500 italic">
              {labelNenhuma}
            </ItemContent>
          </Item>
        </div>

        <Button
          className="w-full mt-2 cursor-pointer"
          variant="success"
          size="lg"
          disabled={!hasSelection || loading}
          onClick={handleConfirm}
        >
          <Activity mode={loading ? "visible" : "hidden"}>
            <LoaderIcon className="w-4 h-4 animate-spin" />
          </Activity>
          {tCommon("confirm")}
        </Button>
      </div>
    </div>
  );
};
