"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useTranslations } from "next-intl";
import { SpinCardTitle } from "../components/spin-card-title/SpinCardTitle";
import { PageMainContentWrapper } from "../components/page-main-content-wrapper/PageMainContentWrapper";
import { PageTitle } from "../components/page-title/PageTitle";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { SmallCard } from "@/components/ui/small-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ApenadoCrimesModal } from "./components/ApenadoCrimesModal";
import { NewApenadoDialog } from "../components/new-apenado-dialog/NewApenadoDialog";
import { toast } from "sonner";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      {<ApenadosPage />}
    </ProtectedRoute>
  );
}

const ApenadosHeader = ({
  metadata,
  fetching,
}: {
  metadata?: ApenadosListMetadataResponse;
  fetching: boolean;
}) => {
  const t = useTranslations();
  const itsEmptyState = (metadata?.data.total_apenados ?? 0) === 0;

  //TODO: update stats with real data from metadata when available, currently using metadata only to get total count of apenados, but other stats are not being calculated in backend yet
  return (
    <div className="relative pb-9">
      <div className="w-full flex flex-wrap gap-4  px-8">
        <Card className="flex-1 pt-0 max-w-full">
          <SpinCardTitle title={t("apenadosPage.subtitle")} centered />
          <CardContent className="pb-4">
            <div className="w-full flex items-center justify-between gap-4">
              <SmallCard
                icon={
                  fetching ? (
                    <span className="material-symbols-outlined text-gray-500 animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-gray-500">
                      people
                    </span>
                  )
                }
                value={t("common.apenadosCount", {
                  count: metadata?.data.total_apenados ?? 0,
                })}
                subtitle={t("apenadosPage.stats.total")}
              />
              <SmallCard
                icon={
                  fetching ? (
                    <span className="material-symbols-outlined text-gray-500 animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-yellow-500">
                      person_remove
                    </span>
                  )
                }
                value={t("apenadosPage.stats.pendingCount", { count: 0 })}
                subtitle={t("apenadosPage.stats.registrationIssues")}
              />
              <SmallCard
                icon={
                  fetching ? (
                    <span className="material-symbols-outlined text-gray-500 animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-blue-700">
                      male
                    </span>
                  )
                }
                value={t("apenadosPage.stats.menCount", { count: 0 })}
                subtitle={t("apenadosPage.stats.registeredInmates")}
              />
              <SmallCard
                icon={
                  fetching ? (
                    <span className="material-symbols-outlined text-gray-500 animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-pink-500">
                      female
                    </span>
                  )
                }
                value={t("apenadosPage.stats.womenCount", { count: 0 })}
                subtitle={t("apenadosPage.stats.registeredInmates")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <NewApenadoDialog
          trigger={
            <Button size="3xl" className="cursor-pointer">
              {itsEmptyState
                ? t("apenadosPage.buttons.registerFirst")
                : t("apenadosPage.buttons.registerNew")}
              <span className="material-symbols-outlined">add</span>
            </Button>
          }
        />
      </span>
    </div>
  );
};

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
    total: 0,
    fechado: 0,
    semiaberto: 0,
    aberto: 0,
  });

  const listFilterCountsAbortController = useRef<AbortController | null>(null);

  const itsEmptyState = useMemo(() => {
    return apenados.length === 0;
  }, [apenados]);

  const filtersRegimeOptions = useMemo(() => {
    return [
      {
        id: "all",
        label: t("apenadosPage.filters.all", {
          count: regimeFilterCounts.total,
        }),
        regime: null,
        disabled: false,
      },
      {
        id: "fechado",
        label: t("apenadosPage.filters.closed", {
          count: regimeFilterCounts.fechado,
        }),
        regime: ApenadoRegimeAtualEnum.Fechado,
        disabled: false,
      },
      {
        id: "semiaberto",
        label: t("apenadosPage.filters.semiOpen", {
          count: regimeFilterCounts.semiaberto,
        }),
        regime: ApenadoRegimeAtualEnum.Semiaberto,
        disabled: false,
      },
      {
        id: "tornozeleira",
        label: t("apenadosPage.filters.withAnkleMonitor", { count: 0 }),
        regime: null,
        disabled: true,
      },
      {
        id: "aberto",
        label: t("apenadosPage.filters.open", {
          count: regimeFilterCounts.aberto,
        }),
        regime: ApenadoRegimeAtualEnum.Aberto,
        disabled: false,
      },
      {
        id: "livramento",
        label: t("apenadosPage.filters.withConditionalRelease", {
          count: 0,
        }),
        regime: null,
        disabled: true,
      },
      {
        id: "prd",
        label: t("apenadosPage.filters.prd", {
          count: 0,
        }),
        regime: null,
        disabled: true,
      },
      {
        id: "sursis",
        label: t("apenadosPage.filters.sursis", {
          count: 0,
        }),
        regime: null,
        disabled: true,
      },
    ];
  }, [t, regimeFilterCounts]);

  useEffect(() => {
    const calculadoraService = CalculadoraService.getInstance();
    if (listAbortController.current) {
      listAbortController.current.abort();
    }
    listAbortController.current = new AbortController();
    const requestGeneration = ++listRequestGenerationRef.current;

    setFetchingList(true);
    calculadoraService
      .listApenados(
        {
          search: filterText,
          regime_atual: filterRegimeAtual ?? undefined,
          page: 1,
        },
        listAbortController.current.signal
      )
      .then((response) => {
        if (listRequestGenerationRef.current !== requestGeneration) {
          return;
        }
        setApenados(response.results);
        setListPage(1);
        setHasMoreApenados(Boolean(response.next));
        setFetchingList(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        if (listRequestGenerationRef.current !== requestGeneration) {
          return;
        }
        setFetchingList(false);
      });
  }, [filterRegimeAtual, filterText]);

  const loadMoreApenados = useCallback(async () => {
    if (!hasMoreApenados || loadingMoreApenados || fetchingList) {
      return;
    }
    const requestGeneration = listRequestGenerationRef.current;
    setLoadingMoreApenados(true);
    try {
      const calculadoraService = CalculadoraService.getInstance();
      const response = await calculadoraService.listApenados({
        search: filterText || undefined,
        regime_atual: filterRegimeAtual ?? undefined,
        page: listPage + 1,
      });
      if (listRequestGenerationRef.current !== requestGeneration) {
        return;
      }
      setApenados((prev) => {
        const seen = new Set(prev.map((a) => a.uuid));
        const appended = response.results.filter((a) => !seen.has(a.uuid));
        return [...prev, ...appended];
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
  }, [
    fetchingList,
    filterRegimeAtual,
    filterText,
    hasMoreApenados,
    listPage,
    loadingMoreApenados,
    t,
  ]);

  useEffect(() => {
    const calculadoraService = CalculadoraService.getInstance();
    if (listFilterCountsAbortController.current) {
      listFilterCountsAbortController.current.abort();
    }
    listFilterCountsAbortController.current = new AbortController();
    const signal = listFilterCountsAbortController.current.signal;
    const searchParams = {
      search: filterText || undefined,
      page_size: 1,
    };

    Promise.all([
      calculadoraService.listApenados(searchParams, signal),
      calculadoraService.listApenados(
        { ...searchParams, regime_atual: ApenadoRegimeAtualEnum.Fechado },
        signal
      ),
      calculadoraService.listApenados(
        { ...searchParams, regime_atual: ApenadoRegimeAtualEnum.Semiaberto },
        signal
      ),
      calculadoraService.listApenados(
        { ...searchParams, regime_atual: ApenadoRegimeAtualEnum.Aberto },
        signal
      ),
    ])
      .then(([all, fechado, semiaberto, aberto]) => {
        setRegimeFilterCounts({
          total: all.count,
          fechado: fechado.count,
          semiaberto: semiaberto.count,
          aberto: aberto.count,
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
      });

    return () => {
      listFilterCountsAbortController.current?.abort();
    };
  }, [filterText]);

  useEffect(() => {
    const calculadoraService = CalculadoraService.getInstance();
    if (listMetadataAbortController.current) {
      listMetadataAbortController.current.abort();
    }
    listMetadataAbortController.current = new AbortController();

    setFetchingMetadata(true);
    calculadoraService
      .listApenadosMetadata(
        {
          search: filterText,
          regime_atual: filterRegimeAtual ?? undefined,
        },
        listMetadataAbortController.current.signal
      )
      .then((response) => {
        setMetadata(response);
        setFetchingMetadata(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setFetchingMetadata(false);
      });
  }, [filterRegimeAtual, filterText]);

  return (
    <div className="min-h-screen w-full flex flex-col gap-15">
      <div className="container">
        <PageTitle title={t("apenadosPage.title")} />
        <ApenadosHeader metadata={metadata} fetching={fetchingMetadata} />
      </div>
      <PageMainContentWrapper>
        <div className="w-full max-w-full flex flex-col">
          <header className="flex gap-3 pb-6 pt-7 flex-wrap items-center">
            <h2 className="text-foreground font-semibold text-xl leading-none">
              {t("apenadosPage.titlePlural")}
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
          </header>
          {fetchingList ? (
            <div className="grid pb-4 grid-cols-[repeat(auto-fill,minmax(314px,1fr))] gap-2">
              {Array(12)
                .fill(null)
                .map((_, i) => (
                  <ApenadoCardSkeleton key={`mock_${i}`} />
                ))}
            </div>
          ) : itsEmptyState ? (
            <ApenadosListEmptyState />
          ) : (
            <>
              <div className="grid pb-4 grid-cols-[repeat(auto-fill,minmax(314px,1fr))] gap-2">
                {apenados.map((apenado) => (
                  <ApenadoCard key={apenado.uuid} apenado={apenado} />
                ))}
              </div>
              {hasMoreApenados ? (
                <div className="flex justify-center pb-8 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer min-w-[200px] inline-flex items-center justify-center gap-2"
                    disabled={loadingMoreApenados}
                    onClick={() => {
                      void loadMoreApenados();
                    }}
                  >
                    {loadingMoreApenados ? (
                      <span className="material-symbols-outlined animate-spin leading-none shrink-0">
                        progress_activity
                      </span>
                    ) : null}
                    <span>{t("apenadosPage.loadMore")}</span>
                  </Button>
                </div>
              ) : null}
            </>
          )}
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

const FilterRegimeButton = ({
  regime,
  active,
  label,
  onChange,
}: {
  regime?: ApenadoRegimeAtualEnum;
  onChange?: (regime: ApenadoRegimeAtualEnum | null) => void;
  active: boolean;
  label: string;
}) => {
  return (
    <Button
      className="cursor-pointer"
      disabled={!onChange}
      variant={active && onChange ? "outline-tertiary-alt" : "outline"}
      onClick={onChange ? () => onChange(regime ?? null) : undefined}
    >
      {label}
    </Button>
  );
};

const ApenadosListEmptyState = () => {
  const t = useTranslations();
  return (
    <main className="w-full min-h-[300px] flex flex-col items-center justify-center bg-purple-500/10 border-purple-500/40 border border-dashed rounded-md">
      <span className="material-symbols-outlined text-purple-400 mb-3">
        calculate
      </span>
      <span className="font-semibold text-foreground">
        {t("apenadosPage.emptyState.title")}
      </span>
      <span className="text-xs text-muted-foreground">
        {t("apenadosPage.emptyState.description")}
      </span>
      <NewApenadoDialog
        trigger={
          <Button size="lg" className="cursor-pointer mt-5" variant="tertiary">
            {t("apenadosPage.buttons.registerFirst")}
            <span className="material-symbols-outlined">add</span>
          </Button>
        }
      />
    </main>
  );
};

const ApenadoCard = ({ apenado }: { apenado: ApenadosListApenado }) => {
  const t = useTranslations();
  const [perfilModalOpen, setPerfilModalOpen] = useState(false);
  const numberFormatter = useMemo(
    () =>
      Intl.NumberFormat("pt-BR", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    []
  );

  const dateFormatter = useMemo(
    () =>
      Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
    []
  );

  const regimeName = useMemo(() => {
    switch (apenado.regime_atual) {
      case ApenadoRegimeAtualEnum.Fechado:
        return t("apenadosPage.card.regimes.closed");
      case ApenadoRegimeAtualEnum.Semiaberto:
        return t("apenadosPage.card.regimes.semiOpen");
      case ApenadoRegimeAtualEnum.Aberto:
        return t("apenadosPage.card.regimes.open");
      default:
        return t("apenadosPage.card.regimes.unknown");
    }
  }, [apenado.regime_atual, t]);

  const daysInHumanReadable = useCallback(
    (days: number) => {
      return yearsMonthsDaysToHumanReadable({
        date: daysToYearsMonthsDays(days),
        t,
      });
    },
    [t]
  );

  const pena_dias_faltantes = useMemo(() => {
    if (apenado.tempo_cumprido_dias === null) return apenado.pena_total_dias;
    return Math.max(apenado.pena_total_dias - apenado.tempo_cumprido_dias, 0);
  }, [apenado.pena_total_dias, apenado.tempo_cumprido_dias]);

  const pena_cumprida_percent = useMemo(() => {
    if (apenado.tempo_cumprido_dias === null) return 0;
    if (apenado.pena_total_dias === 0) return 0;
    return Math.min(apenado.tempo_cumprido_dias / apenado.pena_total_dias, 1);
  }, [apenado.tempo_cumprido_dias, apenado.pena_total_dias]);

  const lastCalculation = useMemo(() => {
    if (apenado.calculations.length === 0) return null;
    const sortedCalculations = [...apenado.calculations].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    return sortedCalculations[0];
  }, [apenado.calculations]);

  return (
    <Card className="pt-0 pb-0 hover:shadow-2xl group shadow-none border border-transparent hover:border-purple-500 transition-[shadow,border,border-color] duration-500 gap-0">
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
          <span className="text-muted-foreground font-semibold group-hover:text-foreground transition-colors duration-500">
            {apenado.nome}
          </span>
        }
        icon={
          <span className="material-symbols-outlined leading-none! text-xl">
            person
          </span>
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
            <span className="material-symbols-outlined text-[#ECD1A6]">
              calculate
            </span>
            <span className="text-sm font-semibold">{regimeName}</span>
            <span className="text-xs text-muted-foreground">
              {t("apenadosPage.card.regimeCumprimento")}
            </span>
          </span>
          <Separator orientation="vertical" />
          <span className="flex-1 flex flex-col items-center px-4">
            <span className="material-symbols-outlined text-[#ECD1A6]">
              calculate
            </span>
            <span className="text-sm font-semibold">
              {t("apenadosPage.card.reincidente")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("apenadosPage.card.totais")}
            </span>
          </span>
        </div>
        <Separator />
        <div className="flex gap-2 py-2 justify-between items-center w-full text-xs">
          <span>{t("apenadosPage.card.penaTotal")}:</span>
          <strong className="font-semibold">
            {daysInHumanReadable(apenado.pena_total_dias)}
          </strong>
        </div>
        <Separator />
        <div className="flex gap-2 py-2 justify-between items-center w-full text-xs">
          <span>{t("apenadosPage.card.cumprimentoAtual")}:</span>
          <strong className="font-semibold">
            {daysInHumanReadable(apenado.tempo_cumprido_dias ?? 0)}
          </strong>
        </div>
        <div className="w-full max-w-sm">
          <Label className="mb-1 text-muted-foreground font-medium">
            <span className="ml-auto">
              {numberFormatter.format(pena_cumprida_percent)}
            </span>
          </Label>
          <Progress value={pena_cumprida_percent * 100} />
        </div>
        <div className="flex gap-2 py-2 justify-between items-center w-full text-xs">
          <span>
            {t("apenadosPage.card.startDate", { date: "15/01/2018" })}:
          </span>
          <span>
            {t("apenadosPage.card.timeRemaining", {
              remaining: daysInHumanReadable(pena_dias_faltantes),
            })}
          </span>
        </div>
        <Separator />
        <ApenadoCrimesModal
          apenado={apenado}
          open={perfilModalOpen}
          onOpenChange={setPerfilModalOpen}
        />
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
            <ApenadoCardLastCalculationResultBadge
              resultado={lastCalculation.resultado}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

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
