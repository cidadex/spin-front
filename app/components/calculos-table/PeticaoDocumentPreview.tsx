"use client";

import {
  daysToYearsMonthsDays,
  yearsMonthsDaysToHumanReadable,
} from "@/lib/utils";
import { PeticaoData, PeticaoDataDados } from "@/types/calculadora";
import { ApenadoRegimeAtualEnum } from "@/types/enums";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

function formatDatePtBr(iso: string): string {
  const normalized = iso.includes("T") ? iso : `${iso}T12:00:00`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString("pt-BR");
}

function getExtraDado(dados: PeticaoDataDados, key: string): unknown {
  return (dados as unknown as Record<string, unknown>)[key];
}

function formatPercentPt(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function PeticaoDocumentPreview({
  dados,
  beneficios_aplicados,
}: {
  dados: PeticaoDataDados;
  beneficios_aplicados: PeticaoData["beneficios_aplicados"];
}) {
  const tDoc = useTranslations("calculosPage.table.petitionModal.document");
  const tGlobal = useTranslations();

  const regimeLabel = useMemo(() => {
    switch (dados.regime_atual) {
      case ApenadoRegimeAtualEnum.Fechado:
        return tDoc("regimeAtual.FECHADO");
      case ApenadoRegimeAtualEnum.Semiaberto:
        return tDoc("regimeAtual.SEMIABERTO");
      case ApenadoRegimeAtualEnum.Aberto:
        return tDoc("regimeAtual.ABERTO");
      default:
        return dados.regime_atual;
    }
  }, [dados.regime_atual, tDoc]);

  const penaTotalText = useMemo(
    () =>
      yearsMonthsDaysToHumanReadable({
        date: daysToYearsMonthsDays(dados.pena_total_dias),
        t: tGlobal,
      }),
    [dados.pena_total_dias, tGlobal]
  );

  const penaPermissivosText = useMemo(
    () =>
      yearsMonthsDaysToHumanReadable({
        date: daysToYearsMonthsDays(dados.pena_crimes_permissivos),
        t: tGlobal,
      }),
    [dados.pena_crimes_permissivos, tGlobal]
  );

  const percentualCumprido =
    dados.pena_total_dias > 0
      ? (dados.tempo_cumprido / dados.pena_total_dias) * 100
      : 0;

  const saidasTemp = getExtraDado(dados, "apenado.saidas_temporarias");
  const saidasTemporarias =
    typeof saidasTemp === "number" ? saidasTemp : undefined;

  const comarca = useMemo(() => {
    if (dados.cidade && dados.estado) {
      return `${dados.cidade}/${dados.estado}`;
    }
    if (dados.cidade) {
      return dados.cidade;
    }
    if (dados.estado) {
      return tDoc("comarcaEstadoOnly", { estado: dados.estado });
    }
    return tDoc("comarcaPlaceholder");
  }, [dados.cidade, dados.estado, tDoc]);

  const dataReferenciaFmt = formatDatePtBr(dados.data_referencia);
  const hojeFmt = new Date().toLocaleDateString("pt-BR");
  const localData = dados.cidade
    ? tDoc("localDataComCidade", { cidade: dados.cidade, data: hojeFmt })
    : dados.estado
      ? tDoc("localDataComEstado", { estado: dados.estado, data: hojeFmt })
      : tDoc("localDataGenerico", { data: hojeFmt });

  const temImpeditivos = dados.crimes_impeditivos.length > 0;

  return (
    <article className="text-sm leading-relaxed text-gray-900 space-y-5">
      <header className="space-y-3">
        <h2 className="text-center text-xs font-bold uppercase tracking-wide text-gray-900 sm:text-sm">
          {tDoc("judgeHeading", { comarca })}
        </h2>
        <p className="text-center font-medium">
          {tDoc("processLine", { numero: dados.numero_processo })}
        </p>
      </header>

      <p className="text-justify indent-6">
        {tDoc("intro", {
          nome: dados.nome_sentenciado,
          regime: regimeLabel,
          decreto: dados.decreto_nome,
        })}
      </p>

      <section className="space-y-3">
        <h3 className="font-bold text-gray-900">{tDoc("section1Title")}</h3>
        <p className="text-justify indent-6">
          {tDoc("section1Lead", {
            nome: dados.nome_sentenciado,
            penaTotal: penaTotalText,
            penaPermissivos: penaPermissivosText,
            tempoCumprido: String(dados.tempo_cumprido),
            reducao: String(dados.total_reducao_dias),
          })}
        </p>
        {dados.crimes_em_execucao.length > 0 ? (
          <ul className="list-disc pl-10 space-y-1">
            {dados.crimes_em_execucao.map((crime) => (
              <li key={crime}>{crime}</li>
            ))}
          </ul>
        ) : null}
        {saidasTemporarias !== undefined && saidasTemporarias > 0 ? (
          <p className="text-justify indent-6">
            {tDoc("section1Saidas", { count: saidasTemporarias })}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-gray-900">{tDoc("section2Title")}</h3>
        <p className="text-justify indent-6">
          {tDoc("section2Lead", {
            decreto: dados.decreto_nome,
            dataReferencia: dataReferenciaFmt,
            artigo: dados.artigo_aplicavel,
          })}
        </p>
        <ul className="list-disc pl-10 space-y-2">
          <li>
            {tDoc("bulletPrimario", { condicao: dados.condicao_juridica })}
          </li>
          <li>{tDoc("bulletRegime", { regime: regimeLabel })}</li>
          <li>
            {tDoc("bulletPercentual", {
              percentual: formatPercentPt(percentualCumprido),
              fracao: dados.fracao_cumprida,
              pedagio: dados.pedagio_fracao,
            })}
          </li>
          <li>
            {temImpeditivos
              ? tDoc("bulletImpeditivosSim")
              : tDoc("bulletImpeditivosNao")}
          </li>
          <li>{tDoc("bulletBoaConduta")}</li>
        </ul>
        {beneficios_aplicados.length > 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50/80 p-4">
            <p className="font-semibold text-gray-900 mb-2">
              {tDoc("beneficiosTitle")}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {beneficios_aplicados.map((b) => (
                <li key={`${b.beneficio_id}-${b.reducao_dias}`}>
                  {tDoc("beneficioItem", {
                    nome: b.beneficio_nome,
                    dias: b.reducao_dias,
                  })}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-gray-900">{tDoc("section3Title")}</h3>
        <ol className="list-decimal pl-10 space-y-2 text-justify">
          <li>{tDoc("request1")}</li>
          <li>{tDoc("request2")}</li>
          <li>{tDoc("request3")}</li>
          <li>{tDoc("request4")}</li>
          <li>{tDoc("request5")}</li>
        </ol>
      </section>

      <footer className="space-y-8 pt-4">
        <p className="text-center font-medium">{tDoc("closing")}</p>
        <p className="text-center text-gray-800">{localData}</p>
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="font-semibold">{dados.advogado_nome}</p>
          <p className="text-muted-foreground text-sm">{dados.advogado_oab}</p>
        </div>
      </footer>
    </article>
  );
}
