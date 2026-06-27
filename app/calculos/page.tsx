"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  CalculadoraCalculationsGroupedListResponse,
  CalculadoraCalculationsGroupedStatusGroup,
  CalculadoraCalculationsSummaryResponseBase,
} from "@/types/calculadora";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { CalculationStatusEnum } from "@/types/enums";
import { useDebounce } from "@/hooks/useDebounce";
import { NewApenadoDialog } from "../components/new-apenado-dialog/NewApenadoDialog";
import {
  CalculosTable,
  CalculosTableLineSkeleton,
} from "../components/calculos-table/CalculosTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalculadoraRepository } from "@/repositories/calculadora/CalculadoraRepository";
import { toast } from "sonner";
import { ArrowRightIcon, PlusIcon } from "lucide-react";

type CalculosGroupedListFilterTab =
  | "all"
  | "em_aberto"
  | CalculationStatusEnum.Completed
  | CalculationStatusEnum.Canceled;

function statusGroupFromListFilterTab(
  tab: CalculosGroupedListFilterTab
): CalculadoraCalculationsGroupedStatusGroup {
  if (tab === "all") return "todos";
  if (tab === "em_aberto") return "em_aberto";
  if (tab === CalculationStatusEnum.Completed) return "concluidos";
  return "cancelados";
}

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      <CalculosPage />
    </ProtectedRoute>
  );
}

/* ── Stats header ─────────────────────────────────────────────────── */
const CalculosHeader = ({
  summary,
  fetchingSummary,
}: {
  summary: CalculadoraCalculationsSummaryResponseBase | null;
  fetchingSummary: boolean;
}) => {
  const t = useTranslations();
  const showRegisterFirstLabel = summary !== null && summary.total === 0;

  const stats = [
    {
      icon: fetchingSummary ? "progress_activity" : "calculate",
      iconColor: "rgba(193,193,193,0.8)",
      value: summary?.total ?? 0,
      subtitle: t("apenadosPage.stats.total"),
    },
    {
      icon: fetchingSummary ? "progress_activity" : "check_box",
      iconColor: "rgba(74,222,128,0.85)",
      value: summary?.elegiveis_indulto ?? 0,
      subtitle: t("calculosPage.stats.eligibleForPardon"),
    },
    {
      icon: fetchingSummary ? "progress_activity" : "exposure",
      iconColor: "rgba(96,165,250,0.85)",
      value: summary?.elegiveis_comutacao ?? 0,
      subtitle: t("calculosPage.stats.eligibleForCommutation"),
    },
    {
      icon: fetchingSummary ? "progress_activity" : "content_paste_off",
      iconColor: "rgba(248,113,113,0.85)",
      value: summary?.nao_elegiveis ?? 0,
      subtitle: t("calculosPage.stats.notEligible"),
    },
    {
      icon: fetchingSummary ? "progress_activity" : "pending_actions",
      iconColor: "rgba(251,146,60,0.85)",
      value: summary?.pendentes_conclusao ?? 0,
      subtitle: t("calculosPage.stats.pendingCompletion"),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-7">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "rgba(236,209,166,0.7)" }}>
            Painel Jurídico
          </p>
          <h1 className="text-2xl font-bold text-white">
            {t("calculosPage.title")}
          </h1>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            {t("calculosPage.subtitle")}
          </p>
        </div>
        <NewApenadoDialog
          trigger={
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shrink-0 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#ECD1A6", color: "#1C2A39" }}
            >
              <PlusIcon className="w-4 h-4" />
              {showRegisterFirstLabel
                ? t("calculosPage.buttons.registerFirst")
                : t("calculosPage.buttons.registerNew")}
            </button>
          }
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
              style={{ color: stat.iconColor }}
            >
              {stat.icon}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-white">
                {t("common.calculationsCount", { count: stat.value })}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {stat.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main page ─────────────────────────────────────────────────────── */
const CalculosPage = () => {
  const t = useTranslations();
  const [summary, setSummary] =
    useState<CalculadoraCalculationsSummaryResponseBase | null>(null);
  const [fetchingSummary, setFetchingSummary] = useState(false);
  const summaryAbortController = useRef<AbortController | null>(null);

  const [inputFilterText, setFilterText] = useState("");
  const filterText = useDebounce(inputFilterText, 500);
  const [listFilterTab, setListFilterTab] =
    useState<CalculosGroupedListFilterTab>("all");
  const [filterDate, setFilterDate] = useState<string>("last_30_days");
  const [dateRange, setDateRange] = useState<{
    created_at_after?: string;
    created_at_before?: string;
  }>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      created_at_after: thirtyDaysAgo.toISOString().split("T")[0],
      created_at_before: today.toISOString().split("T")[0],
    };
  });
  const [fetchingList, setFetchingList] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const getPageAbortController = useRef<AbortController | null>(null);
  const [calculationsGrouped, setCalculationsGrouped] =
    useState<CalculadoraCalculationsGroupedListResponse | null>(null);
  const paginationTriggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    summaryAbortController.current?.abort();
    const calculadoraRepository = new CalculadoraRepository();
    summaryAbortController.current = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetchingSummary(true);
    calculadoraRepository
      .getCalculationsSummary(summaryAbortController.current.signal)
      .then((response) => { setSummary(response.data); setFetchingSummary(false); })
      .catch((error) => {
        if (error.name === "AbortError") return;
        toast.error(t("calculosPage.statsSummaryError"));
        setFetchingSummary(false);
      });
    return () => { summaryAbortController.current?.abort(); };
  }, [t]);

  const getPage = useCallback(
    (
      pageNumber: number,
      {
        cpf, search, created_at_after, created_at_before, status_group,
      }: {
        cpf?: string;
        search?: string;
        created_at_after?: string;
        created_at_before?: string;
        status_group: CalculadoraCalculationsGroupedStatusGroup;
      }
    ) => {
      const calculadoraService = CalculadoraService.getInstance();
      if (getPageAbortController.current) getPageAbortController.current.abort();
      getPageAbortController.current = new AbortController();
      setPage(pageNumber);
      setFetchingList(true);
      if (pageNumber === 1) setCalculationsGrouped(null);

      calculadoraService
        .listCalculationsGrouped(
          { page_size: pageSize, page: pageNumber, cpf, search, created_at_after, created_at_before, status_group },
          getPageAbortController.current.signal
        )
        .then((response) => {
          setTotalPages(Math.ceil(response.count / pageSize));
          setCalculationsGrouped((currentList) => ({
            ...currentList,
            ...response,
            totais: response.totais ?? currentList?.totais,
            results: [...(currentList?.results ?? []), ...response.results],
          }));
        })
        .catch((error) => { if (error.name !== "AbortError") return; })
        .finally(() => { setFetchingList(false); });
    },
    [pageSize]
  );

  const itsEmptyState = useMemo(() => {
    if (fetchingList || fetchingSummary) return false;
    if ((calculationsGrouped?.results?.length ?? 0) !== 0) return false;
    if (summary === null) return false;
    return summary.total === 0;
  }, [calculationsGrouped?.results?.length, fetchingList, fetchingSummary, summary]);

  const filtersStatusOptions = useMemo((): {
    label: string; tab: CalculosGroupedListFilterTab; disabled: boolean;
  }[] => {
    const tot = calculationsGrouped?.totais;
    return [
      { label: t("calculosPage.filters.all",       { count: tot?.todos      ?? 0 }), tab: "all",                             disabled: false },
      { label: t("calculosPage.filters.open",      { count: tot?.em_aberto  ?? 0 }), tab: "em_aberto",                       disabled: false },
      { label: t("calculosPage.filters.completed", { count: tot?.concluidos  ?? 0 }), tab: CalculationStatusEnum.Completed,   disabled: false },
      { label: t("calculosPage.filters.canceled",  { count: tot?.cancelados  ?? 0 }), tab: CalculationStatusEnum.Canceled,    disabled: false },
    ];
  }, [t, calculationsGrouped?.totais]);

  const filtersDateOptions = useMemo(() => [
    { label: t("calculosPage.filtersDate.last7Days"),   value: "last_7_days"   },
    { label: t("calculosPage.filtersDate.last30Days"),  value: "last_30_days"  },
    { label: t("calculosPage.filtersDate.last6Months"), value: "last_6_months" },
    { label: t("calculosPage.filtersDate.last12Months"),value: "last_12_months"},
    { label: t("calculosPage.filtersDate.all"),         value: "all"           },
  ], [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getPage(1, {
      search: filterText,
      created_at_after: dateRange.created_at_after,
      created_at_before: dateRange.created_at_before,
      status_group: statusGroupFromListFilterTab(listFilterTab),
    });
  }, [getPage, filterText, dateRange, listFilterTab]);

  useLayoutEffect(() => {
    if (fetchingList || !paginationTriggerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          getPage(page + 1, {
            search: filterText,
            created_at_after: dateRange.created_at_after,
            created_at_before: dateRange.created_at_before,
            status_group: statusGroupFromListFilterTab(listFilterTab),
          });
        }
      },
      { threshold: 1 }
    );
    observer.observe(paginationTriggerRef.current);
    return () => { observer.disconnect(); };
  }, [page, totalPages, fetchingList, getPage, filterText, dateRange, listFilterTab]);

  const handleDateChange = (value: string) => {
    setFilterDate(value);
    const today = new Date();
    const days = { last_7_days: 7, last_30_days: 30, last_6_months: 180, last_12_months: 365 };
    const d = days[value as keyof typeof days];
    if (d) {
      setDateRange({
        created_at_after:  new Date(today.getTime() - d * 86400000).toISOString().split("T")[0],
        created_at_before: today.toISOString().split("T")[0],
      });
    } else {
      setDateRange({});
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100svh-60px)] flex flex-col" style={{ zIndex: 1 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <section className="w-full px-6 md:px-10 pt-10 pb-8">
        <CalculosHeader summary={summary} fetchingSummary={fetchingSummary} />
      </section>

      {/* ── Table section ──────────────────────────────────── */}
      <div className="flex-1 px-6 md:px-10 pb-10">
        {/* Toolbar */}
        <div className="flex gap-3 pb-5 flex-wrap items-center justify-between">
          <h2 className="text-white font-semibold text-base leading-none">
            {t("calculosPage.myCalculations")}
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
              {filtersStatusOptions.map((option) => (
                <FilterStatusButton
                  key={option.label}
                  tab={option.tab}
                  active={listFilterTab === option.tab}
                  onChange={option.disabled ? undefined : (tab) => setListFilterTab(tab)}
                  label={option.label}
                />
              ))}
            </ButtonGroup>
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <i className="material-symbols-outlined material-symbols-outlined-sized text-purple-400 leading-none">
                  calendar_month
                </i>
                {filtersDateOptions.find((o) => o.value === filterDate)?.label}
                <i className="material-symbols-outlined material-symbols-outlined-sized leading-none">expand_more</i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("calculosPage.filtersDate.label")}</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={filterDate} onValueChange={handleDateChange}>
                  {filtersDateOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value} className="cursor-pointer">
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <CalculosTable data={calculationsGrouped} />
          {fetchingList && (
            <div className="grid grid-cols-6 gap-2 py-2">
              {Array(pageSize).fill(null).map((_, i) => (
                <CalculosTableLineSkeleton key={`mock_${i}`} />
              ))}
            </div>
          )}
          <div className="h-4" ref={paginationTriggerRef} />
        </div>

        {itsEmptyState && <CalculossListEmptyState />}
      </div>

    </div>
  );
};

/* ── Filter button ─────────────────────────────────────────────────── */
const FilterStatusButton = ({
  tab, active, label, onChange,
}: {
  tab: CalculosGroupedListFilterTab;
  onChange?: (tab: CalculosGroupedListFilterTab) => void;
  active: boolean;
  label: string;
}) => (
  <Button
    className="cursor-pointer"
    disabled={!onChange}
    variant={active && onChange ? "outline-tertiary-alt" : "outline"}
    onClick={onChange ? () => onChange(tab) : undefined}
  >
    {label}
  </Button>
);

/* ── Empty state ───────────────────────────────────────────────────── */
const CalculossListEmptyState = () => {
  const t = useTranslations();
  return (
    <div className="w-full min-h-[280px] flex flex-col items-center justify-center gap-3 px-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
        style={{
          background: "rgba(139,92,246,0.12)",
          border:     "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <span className="material-symbols-outlined text-purple-400">calculate</span>
      </div>
      <p className="font-semibold text-white text-base">{t("calculosPage.emptyState.title")}</p>
      <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
        {t("calculosPage.emptyState.description")}
      </p>
      <NewApenadoDialog
        trigger={
          <button
            className="flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#ECD1A6", color: "#1C2A39" }}
          >
            {t("calculosPage.buttons.registerFirst")}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        }
      />
    </div>
  );
};
