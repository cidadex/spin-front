import { Checkbox } from "@/components/ui/checkbox";
import { Item, ItemContent, ItemMedia } from "@/components/ui/item";
import { NovoCalculoQuestionarioDinamicoQuestaoTitle } from "./NovoCalculoQuestionarioDinamicoQuestaoTitle";
import { useNovoCalculo } from "@/hooks/useNovoCalculo";
import { useMemo } from "react";

interface NovoCalculoQuestionarioDinamicoQuestaoSelectItemProps {
  label: string;
  selected?: boolean;
  onChange: () => void;
}

interface NovoCalculoQuestionarioDinamicoQuestaoSelectProps {
  options: {
    label: string;
    value: string;
  }[];
  onChange: (selectedValues: string[]) => void;
  selectedValues: string[];
  questaoTitle: string;
  questaoSubtitle: string | null;
  crimeUuid?: string;
}

const NovoCalculoQuestionarioDinamicoQuestaoSelectItem = ({
  label,
  selected,
  onChange,
}: NovoCalculoQuestionarioDinamicoQuestaoSelectItemProps) => {
  return (
    <Item
      onClick={onChange}
      variant={selected ? "selected" : "outline"}
      className="cursor-pointer"
    >
      <ItemMedia>
        <Checkbox
          checked={selected}
          onCheckedChange={onChange}
          className="rounded-sm"
        />
      </ItemMedia>
      <ItemContent>{label}</ItemContent>
    </Item>
  );
};

export const NovoCalculoQuestionarioDinamicoQuestaoSelect = ({
  options,
  onChange,
  selectedValues,
  questaoSubtitle,
  questaoTitle,
  crimeUuid,
}: NovoCalculoQuestionarioDinamicoQuestaoSelectProps) => {
  const handleOptionChange = (value: string) => {
    onChange([value]);
  };

  const { getParsedDispositivo } = useNovoCalculo();

  const parsedDispositivo = useMemo(() => {
    const parsed = getParsedDispositivo(crimeUuid);
    return parsed;
  }, [crimeUuid, getParsedDispositivo]);

  return (
    <div className="flex flex-col justify-center items-center py-4 min-h-full">
      <NovoCalculoQuestionarioDinamicoQuestaoTitle
        title={questaoTitle}
        subtitle={questaoSubtitle}
        crime={parsedDispositivo}
      />
      <div className="max-w-xl w-full flex flex-col gap-3 mt-5  justify-center">
        {options?.map((option) => (
          <NovoCalculoQuestionarioDinamicoQuestaoSelectItem
            key={option.value}
            label={option.label}
            selected={selectedValues.includes(option.value)}
            onChange={() => handleOptionChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
};
