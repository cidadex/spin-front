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

  console.log({ questao: props.questao }, props.questao.ref_id);

  const booleanProps = isBooleanQuestion(props) ? props : null;
  const listProps = isListQuestion(props) ? props : null;
  const integerProps = isIntegerQuestion(props) ? props : null;
  const decimalProps = isDecimalQuestion(props) ? props : null;

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
        {booleanProps && (
          <NovoCalculoQuestionarioDinamicoQuestaoBoolean
            value={booleanProps.value}
            onChange={booleanProps.onChange}
            questaoTitle={booleanProps.questao.pergunta}
            questaoSubtitle={booleanProps.questao.tooltip}
            crimeUuid={
              Array.isArray(booleanProps.questao.ref_id)
                ? booleanProps.questao.ref_id[0]
                : booleanProps.questao.ref_id
            }
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
            crimeUuid={
              Array.isArray(listProps.questao.ref_id)
                ? listProps.questao.ref_id[0]
                : listProps.questao.ref_id
            }
          />
        )}
        {integerProps && (
          <NovoCalculoQuestionarioDinamicoQuestaoNumer
            value={integerProps.value}
            onChange={integerProps.onChange}
            questaoTitle={integerProps.questao.pergunta}
            questaoSubtitle={integerProps.questao.tooltip}
            crimeUuid={
              Array.isArray(integerProps.questao.ref_id)
                ? integerProps.questao.ref_id[0]
                : integerProps.questao.ref_id
            }
          />
        )}
        {decimalProps && (
          <NovoCalculoQuestionarioDinamicoQuestaoNumer
            value={decimalProps.value}
            onChange={decimalProps.onChange}
            questaoTitle={decimalProps.questao.pergunta}
            questaoSubtitle={decimalProps.questao.tooltip}
            allowDecimal
            crimeUuid={
              Array.isArray(decimalProps.questao.ref_id)
                ? decimalProps.questao.ref_id[0]
                : decimalProps.questao.ref_id
            }
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
