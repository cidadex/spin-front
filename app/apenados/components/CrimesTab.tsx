import { Button } from "@/components/ui/button";
import {
  findSeeuCrimeContext,
  seeuBool,
  seeuString,
} from "@/lib/seeu/seeuCrimeContext";
import {
  daysToYearsMonthsDays,
  yearsMonthsDaysToHumanReadable,
} from "@/lib/utils";
import {
  ApenadoDetalhe,
  CalculadoraGetCalculationResponseBase,
} from "@/types/calculadora";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const availableColors = [
  "#F5E6D3",
  "#AFECEF",
  "#EBF5FF",
  "#E8E2F7",
  "#E7F6F2",
  "#FFF5BA",
  "#FFD6E8",
  "#D5E8D4",
];

function formatDateBr(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

function pickVariavel(
  variaveis: Record<string, unknown> | null,
  keys: string[]
): string {
  if (!variaveis) return "—";
  for (const k of keys) {
    const val = variaveis[k];
    if (typeof val === "string" && val.trim()) return val;
  }
  return "—";
}

type CrimesTabProps = {
  apenado: ApenadoDetalhe;
  calculation?: CalculadoraGetCalculationResponseBase | null;
  onSync?: () => void;
  syncing?: boolean;
};

export const CrimesTab = ({
  apenado,
  calculation,
  onSync,
  syncing = false,
}: CrimesTabProps) => {
  const t = useTranslations();
  const rawData = apenado.raw_data as Record<string, unknown> | undefined;

  const totalPena = useMemo(() => {
    const totalPenaDias = apenado.pena_total_dias;
    const totalPenaYMD = daysToYearsMonthsDays(totalPenaDias);
    return yearsMonthsDaysToHumanReadable({ date: totalPenaYMD, t });
  }, [apenado.pena_total_dias, t]);

  const [selectedCrimeUuid, setSelectedCrimeUuid] = useState<string | null>(
    null
  );

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const crimesComputed = useMemo<
    Array<{
      crime: (typeof apenado.crimes)[0];
      percentage: number;
    }>
  >(() => {
    if (apenado.pena_total_dias === 0) {
      return apenado.crimes.map((crime) => ({ crime, percentage: 0 }));
    }
    return apenado.crimes
      .map((crime) => ({
        crime,
        percentage: (crime.pena_total_dias / apenado.pena_total_dias) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [apenado.crimes, apenado.pena_total_dias]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCrimeUuid(crimesComputed[0]?.crime.uuid || null);
  }, [crimesComputed]);

  const selectedCrime = useMemo(() => {
    return crimesComputed.find((c) => c.crime.uuid === selectedCrimeUuid)
      ?.crime;
  }, [crimesComputed, selectedCrimeUuid]);

  const seeu = useMemo(() => {
    if (!selectedCrime) {
      return {
        processo: null as Record<string, unknown> | null,
        desmembramento: null as Record<string, unknown> | null,
      };
    }
    const { processo, desmembramento } = findSeeuCrimeContext(
      rawData,
      selectedCrime.numero_condenacao,
      selectedCrime.dispositivo
    );
    return { processo, desmembramento };
  }, [rawData, selectedCrime]);

  const resultadoDetalhado = calculation?.resultado_detalhado;

  const lowerboundCrime = useMemo(() => {
    if (!selectedCrime || !resultadoDetalhado?.lowerbound?.crimes) return null;
    return resultadoDetalhado.lowerbound.crimes.find(
      (c) => c.crime_id === selectedCrime.uuid
    );
  }, [resultadoDetalhado, selectedCrime]);

  const crimeIndultavelInfo = useMemo(() => {
    if (!selectedCrime || !resultadoDetalhado?.impeditivos_check?.data) {
      return null;
    }
    const list =
      resultadoDetalhado.impeditivos_check.data.crimes_indultaveis ?? [];
    return (
      list.find(
        (item) =>
          item.crime_principal.dispositivo?.trim() ===
            selectedCrime.dispositivo.trim() &&
          item.crime_principal.data_cometimento ===
            selectedCrime.data_cometimento
      ) ?? null
    );
  }, [resultadoDetalhado, selectedCrime]);

  const qualificadoras = useMemo(() => {
    if (!selectedCrime) return [];
    const c = selectedCrime;
    const dm = seeu.desmembramento;
    const items: string[] = [];

    const violencia =
      c.com_violencia_ou_grave_ameaca ||
      seeuBool(dm, ["Violência ou grave ameaça"]);
    if (violencia) {
      items.push(
        t("apenadosPage.crimesTab.qualificadoras.violenciaGraveAmeaca")
      );
    }

    const morte = c.resultado_morte || seeuBool(dm, ["Resultado morte"]);
    if (morte) {
      items.push(t("apenadosPage.crimesTab.qualificadoras.resultadoMorte"));
    }

    const rComum = c.reincidente_comum || seeuBool(dm, ["Reincidente comum"]);
    if (rComum) {
      items.push(t("apenadosPage.crimesTab.qualificadoras.reincidenteComum"));
    }

    const rEsp =
      c.reincidente_especifico || seeuBool(dm, ["Reincidente específico"]);
    if (rEsp) {
      items.push(
        t("apenadosPage.crimesTab.qualificadoras.reincidenteEspecifico")
      );
    }

    const org =
      c.comando_organizacao_criminosa ||
      seeuBool(dm, ["Condenado por exercer comando de organização criminosa"]);
    if (org) {
      items.push(
        t("apenadosPage.crimesTab.qualificadoras.organizacaoCriminosa")
      );
    }

    return items;
  }, [seeu.desmembramento, selectedCrime, t]);

  const acaoPenalText = useMemo(() => {
    if (!selectedCrime) return "—";
    const fromVars = pickVariavel(selectedCrime.variaveis, [
      "acao_penal",
      "ação_penal",
      "acaoPenal",
    ]);
    if (fromVars !== "—") return fromVars;
    const tipoProc = seeuString(seeu.processo, ["Tipo"]);
    if (tipoProc) {
      return t("apenadosPage.crimesTab.acaoPenalSeeu", { tipo: tipoProc });
    }
    return t("apenadosPage.crimesTab.acaoPenalPadrao");
  }, [seeu.processo, selectedCrime, t]);

  const descricaoLegalCorpo = useMemo(() => {
    if (!selectedCrime) return "";
    const penaTexto = seeuString(seeu.desmembramento, ["Pena"]);
    if (penaTexto) return penaTexto;
    if (selectedCrime.observacao?.trim())
      return selectedCrime.observacao.trim();
    return "";
  }, [seeu.desmembramento, selectedCrime]);

  const juizoVara = useMemo(() => {
    return (
      seeuString(seeu.processo, ["Juízo/Vara de condenação"]) ??
      pickVariavel(selectedCrime?.variaveis ?? null, [
        "local_fato",
        "Local do Fato",
        "local",
      ])
    );
  }, [seeu.processo, selectedCrime]);

  const dataSentencaDisplay = useMemo(() => {
    if (!selectedCrime) return "—";
    const seeuD = seeuString(seeu.processo, ["Data da Sentença"]);
    if (seeuD) return formatDateBr(seeuD);
    if (selectedCrime.data_sentenca)
      return formatDateBr(selectedCrime.data_sentenca);
    return "—";
  }, [seeu.processo, selectedCrime]);

  const dataTransitoDisplay = useMemo(() => {
    if (!selectedCrime) return "—";
    const mp = seeuString(seeu.processo, [
      "Data do trânsito em julgado do Ministério Público",
    ]);
    const proc = seeuString(seeu.processo, [
      "Data do trânsito em julgado do processo",
    ]);
    const prefer = mp ?? proc;
    if (prefer) return formatDateBr(prefer);
    if (selectedCrime.data_transito_julgado)
      return formatDateBr(selectedCrime.data_transito_julgado);
    return "—";
  }, [seeu.processo, selectedCrime]);

  const leiAplicavel = useMemo(() => {
    return (
      seeuString(seeu.desmembramento, ["Lei"]) ??
      pickVariavel(selectedCrime?.variaveis ?? null, [
        "classificacao",
        "classificação",
      ])
    );
  }, [seeu.desmembramento, selectedCrime]);

  const naturezaDisplay = useMemo(() => {
    const n = pickVariavel(selectedCrime?.variaveis ?? null, ["natureza"]);
    if (n !== "—") return n;
    return t("apenadosPage.crimesTab.naturezaNaoInformada");
  }, [selectedCrime, t]);

  const indultoCorpo = useMemo(() => {
    const rel = calculation?.relatorio?.analise_elegibilidade;
    const motivo = rel?.elegivel_para_indulto_motivo?.trim();
    const razaoCrime = crimeIndultavelInfo?.razao?.trim();
    const partes: string[] = [];

    if (motivo) partes.push(motivo);
    if (razaoCrime && razaoCrime !== motivo) partes.push(razaoCrime);

    if (lowerboundCrime && typeof lowerboundCrime.is_impeditivo === "boolean") {
      partes.push(
        lowerboundCrime.is_impeditivo
          ? t("apenadosPage.crimesTab.indultoImpeditivoSim")
          : t("apenadosPage.crimesTab.indultoImpeditivoNao")
      );
    }

    if (partes.length > 0) return partes.join(" ");
    return t("apenadosPage.crimesTab.indultoTexto");
  }, [
    calculation?.relatorio?.analise_elegibilidade,
    crimeIndultavelInfo?.razao,
    lowerboundCrime,
    t,
  ]);

  return (
    <div className="flex flex-col pb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between bg-gray-50 px-6 pt-6">
        <span className="text-gray-800 text-sm font-semibold">
          {t("apenadosPage.crimesTab.distribuicaoPenaTotal", { totalPena })}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-normal text-gray-600">
            {t("apenadosPage.crimesTab.ultimaAtualizacao", {
              date: dateFormatter.format(new Date(apenado.updated_at)),
            })}
          </span>
          {onSync && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              disabled={syncing}
              onClick={onSync}
            >
              <span
                className={`material-symbols-outlined text-base ${syncing ? "animate-spin" : ""}`}
              >
                refresh
              </span>
              {t("apenadosPage.crimesTab.sincronizar")}
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-600 px-6 pt-2 bg-gray-50">
        {t("apenadosPage.crimesTab.crimeDestaqueHint", {
          count: apenado.crimes.length,
        })}
      </p>
      <div>
        <div className="py-4 bg-gray-50 px-6">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden min-h-10">
            {crimesComputed.map(({ crime, percentage }, index) => {
              const color = availableColors[index % availableColors.length];
              const isSelected = crime.uuid === selectedCrimeUuid;
              return (
                <button
                  key={crime.uuid}
                  type="button"
                  style={{
                    flex: Math.max(percentage, 0.01),
                    backgroundColor: isSelected ? undefined : color,
                  }}
                  onClick={() => setSelectedCrimeUuid(crime.uuid)}
                  className={`cursor-pointer hover:opacity-90 flex items-center justify-center relative px-2 py-1.5 border-r border-gray-300/80 last:border-r-0 transition-all duration-100 ${isSelected ? "bg-blue-800 shadow-inner" : ""}`}
                >
                  <span
                    className={`w-6 h-6 flex items-center justify-center ${isSelected ? "bg-white/25 text-white" : "bg-white text-gray-800 border border-gray-300"} rounded-full text-xs leading-none font-semibold`}
                  >
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 items-stretch gap-2 py-2 px-6 bg-gray-50 border-b">
          {crimesComputed.map(({ crime, percentage }, index) => {
            const isSelected = crime.uuid === selectedCrimeUuid;
            return (
              <button
                key={crime.uuid}
                type="button"
                onClick={() => setSelectedCrimeUuid(crime.uuid)}
                className={`p-4 border rounded-lg text-left text-xs flex gap-2 items-start transition-all duration-100 cursor-pointer hover:opacity-95 ${isSelected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-300 bg-white"}`}
              >
                <span
                  className={`text-xs flex items-center justify-center leading-none w-6 h-6 shrink-0 border rounded-full ${isSelected ? "bg-blue-800 text-white border-blue-800" : "bg-gray-100 border-gray-300 text-gray-800"}`}
                >
                  {index + 1}
                </span>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="text-gray-800 font-semibold leading-snug">
                    {crime.dispositivo}
                  </span>
                  <span className="text-gray-700 font-normal">
                    {yearsMonthsDaysToHumanReadable({
                      date: daysToYearsMonthsDays(crime.pena_total_dias),
                      t,
                    })}{" "}
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCrime && (
        <div className="px-6 pt-6 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              {t("apenadosPage.crimesTab.descricaoLegalTitulo", {
                crime: selectedCrime.dispositivo,
                norma: selectedCrime.diploma || "—",
              })}
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
              {descricaoLegalCorpo ||
                t("apenadosPage.crimesTab.semDescricaoLegal")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-1">
                {t("apenadosPage.crimesTab.info.juizoVara")}
              </p>
              <p className="text-xs text-gray-900 break-words">
                {juizoVara !== "—" ? juizoVara : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-1">
                {t("apenadosPage.crimesTab.info.dataCometimento")}
              </p>
              <p className="text-xs text-gray-900">
                {formatDateBr(selectedCrime.data_cometimento)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-1">
                {t("apenadosPage.crimesTab.info.leiNorma")}
              </p>
              <p className="text-xs text-gray-900 break-words">
                {leiAplicavel !== "—" ? leiAplicavel : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-1">
                {t("apenadosPage.crimesTab.info.natureza")}
              </p>
              <p className="text-xs text-gray-900">{naturezaDisplay}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-1">
                {t("apenadosPage.crimesTab.info.dataSentenca")}
              </p>
              <p className="text-xs text-gray-900">{dataSentencaDisplay}</p>
            </div>
            <div className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-1">
                {t("apenadosPage.crimesTab.info.dataTransito")}
              </p>
              <p className="text-xs text-gray-900">{dataTransitoDisplay}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50/80 px-4 py-3">
              <p className="text-xs font-bold text-blue-900 mb-1">
                {t("apenadosPage.crimesTab.acaoPenal")}
              </p>
              <p className="text-xs text-blue-950">{acaoPenalText}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3">
              <p className="text-xs font-bold text-red-900 mb-1">
                {t("apenadosPage.crimesTab.qualificadorasTitulo")}
              </p>
              {qualificadoras.length > 0 ? (
                <ul className="text-xs text-red-950 list-disc pl-4 space-y-1">
                  {qualificadoras.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-red-950">
                  {t("apenadosPage.crimesTab.semQualificadoras")}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-3">
            <p className="text-xs font-bold text-gray-900 mb-2">
              {t("apenadosPage.crimesTab.indultoTitulo")}
            </p>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
              {indultoCorpo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
