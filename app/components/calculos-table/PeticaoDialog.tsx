import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CalculadoraRepository } from "@/repositories/calculadora/CalculadoraRepository";
import { ApiClient } from "@/services/api/ApiClient";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { PeticaoData } from "@/types/calculadora";
import { AlertCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity } from "@/components/ui/activity";
import { toast } from "sonner";
import { PeticaoDocumentPreview } from "./PeticaoDocumentPreview";

export const CalculosTablePeticaoModal = ({
  trigger,
  uuid,
}: {
  trigger: React.ReactNode;
  uuid: string;
}) => {
  const t = useTranslations();
  const tPetition = useTranslations("calculosPage.table.petitionModal");
  const abortController = useRef<AbortController | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [peticaoData, setPeticaoData] = useState<PeticaoData | null>(null);
  const [processingDownload, setProcessingDownload] = useState(false);
  const downloadAbortController = useRef<AbortController | null>(null);

  const handleDownload = useCallback(async () => {
    try {
      downloadAbortController.current?.abort();
      setProcessingDownload(true);
      const calculadoraRepository = new CalculadoraRepository();
      downloadAbortController.current = new AbortController();
      const response = await calculadoraRepository.getPeticaoDownload(
        uuid,
        downloadAbortController.current.signal
      );
      const a = document.createElement("a");
      a.href = URL.createObjectURL(response);
      a.download = "peticao.docx";
      a.click();

      URL.revokeObjectURL(a.href);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        return;
      }
      toast.error(tPetition("downloadError"));
    } finally {
      setProcessingDownload(false);
    }
  }, [tPetition, uuid]);

  useEffect(() => {
    abortController.current?.abort();
    setError(null);
    setFetching(false);
    if (!open) return;

    const fetchData = async () => {
      try {
        setFetching(true);
        const calculadoraService = CalculadoraService.getInstance();
        abortController.current = new AbortController();

        const response = await calculadoraService.getPeticaoData(
          uuid,
          abortController.current.signal
        );
        setPeticaoData(response.data);
        setFetching(false);
      } catch (err) {
        if (ApiClient.isApiClientError<{ errors: string[] }>(err)) {
          const details = await err.details;
          setError(
            !details
              ? t("calculosPage.table.petitionModal.error")
              : details.errors.join(", ")
          );
          setFetching(false);
          return;
        }

        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError(t("calculosPage.table.petitionModal.error"));
        setFetching(false);
      }
    };

    fetchData();

    return () => {
      abortController.current?.abort();
    };
  }, [uuid, open, t]);

  useEffect(() => {
    if (!open) {
      downloadAbortController.current?.abort();
    }
  }, [open]);

  const getSkeletonWidths = () => {
    const baseWidths = [80, 60, 90, 50, 70];
    return baseWidths.map(
      (width) => `${width + Math.floor(Math.random() * 20)}%`
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-4xl! overflow-hidden px-0 pt-0">
        <DialogTitle className="border-b border-white/10 pt-6 pb-4 pl-6 pr-14 bg-[#152030] flex flex-wrap items-center gap-2 gap-y-3">
          <span className="material-symbols-outlined material-symbols-outlined-sized shrink-0 text-[#ECD1A6]">
            docs
          </span>
          <span className="min-w-0 flex-1 text-left text-base font-semibold leading-snug">
            {tPetition("title")}
          </span>
          <Button
            className="cursor-pointer shrink-0"
            variant="outline-tertiary"
            onClick={handleDownload}
            disabled={processingDownload}
          >
            <i className="material-symbols-outlined material-symbols-outlined-sized text-[#ECD1A6]">
              docs
            </i>
            {tPetition("download")}
          </Button>
        </DialogTitle>
        <div className="overflow-hidden h-[70vh]">
          <ScrollArea className="h-full ">
            <Activity mode={error && !fetching ? "visible" : "hidden"}>
              <Alert variant="destructive" className="mb-4">
                <AlertCircleIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </Activity>
            <Activity mode={fetching ? "visible" : "hidden"}>
              <div className="p-6">
                <div className=" border-gray-200 border rounded-lg p-4">
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: 50 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-4"
                        style={{
                          width: getSkeletonWidths()[index % 5],
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Activity>
            <Activity
              mode={!fetching && !error && peticaoData ? "visible" : "hidden"}
            >
              <div className="p-6">
                {peticaoData ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    {peticaoData.peticao_html?.trim() ? (
                      <div
                        className="html-rendered-content max-w-none text-sm leading-relaxed text-gray-900"
                        dangerouslySetInnerHTML={{
                          __html: peticaoData.peticao_html,
                        }}
                      />
                    ) : (
                      <PeticaoDocumentPreview
                        dados={peticaoData.dados}
                        beneficios_aplicados={peticaoData.beneficios_aplicados}
                      />
                    )}
                  </div>
                ) : null}
              </div>
            </Activity>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
