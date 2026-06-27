"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useTranslations } from "next-intl";
import { PageMainContentWrapper } from "../components/page-main-content-wrapper/PageMainContentWrapper";
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
import { Separator } from "@/components/ui/separator";
import {
  CalculadoraCalculationsGroupedListResponse,
  CalculadoraCalculationsGroupedStatusGroup,
  CalculadoraCalculationsSummaryResponseBase,
} from "@/types/calculadora";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { CalculationStatusEnum } from "@/types/enums";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
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

type CalculosGroupedListFilterTab =
  | "all"
  | "em_aberto"
  | CalculationStatusEnum.Completed
  | CalculationStatusEnum.Canceled;

function statusGroupFromListFilterTab(
  tab: CalculosGroupedListFilterTab
): CalculadoraCalculationsGroupedStatusGroup {
  if (tab === "all") {
    return "todos";
  }
  if (tab === "em_aberto") {
    return "em_aberto";
  }
  if (tab === CalculationStatusEnum.Completed) {
    return "concluidos";
  }
  return "cancelados";
}

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      {<CalculosPage />}
    </ProtectedRoute>
  );
}

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
      iconColor: "text-[#C1C1C1]",
      value: summary?.total ?? 0,
      subtitle: t("apenadosPage.stats.total"),
    },
    {
      icon: fetchingSummary ? "progress_activity" : "check_box",
      iconColor: "text-green-400",
      value: summary?.elegiveis_indulto ?? 0,
      subtitle: t("calculosPage.stats.eligibleForPardon"),
    },
    {
      icon: fetchingSummary ? "progress_activity" : "exposure",
      iconColor: "text-blue-400",
      value: summary?.elegiveis_comutacao ?? 0,
      subtitle: t("calculosPage.stats.eligibleForCommutation"),
    },
    {
      icon: fetchingSummary ? "progress_activity" : "content_paste_off",
      iconColor: "text-red-400",
      value: summary?.nao_elegiveis ?? 0,
      subtitle: t("calculosPage.stats.notEligible"),
    },
    {
      icon: fetchingSummary ? "progress_activity" : "pending_actions",
      iconColor: "text-orange-400",
      value: summary?.pendentes_conclusao ?? 0,
      subtitle: t("calculosPage.stats.pendingCompletion"),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("calculosPage.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("calculosPage.subtitle")}</p>
        </div>
        <NewApenadoDialog
          trigger={
            <Button
              size="3xl"
              className="cursor-pointer bg-[#ECD1A6] text-[#1C2A39] hover:bg-[#dfc090] font-semibold border-0"
            >
              <span className="material-symbols-outlined">add</span>
              {showRegisterFirstLabel
                ? t("calculosPage.buttons.registerFirst")
                : t("calculosPage.buttons.registerNew")}
            </Button>
          }
        />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#1c2a39] p-5 shadow-sm"
          >
            <span
              className={`material-symbols-outlined text-2xl ${stat.iconColor} ${fetchingSummary ? "animate-spin" : ""}`}
            >
              {stat.icon}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-foreground">
                {t("common.calculationsCount", { count: stat.value })}
              </span>
              <span className="text-xs text-muted-foreground">{stat.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
      .then((response) => {
        setSummary(response.data);
        setFetchingSummary(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        toast.error(t("calculosPage.statsSummaryError"));
        setFetchingSummary(false);
      });

    return () => {
      summaryAbortController.current?.abort();
    };
  }, [t]);

  const getPage = useCallback(
    (
      pageNumber: number,
      {
        cpf,
        search,
        created_at_after,
        created_at_before,
        status_group,
      }: {
        cpf?: string;
        search?: string;
        created_at_after?: string;
        created_at_before?: string;
        status_group: CalculadoraCalculationsGroupedStatusGroup;
      }
    ) => {
      const calculadoraService = CalculadoraService.getInstance();

      if (getPageAbortController.current) {
        getPageAbortController.current.abort();
      }
      getPageAbortController.current = new AbortController();
      setPage(pageNumber);
      setFetchingList(true);
      if (pageNumber === 1) {
        setCalculationsGrouped(null);
      }

      calculadoraService
        .listCalculationsGrouped(
          {
            page_size: pageSize,
            page: pageNumber,
            cpf,
            search,
            created_at_after,
            created_at_before,
            status_group,
          },
          getPageAbortController.current.signal
        )
        .then((response) => {
          setTotalPages(Math.ceil(response.count / pageSize));
          setCalculationsGrouped((currentList) => {
            return {
              ...currentList,
              ...response,
              totais: response.totais ?? currentList?.totais,
              results: [...(currentList?.results ?? []), ...response.results],
            };
          });
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            return;
          }
        })
        .finally(() => {
          setFetchingList(false);
        });
    },
    [pageSize]
  );

  const itsEmptyState = useMemo(() => {
    if (fetchingList || fetchingSummary) {
      return false;
    }
    const listEmpty = (calculationsGrouped?.results?.length ?? 0) === 0;
    if (!listEmpty) {
      return false;
    }
    if (summary === null) {
      return false;
    }
    return summary.total === 0;
  }, [
    calculationsGrouped?.results?.length,
    fetchingList,
    fetchingSummary,
    summary,
  ]);

  const filtersStatusOptions = useMemo((): {
    label: string;
    tab: CalculosGroupedListFilterTab;
    disabled: boolean;
  }[] => {
    const tot = calculationsGrouped?.totais;
    return [
      {
        label: t("calculosPage.filters.all", { count: tot?.todos ?? 0 }),
        tab: "all",
        disabled: false,
      },
      {
        label: t("calculosPage.filters.open", {
          count: tot?.em_aberto ?? 0,
        }),
        tab: "em_aberto",
        disabled: false,
      },
      {
        label: t("calculosPage.filters.completed", {
          count: tot?.concluidos ?? 0,
        }),
        tab: CalculationStatusEnum.Completed,
        disabled: false,
      },
      {
        label: t("calculosPage.filters.canceled", {
          count: tot?.cancelados ?? 0,
        }),
        tab: CalculationStatusEnum.Canceled,
        disabled: false,
      },
    ];
  }, [t, calculationsGrouped?.totais]);

  const filtersDateOptions = useMemo(() => {
    return [
      {
        label: t("calculosPage.filtersDate.last7Days"),
        value: "last_7_days",
      },
      {
        label: t("calculosPage.filtersDate.last30Days"),
        value: "last_30_days",
      },
      {
        label: t("calculosPage.filtersDate.last6Months"),
        value: "last_6_months",
      },
      {
        label: t("calculosPage.filtersDate.last12Months"),
        value: "last_12_months",
      },
      {
        label: t("calculosPage.filtersDate.all"),
        value: "all",
      },
    ];
  }, [t]);

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
    if (fetchingList) return;
    if (!paginationTriggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && page < totalPages) {
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

    return () => {
      observer.disconnect();
    };
  }, [
    page,
    totalPages,
    fetchingList,
    getPage,
    filterText,
    dateRange,
    listFilterTab,
  ]);

  return (
    <div className="min-h-screen w-full flex flex-col gap-15">
      <div className="container">
        <CalculosHeader summary={summary} fetchingSummary={fetchingSummary} />
      </div>
      <PageMainContentWrapper>
        <div className="w-7xl max-w-full flex flex-col">
          <header className="flex gap-3 pb-6 pt-7 flex-wrap items-center justify-between">
            <h2 className="text-foreground font-semibold text-xl leading-none">
              {t("calculosPage.myCalculations")}
            </h2>
            <span className="dark text-foreground">
              <InputGroup className="bg-gray-600!">
                <InputGroupInput
                  type="text"
                  value={inputFilterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder={t("apenadosPage.searchPlaceholder")}
                />
                <InputGroupAddon>
                  <span className="material-symbols-outlined text-inherit">
                    search
                  </span>
                </InputGroupAddon>
              </InputGroup>
            </span>
            <span className="dark text-foreground">
              <ButtonGroup className="bg-gray-600! rounded-md">
                {filtersStatusOptions.map((option) => (
                  <FilterStatusButton
                    key={option.label}
                    tab={option.tab}
                    active={listFilterTab === option.tab}
                    onChange={
                      option.disabled
                        ? undefined
                        : (tab) => setListFilterTab(tab)
                    }
                    label={option.label}
                  />
                ))}
              </ButtonGroup>
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                  <i className="material-symbols-outlined material-symbols-outlined-sized text-purple-500 leading-none">
                    calendar_month
                  </i>
                  {
                    filtersDateOptions.find(
                      (option) => option.value === filterDate
                    )?.label
                  }
                  <i className="material-symbols-outlined material-symbols-outlined-sized leading-none">
                    expand_more
                  </i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    {t("calculosPage.filtersDate.label")}
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={filterDate}
                    onValueChange={(value) => {
                      setFilterDate(value);

                      const today = new Date();
                      let newDateRange: {
                        created_at_after?: string;
                        created_at_before?: string;
                      } = {};

                      switch (value) {
                        case "last_7_days":
                          newDateRange = {
                            created_at_after: new Date(
                              today.getTime() - 7 * 24 * 60 * 60 * 1000
                            )
                              .toISOString()
                              .split("T")[0],
                            created_at_before: today
                              .toISOString()
                              .split("T")[0],
                          };
                          break;
                        case "last_30_days":
                          newDateRange = {
                            created_at_after: new Date(
                              today.getTime() - 30 * 24 * 60 * 60 * 1000
                            )
                              .toISOString()
                              .split("T")[0],
                            created_at_before: today
                              .toISOString()
                              .split("T")[0],
                          };
                          break;
                        case "last_6_months":
                          newDateRange = {
                            created_at_after: new Date(
                              today.getTime() - 180 * 24 * 60 * 60 * 1000
                            )
                              .toISOString()
                              .split("T")[0],
                            created_at_before: today
                              .toISOString()
                              .split("T")[0],
                          };
                          break;
                        case "last_12_months":
                          newDateRange = {
                            created_at_after: new Date(
                              today.getTime() - 365 * 24 * 60 * 60 * 1000
                            )
                              .toISOString()
                              .split("T")[0],
                            created_at_before: today
                              .toISOString()
                              .split("T")[0],
                          };
                          break;
                        case "all":
                          newDateRange = {
                            created_at_after: undefined,
                            created_at_before: undefined,
                          };
                          break;
                      }

                      setDateRange(newDateRange);
                    }}
                  >
                    {filtersDateOptions.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                        className="cursor-pointer"
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <div className="w-full overflow-x-auto overflow-y-hidden">
            <CalculosTable data={calculationsGrouped} />
            {fetchingList && (
              <div className="grid grid-cols-6 gap-2">
                {Array(pageSize)
                  .fill(null)
                  .map((_, i) => (
                    <CalculosTableLineSkeleton key={`mock_${i}`} />
                  ))}
              </div>
            )}
            <div className="h-4" ref={paginationTriggerRef}></div>
          </div>
          {itsEmptyState ? <CalculossListEmptyState /> : <></>}
        </div>
      </PageMainContentWrapper>
    </div>
  );
};

const ApenadoCardSkeleton = () => {
  return (
    <Card className="pt-0 pb-0 bg-white/30 shadow-none border border-transparent gap-0">
      <CardHeader className="px-2 pt-2">
        <Skeleton className="w-full h-10" />
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex gap-2 py-2 justify-between items-center w-full text-xs">
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-full h-5" />
        </div>
        <div className=" flex py-4">
          <span className="flex-1 flex flex-col items-center gap-1 px-4">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-1/2 h-5" />
            <Skeleton className="w-full h-3" />
          </span>
          <Separator orientation="vertical" />
          <span className="flex-1 flex flex-col items-center gap-1 px-4">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-1/2 h-5" />
            <Skeleton className="w-full h-3" />
          </span>
        </div>
        <div className="flex gap-2 py-1 justify-between items-center w-full text-xs">
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-full h-5" />
        </div>
        <div className="flex gap-2 py-1 justify-between items-center w-full text-xs">
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-full h-5" />
        </div>
        <div className="py-2">
          <Skeleton className="w-full h-12" />
        </div>
        <div className="py-2">
          <Skeleton className="w-full h-10" />
        </div>
        <div className="flex gap-2 py-1 justify-between items-center w-full text-xs pb-2">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
        </div>
      </CardContent>
    </Card>
  );
};

const FilterStatusButton = ({
  tab,
  active,
  label,
  onChange,
}: {
  tab: CalculosGroupedListFilterTab;
  onChange?: (tab: CalculosGroupedListFilterTab) => void;
  active: boolean;
  label: string;
}) => {
  return (
    <Button
      className="cursor-pointer"
      disabled={!onChange}
      variant={active && onChange ? "outline-tertiary-alt" : "outline"}
      onClick={onChange ? () => onChange(tab) : undefined}
    >
      {label}
    </Button>
  );
};

const CalculossListEmptyState = () => {
  const t = useTranslations();
  return (
    <main className="w-full min-h-[300px] flex flex-col items-center justify-center bg-purple-500/5 border-purple-500/30 border border-dashed rounded-md">
      <span className="material-symbols-outlined text-purple-500 mb-3">
        calculate
      </span>
      <span className="font-semibold">
        {t("calculosPage.emptyState.title")}
      </span>
      <span className="text-xs">
        {t("calculosPage.emptyState.description")}
      </span>
      <NewApenadoDialog
        trigger={
          <Button size="lg" className="cursor-pointer mt-5" variant="tertiary">
            {t("calculosPage.buttons.registerFirst")}
            <span className="material-symbols-outlined">arrow_right_alt</span>
          </Button>
        }
      ></NewApenadoDialog>
    </main>
  );
};
