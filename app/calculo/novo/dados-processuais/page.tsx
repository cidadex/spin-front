"use client";

import { useRouter } from "next/navigation";
import { Activity } from "@/components/ui/activity";
import { NovoCalculoStepperStepCard } from "../components/NovoCalculoStepperStepCard";
import { useGenerateSchema } from "@/hooks/useGenerateSchema/useGenerateSchema";
import {
  DadosProcessuaisPageSchema,
  REGIME_ATUAL_OPTIONS,
  generateDadosProcessuaisPageSchema,
} from "./schemas";
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useAutoFilledFields } from "@/hooks/useAutoFilledFields";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageStatusEnum } from "@/types/enums";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { ProcessResponse } from "@/types/calculadora";
import {
  cn,
  parseDispositivo,
  seeuDateConverter,
  yearsMonthsDaysToHumanReadable,
} from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  AlertCircleIcon,
  BookTextIcon,
  CalendarIcon,
  Loader,
} from "lucide-react";
import z from "zod";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ApiClient } from "@/services/api/ApiClient";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNovoCalculo } from "@/hooks/useNovoCalculo";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      <NovoDadosProcessuaisPage />
    </ProtectedRoute>
  );
}

const CondenacaoItemInfoCard = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="flex-1 flex flex-col gap-1 border bg-white/5 border-white/10 px-3 pb-3 pt-2 rounded-lg">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
};

const CondenacaoItem = ({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) => {
  const form = useFormContext<DadosProcessuaisPageSchema>();
  const t = useTranslations();

  const condenacao = useWatch({
    control: form.control,
    name: `condenacoes.${index}`,
  });

  const parsedDispositivo = useMemo(
    () => parseDispositivo(condenacao?.dispositivo ?? ""),
    [condenacao?.dispositivo]
  );

  return (
    <div>
      <Card className="shadow-none pt-4 pb-3 gap-4 rounded-lg">
        <CardTitle className="flex items-center justify-between gap-2 px-4 font-bold text-sm text-foreground">
          <div className="flex items-center gap-2">
            {parsedDispositivo.descricao}
            {parsedDispositivo.codigo && (
              <span className="text-xs font-normal text-muted-foreground">
                {parsedDispositivo.codigo}
              </span>
            )}
            {condenacao?.hediondo_linha_tempo && (
              <span className="rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase px-2 py-0.5">
                {t("calculo.dadosProcessuais.crime.hediondoBadge")}
              </span>
            )}
          </div>
          <Button
            variant="link-destructive"
            size="sm"
            onClick={onRemove}
            type="button"
            className="cursor-pointer"
          >
            {t("calculo.dadosProcessuais.removeCondenacao")}
            <i className="material-symbols-outlined material-symbols-outlined-sized">
              close
            </i>
          </Button>
        </CardTitle>
        <CardContent className="px-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name={`condenacoes.${index}.numero_condenacao`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("calculo.dadosProcessuais.crime.numeroCondenacao")} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="border-white/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`condenacoes.${index}.diploma`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("calculo.dadosProcessuais.crime.diploma")} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="border-white/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`condenacoes.${index}.dispositivo`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>
                    {t("calculo.dadosProcessuais.crime.dispositivo")} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="border-white/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`condenacoes.${index}.data_cometimento`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {t("calculo.dadosProcessuais.crime.dataInfracao")} *
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal border-white/20",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>
                              {t("calculo.dadosProcessuais.crime.dataInfracao")}
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) field.onChange(date);
                        }}
                        disabled={(date) => date > new Date()}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`condenacoes.${index}.data_sentenca`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {t("calculo.dadosProcessuais.crime.dataSentenca")}
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>
                              {t("calculo.dadosProcessuais.crime.dataSentenca")}
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={(date) => field.onChange(date ?? null)}
                        disabled={(date) => date > new Date()}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`condenacoes.${index}.regime_inicial`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("calculo.dadosProcessuais.crime.regimeInicial")}
                  </FormLabel>
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(v) =>
                      field.onChange(v as (typeof REGIME_ATUAL_OPTIONS)[number])
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t(
                            "calculo.dadosProcessuais.execucao.regimePlaceholder"
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REGIME_ATUAL_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {t(
                            `calculo.dadosProcessuais.execucao.regimes.${option}` as never
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2 grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name={`condenacoes.${index}.pena.anos`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("calculo.dadosProcessuais.crime.penaAnos")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="border-white/20"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`condenacoes.${index}.pena.meses`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("calculo.dadosProcessuais.crime.penaMeses")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="border-white/20"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`condenacoes.${index}.pena.dias`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("calculo.dadosProcessuais.crime.penaDias")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="border-white/20"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name={`condenacoes.${index}.com_violencia_ou_grave_ameaca`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">
                    {t(
                      "calculo.dadosProcessuais.crime.comViolenciaOuGraveAmeaca"
                    )}
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`condenacoes.${index}.reincidente_comum`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">
                    {t("calculo.dadosProcessuais.crime.reincidenteComum")}
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`condenacoes.${index}.comando_organizacao_criminosa`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">
                    {t(
                      "calculo.dadosProcessuais.crime.comandoOrganizacaoCriminosa"
                    )}
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`condenacoes.${index}.hediondo_linha_tempo`}
              render={({ field }) => {
                const value =
                  field.value === null ? "null" : String(field.value);
                return (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="cursor-pointer">
                      {t("calculo.dadosProcessuais.crime.hediondo")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <i className="material-symbols-outlined material-symbols-outlined-sized text-gray-400 cursor-pointer ml-1">
                            info
                          </i>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t("calculo.dadosProcessuais.crime.hediondoTooltip")}
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={value}
                        onValueChange={(v) =>
                          field.onChange(
                            v === "null" ? null : v === "true" ? true : false
                          )
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">
                            {t(
                              "calculo.dadosProcessuais.crime.hediondoOptions.unknown"
                            )}
                          </SelectItem>
                          <SelectItem value="true">
                            {t(
                              "calculo.dadosProcessuais.crime.hediondoOptions.yes"
                            )}
                          </SelectItem>
                          <SelectItem value="false">
                            {t(
                              "calculo.dadosProcessuais.crime.hediondoOptions.no"
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BlocoBSection = () => {
  const t = useTranslations();
  const form = useFormContext<DadosProcessuaisPageSchema>();

  return (
    <section className="border border-white/10 rounded-lg p-4 bg-white/5">
      <header className="mb-3">
        <h3 className="font-semibold text-sm text-foreground">
          {t("calculo.dadosProcessuais.execucao.title")}
        </h3>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="regime_atual"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] text-muted-foreground">
                {t("calculo.dadosProcessuais.execucao.regime")}
              </FormLabel>
              <Select
                value={field.value ?? undefined}
                onValueChange={(v) =>
                  field.onChange(v as (typeof REGIME_ATUAL_OPTIONS)[number])
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "calculo.dadosProcessuais.execucao.regimePlaceholder"
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REGIME_ATUAL_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(
                        `calculo.dadosProcessuais.execucao.regimes.${option}` as never
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="total_dias_remidos"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] text-muted-foreground">
                {t("calculo.dadosProcessuais.execucao.totalDiasRemidos")}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  className=""
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    field.onChange(raw === "" ? null : parseInt(raw, 10) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
};

function NovoDadosProcessuaisPage() {
  const { push } = useRouter();

  const [storedResponse, setStoredResponse] = useState<ProcessResponse | null>(
    null
  );
  const { updateTempMetadata } = useNovoCalculo();
  const schema = useGenerateSchema(generateDadosProcessuaisPageSchema);
  const [pageStatus, setPageStatus] = useState<PageStatusEnum>(
    PageStatusEnum.Initial
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const t = useTranslations();
  const { updateAutoFilledFields } = useAutoFilledFields<typeof schema>({
    regime_atual: false,
    total_dias_remidos: false,
    condenacoes: false,
  });
  const form = useForm<DadosProcessuaisPageSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      regime_atual: undefined,
      total_dias_remidos: null,
      condenacoes: [],
    },
  });

  const condenacoesFieldArray = useFieldArray({
    control: form.control,
    name: "condenacoes",
  });

  const onValidSubmit = useCallback<SubmitHandler<z.infer<typeof schema>>>(
    async (updatedValues) => {
      try {
        setSubmitError(null);
        if (!storedResponse) return;
        const calculadoraService = CalculadoraService.getInstance();

        // Fields the form does not surface (resultado_morte,
        // reincidente_especifico, indultado, comutado, data_transito_julgado,
        // observacao) are preserved from the SEEU response so they are not
        // silently zeroed on submit. Crimes are matched via _sourceIdx (original
        // index in storedResponse.crimes) so removal is safe.
        const serializedCrimes = updatedValues.condenacoes.map(
          (condenacao) => {
            const sourceCrime = storedResponse.crimes[condenacao._sourceIdx];
            return {
              numero_condenacao: condenacao.numero_condenacao,
              dispositivo: condenacao.dispositivo,
              diploma: condenacao.diploma,
              data_cometimento: seeuDateConverter.toSeeuDate(
                condenacao.data_cometimento
              ),
              data_sentenca: condenacao.data_sentenca
                ? seeuDateConverter.toSeeuDate(condenacao.data_sentenca)
                : null,
              data_transito_julgado: sourceCrime?.data_transito_julgado ?? null,
              extinto: condenacao.extinto,
              indultado: sourceCrime?.indultado ?? false,
              comutado: sourceCrime?.comutado ?? false,
              com_violencia_ou_grave_ameaca:
                condenacao.com_violencia_ou_grave_ameaca,
              resultado_morte: sourceCrime?.resultado_morte ?? false,
              reincidente_comum: condenacao.reincidente_comum,
              reincidente_especifico:
                sourceCrime?.reincidente_especifico ?? false,
              comando_organizacao_criminosa:
                condenacao.comando_organizacao_criminosa,
              hediondo_linha_tempo: condenacao.hediondo_linha_tempo,
              regime_inicial: condenacao.regime_inicial,
              cumulacao: condenacao.cumulacao,
              observacao: sourceCrime?.observacao ?? null,
              pena_anos: condenacao.pena?.anos ?? 0,
              pena_meses: condenacao.pena?.meses ?? 0,
              pena_dias: condenacao.pena?.dias ?? 0,
            };
          }
        );

        // Persist apenado first; only mutate the SEEU temp state on success
        // so a failed createApenado does not leave orphan edits in localStorage.
        const saveApenadoResponse = await calculadoraService.createApenado({
          nome: storedResponse.identificacao.nome,
          cpf: storedResponse.identificacao.cpf,
          data_nascimento: storedResponse.identificacao.data_nascimento,
          numero_unico: storedResponse.identificacao.numero_unico,
          regime_atual: updatedValues.regime_atual,
          // Persist dias remidos (editable by user) and status from SEEU
          total_dias_remidos: updatedValues.total_dias_remidos ?? null,
          status_execucao: storedResponse.identificacao.ativo
            ? "ATIVO"
            : storedResponse.identificacao.ativo === false
              ? "EXTINTO"
              : null,
          raw_data: storedResponse.raw_data,
          crimes: serializedCrimes,
          marcos_temporais: storedResponse.marcos_temporais,
          variaveis: {},
          // Forward the upload context so the Apenado is created with the
          // emission date (read by /calculate to gate against pre-data_corte
          // PDFs) and linked to the decreto chosen on the upload screen.
          seeu_emission_date: storedResponse.seeu_emission_date ?? null,
          decreto_uuid: storedResponse.decreto_uuid,
        });

        await calculadoraService.updateTempSeeuResponse({
          ...storedResponse,
          calculos_pena: {
            ...storedResponse.calculos_pena,
            regime_atual: updatedValues.regime_atual,
            total_dias_remidos: updatedValues.total_dias_remidos,
          },
          crimes: serializedCrimes,
        });

        await calculadoraService.updateTempApenado(saveApenadoResponse.data);

        setPageStatus(PageStatusEnum.Completed);
      } catch (e) {
        console.log({ e });
        setSubmitError(t("common.errors.errorSubmittingData"));
      }
    },
    [storedResponse, t]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageStatus(PageStatusEnum.Loading);
    const calculadoraService = CalculadoraService.getInstance();
    calculadoraService
      .getTempSeeuResponse()
      .then(async (response) => {
        if (!response) {
          throw new Error("No stored response found");
        }
        setStoredResponse(response);
        const regimeAtual = response.calculos_pena.regime_atual;
        const regimeAtualSafe =
          regimeAtual &&
          (REGIME_ATUAL_OPTIONS as readonly string[]).includes(regimeAtual)
            ? (regimeAtual as (typeof REGIME_ATUAL_OPTIONS)[number])
            : undefined;
        form.reset({
          regime_atual: regimeAtualSafe,
          total_dias_remidos: response.calculos_pena.total_dias_remidos ?? null,
          condenacoes: response.crimes.map((crime, i) => ({
            _sourceIdx: i,
            dispositivo: crime.dispositivo,
            diploma: crime.diploma,
            data_cometimento:
              seeuDateConverter.toDate(crime.data_cometimento) || undefined,
            data_sentenca: crime.data_sentenca
              ? seeuDateConverter.toDate(crime.data_sentenca)
              : null,
            extinto: crime.extinto,
            com_violencia_ou_grave_ameaca: crime.com_violencia_ou_grave_ameaca,
            reincidente_comum: crime.reincidente_comum ?? false,
            comando_organizacao_criminosa:
              crime.comando_organizacao_criminosa ?? false,
            hediondo_linha_tempo: crime.hediondo_linha_tempo ?? null,
            regime_inicial: (
              REGIME_ATUAL_OPTIONS as readonly string[]
            ).includes(crime.regime_inicial ?? "")
              ? (crime.regime_inicial as (typeof REGIME_ATUAL_OPTIONS)[number])
              : null,
            cumulacao: crime.cumulacao,
            numero_condenacao: crime.numero_condenacao,
            pena: {
              anos: crime.pena_anos,
              meses: crime.pena_meses,
              dias: crime.pena_dias,
            },
          })),
        });
        updateAutoFilledFields({});
        updateTempMetadata();
        // Surface validation errors for SEEU-supplied invalid values
        // (e.g. data_cometimento that failed parsing → undefined) immediately
        // instead of waiting for the user to touch each field.
        await form.trigger();
        setPageStatus(PageStatusEnum.Loaded);
      })
      .catch((e) => {
        console.log({ e });
        setPageStatus(PageStatusEnum.Error);
      });
  }, [form, updateAutoFilledFields, updateTempMetadata]);

  if (pageStatus === PageStatusEnum.Completed)
    return <DadosProcesuaisSuccessPage />;

  if (pageStatus === PageStatusEnum.Loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (pageStatus === PageStatusEnum.Error) {
    return <div>{t("common.errors.errorLoadingData")}</div>;
  }

  return (
    <Form {...form}>
      <form
        className="flex-1 flex-col flex"
        onSubmit={form.handleSubmit(onValidSubmit, () => {
          setSubmitError(t("common.errors.validationError"));
        })}
      >
        <NovoCalculoStepperStepCard
          stepIndex={2}
          formState={form.formState}
          prevStep={() => {
            push("/calculo/novo/dados-pessoais");
          }}
          stepTitle={t("calculo.dadosProcessuais.title")}
          stepSubtitle={
            <>
              {t("calculo.dadosProcessuais.subtitle")}
              <strong>
                {t("calculo.dadosProcessuais.subtitleDetails", {
                  crimes: t("common.crimesCount", {
                    count: condenacoesFieldArray.fields.length,
                  }),
                  penaTotal: yearsMonthsDaysToHumanReadable({
                    date: {
                      years:
                        storedResponse?.calculos_pena.pena_total_imposta
                          ?.anos ?? 0,
                      months:
                        storedResponse?.calculos_pena.pena_total_imposta
                          ?.meses ?? 0,
                      days:
                        storedResponse?.calculos_pena.pena_total_imposta
                          ?.dias ?? 0,
                    },
                    t,
                  }),
                })}
              </strong>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <BlocoBSection />
            <section>
              <header className="mb-2">
                <h3 className="font-semibold text-sm text-foreground">
                  {t("calculo.dadosProcessuais.crimes.title")}
                </h3>
              </header>
              <div className="flex flex-col gap-3">
                {condenacoesFieldArray.fields.map((fieldArrayItem, index) => (
                  <CondenacaoItem
                    key={fieldArrayItem.id}
                    index={index}
                    onRemove={() => condenacoesFieldArray.remove(index)}
                  />
                ))}
              </div>
            </section>
          </div>
          <Activity mode={submitError ? "visible" : "hidden"}>
            <Alert variant="destructive" className="mt-4">
              <AlertCircleIcon />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          </Activity>
        </NovoCalculoStepperStepCard>
      </form>
    </Form>
  );
}

const DadosProcesuaisSuccessPage = () => {
  const t = useTranslations();
  const [decreto, setDecreto] = useState("");
  const { push } = useRouter();

  const handleStartAnalysis = useCallback(async () => {
    if (!decreto) return;
    try {
      const calculadoraService = CalculadoraService.getInstance();
      const tempApenado = await calculadoraService.getTempApenado();

      const crimesOrderForPayload = tempApenado?.crimes.map(
        (crime) => crime.uuid
      );

      calculadoraService.updateTempCalculationMetadataItem(
        "penas_para_cumprido",
        crimesOrderForPayload
      );

      const initialMetadata = calculadoraService.getTempCalculationMetadata();

      if (!initialMetadata.dias_cumpridos_manual) {
        calculadoraService.updateTempCalculationMetadataItem(
          "dias_cumpridos_manual",
          0
        );
      }

      if (!initialMetadata.distribuir_cumprido) {
        calculadoraService.updateTempCalculationMetadataItem(
          "distribuir_cumprido",
          false
        );
      }

      const updatedMetadata = calculadoraService.getTempCalculationMetadata();

      await calculadoraService.calculate({
        apenado_id: tempApenado?.uuid || "",
        decreto_id: decreto,
        metadata: updatedMetadata,
      });

      push("/calculo/novo/questionario-dinamico");
    } catch (e) {
      if (
        ApiClient.isApiClientError<{
          errors: Array<string>;
        }>(e)
      ) {
        const errorDetails = await e.details;
        errorDetails?.errors.forEach((errorMessage) => {
          toast.error(errorMessage, {
            position: "bottom-center",
          });
        });
        return;
      }
      toast.error(
        t("calculo.dadosProcessuais.successPage.startAnalysisError"),
        {
          position: "bottom-center",
        }
      );
    }
  }, [decreto, push, t]);

  return (
    <div className="flex flex-col justify-center items-center flex-1 gap-4">
      <span className="bg-[#ECD1A6]/15 border border-[#ECD1A6]/40 w-20 h-20 flex items-center justify-center rounded-full mb-2">
        <span className="inline-block leading-8 text-[48px] whitespace-nowrap">
          <i className="material-symbols-outlined material-symbols-outlined-sized text-[#ECD1A6] leading-none">
            check
          </i>
        </span>
      </span>
      <h1 className="text-2xl font-bold text-foreground">
        {t("calculo.dadosProcessuais.successPage.title")}
      </h1>
      <span className="text-foreground text-sm">
        {t("calculo.dadosProcessuais.successPage.subtitle")}
      </span>
      <section className="max-w-xl">
        <div className="rounded-lg border border-[#ECD1A6]/25 bg-[#ECD1A6]/5 p-6 mt-4">
          <header className="flex gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#ECD1A6]/20 flex items-center text-2xl justify-center min-w-12 min-h-12">
              <i className="material-symbols-outlined material-symbols-outlined-sized text-[#ECD1A6]">
                bolt
              </i>
            </div>
            <section className="flex flex-col gap-2">
              <h2 className="font-bold text-base text-[#ECD1A6]">
                {t("calculo.dadosProcessuais.successPage.analysisStart.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(
                  "calculo.dadosProcessuais.successPage.analysisStart.description"
                )}
              </p>
            </section>
          </header>
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <h3 className="uppercase text-[#ECD1A6]/80 font-semibold text-xs">
              {t(
                "calculo.dadosProcessuais.successPage.analysisStart.confirmedDataTitle"
              )}
            </h3>
            <ul className="list-disc list-inside mt-2 text-muted-foreground text-xs">
              <li className="mb-1">
                {t(
                  "calculo.dadosProcessuais.successPage.analysisStart.confirmedItems.personalData"
                )}
              </li>
              <li className="mb-1">
                {t(
                  "calculo.dadosProcessuais.successPage.analysisStart.confirmedItems.prisonRegistration"
                )}
              </li>
              <li className="mb-1">
                {t(
                  "calculo.dadosProcessuais.successPage.analysisStart.confirmedItems.prisonRegime"
                )}
              </li>
            </ul>
          </div>
        </div>
        <DecretoSelect
          key="decreto-select"
          value={decreto}
          onChange={setDecreto}
        />
        <Button
          className="w-full cursor-pointer mt-6 bg-[#ECD1A6] text-[#1C2A39] hover:bg-[#dfc090] shadow hover:shadow-lg font-bold border-0"
          size="3xl"
          disabled={!decreto}
          onClick={handleStartAnalysis}
        >
          {t("calculo.dadosProcessuais.successPage.startAnalysisButton")}
          <i className="material-symbols-outlined material-symbols-outlined-sized text-[#1C2A39] leading-none">
            arrow_forward
          </i>
        </Button>
        <p className="text-xs text-muted-foreground text-center w-full mt-4">
          {t("calculo.dadosProcessuais.successPage.estimatedTime")}
        </p>
      </section>
      <div className="mt-6 mb-4 w-full">
        <Separator />
      </div>
      <Button
        variant="primary"
        className="cursor-pointer"
        onClick={() => {
          const calculadoraService = CalculadoraService.getInstance();
          calculadoraService.clearTempCalculationData();
          push("/");
        }}
      >
        <BookTextIcon />
        {t("calculo.dadosProcessuais.successPage.saveAndContinueLater")}
      </Button>
    </div>
  );
};

const DecretoSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const t = useTranslations();
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );

  useEffect(() => {
    const calculadoraService = CalculadoraService.getInstance();

    calculadoraService.listDecretos().then((response) => {
      const formattedOptions = response.results.map((decreto) => ({
        label: decreto.nome,
        value: decreto.uuid,
      }));
      setOptions(formattedOptions);
      // Pre-select the latest decreto (index 0, API orders by -data_corte).
      if (formattedOptions.length > 0) {
        onChange(formattedOptions[0].value);
      }
    });
    // `onChange` is intentionally NOT in the dep array — an unstable callback
    // identity from a caller would refetch decretos and re-auto-select the
    // first option on every parent render, clobbering a manual choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col mt-4">
      <label
        htmlFor="decreto"
        className="text-sm font-medium text-foreground mb-1"
      >
        {t("calculo.dadosProcessuais.decreto")}
      </label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={t("calculo.dadosProcessuais.decretoPlaceholder")}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const DadosProcessuaisPageRouteConfig = {
  hideMenu: true,
  configs: {
    step: "dados-processuais",
    stepIndex: 0,
  },
};
