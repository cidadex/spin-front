"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity } from "@/components/ui/activity";
import { Button } from "@/components/ui/button";
import {
  CalculadoraCalculateResponseBase,
  CalculadoraCalculationsGroupedListItem,
  CalculadoraCalculationsGroupedListResponse,
  CalculadoraCalculationsListItem,
  CalculadoraRelatorioDoCalculo,
} from "@/types/calculadora";
import { CalculosTableLineResultadoLabel } from "./CalculosTableLineResultadoLabel";
import { CalculosTableLineStatusLabel } from "./CalculosTableLineStatusLabel";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { CalculationResultEnum, CalculationStatusEnum } from "@/types/enums";
import { CalculatorIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import {
  RelatorioCalculo,
  RelatorioCalculoSkeleton,
} from "../relatorio-calculo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { showCalculoCancelSuccessToast } from "@/lib/toast/showCalculoCancelSuccessToast";
import { CalculosTablePeticaoModal } from "./PeticaoDialog";

function questionarioDinamicoPathFromCalculateResult(
  result: CalculadoraCalculateResponseBase
): string {
  const first = result.variaveis_pendentes?.[0];
  const base = "/calculo/novo/questionario-dinamico";
  if (!first) {
    return base;
  }
  const queryParams = new URLSearchParams();
  const refRaw = first.ref_id;
  const refId =
    refRaw === undefined || refRaw === null
      ? ""
      : Array.isArray(refRaw)
        ? (refRaw[0] ?? "")
        : refRaw;
  queryParams.set("ref_id", refId);
  queryParams.set("escopo", first.escopo);
  queryParams.set("identificador", first.identificador);
  return `${base}?${queryParams.toString()}`;
}

async function navigateToCalculoFromCalculationUuid(
  push: (href: string) => void,
  uuid: string
): Promise<void> {
  const calculadoraService = CalculadoraService.getInstance();
  calculadoraService.clearTempCalculationData();
  const response = await calculadoraService.getCalculation(uuid);
  const apenado_id = response.data.apenado.uuid;
  const decreto_id =
    response.data.decreto ??
    response.data.apenado.calculations?.find(
      (c: { decreto?: string | null }) => c.decreto
    )?.decreto;
  if (!decreto_id) {
    throw new Error("Decreto ID is missing in calculation data");
  }
  if (!apenado_id) {
    throw new Error("Apenado ID is missing in calculation data");
  }

  const calculateResult = await calculadoraService.calculate({
    apenado_id,
    decreto_id,
    metadata: response.data.metadata || {},
  });

  calculadoraService.updateTempCalculationMetadata(
    response.data.metadata || {}
  );

  await calculadoraService.updateTempApenado(response.data.apenado);

  push(questionarioDinamicoPathFromCalculateResult(calculateResult));
}

export const CalculosTableLineSkeleton = () => {
  return <Skeleton className="col-span-6 h-13 rounded-sm" />;
};
export const CalculosTableLine = ({
  calculation: initialCalculation,
}: {
  calculation: CalculadoraCalculationsGroupedListItem;
}) => {
  const t = useTranslations();
  const fetchOtherCalculationsSignal = useRef<AbortController | null>(null);
  const [fetchingOtherCalculations, setFetchingOtherCalculations] =
    useState(false);
  const [expanded, setExpanded] = useState(false);
  const [otherCalculations, setOtherCalculations] = useState<
    CalculadoraCalculationsListItem[]
  >([]);
  const [calculation, setCalculation] = useState(initialCalculation);

  const date = useMemo(() => {
    const createdAt = new Date(calculation.latest_calculation_created_at);

    return createdAt.toLocaleDateString("pt-BR");
  }, [calculation.latest_calculation_created_at]);

  const dateTime = useMemo(() => {
    const createdAt = new Date(calculation.latest_calculation_created_at);

    return createdAt.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [calculation.latest_calculation_created_at]);

  useEffect(() => {
    if (fetchOtherCalculationsSignal.current) {
      fetchOtherCalculationsSignal.current.abort();
    }

    if (!expanded) {
      return;
    }

    const controller = new AbortController();
    fetchOtherCalculationsSignal.current = controller;

    const calculadoraService = CalculadoraService.getInstance();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetchingOtherCalculations(true);
    calculadoraService
      .listCalculations(
        {
          cpf: calculation.cpf,
          page_size: calculation.total_calculations,
        },
        controller.signal
      )
      .then((response) => {
        setOtherCalculations(
          response.results.filter(
            (calc) => calc.uuid !== calculation.latest_calculation_uuid
          )
        );
        setFetchingOtherCalculations(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Fetch de outras cálculações abortado");
        } else {
          console.error("Erro ao buscar outras cálculações", error);
        }
        setFetchingOtherCalculations(false);
      });
  }, [
    expanded,
    calculation.cpf,
    calculation.total_calculations,
    calculation.latest_calculation_uuid,
  ]);

  return (
    <div
      style={{
        gridRowEnd: `span ${calculation.total_calculations}`,
      }}
      className="col-span-6 grid-cols-subgrid grid-rows-subgrid relative overflow-hidden grid group border border-white/8 bg-white/4 hover:bg-white/8 mt-2 rounded-sm shadow-none transition-all duration-300 hover:shadow-xl hover:border-purple-500/50"
    >
      <div className="w-full h-full">
        <div className="relative overflow-hidden h-full w-full py-2 rounded-l-lg text-center text-muted-foreground">
          <span className="flex flex-col gap-1 justify-center border-r h-full text-sm leading-none">
            {date}
            <Activity
              mode={
                calculation.total_calculations > 1 && expanded
                  ? "visible"
                  : "hidden"
              }
            >
              <small className="text-xs text-muted-foreground/60">{dateTime}</small>
            </Activity>
          </span>
        </div>
      </div>
      <div className="w-full h-full">
        <div className="h-full w-full py-2 text-left text-foreground pl-4">
          <span className="flex gap-2 justify-between items-center border-r h-full text-[15px] font-medium leading-none pr-2">
            {calculation.nome}
            <Activity
              mode={calculation.total_calculations > 1 ? "visible" : "hidden"}
            >
              <Button
                size="icon"
                variant="outline"
                className="cursor-pointer w-6 h-6"
                onClick={() => setExpanded((prev) => !prev)}
              >
                <i className="material-symbols-outlined material-symbols-outlined-sized">
                  {expanded ? "expand_less" : "expand_more"}
                </i>
              </Button>
            </Activity>
          </span>
        </div>
      </div>
      <div className="w-full h-full">
        <div className="h-full w-full py-2 text-center text-foreground pl-4">
          <span className="flex flex-col justify-center border-r h-full text-sm font-semibold leading-none pr-4">
            -
          </span>
        </div>
      </div>
      <div className="w-full h-full">
        <div className="h-full w-full flex items-center justify-center text-center text-muted-foreground pl-4">
          <CalculosTableLineStatusLabel resultado={calculation.latest_status} />
        </div>
      </div>
      <div className="w-full h-ful">
        <div className="h-full w-full py-2 text-center text-muted-foreground pl-4">
          <span className="flex flex-col justify-center items-center pr-4 border-r h-full text-sm leading-none">
            <CalculosTableLineResultadoLabel
              resultado={
                calculation.latest_status === CalculationStatusEnum.Open ||
                calculation.latest_status === CalculationStatusEnum.InProgress
                  ? null
                  : calculation.latest_resultado
              }
            />
          </span>
        </div>
      </div>
      <CalculosTableLineActions
        uuid={calculation.latest_calculation_uuid}
        status={calculation.latest_status}
        resultado={calculation.latest_resultado}
        onChangeStatus={(status) =>
          setCalculation({ ...calculation, latest_status: status })
        }
      />
      <Activity
        mode={
          calculation.total_calculations > 1 && fetchingOtherCalculations
            ? "visible"
            : "hidden"
        }
      >
        <>
          {Array.from({ length: calculation.total_calculations - 1 }).map(
            (_, index) => (
              <div className="col-span-6 border-t" key={index}>
                <div className="w-full h-full">
                  <div className="relative overflow-hidden h-full w-full py-2 rounded-l-lg text-center text-muted-foreground">
                    <span className="flex flex-col gap-1 justify-center border-r h-full text-sm leading-none py-2">
                      {t("calculosPage.table.loadingOtherCalculations")}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </>
      </Activity>
      <Activity
        mode={expanded && !fetchingOtherCalculations ? "visible" : "hidden"}
      >
        {otherCalculations.map((calculation) => (
          <CalculosTableLineOtherCalculation
            key={calculation.uuid}
            calculation={calculation}
          />
        ))}
      </Activity>
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute left-0 top-0 h-full w-1 bg-purple-400 rounded-l-sm"></div>
    </div>
  );
};

export const CalculosTableLineOtherCalculation = ({
  calculation: initialCalculation,
}: {
  calculation: CalculadoraCalculationsListItem;
}) => {
  const [calculation, setCalculation] = useState(initialCalculation);
  const date = useMemo(() => {
    const createdAt = new Date(calculation.created_at);

    return createdAt.toLocaleDateString("pt-BR");
  }, [calculation.created_at]);

  const dateTime = useMemo(() => {
    const createdAt = new Date(calculation.created_at);

    return createdAt.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [calculation.created_at]);

  return (
    <div className="col-span-6 grid-cols-subgrid grid-rows-subgrid grid border-t border-white/5">
      <div className="w-full h-full">
        <div className="relative overflow-hidden h-full w-full py-2 rounded-l-lg text-center text-muted-foreground">
          <span className="flex flex-col gap-1 justify-center border-r h-full text-sm leading-none">
            {date}
            <small className="text-xs text-muted-foreground/60">{dateTime}</small>
          </span>
        </div>
      </div>
      <div className="w-full h-full">
        <div className="h-full w-full py-2 text-left text-foreground pl-4">
          <span className="flex flex-col justify-center border-r h-full text-[15px] font-medium leading-none">
            {calculation.apenado_nome}
          </span>
        </div>
      </div>
      <div className="w-full h-full">
        <div className="h-full w-full py-2 text-center text-foreground pl-4">
          <span className="flex flex-col justify-center border-r h-full text-sm font-semibold leading-none pr-4">
            -
          </span>
        </div>
      </div>
      <div className="w-full h-full">
        <div className="h-full w-full flex items-center justify-center text-center text-muted-foreground pl-4">
          <CalculosTableLineStatusLabel resultado={calculation.status} />
        </div>
      </div>
      <div className="w-full h-ful">
        <div className="h-full w-full py-2 text-center text-muted-foreground pl-4">
          <span className="flex flex-col justify-center items-center pr-4 border-r h-full text-sm leading-none">
            <CalculosTableLineResultadoLabel
              resultado={calculation.resultado}
            />
          </span>
        </div>
      </div>
      <CalculosTableLineActions
        uuid={calculation.uuid}
        status={calculation.status}
        resultado={calculation.resultado}
        onChangeStatus={(status) => setCalculation({ ...calculation, status })}
      />
    </div>
  );
};

export const CalculosTableLineActions = ({
  status,
  resultado,
  uuid,
  onChangeStatus,
}: {
  uuid: string;
  status: CalculationStatusEnum;
  resultado: CalculationResultEnum | null;
  onChangeStatus: (status: CalculationStatusEnum) => void;
}) => {
  const t = useTranslations();
  const { push } = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [performNewDialogOpen, setPerformNewDialogOpen] = useState(false);
  const showRetomarCalculoButton =
    status === CalculationStatusEnum.Open ||
    status === CalculationStatusEnum.InProgress;

  const showVerPeticaoButton =
    !showRetomarCalculoButton &&
    status === CalculationStatusEnum.Completed &&
    (resultado === CalculationResultEnum.Commutable ||
      resultado === CalculationResultEnum.Pardonable);
  const showVerRelatorioButton = !showRetomarCalculoButton;

  const [retomarCalculoLoading, setRetomarCalculoLoading] = useState(false);

  return (
    <div className="w-full h-ful">
      <div className="h-full w-full text-muted-foreground flex items-center py-2 px-4 gap-2">
        <div className="flex flex-1 items-center justify-center gap-2">
          <Activity mode={showVerPeticaoButton ? "visible" : "hidden"}>
            <CalculosTablePeticaoModal
              uuid={uuid}
              trigger={
                <Button size="sm" variant="outline" className="cursor-pointer">
                  <i className="material-symbols-outlined material-symbols-outlined-sized text-blue-500 leading-none">
                    docs
                  </i>
                  {t("calculosPage.table.actions.viewPetition")}
                </Button>
              }
            />
          </Activity>
          <Activity mode={showVerRelatorioButton ? "visible" : "hidden"}>
            <CalculosTableRelatorioModal
              calculationUuid={uuid}
              trigger={
                <Button size="sm" variant="outline" className="cursor-pointer">
                  <i className="material-symbols-outlined material-symbols-outlined-sized text-purple-500 leading-none">
                    calculate
                  </i>
                  {t("calculosPage.table.actions.viewReport")}
                </Button>
              }
            />
          </Activity>
          <Activity mode={showRetomarCalculoButton ? "visible" : "hidden"}>
            <Button
              size="sm"
              className="cursor-pointer bg-purple-900 hover:bg-purple-800"
              disabled={retomarCalculoLoading}
              onClick={async () => {
                setRetomarCalculoLoading(true);
                try {
                  await navigateToCalculoFromCalculationUuid(push, uuid);
                } catch (error) {
                  console.error("Erro ao retomar cálculo", error);
                  toast.error(
                    t("calculosPage.table.actions.resumeCalculationError")
                  );
                } finally {
                  setRetomarCalculoLoading(false);
                }
              }}
            >
              <Activity mode={retomarCalculoLoading ? "visible" : "hidden"}>
                <i className="material-symbols-outlined material-symbols-outlined-sized animate-spin leading-none">
                  autorenew
                </i>
              </Activity>
              {t("calculosPage.table.actions.resumeCalculation")}
              <CalculatorIcon />
            </Button>
          </Activity>
        </div>
        <div className="flex shrink-0 items-center justify-center">
          {status === CalculationStatusEnum.Canceled ? (
            <span className="size-9 shrink-0" aria-hidden />
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <i className="material-symbols-outlined material-symbols-outlined-sized">
                      more_vert
                    </i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => {
                        setPerformNewDialogOpen(true);
                      }}
                    >
                      <i className="material-symbols-outlined material-symbols-outlined-size leading-none">
                        person_add
                      </i>
                      {t("calculosPage.table.actions.performNewCalculation")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      className="cursor-pointer"
                      onSelect={() => {
                        setCancelDialogOpen(true);
                      }}
                    >
                      <i className="material-symbols-outlined material-symbols-outlined-size leading-none">
                        delete
                      </i>
                      {t("calculosPage.table.actions.cancelCalculation")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <PerformNewCalculoDialog
                calculationUuid={uuid}
                open={performNewDialogOpen}
                onOpenChange={setPerformNewDialogOpen}
              />
              <CancelCalculoDialog
                calculationUuid={uuid}
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                key={`line-${uuid}`}
                onCancel={() => {
                  onChangeStatus(CalculationStatusEnum.Canceled);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const CalculosTable = ({
  data,
}: {
  data: CalculadoraCalculationsGroupedListResponse | null;
}) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col py-2">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_1fr]">
        <div className="grid grid-cols-subgrid col-span-6 bg-[#4C4E70B0]/69 py-1 rounded-t-sm">
          <span className=" text-center py-2 text-gray-300 rounded-tl-lg uppercase text-xs font-medium px-4 border-r">
            {t("calculosPage.table.headers.calculationDate")}
          </span>
          <span className="text-center py-2 text-gray-300 uppercase text-xs font-medium px-4 border-r">
            {t("calculosPage.table.headers.inmate")}
          </span>
          <span className="text-center py-2 text-gray-300 uppercase text-xs font-medium px-4 border-r">
            {t("calculosPage.table.headers.process")}
          </span>
          <span className="text-center py-2 text-gray-300 uppercase text-xs font-medium px-4 border-r">
            {t("calculosPage.table.headers.status")}
          </span>
          <span className="text-center py-2 text-gray-300 uppercase text-xs font-medium px-4 border-r">
            {t("calculosPage.table.headers.result")}
          </span>
          <span className="text-center py-2 text-gray-300 rounded-tr-lg uppercase text-xs font-medium px-4">
            {t("calculosPage.table.headers.actions")}
          </span>
        </div>
        {data &&
          data.results.map((calculation) => (
            <CalculosTableLine
              key={calculation.latest_calculation_uuid}
              calculation={calculation}
            />
          ))}
      </div>
    </div>
  );
};

export const CalculosTableRelatorioModal = ({
  trigger,
  calculationUuid,
}: {
  trigger: React.ReactNode;
  calculationUuid: string;
}) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [relatorio, setRelatorio] =
    useState<CalculadoraRelatorioDoCalculo | null>(null);

  const [fetchingRelatorio, setFetchingRelatorio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatorioUnavailable, setRelatorioUnavailable] = useState(false);
  const fetchRelatorioSignal = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchRelatorioSignal.current?.abort();
    if (!isOpen) {
      return;
    }

    fetchRelatorioSignal.current = new AbortController();
    const signal = fetchRelatorioSignal.current.signal;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetchingRelatorio(true);

    setError(null);

    setRelatorioUnavailable(false);

    setRelatorio(null);
    const calculadoraService = CalculadoraService.getInstance();

    calculadoraService
      .getCalculation(calculationUuid, signal)
      .then((response) => {
        const nextRelatorio = response.data.relatorio;
        if (!nextRelatorio) {
          setRelatorioUnavailable(true);
          setRelatorio(null);
        } else {
          setRelatorio(nextRelatorio);
        }
        setFetchingRelatorio(false);
      })
      .catch((err: unknown) => {
        if (
          signal.aborted ||
          (err instanceof DOMException && err.name === "AbortError")
        ) {
          return;
        }
        setError(t("calculosPage.table.reportModal.error"));
        setFetchingRelatorio(false);
      });
  }, [isOpen, calculationUuid, t]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-4xl! overflow-hidden px-0 pt-0">
        <DialogTitle className="border-b border-white/10 pt-6 pb-4 px-6 bg-[#152030] flex items-center gap-2">
          <span className="material-symbols-outlined material-symbols-outlined-sized text-[#ECD1A6]">
            calculate
          </span>
          {t("calculosPage.table.reportModal.title")}
        </DialogTitle>
        <div className="overflow-hidden h-[70vh]">
          <ScrollArea className="h-full ">
            <div className="px-6 py-2 text-xs">
              <Activity mode={fetchingRelatorio ? "visible" : "hidden"}>
                <RelatorioCalculoSkeleton />
              </Activity>
              <Activity mode={error ? "visible" : "hidden"}>
                <Alert variant="destructive">
                  <AlertTitle>
                    {t("calculosPage.table.reportModal.errorTitle")}
                  </AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </Activity>
              <Activity
                mode={
                  !fetchingRelatorio && !error && relatorioUnavailable
                    ? "visible"
                    : "hidden"
                }
              >
                <Alert
                  variant="default"
                  className="border-muted-foreground/25 flex flex-row gap-3 items-start"
                >
                  <span
                    aria-hidden
                    className="material-symbols-outlined material-symbols-outlined-sized shrink-0 text-muted-foreground leading-none pt-0.5"
                  >
                    info
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <AlertTitle className="col-start-auto">
                      {t("calculosPage.table.reportModal.unavailableTitle")}
                    </AlertTitle>
                    <AlertDescription className="col-start-auto">
                      {t(
                        "calculosPage.table.reportModal.unavailableDescription"
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              </Activity>
              <Activity
                mode={
                  !fetchingRelatorio &&
                  !error &&
                  !relatorioUnavailable &&
                  relatorio
                    ? "visible"
                    : "hidden"
                }
              >
                <RelatorioCalculo relatorio={relatorio!} />
              </Activity>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const PerformNewCalculoDialog = ({
  calculationUuid,
  open,
  onOpenChange,
}: {
  calculationUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const t = useTranslations(
    "calculosPage.table.actions.performNewCalculationModal"
  );
  const tTable = useTranslations();
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center sm:text-center gap-0">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <i className="material-symbols-outlined text-2xl text-[#ECD1A6]">
              priority_high
            </i>
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm font-medium text-muted-foreground">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 flex flex-row gap-2 sm:justify-center">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer flex-1 sm:flex-initial"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            className="cursor-pointer flex-1 sm:flex-initial inline-flex items-center gap-2"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              void navigateToCalculoFromCalculationUuid(push, calculationUuid)
                .then(() => {
                  onOpenChange(false);
                })
                .catch((error) => {
                  console.error("Erro ao iniciar novo cálculo", error);
                  toast.error(
                    tTable("calculosPage.table.actions.resumeCalculationError")
                  );
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            {loading ? (
              <i className="material-symbols-outlined material-symbols-outlined-sized animate-spin leading-none">
                progress_activity
              </i>
            ) : null}
            <span>{t("confirm")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CancelCalculoDialog = ({
  calculationUuid,
  open,
  onOpenChange,
  onCancel,
}: {
  calculationUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}) => {
  const t = useTranslations("calculo.novoCalculo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="hidden">
          {t("cancelCalculoDialog.title")}
        </DialogTitle>
        <div className="flex flex-col py-4 gap-2 items-center">
          <div className="text-3xl">
            <i className="material-symbols-outlined material-symbols-outlined-sized text-gray-500">
              error
            </i>
          </div>
          <div className="flex flex-col">
            <strong className="text-center font-bold text-gray-500">
              {t("cancelCalculoDialog.title")}
            </strong>
            <p className="text-gray-500 text-sm text-center font-medium ">
              {t("cancelCalculoDialog.description")}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            className=" cursor-pointer"
          >
            {t("cancelCalculoDialog.goBackToCalculo")}
          </Button>
          <Button
            onClick={() => {
              const calculadoraService = CalculadoraService.getInstance();

              void calculadoraService
                .cancelCalculation(calculationUuid)
                .then((response) => {
                  if (response.success) {
                    onOpenChange(false);
                    showCalculoCancelSuccessToast(
                      response.message?.trim() ||
                        t("cancelCalculoDialog.successToastFallback"),
                      { dismissLabel: t("cancelCalculoDialog.closeToast") }
                    );
                    onCancel();
                  } else {
                    toast.error(t("cancelCalculoDialog.cancelRequestError"));
                  }
                })
                .catch(() => {
                  toast.error(t("cancelCalculoDialog.cancelRequestError"));
                });
            }}
            variant="destructive"
            className="cursor-pointer"
          >
            {t("cancelCalculoDialog.yesCancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
