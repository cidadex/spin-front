import { useGenerateSchema } from "@/hooks/useGenerateSchema/useGenerateSchema";
import { SubmitHandler, useForm } from "react-hook-form";
import { generateNewApenadoAutomaticFormSeeuReportSchema } from "./schemas/newApenadoAutomaticForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FileInput from "@/components/ui/inputs/file/FileInput";
import { CardContent } from "@/components/ui/card";
import { AlertCircleIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity } from "@/components/ui/activity";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { useRouter } from "next/navigation";
import { ApiClient, ApiClientError } from "@/services/api/ApiClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DecretoListItem } from "@/types/calculadora/decretos";

type DecretoOption = Pick<DecretoListItem, "uuid" | "nome" | "data_corte">;

function formatDataCorte(isoDate: string): string {
  const datePart = isoDate.split("T")[0];
  const segments = datePart.split("-");
  if (segments.length !== 3) return isoDate;
  const [year, month, day] = segments;
  return `${day}/${month}/${year}`;
}

const ReadingAnimation = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1827]/90 backdrop-blur-sm rounded-xl z-10 gap-6">
    <div className="relative w-20 h-24 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#ECD1A6] text-6xl">description</span>
      </div>
      <div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-90"
        style={{
          animation: "scanLine 1.6s ease-in-out infinite",
          top: "20%",
        }}
      />
    </div>
    <div className="flex flex-col items-center gap-2">
      <p className="text-white font-semibold text-base">Lendo arquivos…</p>
      <p className="text-muted-foreground text-sm">Identificando dados do apenado</p>
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-purple-400"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite` }}
          />
        ))}
      </div>
    </div>
    <style>{`
      @keyframes scanLine {
        0%   { top: 15%; opacity: 0; }
        10%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { top: 85%; opacity: 0; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50%       { opacity: 1;   transform: scale(1.2); }
      }
    `}</style>
  </div>
);

export const NewApenadoAutomaticForm = () => {
  const t = useTranslations("newApenadoAutomaticForm");
  const schema = useGenerateSchema(
    generateNewApenadoAutomaticFormSeeuReportSchema
  );
  const { push } = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      decretoUuid: "",
      arquivos: [],
    },
  });
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "" });
  const [decretos, setDecretos] = useState<DecretoOption[]>([]);
  const [decretosLoadError, setDecretosLoadError] = useState(false);

  const decretoUuidWatch = form.watch("decretoUuid");
  const selectedDecreto = useMemo(
    () => decretos.find((d) => d.uuid === decretoUuidWatch) ?? null,
    [decretos, decretoUuidWatch]
  );

  useEffect(() => {
    let isMounted = true;
    const calculadoraService = CalculadoraService.getInstance();
    calculadoraService
      .listDecretos()
      .then((response) => {
        if (!isMounted) return;
        const opts: DecretoOption[] = response.results.map((d) => ({
          uuid: d.uuid,
          nome: d.nome,
          data_corte: d.data_corte,
        }));
        setDecretos(opts);
      })
      .catch(() => {
        if (!isMounted) return;
        setDecretosLoadError(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (decretos.length > 0 && !form.getValues("decretoUuid")) {
      form.setValue("decretoUuid", decretos[0].uuid, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decretos]);

  const handleSubmit = useCallback<SubmitHandler<z.infer<typeof schema>>>(
    async (data) => {
      setErrorMessage({ title: "", message: "" });
      try {
        const calculadoraService = CalculadoraService.getInstance();
        const selected = decretos.find((d) => d.uuid === data.decretoUuid);
        await calculadoraService.processSeeuReport({
          arquivos: data.arquivos,
          decretoUuid: data.decretoUuid,
          decretoDataCorte: selected?.data_corte,
        });
        push("/calculo/novo");
      } catch (e) {
        if (!ApiClient.isApiClientError(e)) {
          setErrorMessage({
            title: t("errors.unexpected.title"),
            message: t("errors.unexpected.message"),
          });
          return;
        }

        let errorDetail: Awaited<typeof e.details> | undefined;
        try {
          errorDetail = await e.details;
        } catch {
          errorDetail = undefined;
        }

        const emissionError = errorDetail as
          | {
              error_code?: string;
              data_corte?: string;
              error?: string;
              message?: string;
            }
          | undefined;
        if (emissionError?.error_code === "PDF_EMITIDO_ANTES_DO_DECRETO") {
          const dataCorteIso = emissionError.data_corte;
          setErrorMessage({
            title: emissionError.error ?? t("errors.unexpected.title"),
            message: dataCorteIso
              ? t("errors.documentoEmitidoAntesDoDecreto", {
                  dataCorte: formatDataCorte(dataCorteIso),
                })
              : (emissionError.message ?? t("errors.unexpected.message")),
          });
          return;
        }

        if (ApiClientError.detailHasErrorInformation(errorDetail)) {
          setErrorMessage({
            title: errorDetail.error,
            message: errorDetail.message,
          });
          return;
        }

        setErrorMessage({
          title: t("errors.unexpected.title"),
          message: t("errors.unexpected.message"),
        });
      }
    },
    [decretos, push, t]
  );

  return (
    <div className="flex-1 relative">
      {form.formState.isSubmitting && <ReadingAnimation />}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex-1 h-full relative flex flex-col gap-4"
        >
          <span className="px-6 text-center w-full text-muted-foreground text-sm">
            {t("instructionText")}
          </span>
          <div className="px-6">
            <FormField
              control={form.control}
              name="decretoUuid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("decretoLabel")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(v) => {
                        field.onChange(v);
                      }}
                      disabled={decretos.length === 0 || decretosLoadError}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("decretoPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {decretos.map((d) => (
                          <SelectItem key={d.uuid} value={d.uuid}>
                            {d.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {selectedDecreto && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("emissionDateNotice", {
                        dataCorte: formatDataCorte(selectedDecreto.data_corte),
                      })}
                    </p>
                  )}
                  {decretosLoadError && (
                    <p className="text-xs text-red-400 mt-1">
                      {t("decretoLoadError")}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="px-6">
            <FormField
              control={form.control}
              name="arquivos"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileInput
                      {...field}
                      multiple={true}
                      maxFiles={2}
                      maxSize={10 * 1024 * 1024}
                      accept={{
                        "application/pdf": [".pdf"],
                      }}
                      buttonClassName="h-14 whitespace-normal text-center leading-tight"
                      buttonLabel={
                        <>
                          {t("fileInputLabel")}
                          <span className="material-symbols-outlined material-symbols-outlined-sized">
                            upload
                          </span>
                        </>
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="px-6">
            <Activity
              mode={
                errorMessage.title || errorMessage.message
                  ? "visible"
                  : "hidden"
              }
            >
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>{errorMessage.title}</AlertTitle>
                  <AlertDescription>{errorMessage.message}</AlertDescription>
                </Alert>
              </CardContent>
            </Activity>
          </div>
          <div className="bg-white/5 border-t border-white/10 px-6 pt-6 pb-10 flex items-center justify-center">
            <Activity mode={form.formState.isValid ? "hidden" : "visible"}>
              <span className="text-center w-full text-muted-foreground text-xs leading-none">
                {t("validationMessage")}
              </span>
            </Activity>
            <Activity mode={form.formState.isValid ? "visible" : "hidden"}>
              <Button
                className="w-full cursor-pointer bg-[#ECD1A6] text-[#1C2A39] hover:bg-[#dfc090] font-semibold"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                <UploadIcon className="w-4 h-4" />
                {t("buttonLabel")}
              </Button>
            </Activity>
          </div>
        </form>
      </Form>
    </div>
  );
};
