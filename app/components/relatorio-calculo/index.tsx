import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  daysToYearsMonthsDays,
  seeuDateConverter,
  yearsMonthsDaysToHumanReadable,
} from "@/lib/utils";
import { CalculadoraRelatorioDoCalculo } from "@/types/calculadora";
import { ApenadoRegimeAtualEnum } from "@/types/enums";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

export const RelatorioCalculo = ({
  relatorio,
}: {
  relatorio: CalculadoraRelatorioDoCalculo;
}) => {
  const t = useTranslations();

  const formatedPercent = useCallback((percent: number) => {
    return percent.toLocaleString("pt-BR", {
      style: "percent",
      minimumFractionDigits: 2,
    });
  }, []);

  const parseDate = useCallback((dateString: string) => {
    const date = seeuDateConverter.toDate(dateString);
    if (date) {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else {
      return dateString;
    }
  }, []);

  const idadeEmAnos = useCallback(
    (dataNascimentoSeeu: string, dataCorteSeeu: string): number | null => {
      const dataNascimento = seeuDateConverter.toDate(dataNascimentoSeeu);
      const dataCorte = seeuDateConverter.toDate(dataCorteSeeu);
      if (!dataNascimento || !dataCorte) return null;
      let age = dataCorte.getFullYear() - dataNascimento.getFullYear();
      const monthDiff = dataCorte.getMonth() - dataNascimento.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && dataCorte.getDate() < dataNascimento.getDate())
      ) {
        age -= 1;
      }
      return age >= 0 ? age : null;
    },
    []
  );

  const parseDuration = useCallback(
    (duration: number) => {
      const date = daysToYearsMonthsDays(duration);
      const parsed = yearsMonthsDaysToHumanReadable({
        t,
        date,
      });
      return parsed;
    },
    [t]
  );

  const getRegimeLabel = useCallback(
    (regime: ApenadoRegimeAtualEnum) => {
      switch (regime) {
        case ApenadoRegimeAtualEnum.Fechado:
          return t("apenadosPage.card.regimes.closed");
        case ApenadoRegimeAtualEnum.Semiaberto:
          return t("apenadosPage.card.regimes.semiOpen");
        case ApenadoRegimeAtualEnum.Aberto:
          return t("apenadosPage.card.regimes.open");
        default:
          return regime;
      }
    },
    [t]
  );

  const parseCondenacaoDuration = useCallback(
    (pena: CalculadoraRelatorioDoCalculo["condenacoes"][number]["pena"]) => {
      if (!pena) return "-";
      const regex = /(?:(\d+)a)?\s*(?:(\d+)m)?\s*(?:(\d+)d)?/;
      const match = pena.match(regex);

      if (!match) {
        return pena;
      }
      const [, anos, meses, dias] = match;

      return yearsMonthsDaysToHumanReadable({
        t,
        date: {
          years: Number(anos),
          months: Number(meses),
          days: Number(dias),
        },
      });
    },
    [t]
  );

  return (
    <div className="flex flex-col w-full justify-stretch items-center gap-6">
      <div className="rounded-lg bg-blue-600 w-full text-center p-6 text-white flex flex-col gap-1">
        <h1 className="leading-none mb-1 text-lg font-bold uppercase">
          {t("calculosPage.relatorio.calculo.title")}
        </h1>
        <span className="text-sm font-normal leading-none">
          {relatorio.decreto.nome}
        </span>
        <span className="text-xs leading-none">
          {t("calculosPage.relatorio.calculo.generatedAt", {
            date: parseDate(relatorio.data_gerado),
          })}
        </span>
      </div>
      <div className="bg-gray-50 text-gray-600 p-5 border border-gray-200 rounded-lg w-full">
        <header className="pb-2 border-b mb-4">
          <h2 className="uppercase text-gray-800 text-base font-bold leading-none">
            {t(
              "calculosPage.relatorio.calculo.sections.identificacaoSentenciado"
            )}
          </h2>
        </header>
        <div className="grid grid-cols-2 gap-4 items-baseline justify-start">
          <span className="leading-none text-xs">
            {t("calculosPage.relatorio.calculo.fields.nome")}{" "}
            <strong className="font-medium text-gray-800">
              {relatorio.identificacao.nome}
            </strong>
          </span>
          <span className="leading-none text-xs">
            {t("calculosPage.relatorio.calculo.fields.cpf")}{" "}
            <strong className="font-medium text-gray-800">
              {relatorio.identificacao.cpf}
            </strong>
          </span>
          <span className="leading-none text-xs">
            {t("calculosPage.relatorio.calculo.fields.dataNascimento")}{" "}
            <strong className="font-medium text-gray-800">
              {parseDate(relatorio.identificacao.data_nascimento)}
            </strong>
          </span>
          {(() => {
            const idade = idadeEmAnos(
              relatorio.identificacao.data_nascimento,
              relatorio.decreto.data_corte
            );
            if (idade === null) return null;
            return (
              <span className="leading-none text-xs">
                {t("calculosPage.relatorio.calculo.fields.idadeNaDataCorte", {
                  dataCorte: parseDate(relatorio.decreto.data_corte),
                })}{" "}
                <strong className="font-medium text-gray-800">
                  {t("calculosPage.relatorio.calculo.idadeAnos", {
                    idade,
                  })}
                </strong>
              </span>
            );
          })()}
          <span className="leading-none text-xs">
            {t("calculosPage.relatorio.calculo.fields.processos")}{" "}
            <strong className="font-medium text-gray-800">
              {(relatorio.identificacao?.processos ?? []).join(", ")}
            </strong>
          </span>
        </div>
      </div>
      <div className="bg-gray-50 text-gray-600 p-5 border border-gray-200 rounded-lg w-full">
        <header className="pb-2 border-b mb-4">
          <h2 className="uppercase text-gray-800 text-base font-bold leading-none">
            {t("calculosPage.relatorio.calculo.sections.dadosCondenacoes")}
          </h2>
        </header>
        <section className="flex flex-col gap-3">
          {(relatorio.condenacoes ?? []).map((condenacao, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-300 bg-white p-4 flex flex-col gap-2"
            >
              <div className="flex gap-2 justify-between items-center pb-1">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold leading-none px-2 py-1 rounded-full">
                  {t("calculosPage.relatorio.calculo.condenacaoNumero", {
                    index: index + 1,
                  })}
                </span>
                <span className="text-red-700 text-xs font-bold leading-none">
                  {t("calculosPage.relatorio.calculo.penaLabel")}{" "}
                  {parseCondenacaoDuration(condenacao.pena)}
                </span>
              </div>
              <div className="flex gap-2 justify-between items-center">
                <span className="text-gray-600 text-xs font-normal leading-none">
                  {t("calculosPage.relatorio.calculo.fields.crime")}
                </span>
                <span className="text-gray-800 text-xs font-medium leading-none">
                  {condenacao.nome}
                </span>
              </div>
              <div className="flex gap-2 justify-between items-center">
                <span className="text-gray-600 text-xs font-normal leading-none">
                  {t("calculosPage.relatorio.calculo.fields.dataDoFato")}
                </span>
                <span className="text-gray-800 text-xs font-medium leading-none">
                  {parseDate(condenacao.data)}
                </span>
              </div>
            </div>
          ))}
        </section>
        {(relatorio.processos_excluidos_por_sentenca_posterior?.length ?? 0) > 0 && (
          <Alert variant="warning" className="mt-4">
            <i className="material-symbols-outlined material-symbols-outlined-sized">
              warning
            </i>
            <AlertTitle>
              {t("calculosPage.relatorio.calculo.processosExcluidos.title")}
            </AlertTitle>
            <AlertDescription>
              {relatorio.processos_excluidos_por_sentenca_posterior?.map(
                (excluido) => (
                  <p
                    key={excluido.numero_condenacao}
                    className="text-xs leading-snug"
                  >
                    {t(
                      "calculosPage.relatorio.calculo.processosExcluidos.message",
                      {
                        numero: excluido.numero_condenacao,
                        dataSentenca: parseDate(excluido.data_sentenca),
                        decretoNome: relatorio.decreto.nome,
                        dataCorte: parseDate(relatorio.decreto.data_corte),
                      }
                    )}
                  </p>
                )
              )}
            </AlertDescription>
          </Alert>
        )}
        <div className="bg-blue-50 text-blue-800 p-5 mt-5 border border-blue-300 rounded-lg w-full">
          <header className="pb-2 mb-4">
            <div className="flex gap-2 items-center justify-start">
              <i className="material-symbols-outlined material-symbols-outlined-sized">
                schedule
              </i>
              <h2 className="text-xs font-bold leading-none">
                {t(
                  "calculosPage.relatorio.calculo.sections.resumoExecucaoUnificada"
                )}
              </h2>
            </div>
          </header>
          <section className="flex flex-col gap-2">
            <div className="flex gap-2 justify-between items-center">
              <span className=" text-xs font-normal leading-none">
                {t("calculosPage.relatorio.calculo.fields.penaTotalUnificada")}
              </span>
              <span className="text-red-700 text-xs font-bold leading-none">
                {t("calculosPage.relatorio.calculo.penaLabel")}{" "}
                {parseCondenacaoDuration(
                  relatorio.resumo_execucao_unificada.pena_total_unificada
                )}
              </span>
            </div>
            <div className="flex gap-2 justify-between items-center">
              <span className=" text-xs font-normal leading-none">
                {t("calculosPage.relatorio.calculo.fields.dataInicioExecucao")}
              </span>
              <span className="text-blue-900 text-xs font-medium leading-none">
                {parseDate(
                  relatorio.resumo_execucao_unificada.data_inicio_execucao
                )}
              </span>
            </div>
            <div className="flex gap-2 justify-between items-center">
              <span className=" text-xs font-normal leading-none">
                {t("calculosPage.relatorio.calculo.fields.regimeInicial")}
              </span>
              <span className="text-blue-900 text-xs font-medium leading-none">
                {relatorio.resumo_execucao_unificada.regime_inicial
                  ? getRegimeLabel(
                      relatorio.resumo_execucao_unificada.regime_inicial
                    )
                  : "-"}
              </span>
            </div>
            <Separator className="bg-blue-200" />
            <div className="flex gap-2 justify-between items-center">
              <span className=" text-xs font-normal leading-none">
                {t(
                  "calculosPage.relatorio.calculo.fields.regimeAtualNoDecreto"
                )}
              </span>
              <span className="text-blue-700 text-sm font-bold leading-none">
                {getRegimeLabel(
                  relatorio.resumo_execucao_unificada.regime_atual
                )}
              </span>
            </div>
            <div className="flex gap-2 justify-between items-center">
              <span className=" text-xs font-normal leading-none">
                {t("calculosPage.relatorio.calculo.fields.tempoPenaCumprida")}
              </span>
              <span className="text-green-700 text-sm font-bold leading-none">
                {parseDuration(
                  relatorio.resumo_execucao_unificada.tempo_pena_cumprida
                )}
              </span>
            </div>
            <div className="flex gap-2 justify-between items-center">
              <span className=" text-xs font-normal leading-none">
                {t("calculosPage.relatorio.calculo.fields.percentualCumprido")}
              </span>
              <span className="text-green-700 text-sm font-bold leading-none">
                {formatedPercent(
                  relatorio.resumo_execucao_unificada.percentual_cumprido
                )}
              </span>
            </div>
          </section>
        </div>
      </div>
      <div className="bg-blue-50 text-gray-600 p-5 border border-blue-700 rounded-lg w-full">
        <header className="pb-2 border-b border-b-blue-400 mb-4">
          <h2 className="uppercase text-gray-800 text-base font-bold leading-none">
            {t("calculosPage.relatorio.calculo.sections.calculoTempoCumprido")}
          </h2>
        </header>
        <section className="flex flex-col gap-2">
          <div className="flex gap-2 justify-between items-center">
            <span className="text-gray-600 text-xs font-normal leading-none">
              {t("calculosPage.relatorio.calculo.fields.dataInicioPena")}
            </span>
            <span className="text-gray-800 text-xs font-medium leading-none">
              {parseDate(relatorio.calculo_tempo_cumprido.data_primeiro_marco)}
            </span>
          </div>
          <div className="flex gap-2 justify-between items-center">
            <span className="text-gray-600 text-xs font-normal leading-none">
              {t("calculosPage.relatorio.calculo.fields.dataReferenciaDecreto")}
            </span>
            <span className="text-gray-800 text-xs font-medium leading-none">
              {parseDate(relatorio.calculo_tempo_cumprido.data_referencia)}
            </span>
          </div>
          <div className="flex gap-2 justify-between items-center">
            <span className="text-gray-600 text-xs font-normal leading-none">
              {t("calculosPage.relatorio.calculo.fields.tempoCorrido")}
            </span>
            <span className="text-gray-800 text-xs font-medium leading-none">
              {parseDuration(relatorio.calculo_tempo_cumprido.tempo_corrido)}
            </span>
          </div>
          <Separator className="bg-blue-400" />
          <div className="p-2 bg-white rounded-lg flex gap-2 items-center justify-between">
            <span className="leading-none text-xs text-gray-900 font-bold">
              {t("calculosPage.relatorio.calculo.fields.tempoTotalCumprido")}
            </span>
            <strong className="text-blue-700 text-base font-bold leading-none">
              {parseDuration(
                relatorio.calculo_tempo_cumprido.tempo_pena_cumprida
              )}
            </strong>
          </div>
        </section>
      </div>
      <RelatorioCalculoAnaliseDeElegibilidade relatorio={relatorio} />
      <ResultadoFinal relatorio={relatorio} />
      <FundamentacaoDaDecisao relatorio={relatorio} />
      <div className="bg-amber-50 border border-amber-400 w-full p-5 rounded-lg flex gap-2 items-start">
        <span className="text-sm leading-none">
          <i className="material-symbols-outlined material-symbols-outlined-sized leading-none text-amber-900">
            info
          </i>
        </span>
        <section className="text-xs font-normal text-amber-900 flex flex-col gap-2">
          <h2 className="leading-none text-sm font-bold uppercase">
            {t("calculosPage.relatorio.calculo.observacoes.title")}
          </h2>
          <p>{t("calculosPage.relatorio.calculo.observacoes.generated")}</p>
          <p>
            {t("calculosPage.relatorio.calculo.observacoes.baseadoNoDecreto", {
              decreto: relatorio.decreto.nome,
            })}
          </p>
          <p>{t("calculosPage.relatorio.calculo.observacoes.recomendacao")}</p>
          <p>{t("calculosPage.relatorio.calculo.observacoes.deferimento")}</p>
        </section>
      </div>
    </div>
  );
};

export const RelatorioCalculoAnaliseDeElegibilidade = ({
  relatorio,
}: {
  relatorio: CalculadoraRelatorioDoCalculo;
}) => {
  const t = useTranslations();

  return (
    <div className="bg-gray-50 text-gray-600 p-5 border border-gray-200 rounded-lg w-full">
      <header className="pb-2 border-b mb-4">
        <h2 className="uppercase text-gray-800 text-base font-bold leading-none">
          {t("calculosPage.relatorio.analiseElegibilidade.title")}
        </h2>
      </header>
      <section className="flex flex-col gap-2">
        <div className="flex gap-2 justify-between items-center">
          <span className="text-gray-600 text-xs font-normal leading-none">
            {t(
              "calculosPage.relatorio.analiseElegibilidade.gatilhosExclusaoAbsoluta"
            )}
          </span>
          <GatilhoDeExelusaoAbsolutos
            gatilhosExclusaoAbsolutos={
              relatorio.analise_elegibilidade.gatilhos_exclusao_absolutos
            }
          />
        </div>
        <div className="flex gap-2 justify-between items-center">
          <span className="text-gray-600 text-xs font-normal leading-none">
            {t("calculosPage.relatorio.analiseElegibilidade.crimeImpeditivo")}
          </span>
          <Badge
            variant={
              relatorio.analise_elegibilidade.crime_impeditivo
                ? "destructive"
                : "secondary-success"
            }
          >
            {relatorio.analise_elegibilidade.crime_impeditivo ? (
              <i className="material-symbols-outlined material-symbols-outlined-sized text-red-700">
                cancel
              </i>
            ) : (
              <i className="material-symbols-outlined material-symbols-outlined-sized text-green-700">
                check
              </i>
            )}
            {relatorio.analise_elegibilidade.crime_impeditivo
              ? t("common.yes")
              : t("common.no")}
          </Badge>
        </div>
        <div className="flex gap-2 justify-between items-center">
          <span className="text-gray-600 text-xs font-normal leading-none">
            {t(
              "calculosPage.relatorio.analiseElegibilidade.percentualCumpridoLabel"
            )}
          </span>
          <PercentualCumpridoLabel
            analiseElegibilidade={relatorio.analise_elegibilidade}
          />
        </div>
      </section>
    </div>
  );
};
const GatilhoDeExelusaoAbsolutos = ({
  gatilhosExclusaoAbsolutos,
}: {
  gatilhosExclusaoAbsolutos: CalculadoraRelatorioDoCalculo["analise_elegibilidade"]["gatilhos_exclusao_absolutos"];
}) => {
  const t = useTranslations();
  const gatilhos = [];

  if (gatilhosExclusaoAbsolutos.nao_cumpriu_pedagio) {
    gatilhos.push(
      t(
        "calculosPage.relatorio.analiseElegibilidade.gatilhos.naoCumpriuPedagio"
      )
    );
  }
  if (gatilhosExclusaoAbsolutos.todos_crimes_impeditivos) {
    gatilhos.push(
      t(
        "calculosPage.relatorio.analiseElegibilidade.gatilhos.todosCrimesImpeditivos"
      )
    );
  }
  if (gatilhos.length === 0) {
    return (
      <Badge variant="secondary-success">
        <i className="material-symbols-outlined material-symbols-outlined-sized text-green-700">
          check
        </i>
        {t("common.none")}
      </Badge>
    );
  }

  return gatilhos.map((gatilho, index) => (
    <Badge key={index} variant="warning">
      {gatilho}
    </Badge>
  ));
};

export const PercentualCumpridoLabel = ({
  analiseElegibilidade,
}: {
  analiseElegibilidade: CalculadoraRelatorioDoCalculo["analise_elegibilidade"];
}) => {
  const t = useTranslations();

  const percentual = analiseElegibilidade.percentual_cumprido;
  const percentualRequerido = analiseElegibilidade.percentual_requerido;

  if (percentual >= percentualRequerido) {
    return (
      <span className="text-xs font-bold leading-none text-green-600">
        {t("calculosPage.relatorio.analiseElegibilidade.percentualCumprido", {
          percentual: percentual.toLocaleString("pt-BR", {
            style: "percent",
            minimumFractionDigits: 2,
          }),
          percentualRequerido: percentualRequerido.toLocaleString("pt-BR", {
            style: "percent",
            minimumFractionDigits: 2,
          }),
        })}
      </span>
    );
  }
  return (
    <span className="text-xs font-bold leading-none text-red-600">
      {t("calculosPage.relatorio.analiseElegibilidade.percentualNaoCumprido", {
        percentual: percentual.toLocaleString("pt-BR", {
          style: "percent",
          minimumFractionDigits: 2,
        }),
        percentualRequerido: percentualRequerido.toLocaleString("pt-BR", {
          style: "percent",
          minimumFractionDigits: 2,
        }),
      })}
    </span>
  );
};

export const ResultadoFinal = ({
  relatorio,
}: {
  relatorio: CalculadoraRelatorioDoCalculo;
}) => {
  const t = useTranslations();

  if (relatorio.analise_elegibilidade.elegivel_para_indulto) {
    return (
      <div className="bg-green-100 border border-green-500 p-6 rounded-lg w-full flex flex-col gap-3">
        <header>
          <h2 className="text-center text-green-900 text-lg font-bold leading-none uppercase">
            {t("calculosPage.relatorio.resultadoFinal.title")}
          </h2>
        </header>
        <div className="bg-white p-6 rounded-lg flex flex-col items-center justify-center gap-2">
          <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center text-4xl">
            <i className="material-symbols-outlined material-symbols-outlined-sized text-white leading-none">
              check_circle
            </i>
          </div>
          <h3 className="text-green-700 text-xl font-bold leading-none uppercase mt-2 text-center">
            {t("calculosPage.relatorio.resultadoFinal.elegivel")}
          </h3>
          <span className="text-green-800 text-sm font-normal leading-none text-center">
            {relatorio.analise_elegibilidade.elegivel_para_indulto_motivo}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-100 border border-red-500 p-6 rounded-lg w-full flex flex-col gap-3">
      <header>
        <h2 className="text-center text-red-900 text-lg font-bold leading-none uppercase">
          {t("calculosPage.relatorio.resultadoFinal.title")}
        </h2>
      </header>
      <div className="bg-white p-6 rounded-lg flex flex-col items-center justify-center gap-2">
        <div className="bg-red-500 rounded-full w-16 h-16 flex items-center justify-center text-4xl">
          <i className="material-symbols-outlined material-symbols-outlined-sized text-white leading-none">
            cancel
          </i>
        </div>
        <h3 className="text-red-700 text-xl font-bold leading-none uppercase mt-2 text-center">
          {t("calculosPage.relatorio.resultadoFinal.naoElegivel")}
        </h3>
        <span className="text-red-800 text-sm font-normal leading-none text-center">
          {relatorio.analise_elegibilidade.elegivel_para_indulto_motivo}
        </span>
      </div>
    </div>
  );
};

type BadgeVariant =
  | "secondary-success"
  | "destructive"
  | "warning"
  | "secondary";

export const FundamentacaoDaDecisao = ({
  relatorio,
}: {
  relatorio: CalculadoraRelatorioDoCalculo;
}) => {
  const t = useTranslations();
  const justificativa = relatorio.justificativa;

  if (!justificativa || !justificativa.itens?.length) {
    return null;
  }

  const resultadoLabels: Record<string, string> = {
    ATENDIDO: t("calculosPage.relatorio.fundamentacao.resultado.atendido"),
    NAO_ATENDIDO: t("calculosPage.relatorio.fundamentacao.resultado.naoAtendido"),
    PENDENTE: t("calculosPage.relatorio.fundamentacao.resultado.pendente"),
    NAO_APLICAVEL: t(
      "calculosPage.relatorio.fundamentacao.resultado.naoAplicavel"
    ),
  };

  const origemLabels: Record<string, string> = {
    SEEU_RELATORIO: t("calculosPage.relatorio.fundamentacao.origem.seeu"),
    PROJUDI_LINHA_TEMPO: t("calculosPage.relatorio.fundamentacao.origem.projudi"),
    BASE_CRIMES: t("calculosPage.relatorio.fundamentacao.origem.baseCrimes"),
    DECRETO: t("calculosPage.relatorio.fundamentacao.origem.decreto"),
    INPUT_USUARIO: t("calculosPage.relatorio.fundamentacao.origem.usuario"),
    CALCULO_DERIVADO: t("calculosPage.relatorio.fundamentacao.origem.calculo"),
  };

  const variantByResultado: Record<string, BadgeVariant> = {
    ATENDIDO: "secondary-success",
    NAO_ATENDIDO: "destructive",
    PENDENTE: "warning",
    NAO_APLICAVEL: "secondary",
  };

  return (
    <div className="bg-gray-50 text-gray-600 p-5 border border-gray-200 rounded-lg w-full">
      <header className="pb-2 border-b mb-4">
        <h2 className="uppercase text-gray-800 text-base font-bold leading-none">
          {t("calculosPage.relatorio.fundamentacao.title")}
        </h2>
        <p className="text-gray-500 text-xs leading-snug mt-2">
          {t("calculosPage.relatorio.fundamentacao.subtitle")}
        </p>
      </header>

      {justificativa.conclusao && (
        <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-gray-800 leading-snug">
            {t("calculosPage.relatorio.fundamentacao.conclusaoLabel")}{" "}
            {justificativa.conclusao.resultado_label}
          </span>
          {justificativa.conclusao.resumo && (
            <span className="text-xs text-gray-600 leading-snug">
              {justificativa.conclusao.resumo}
            </span>
          )}
        </div>
      )}

      <section className="flex flex-col gap-3">
        {justificativa.itens.map((no) => {
          const fundamentos = Object.values(no.fundamentacao_legal || {})
            .filter(Boolean)
            .map(String);
          return (
            <div
              key={no.id}
              className="rounded-lg border border-gray-300 bg-white p-4 flex flex-col gap-2"
            >
              <div className="flex gap-2 justify-between items-start">
                <span className="text-gray-800 text-xs font-bold leading-snug">
                  {no.titulo}
                </span>
                <Badge variant={variantByResultado[no.resultado] ?? "secondary"}>
                  {resultadoLabels[no.resultado] ?? no.resultado}
                </Badge>
              </div>
              <p className="text-gray-600 text-xs leading-snug">
                {no.explicacao}
              </p>
              {fundamentos.length > 0 && (
                <p className="text-gray-500 text-[11px] leading-snug">
                  {t("calculosPage.relatorio.fundamentacao.fundamentoLabel")}{" "}
                  {fundamentos.join(" · ")}
                </p>
              )}
              {no.fonte?.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-gray-200 pt-2">
                  <span className="text-gray-500 text-[11px] font-semibold uppercase leading-none">
                    {t("calculosPage.relatorio.fundamentacao.fonteLabel")}
                  </span>
                  <ul className="flex flex-col gap-0.5">
                    {no.fonte.map((f, i) => (
                      <li
                        key={`${no.id}-fonte-${i}`}
                        className="text-gray-500 text-[11px] leading-snug"
                      >
                        <span className="font-medium text-gray-700">
                          {origemLabels[f.origem] ?? f.origem}
                        </span>
                        {" — "}
                        {f.campo}
                        {f.valor !== undefined &&
                        f.valor !== null &&
                        f.valor !== ""
                          ? `: ${f.valor}`
                          : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export const RelatorioCalculoSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="w-full h-30 rounded-md" />
      <Skeleton className="w-full h-30 rounded-md" />
      <Skeleton className="w-full h-200 rounded-md" />
      <Skeleton className="w-full h-30 rounded-md" />
      <Skeleton className="w-full h-30 rounded-md" />
    </div>
  );
};
