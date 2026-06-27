"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useTranslations } from "next-intl";
import { SpinCardTitle } from "../components/spin-card-title/SpinCardTitle";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApenadosListApenado,
  ApenadosListMetadataResponse,
} from "@/types/calculadora";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { ApenadoRegimeAtualEnum, CalculationResultEnum } from "@/types/enums";
import {
  daysToYearsMonthsDays,
  yearsMonthsDaysToHumanReadable,
} from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { ApenadoCrimesModal } from "./components/ApenadoCrimesModal";
import { NewApenadoDialog } from "../components/new-apenado-dialog/NewApenadoDialog";
import { toast } from "sonner";
import { PlusIcon, ArrowRightIcon } from "lucide-react";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      <ApenadosPage />
    </ProtectedRoute>
  );
}

/* ── Header / Stats ───────────────────────────────────────────────── */
const ApenadosHeader = ({
  metadata,
  fetching,
}: {
  metadata?: ApenadosListMetadataResponse;
  fetching: boolean;
}) => {
  const t = useTranslations();
  const itsEmptyState = (metadata?.data.total_apenados ?? 0) === 0;

  const stats = [
    {
      icon: fetching ? "progress_activity" : "people",
      color: "rgba(193,193,193,0.85)",
      value: t("common.apenadosCount", { count: metadata?.data.total_apenados ?? 0 }),
      label: t("apenadosPage.stats.total"),
    },
    {
      icon: fetching ? "progress_activity" : "person_remove",
      color: "rgba(251,191,36,0.85)",
      value: t("apenadosPage.stats.pendingCount", { count: 0 }),
      label: t("apenadosPage.stats.registrationIssues"),
    },
    {
      icon: fetching ? "progress_activity" : "male",
      color: "rgba(96,165,250,0.85)",
      value: t("apenadosPage.stats.menCount", { count: 0 }),
      label: t("apenadosPage.stats.registeredInmates"),
    },
    {
      icon: fetching ? "progress_activity" : "female",
      color: "rgba(244,114,182,0.85)",
      value: t("apenadosPage.stats.womenCount", { count: 0 }),
      label: t("apenadosPage.stats.registeredInmates"),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "rgba(236,209,166,0.7)" }}>
            Gestão de Apenados
          </p>
          <h1 className="text-2xl font-bold text-white">
            {t("apenadosPage.title")}
          </h1>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            {t("apenadosPage.subtitle")}
          </p>
        </div>
        <NewApenadoDialog
          trigger={
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shrink-0 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#ECD1A6", color: "#1C2A39" }}
            >
              <PlusIcon className="w-4 h-4" />
              {itsEmptyState
                ? t("apenadosPage.buttons.registerFirst")
                : t("apenadosPage.buttons.registerNew")}
            </button>
          }
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{
              background:     "rgba(255,255,255,0.05)",
              border:         "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span
              className="material-symbols-outlined text-2xl leading-none"
              style={{ color: stat.color }}
            >
              {stat.icon}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-white">{stat.value}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main page ─────────────────────────────────────────────────────── */
const ApenadosPage = () => {
  const t = useTranslations();
  const [inputFilterText, setFilterText] = useState("");
  const filterText = useDebounce(inputFilterText, 500);
  const [filterRegimeAtual, setFilterRegimeAtual] =
    useState<ApenadoRegimeAtualEnum | null>(null);
  const listAbortController = useRef<AbortController | null>(null);
  const listMetadataAbortController = useRef<AbortController | null>(null);
  const listRequestGenerationRef = useRef(0);
  const [fetchingList, setFetchingList] = useState(false);
  const [loadingMoreApenados, setLoadingMoreApenados] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [hasMoreApenados, setHasMoreApenados] = useState(false);
  const [apenados, setApenados] = useState<Array<ApenadosListApenado>>([]);
  const [metadata, setMetadata] = useState<ApenadosListMetadataResponse>();
  const [regimeFilterCounts, setRegimeFilterCounts] = useState({
    total: 0, fechado: 0, semiaberto: 0, aberto: 0,
  });
  const listFilterCountsAbortController = useRef<AbortController | null>(null);

  const itsEmptyState = useMemo(() => apenados.length === 0, [apenados]);

  const filtersRegimeOptions = useMemo(() => [
    { id: "all",          label: t("apenadosPage.filters.all",                 { count: regimeFilterCounts.total      }), regime: null,                          disabled: false },
    { id: "fechado",      label: t("apenadosPage.filters.closed",              { count: regimeFilterCounts.fechado    }), regime: ApenadoRegimeAtualEnum.Fechado,    disabled: false },
    { id: "semiaberto",   label: t("apenadosPage.filters.semiOpen",            { count: regimeFilterCounts.semiaberto }), regime: ApenadoRegimeAtualEnum.Semiaberto, disabled: false },
    { id: "tornozeleira", label: t("apenadosPage.filters.withAnkleMonitor",    { count: 0 }),                             regime: null,                          disabled: true  },
    { id: "aberto",       label: t("apenadosPage.filters.open",                { count: regimeFilterCounts.aberto     }), regime: ApenadoRegimeAtualEnum.Aberto,     disabled: false },
    { id: "livramento",   label: t("apenadosPage.filters.withConditionalRelease",{ count: 0 }),                           regime: null,                          disabled: true  },
    { id: "prd",          label: t("apenadosPage.filters.prd",                 { count: 0 }),                             regime: null,                          disabled: true  },
    { id: "sursis",       label: t("apenadosPage.filters.sursis",              { count: 0 }),                             regime: null,                          disabled: true  },
  ], [t, regimeFilterCounts]);

  useEffect(() => {
    const calculadoraService = CalculadoraService.getInstance();
    if (listAbortController.current) listAbortController.current.abort();
    listAbortController.current = new AbortController();
    const requestGeneration = ++listRequestGenerationRef.current;
    setFetchingList(true);
    calculadoraService
      .listApenados({ search: filterText, regime_atual: filterRegimeAtual ?? undefined, page: 1 }, listAbortController.current.signal)
      .then((response) => {
        if (listRequestGenerationRef.current !== requestGeneration) return;
        setApenados(response.results);
        setListPage(1);
        setHasMoreApenados(Boolean(response.next));
        setFetchingList(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        if (listRequestGenerationRef.current !== requestGeneration) return;
        setFetchingList(false);
      });
  }, [filterRegimeAtual, filterText]);

  const loadMoreApenados = useCallback(async () => {
    if (!hasMoreApenados || loadingMoreApenados || fetchingList) return;
    const requestGeneration = listRequestGenerationRef.current;
    setLoadingMoreApenados(true);
    try {
      const calculadoraService = CalculadoraService.getInstance();
      const response = await calculadoraService.listApenados({
        search: filterText || undefined,
        regime_atual: filterRegimeAtual ?? undefined,
        page: listPage + 1,
      });
      if (listRequestGenerationRef.current !== requestGeneration) return;
      setApenados((prev) => {
        const seen = new Set(prev.map((a) => a.uuid));
        return [...prev, ...response.results.filter((a) => !seen.has(a.uuid))];
      });
      setListPage((p) => p + 1);
      setHasMoreApenados(Boolean(response.next));
    } catch {
      if (listRequestGenerationRef.current === requestGeneration) {
        toast.error(t("apenadosPage.loadMoreError"));
      }
    } finally {
      setLoadingMoreApenados(false);
    }
  }, [fetchingList, filterRegimeAtual, filterText, hasMoreApenados, listPage, loadingMoreApenados, t]);

  useEffect(() => {
    const calculadoraService = CalculadoraService.getInstance();
    if (listFilterCountsAbortController.current) listFilterCountsAbortController.current.abort();
    listFilterCountsAbortController.current = new AbortController();
    const signal = listFilterCountsAbortController.current.signal;
    const searchParams = { search: filterText || undefined, page_size: 1 };
    Promise.all([
      calculadoraService.listApenados(searchParams, signal),
      calculadoraService.listApenados({ ...searchParams, regime_atual: ApenadoRegimeAtualEnum.Fechado }, signal),
      calculadoraService.listApenados({ ...searchParams, regime_atual: ApenadoRegimeAtualEnum.Semiaberto }, signal),
      calculadoraService.listApenados({ ...searchParams, regime_atual: ApenadoRegimeAtualEnum.Aberto }, signal),
    ])
      .then(([all, fechado, semiaberto, aberto]) => {
        setRegimeFilterCounts({ total: all.count, fechado: fechado.count, semiaberto: semiaberto.count, aberto: aberto.count });
      })
      .catch((error) => { if (error.name !== "AbortError") return; });
    return () => { listFilterCountsAbortController.current?.abort(); };
  }, [filterText]);

  useEffect(() => {
    const calculadoraService = CalculadoraService.getInstance();
    if (listMetadataAbortController.current) listMetadataAbortController.current.abort();
    listMetadataAbortController.current = new AbortController();
    setFetchingMetadata(true);
    calculadoraService
      .listApenadosMetadata(
        { search: filterText, regime_atual: filterRegimeAtual ?? undefined },
        listMetadataAbortController.current.signal
      )
      .then((response) => { setMetadata(response); setFetchingMetadata(false); })
      .catch((error) => { if (error.name === "AbortError") return; setFetchingMetadata(false); });
  }, [filterRegimeAtual, filterText]);

  return (
    <div className="relative w-full min-h-[calc(100svh-60px)] flex flex-col" style={{ zIndex: 1 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <section className="w-full px-6 md:px-10 pt-10 pb-8">
        <ApenadosHeader metadata={metadata} fetching={fetchingMetadata} />
      </section>

      {/* ── List section ───────────────────────────────────── */}
      <div className="flex-1 px-6 md:px-10 pb-10">
        {/* Toolbar */}
        <div className="flex gap-3 pb-5 flex-wrap items-center">
          <h2 className="text-white font-semibold text-base leading-none mr-1">
            {t("apenadosPage.titlePlural")}
          </h2>
          <span className="dark text-foreground">
            <InputGroup>
              <InputGroupInput
                type="text"
                value={inputFilterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={t("apenadosPage.searchPlaceholder")}
              />
              <InputGroupAddon>
                <span className="material-symbols-outlined text-inherit">search</span>
              </InputGroupAddon>
            </InputGroup>
          </span>
          <span className="dark text-foreground">
            <ButtonGroup className="rounded-md">
              {filtersRegimeOptions.map((option) => (
                <FilterRegimeButton
                  key={option.id}
                  regime={option.regime ?? undefined}
                  active={
                    filterRegimeAtual === option.regime ||
                    (filterRegimeAtual === null && option.regime === null)
                  }
                  onChange={
                    option.disabled
                      ? undefined
                      : (regime) => setFilterRegimeAtual(regime ?? null)
                  }
                  label={option.label}
                />
              ))}
            </ButtonGroup>
          </span>
        </div>

        {/* Grid */}
        {fetchingList ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
            {Array(12).fill(null).map((_, i) => <ApenadoCardSkeleton key={`mock_${i}`} />)}
          </div>
        ) : itsEmptyState ? (
          <ApenadosListEmptyState />
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
              {apenados.map((apenado) => <ApenadoCard key={apenado.uuid} apenado={apenado} />)}
            </div>
            {hasMoreApenados && (
              <div className="flex justify-center pt-6 pb-2">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer min-w-[200px] inline-flex items-center justify-center gap-2"
                  disabled={loadingMoreApenados}
                  onClick={() => { void loadMoreApenados(); }}
                >
                  {loadingMoreApenados && (
                    <span className="material-symbols-outlined animate-spin leading-none shrink-0">progress_activity</span>
                  )}
                  <span>{t("apenadosPage.loadMore")}</span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

/* ── Filter button ─────────────────────────────────────────────────── */
const FilterRegimeButton = ({
  regime, active, label, onChange,
}: {
  regime?: ApenadoRegimeAtualEnum;
  onChange?: (regime: ApenadoRegimeAtualEnum | null) => void;
  active: boolean;
  label: string;
}) => (
  <Button
    className="cursor-pointer"
    disabled={!onChange}
    variant={active && onChange ? "outline-tertiary-alt" : "outline"}
    onClick={onChange ? () => onChange(regime ?? null) : undefined}
  >
    {label}
  </Button>
);

/* ── Card skeleton ─────────────────────────────────────────────────── */
const ApenadoCardSkeleton = () => (
  <div
    className="rounded-xl overflow-hidden"
    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
  >
    <div className="p-3 border-b border-white/5">
      <Skeleton className="w-3/4 h-5" />
    </div>
    <div className="p-4 flex flex-col gap-3">
      <div className="flex gap-2"><Skeleton className="w-full h-4" /><Skeleton className="w-full h-4" /></div>
      <div className="flex gap-4 py-2"><Skeleton className="flex-1 h-14" /><Skeleton className="flex-1 h-14" /></div>
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-2 rounded-full" />
    </div>
    <div className="p-3 border-t border-white/5 flex gap-2">
      <Skeleton className="flex-1 h-7" /><Skeleton className="w-20 h-7" />
    </div>
  </div>
);

/* ── Empty state ───────────────────────────────────────────────────── */
const ApenadosListEmptyState = () => {
  const t = useTranslations();
  return (
    <div className="w-full min-h-[280px] flex flex-col items-center justify-center gap-3 px-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
        style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}
      >
        <span className="material-symbols-outlined text-purple-400">group</span>
      </div>
      <p className="font-semibold text-white text-base">{t("apenadosPage.emptyState.title")}</p>
      <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
        {t("apenadosPage.emptyState.description")}
      </p>
      <NewApenadoDialog
        trigger={
          <button
            className="flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#ECD1A6", color: "#1C2A39" }}
          >
            {t("apenadosPage.buttons.registerFirst")}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        }
      />
    </div>
  );
};

/* ── Apenado card ──────────────────────────────────────────────────── */
const ApenadoCard = ({ apenado }: { apenado: ApenadosListApenado }) => {
  const t = useTranslations();
  const [perfilModalOpen, setPerfilModalOpen] = useState(false);

  const numberFormatter = useMemo(
    () => Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 1 }),
    []
  );
  const dateFormatter = useMemo(
    () => Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }),
    []
  );

  const regimeName = useMemo(() => {
    switch (apenado.regime_atual) {
      case ApenadoRegimeAtualEnum.Fechado:    return t("apenadosPage.card.regimes.closed");
      case ApenadoRegimeAtualEnum.Semiaberto: return t("apenadosPage.card.regimes.semiOpen");
      case ApenadoRegimeAtualEnum.Aberto:     return t("apenadosPage.card.regimes.open");
      default: return t("apenadosPage.card.regimes.unknown");
    }
  }, [apenado.regime_atual, t]);

  const daysInHumanReadable = useCallback(
    (days: number) => yearsMonthsDaysToHumanReadable({ date: daysToYearsMonthsDays(days), t }),
    [t]
  );

  const pena_dias_faltantes = useMemo(() => {
    if (apenado.tempo_cumprido_dias === null) return apenado.pena_total_dias;
    return Math.max(apenado.pena_total_dias - apenado.tempo_cumprido_dias, 0);
  }, [apenado.pena_total_dias, apenado.tempo_cumprido_dias]);

  const pena_cumprida_percent = useMemo(() => {
    if (apenado.tempo_cumprido_dias === null || apenado.pena_total_dias === 0) return 0;
    return Math.min(apenado.tempo_cumprido_dias / apenado.pena_total_dias, 1);
  }, [apenado.tempo_cumprido_dias, apenado.pena_total_dias]);

  const lastCalculation = useMemo(() => {
    if (apenado.calculations.length === 0) return null;
    return [...apenado.calculations].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  }, [apenado.calculations]);

  return (
    <div
      className="rounded-xl overflow-hidden group transition-all duration-300 hover:border-purple-500/50"
      style={{
        background: "rgba(255,255,255,0.05)",
        border:     "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Card header */}
      <SpinCardTitle
        dense
        groupHoverable
        actions={
          <span className="hidden group-hover:flex">
            <Button
              size="sm"
              variant="tertiary"
              type="button"
              className="cursor-pointer"
              onClick={() => setPerfilModalOpen(true)}
            >
              {t("apenadosPage.card.viewProfile")}
            </Button>
          </span>
        }
        title={
          <span className="text-muted-foreground font-semibold group-hover:text-foreground transition-colors duration-300">
            {apenado.nome}
          </span>
        }
        icon={
          <span className="material-symbols-outlined leading-none! text-xl">person</span>
        }
      />

      <CardContent className="flex flex-col py-2 px-4">
        <div className="flex gap-2 py-2 justify-between items-center w-full text-xs">
          <span>{t("apenadosPage.card.registroGeral")}:</span>
          <span>{apenado.cpf}</span>
        </div>
        <Separator />
        <div className="bg-white/5 flex py-4">
          <span className="flex-1 flex flex-col items-center px-4">
            <span className="material-symbols-outlined text-[#ECD1A6]">calculate</span>
            <span className="text-sm font-semibold">{regimeName}</span>
            <span className="text-xs text-muted-foreground">{t("apenadosPage.card.regimeCumprimento")}</span>
          </span>
          <Separator orientation="vertical" />
          <span className="flex-1 flex flex-col items-center px-4">
            <span className="material-symbols-outlined text-[#ECD1A6]">calculate</span>
            <span className="text-sm font-semibold">{t("apenadosPage.card.reincidente")}</span>
            <span className="text-xs text-muted-foreground">{t("apenadosPage.card.totais")}</span>
          </span>
        </div>
        <Separator />
        <div className="flex gap-2 py-2 justify-between items-center w-full text-xs">
          <span>{t("apenadosPage.card.penaTotal")}:</span>
          <strong className="font-semibold">{daysInHumanReadable(apenado.pena_total_dias)}</strong>
        </div>
        <Separator />
        <div className="flex gap-2 py-2 justify-between items-center w-full text-xs">
          <span>{t("apenadosPage.card.cumprimentoAtual")}:</span>
          <strong className="font-semibold">{daysInHumanReadable(apenado.tempo_cumprido_dias ?? 0)}</strong>
        </div>
        <div className="w-full">
          <Label className="mb-1 text-muted-foreground font-medium flex justify-end">
            {numberFormatter.format(pena_cumprida_percent)}
          </Label>
          <Progress value={pena_cumprida_percent * 100} />
        </div>
        <div className="flex gap-2 py-2 justify-between items-center w-full text-xs">
          <span>{t("apenadosPage.card.startDate", { date: "15/01/2018" })}:</span>
          <span>{t("apenadosPage.card.timeRemaining", { remaining: daysInHumanReadable(pena_dias_faltantes) })}</span>
        </div>
        <Separator />
        <ApenadoCrimesModal apenado={apenado} open={perfilModalOpen} onOpenChange={setPerfilModalOpen} />
      </CardContent>

      <CardFooter className="rounded-b-md border px-4 border-transparent border-t-white/10 bg-white/5 py-2!">
        <div className="flex gap-2 w-full items-center justify-between">
          <span className="text-muted-foreground text-xs leading-none flex-1">
            {t("apenadosPage.card.ultimoCalculo")}:{" "}
            {lastCalculation
              ? dateFormatter.format(new Date(lastCalculation.created_at))
              : t("apenadosPage.card.semCalculo")}
          </span>
          {lastCalculation && (
            <ApenadoCardLastCalculationResultBadge resultado={lastCalculation.resultado} />
          )}
        </div>
      </CardFooter>
    </div>
  );
};

/* ── Result badge ──────────────────────────────────────────────────── */
const ApenadoCardLastCalculationResultBadge = ({
  resultado,
}: {
  resultado: CalculationResultEnum | null;
}) => {
  const t = useTranslations();
  switch (resultado) {
    case CalculationResultEnum.Commutable:
    case CalculationResultEnum.Pardonable:
      return (
        <Badge variant="secondary-success" className="rounded-md">
          <span className="material-symbols-outlined">check</span>
          {t("apenadosPage.card.status.eligible")}
        </Badge>
      );
    case CalculationResultEnum.NoReduction:
      return (
        <Badge variant="secondary-destructive" className="rounded-md">
          <span className="material-symbols-outlined">cancel</span>
          {t("apenadosPage.card.status.notEligible")}
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="rounded-md">
          <span className="material-symbols-outlined">error</span>
          {t("apenadosPage.card.status.noResult")}
        </Badge>
      );
  }
};
