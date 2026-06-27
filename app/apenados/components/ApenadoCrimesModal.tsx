import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ApenadosRepository } from "@/repositories/calculadora/ApenadosRepository";
import { CalculadoraRepository } from "@/repositories/calculadora/CalculadoraRepository";
import {
  ApenadoDetalhe,
  ApenadosListApenado,
  CalculadoraGetCalculationResponseBase,
} from "@/types/calculadora";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity } from "@/components/ui/activity";
import { CrimesTab } from "./CrimesTab";
import { MarcosTemporaisTab } from "./MarcosTemporaisTab";
import { toast } from "sonner";

type ApenadoCrimesModalProps = {
  apenado: ApenadosListApenado;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ApenadoCrimesModal = ({
  apenado,
  open: openProp,
  onOpenChange,
}: ApenadoCrimesModalProps) => {
  const t = useTranslations();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setDialogOpen = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (openProp === undefined) {
        setInternalOpen(next);
      }
    },
    [onOpenChange, openProp]
  );

  const [tab, setTab] = useState<"crimes" | "marcos_temporais">("crimes");
  const [detalhe, setDetalhe] = useState<ApenadoDetalhe | null>(null);
  const [fetchingDetalhe, setFetchingDetalhe] = useState(false);
  const [syncingDetalhe, setSyncingDetalhe] = useState(false);
  const [calculation, setCalculation] =
    useState<CalculadoraGetCalculationResponseBase | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const fetchApenadoDetails = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      try {
        abortController.current?.abort();
        abortController.current = new AbortController();
        if (mode === "initial") {
          setFetchingDetalhe(true);
        }
        const apenadosRepository = new ApenadosRepository();
        const response = await apenadosRepository.getByUuid(
          apenado.uuid,
          abortController.current.signal
        );
        setDetalhe(response.data);
        const calculadoraRepository = new CalculadoraRepository();

        const calculationUuid = response.data.calculations[0]?.uuid;

        if (calculationUuid) {
          const calculationResponse =
            await calculadoraRepository.getCalculation(
              calculationUuid,
              abortController.current.signal
            );
          setCalculation(calculationResponse.data);
        } else {
          setCalculation(null);
        }

        setFetchingDetalhe(false);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          setFetchingDetalhe(false);
        } else {
          setCalculation(null);
          setDetalhe(null);
          setFetchingDetalhe(false);
          toast.error(t("apenadosPage.crimesModal.erroAoCarregarDetalhes"));
          if (mode === "initial") {
            setDialogOpen(false);
          }
        }
      }
    },
    [apenado.uuid, setDialogOpen, t]
  );

  useEffect(() => {
    if (open) {
      void fetchApenadoDetails("initial");
    }

    return () => {
      abortController.current?.abort();
    };
  }, [apenado.uuid, fetchApenadoDetails, open]);

  const handleSyncDetalhe = useCallback(async () => {
    setSyncingDetalhe(true);
    try {
      await fetchApenadoDetails("refresh");
    } finally {
      setSyncingDetalhe(false);
    }
  }, [fetchApenadoDetails]);

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <Button
        type="button"
        variant="outline-tertiary"
        className="mt-2 cursor-pointer w-full"
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex items-center justify-center gap-2 w-full">
          <span className="material-symbols-outlined text-[#ECD1A6]">
            calculate
          </span>
          <span className="font-semibold">
            {t("apenadosPage.card.verDetalhesCrimes", {
              count: apenado.total_crimes,
            })}
          </span>
        </div>
        <ChevronDown />
      </Button>
      <DialogContent className="w-full max-w-4xl! h-[90vh] overflow-hidden grid-rows-[auto_1fr] gap-0 p-0">
        <DialogHeader className="bg-[#152030]">
          <DialogTitle className="px-6 pt-6 border-b border-white/10 pb-4">
            <span className="flex items-center gap-2 font-bold text-lg">
              <i className="material-symbols-outlined text-[#ECD1A6]">
                person
              </i>
              {t("apenadosPage.crimesModal.title")}
            </span>
          </DialogTitle>
          <header className="flex justify-center bg-[#152030]">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setTab("crimes")}
              className={`cursor-pointer rounded-none border-b-2 ${tab === "crimes" ? "text-[#ECD1A6] border-[#ECD1A6]" : "border-transparent text-muted-foreground"}`}
            >
              {t("apenadosPage.crimesModal.tabCrimes")}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setTab("marcos_temporais")}
              className={`cursor-pointer rounded-none border-b-2 ${tab === "marcos_temporais" ? "text-[#ECD1A6] border-[#ECD1A6]" : "border-transparent text-muted-foreground"}`}
            >
              {t("apenadosPage.crimesModal.tabMarcosTemporais")}
            </Button>
          </header>
        </DialogHeader>
        <section className="overflow-hidden">
          <ScrollArea className="h-full pr-2">
            {detalhe === null || fetchingDetalhe ? (
              <div className="p-4">
                <Skeleton className="w-full h-50 mb-2" />
                <Skeleton className="w-3/4 h-4 mb-2" />
                <Skeleton className="w-1/2 h-4 mb-2" />
                <div className="grid grid-cols-2 grid-rows-auto items-stretch justify-stretch gap-2 flex-wrap py-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="rounded w-full h-20" />
                  ))}
                </div>
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-5/6 h-4 mb-2" />
                <Skeleton className="w-2/3 h-4 mb-2" />
              </div>
            ) : (
              <div>
                <Activity mode={tab === "crimes" ? "visible" : "hidden"}>
                  <CrimesTab
                    apenado={detalhe!}
                    calculation={calculation}
                    onSync={() => void handleSyncDetalhe()}
                    syncing={syncingDetalhe}
                  />
                </Activity>
                <Activity
                  mode={tab === "marcos_temporais" ? "visible" : "hidden"}
                >
                  <MarcosTemporaisTab
                    apenado={detalhe!}
                    calculation={calculation}
                  />
                </Activity>
              </div>
            )}
          </ScrollArea>
        </section>
      </DialogContent>
    </Dialog>
  );
};
