import { CircularProgress } from "@/app/components/circular-progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircleIcon, BookTextIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { NovoCalculoQuestionarioDinamicoQuestaoBoolean } from "./NovoCalculoQuestionarioDinamicoQuestaoBoolean";
import { CalculationVariavelTypeEnum } from "@/types/enums";
import { CalculadoraVariavelPendiente } from "@/types/calculadora";
import { NovoCalculoQuestionarioDinamicoQuestaoSelect } from "./NovoCalculoQuestionarioDinamicoQuestaoSelect";
import { useRouter } from "next/navigation";
import { NovoCalculoQuestionarioDinamicoQuestaoNumer } from "./NovoCalculoQuestionarioDinamicoQuestaoNumber";
import { useNovoCalculo } from "@/hooks/useNovoCalculo";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import {
  CheckboxGroupOpcao,
  NovoCalculoQuestionarioDinamicoQuestaoCheckboxGroup,
} from "./NovoCalculoQuestionarioDinamicoQuestaoCheckboxGroup";

export type BooleanQuestionProps = {
  questao: CalculadoraVariavelPendiente & {
    tipo: CalculationVariavelTypeEnum.Boolean;
  };
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => Promise<void>;
};

export type ListQuestionProps = {
  questao: CalculadoraVariavelPendiente & {
    tipo: CalculationVariavelTypeEnum.List;
  };
  value: string | undefined;
  onChange: (value: string | undefined) => Promise<void>;
};

export type IntegerQuestionProps = {
  questao: CalculadoraVariavelPendiente & {
    tipo: CalculationVariavelTypeEnum.Integer;
  };
  value: number | undefined;
  onChange: (value: number | undefined) => Promise<void>;
};

export type DecimalQuestionProps = {
  questao: CalculadoraVariavelPendiente & {
    tipo: CalculationVariavelTypeEnum.Decimal;
  };
  value: number | undefined;
  onChange: (value: number | undefined) => Promise<void>;
};

export type NovoCalculoQuestionarioDinamicoQuestaoProps =
  | BooleanQuestionProps
  | ListQuestionProps
  | IntegerQuestionProps
  | DecimalQuestionProps;

const isBooleanQuestion = (
  p: NovoCalculoQuestionarioDinamicoQuestaoProps
): p is BooleanQuestionProps =>
  p.questao.tipo === CalculationVariavelTypeEnum.Boolean;

const isListQuestion = (
  p: NovoCalculoQuestionarioDinamicoQuestaoProps
): p is ListQuestionProps =>
  p.questao.tipo === CalculationVariavelTypeEnum.List;

const isIntegerQuestion = (
  p: NovoCalculoQuestionarioDinamicoQuestaoProps
): p is IntegerQuestionProps =>
  p.questao.tipo === CalculationVariavelTypeEnum.Integer;

const isDecimalQuestion = (
  p: NovoCalculoQuestionarioDinamicoQuestaoProps
): p is DecimalQuestionProps =>
  p.questao.tipo === CalculationVariavelTypeEnum.Decimal;

// F4.3 — Humanitária por alínea (art. 9º, XVI alíneas I/II/IV/V)
const OPCOES_CONDICAO_MEDICA: CheckboxGroupOpcao[] = [
  {
    id: "I",
    label:
      "Inc. I — Paraplegia, tetraplegia, monoplegia, hemiplegia, ostomia, amputação, paralisia, cegueira ou deficiência física análoga (não anterior à prática do crime)",
  },
  {
    id: "II",
    label: "Inc. II — HIV em estágio terminal",
  },
  {
    id: "IV",
    label:
      "Inc. IV — Doença grave, crônica ou altamente contagiosa com grave limitação funcional (câncer estágio IV, insuficiência renal aguda, esclerose múltipla, ELA, tuberculose avançada, diabetes tipo 1)",
  },
  {
    id: "V",
    label:
      "Inc. V — Transtorno do espectro autista severo (grau 3) ou neurodiversidade análoga",
  },
];

// F4.4 — Pobreza: 7 incisos do art. 12, §2º
const OPCOES_HIPOSUFICIENTE: CheckboxGroupOpcao[] = [
  {
    id: "I",
    label: "Inc. I — Declaração de hipossuficiência (sob as penas da lei)",
  },
  {
    id: "II",
    label:
      "Inc. II — Representado por Defensoria Pública, dativo no múnus público ou núcleo de prática jurídica",
  },
  {
    id: "III",
    label:
      "Inc. III — Beneficiário de programa social (Bolsa Família, Auxílio Brasil, BPC-LOAS)",
  },
  {
    id: "IV",
    label: "Inc. IV — Inscrito no CadÚnico",
  },
  {
    id: "V",
    label: "Inc. V — Pessoa em situação de rua",
  },
  {
    id: "VI",
    label: "Inc. VI — Indígena de comunidade tradicional",
  },
  {
    id: "VII",
    label: "Inc. VII — Migrante em situação de vulnerabilidade",
  },
];

const CHECKBOX_GROUP_CONFIG: Record<
  string,
  { titulo: string; opcoes: CheckboxGroupOpcao[]; labelNenhuma?: string }
> = {
  condicao_medica: {
    titulo: "O apenado se enquadra em alguma das condições médicas abaixo?",
    opcoes: OPCOES_CONDICAO_MEDICA,
    labelNenhuma: "Nenhuma das condições acima",
  },
  hiposuficiente: {
    titulo:
      "O apenado se enquadra em alguma hipótese de hipossuficiência? (art. 12, §2º do Decreto)",
    opcoes: OPCOES_HIPOSUFICIENTE,
    labelNenhuma: "Nenhuma das anteriores",
  },
};

export function NovoCalculoQuestionarioDinamicoQuestao(
  props: NovoCalculoQuestionarioDinamicoQuestaoProps
) {
  const t = useTranslations("calculo.questionarioDinamico");
  const tCommon = useTranslations("common");
  const tDadosProcessuais = useTranslations(
    "calculo.dadosProcessuais.successPage"
  );
  const { push } = useRouter();
  const { goBack } = useNovoCalculo();

  const booleanProps = isBooleanQuestion(props) ? props : null;
  const listProps = isListQuestion(props) ? props : null;
  const integerProps = isIntegerQuestion(props) ? props : null;
  const decimalProps = isDecimalQuestion(props) ? props : null;

  // F4.3/F4.4: detectar variáveis especiais que usam multi-checkbox
  const identificadorBase = props.questao.identificador.split(".").pop() ?? "";
  const checkboxGroupConfig = CHECKBOX_GROUP_CONFIG[identificadorBase];
  const crimeUuid =
    Array.isArray(props.questao.ref_id)
      ? props.questao.ref_id[0]
      : props.questao.ref_id;

  return (
    <div className="flex flex-col w-full flex-1 max-h-full overflow-hidden">
      <header className="flex container mx-auto py-4 items-center gap-3">
        <CircularProgress
          className="text-blue-700 min-w-8"
          size={32}
          total={100}
          current={10}
          strokeWidth={4}
        />
        <p className="leading-none text-sm">
          <strong className="font-semibold">
            {t("intelligentAnalysisInProgress")}{" "}
          </strong>
          {t("eachResponseEvaluated")}
        </p>
      </header>
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* F4.3 / F4.4: multi-checkbox para condicao_medica e hiposuficiente */}
        {booleanProps && checkboxGroupConfig && (
          <NovoCalculoQuestionarioDinamicoQuestaoCheckboxGroup
            questaoTitle={checkboxGroupConfig.titulo}
            questaoSubtitle={booleanProps.questao.tooltip}
            opcoes={checkboxGroupConfig.opcoes}
            labelNenhuma={checkboxGroupConfig.labelNenhuma}
            onChange={async (value, selectedLabels) => {
              await booleanProps.onChange(value);
              // F4.3/F4.4: persistir os incisos escolhidos para exibição no relatório.
              // Sempre sincroniza esta questão: se vazio (ex.: "Nenhuma"), remove a
              // entrada para não exibir incisos obsoletos no relatório.
              const svc = CalculadoraService.getInstance();
              const prev = {
                ...(svc.getTempCalculationMetadata()?.incisos_selecionados ??
                  {}),
              };
              if (selectedLabels.length > 0) {
                prev[props.questao.identificador] = selectedLabels;
              } else {
                delete prev[props.questao.identificador];
              }
              svc.updateTempCalculationMetadataItem(
                "incisos_selecionados",
                prev
              );
            }}
            crimeUuid={crimeUuid ?? undefined}
          />
        )}
        {booleanProps && !checkboxGroupConfig && (
          <NovoCalculoQuestionarioDinamicoQuestaoBoolean
            value={booleanProps.value}
            onChange={booleanProps.onChange}
            questaoTitle={booleanProps.questao.pergunta}
            questaoSubtitle={booleanProps.questao.tooltip}
            crimeUuid={crimeUuid ?? undefined}
          />
        )}
        {listProps && (
          <NovoCalculoQuestionarioDinamicoQuestaoSelect
            selectedValues={listProps.value ? [listProps.value] : []}
            onChange={(value) => {
              listProps.onChange(value[0]);
            }}
            questaoTitle={listProps.questao.pergunta}
            questaoSubtitle={listProps.questao.tooltip}
            options={listProps.questao.opcoes.map((opcao) => ({
              label: opcao.valor,
              value: opcao.valor,
            }))}
            crimeUuid={crimeUuid ?? undefined}
          />
        )}
        {integerProps && (
          <NovoCalculoQuestionarioDinamicoQuestaoNumer
            value={integerProps.value}
            onChange={integerProps.onChange}
            questaoTitle={integerProps.questao.pergunta}
            questaoSubtitle={integerProps.questao.tooltip}
            crimeUuid={crimeUuid ?? undefined}
          />
        )}
        {decimalProps && (
          <NovoCalculoQuestionarioDinamicoQuestaoNumer
            value={decimalProps.value}
            onChange={decimalProps.onChange}
            questaoTitle={decimalProps.questao.pergunta}
            questaoSubtitle={decimalProps.questao.tooltip}
            allowDecimal
            crimeUuid={crimeUuid ?? undefined}
          />
        )}
      </main>
      <div className="container mx-auto flex items-center pt-4">
        <Alert>
          <AlertCircleIcon />
          <AlertDescription>{t("aiAutoFilledAlert")}</AlertDescription>
        </Alert>
      </div>
      <div className="py-4">
        <Separator />
      </div>
      <footer className="container mx-auto flex gap-10 items-center pb-4">
        <span className="flex-1">
          <Button
            variant="ghost"
            size="lg"
            className="cursor-pointer"
            onClick={() => {
              goBack();
            }}
          >
            <i className="material-symbols-outlined">arrow_left_alt</i>
            {tCommon("back")}
          </Button>
        </span>
        <Button
          variant="primary"
          className="cursor-pointer"
          onClick={() => {
            const calculadoraService = CalculadoraService.getInstance();
            calculadoraService.clearTempCalculationData();
            push("/");
          }}
        >
          <BookTextIcon />
          {tDadosProcessuais("saveAndContinueLater")}
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block w-fit">
              <Button variant="success" disabled size="lg">
                {t("calculateEligibility")}
                <i className="material-symbols-outlined">arrow_right_alt</i>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{t("answerQuestionsTooltip")}</TooltipContent>
        </Tooltip>
      </footer>
    </div>
  );
}
