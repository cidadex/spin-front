"use client";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AuthStatusEnum } from "@/types/enums/auth";
import { NovoCalculoQuestionarioDinamicoQuestao } from "../components/NovoCalculoQuestionarioDinamicoQuestao";
import {
  CalculationVariavelEscopoEnum,
  CalculationVariavelTypeEnum,
  PageStatusEnum,
} from "@/types/enums";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { CircularProgress } from "@/app/components/circular-progress";
import {
  CalculadoraVariavelPendiente,
  CalculadoraVariavelRespondida,
} from "@/types/calculadora";
import { useNovoCalculo } from "@/hooks/useNovoCalculo";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookTextIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      <QuestionarioDinamicoPage />
    </ProtectedRoute>
  );
}

const QuestionarioDinamicoPage = () => {
  const {
    updateVariaveis,
    variaveisPendentes,
    variaveisRespondidas,
    upperboundCrimes,
  } = useNovoCalculo();
  const [pageStatus, setPageStatus] = useState<PageStatusEnum>(
    PageStatusEnum.Initial
  );

  const searchParams = useSearchParams();
  const ref_id = searchParams.get("ref_id");
  const escopo = searchParams.get("escopo");
  const identificador = searchParams.get("identificador");

  const variableFromQueryParams = useMemo<
    CalculadoraVariavelPendiente | CalculadoraVariavelRespondida | null
  >(() => {
    if (!escopo || !identificador) return null;

    const variablePendente = variaveisPendentes.find(
      (variavel) =>
        variavel.ref_id === ref_id &&
        variavel.escopo === escopo &&
        variavel.identificador.endsWith(identificador)
    );

    if (variablePendente) {
      return variablePendente;
    }

    const variableRespondida = variaveisRespondidas.find((variavel) => {
      return (
        (escopo === CalculationVariavelEscopoEnum.Apenado ||
          variavel.ref_id === ref_id) &&
        variavel.escopo === escopo &&
        variavel.identificador.endsWith(identificador)
      );
    });

    if (variableRespondida) {
      return variableRespondida;
    }

    const crime = upperboundCrimes.find((crime) => crime.crime_id === ref_id);
    if (!crime) return null;
    const variableFromCrime = crime.variaveis_respondidas.find(
      (variavel) =>
        variavel.escopo === escopo &&
        variavel.identificador.endsWith(identificador)
    );

    if (variableFromCrime) {
      return variableFromCrime;
    }

    return null;
  }, [
    ref_id,
    escopo,
    identificador,
    variaveisPendentes,
    variaveisRespondidas,
    upperboundCrimes,
  ]);

  const firstVariable = useMemo(() => {
    if (variaveisPendentes.length === 0) return null;
    return variaveisPendentes[0];
  }, [variaveisPendentes]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageStatus(PageStatusEnum.Loading);
    updateVariaveis().then(() => {
      setPageStatus(PageStatusEnum.Loaded);
    });
  }, [updateVariaveis]);

  console.log({ variaveisPendentes });

  useEffect(() => {
    if (
      pageStatus === PageStatusEnum.Loaded &&
      variaveisPendentes.length === 0
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPageStatus(PageStatusEnum.Completed);
    }
  }, [pageStatus, variaveisPendentes]);

  useEffect(() => {
    if (variableFromQueryParams) {
      return;
    }

    const ref_id = firstVariable?.ref_id;
    const escopo = firstVariable?.escopo;
    const identificador = firstVariable?.identificador;

    if (pageStatus !== PageStatusEnum.Loaded) {
      return;
    }

    if (!firstVariable) {
      return;
    }

    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("ref_id", Array.isArray(ref_id) ? ref_id[0] : ref_id || "");
    queryParams.set("escopo", escopo || "");
    queryParams.set("identificador", identificador || "");

    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [pageStatus, firstVariable, variableFromQueryParams]);

  return (
    <>
      {pageStatus === PageStatusEnum.Loading && (
        <div className="w-full h-full text-primary flex items-center justify-center">
          <CircularProgress
            size={50}
            total={100}
            current={25}
            className="animate-spin"
          />
        </div>
      )}
      {pageStatus === PageStatusEnum.Loaded &&
        (firstVariable || variableFromQueryParams) && (
          <NovoCalculoQuestionarioDinamicoQuestaoWrapper
            questao={
              variableFromQueryParams ? variableFromQueryParams : firstVariable!
            }
            value={
              variableFromQueryParams
                ? ((variableFromQueryParams as CalculadoraVariavelRespondida)
                    .valor as string | number | boolean | undefined)
                : undefined
            }
            onAnswer={() => {
              updateVariaveis();
              const queryParams = new URLSearchParams(window.location.search);
              queryParams.delete("ref_id");
              queryParams.delete("escopo");
              queryParams.delete("identificador");
              const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
              window.history.replaceState(null, "", newUrl);
            }}
          />
        )}
      {pageStatus === PageStatusEnum.Completed && (
        <QuestionarioDinamicoSuccessPage />
      )}
    </>
  );
};

const NovoCalculoQuestionarioDinamicoQuestaoWrapper = ({
  questao,
  onAnswer,
  value,
}: {
  questao: CalculadoraVariavelPendiente;
  onAnswer: (value: boolean | string | number | undefined) => void;
  value: boolean | string | number | undefined;
}) => {
  if (
    questao.tipo !== CalculationVariavelTypeEnum.Boolean &&
    questao.tipo !== CalculationVariavelTypeEnum.List &&
    questao.tipo !== CalculationVariavelTypeEnum.Integer &&
    questao.tipo !== CalculationVariavelTypeEnum.Decimal
  ) {
    return <div>Tipo de questão não suportada ainda.</div>;
  }

  return (
    <NovoCalculoQuestionarioDinamicoQuestao
      questao={
        questao as
          | Extract<
              CalculadoraVariavelPendiente,
              { tipo: CalculationVariavelTypeEnum.Boolean }
            >
          | Extract<
              CalculadoraVariavelPendiente,
              { tipo: CalculationVariavelTypeEnum.List }
            >
          | Extract<
              CalculadoraVariavelPendiente,
              { tipo: CalculationVariavelTypeEnum.Integer }
            >
          | Extract<
              CalculadoraVariavelPendiente,
              { tipo: CalculationVariavelTypeEnum.Decimal }
            >
      }
      value={value}
      onChange={async (newValue: boolean | string | number | undefined) => {
        const calculadoraService = CalculadoraService.getInstance();

        switch (questao.escopo) {
          case CalculationVariavelEscopoEnum.Apenado:
            await calculadoraService.updateApenadoVariavel({
              escopo: CalculationVariavelEscopoEnum.Apenado,
              variavelIdentificador: questao.identificador.replace(
                `${questao.escopo}.`,
                ""
              ),
              variavelValor: newValue,
            });
            onAnswer(newValue);
            break;
          case CalculationVariavelEscopoEnum.Pena:
            await calculadoraService.updateApenadoVariavel({
              escopo: CalculationVariavelEscopoEnum.Pena,
              variavelIdentificador:
                questao.identificador.split(".").pop() || "",
              variavelValor: newValue,
              crimeUuid: Array.isArray(questao.ref_id)
                ? questao.ref_id[0]
                : questao.ref_id,
            });
            onAnswer(newValue);
            break;
          default:
            throw new Error("Missing implemetation");
            break;
        }
      }}
    />
  );
};

const QuestionarioDinamicoSuccessPage = () => {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const tDadosProcessuais = useTranslations(
    "calculo.dadosProcessuais.successPage"
  );

  const { push } = useRouter();
  const handleStartAnalysis = useCallback(async () => {
    push("/calculo/novo/relatorio");
  }, [push]);

  return (
    <div className="flex flex-col justify-center items-center flex-1 gap-4">
      <div className="flex-1"></div>
      <span className="bg-[#ECD1A6]/15 border border-[#ECD1A6]/40 w-20 h-20 flex items-center justify-center rounded-full mb-2">
        <span className="inline-block leading-8 text-[48px] whitespace-nowrap">
          <i className="material-symbols-outlined material-symbols-outlined-sized text-[#ECD1A6] leading-none">
            check
          </i>
        </span>
      </span>
      <h1 className="text-2xl font-bold text-foreground">
        {t("calculo.questionarioDinamico.successPage.title")}
      </h1>
      <span className="text-muted-foreground text-sm">
        {t("calculo.questionarioDinamico.successPage.subtitle")}
      </span>
      <section className="max-w-xl">
        <div className="rounded-lg border border-[#ECD1A6]/25 bg-[#ECD1A6]/5 p-6 mt-4">
          <header className="flex gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#ECD1A6]/20 flex items-center text-2xl justify-center min-w-12 min-h-12">
              <i className="material-symbols-outlined material-symbols-outlined-sized text-[#ECD1A6]">
                calculate
              </i>
            </div>
            <section className="flex flex-col gap-2">
              <h2 className="font-bold text-base text-[#ECD1A6]">
                {t("calculo.questionarioDinamico.successPage.cardTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("calculo.questionarioDinamico.successPage.cardDescription")}
              </p>
            </section>
          </header>
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <h3 className="uppercase text-[#ECD1A6]/80 font-semibold text-xs">
              {t("calculo.questionarioDinamico.successPage.confirmedDataTitle")}
            </h3>
            <ul className="list-disc list-inside mt-2 text-muted-foreground text-xs">
              <li className="mb-1">
                {t(
                  "calculo.questionarioDinamico.successPage.confirmedDataItems.personalData"
                )}
              </li>
              <li className="mb-1">
                {t(
                  "calculo.questionarioDinamico.successPage.confirmedDataItems.prisonData"
                )}
              </li>
              <li className="mb-1">
                {t(
                  "calculo.questionarioDinamico.successPage.confirmedDataItems.prisonRegime"
                )}
              </li>
            </ul>
          </div>
        </div>
        <Button
          className="w-full cursor-pointer mt-6 bg-[#ECD1A6] text-[#1C2A39] hover:bg-[#dfc090] shadow hover:shadow-lg font-bold border-0"
          size="3xl"
          onClick={handleStartAnalysis}
        >
          {t("calculo.questionarioDinamico.successPage.startAnalysisButton")}
          <i className="material-symbols-outlined material-symbols-outlined-sized text-[#1C2A39] leading-none">
            arrow_forward
          </i>
        </Button>
      </section>
      <div className="flex-1"></div>
      <div className="mt-6 mb-4 w-full">
        <Separator />
      </div>
      <footer className="container mx-auto flex gap-10 items-center pb-4">
        <span className="flex-1">
          <Button variant="ghost" size="lg" className="cursor-pointer" disabled>
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
        <div className="flex-1"></div>
      </footer>
    </div>
  );
};

const QuestionarioDinamicoPageRouteConfig = {
  hideMenu: true,
  configs: {
    step: "questionario-dinamico",
    stepIndex: 1,
  },
};
