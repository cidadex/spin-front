"use client";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { useGenerateSchema } from "@/hooks/useGenerateSchema/useGenerateSchema";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { AuthStatusEnum } from "@/types/enums/auth";
import { CalendarIcon, Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { generateDadosPessoaisPageSchema } from "./schemas";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormItemAutoFilledIndicator,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, seeuDateConverter } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAutoFilledFields } from "@/hooks/useAutoFilledFields";
import { RouteConfigProps } from "@/lib/route-config";
import { NovoCalculoStepperStepCard } from "../components/NovoCalculoStepperStepCard";
import z from "zod";
import { ProcessResponse } from "@/types/calculadora/seeuReports";
import { useRouter } from "next/navigation";
import { PageStatusEnum } from "@/types/enums";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      <DadosPessoaisPage />
    </ProtectedRoute>
  );
}

const DadosPessoaisPage = () => {
  const [storedResponse, setStoredResponse] = useState<ProcessResponse | null>(
    null
  );
  const [pageStatus, setPageStatus] = useState<PageStatusEnum>(
    PageStatusEnum.Initial
  );
  const t = useTranslations();
  const { push } = useRouter();

  const schema = useGenerateSchema(generateDadosPessoaisPageSchema);
  const { fields: autoFilledFields, updateAutoFilledFields } =
    useAutoFilledFields<typeof schema>({
      nome: false,
      cpf: false,
      data_nascimento: false,
      rg: false,
      nome_mae: false,
      numero_unico: false,
    });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      cpf: "",
      data_nascimento: undefined,
      rg: "",
      nome_mae: "",
      numero_unico: "",
    },
  });

  const onValidSubmit = useCallback<SubmitHandler<z.infer<typeof schema>>>(
    async (data) => {
      if (!storedResponse) return;
      const calculadoraService = CalculadoraService.getInstance();
      await calculadoraService.updateTempSeeuResponse({
        identificacao: {
          ...storedResponse?.identificacao,
          nome: data.nome,
          cpf: data.cpf,
          data_nascimento: data.data_nascimento
            ? seeuDateConverter.toSeeuDate(data.data_nascimento)
            : "0000-00-00",
          rg: data.rg || "",
          nome_mae: data.nome_mae || "",
          numero_unico: data.numero_unico,
        },
      });

      push("/calculo/novo/dados-processuais");
    },
    [storedResponse, push]
  );

  useEffect(() => {
    setPageStatus(PageStatusEnum.Loading);
    const calculadoraService = CalculadoraService.getInstance();
    calculadoraService
      .getTempSeeuResponse()
      .then((response) => {
        if (!response) {
          throw new Error("No stored response found");
        }
        setStoredResponse(response);
        form.reset({
          nome:
            response.identificacao.nome !== ""
              ? response.identificacao.nome
              : "",
          cpf:
            response.identificacao.cpf !== "" ? response.identificacao.cpf : "",
          data_nascimento:
            response.identificacao.data_nascimento !== "0000-00-00"
              ? (seeuDateConverter.toDate(
                  response.identificacao.data_nascimento
                ) ?? undefined)
              : undefined,
          rg: response.identificacao.rg !== "" ? response.identificacao.rg : "",
          nome_mae:
            response.identificacao.nome_mae !== ""
              ? response.identificacao.nome_mae
              : "",
          numero_unico:
            response.identificacao.numero_unico !== ""
              ? response.identificacao.numero_unico
              : "",
        });
        updateAutoFilledFields({
          nome: response.identificacao.nome !== "",
          cpf: response.identificacao.cpf !== "",
          data_nascimento:
            response.identificacao.data_nascimento !== "0000-00-00",
          rg: response.identificacao.rg !== "",
          nome_mae: response.identificacao.nome_mae !== "",
          numero_unico: response.identificacao.numero_unico !== "",
        });
        setPageStatus(PageStatusEnum.Loaded);
      })
      .catch(() => {
        setPageStatus(PageStatusEnum.Error);
      });
    // `form` is intentionally NOT in deps — useForm returns a stable handle in
    // practice, but its reference can change on schema regeneration (locale
    // switch / HMR), which would re-fire this effect and wipe user edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return pageStatus === PageStatusEnum.Loading ||
    pageStatus === PageStatusEnum.Initial ? (
    <div className="flex flex-1 items-center justify-center">
      <Loader className="animate-spin" />
    </div>
  ) : pageStatus === PageStatusEnum.Error ? (
    <div>{t("common.errors.errorLoadingData")}</div>
  ) : (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValidSubmit)}
        className="flex-1 flex-col flex"
      >
        <NovoCalculoStepperStepCard
          stepIndex={1}
          formState={form.formState}
          stepTitle={t("calculo.dadosPessoais.title")}
          stepSubtitle={t("calculo.dadosPessoais.subtitle")}
        >
          <div className="grid grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("calculo.dadosPessoais.nome")} *
                    <FormItemAutoFilledIndicator
                      autoFilled={autoFilledFields.nome}
                    />
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
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("calculo.dadosPessoais.cpf")} *
                    <FormItemAutoFilledIndicator
                      autoFilled={autoFilledFields.cpf}
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-white/20"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("calculo.dadosPessoais.rg")}
                    <FormItemAutoFilledIndicator
                      autoFilled={autoFilledFields.rg}
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      className=""
                      type="text"
                      {...field}
                      placeholder={t("calculo.dadosPessoais.rgPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data_nascimento"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {t("calculo.dadosPessoais.dataNascimento")} *
                    <FormItemAutoFilledIndicator
                      autoFilled={autoFilledFields.data_nascimento}
                    />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal border-white/20",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>
                              {t("calculo.dadosPessoais.dataNascimento")}
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
                        onSelect={field.onChange}
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
              name="nome_mae"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("calculo.dadosPessoais.nomeMae")}
                    <FormItemAutoFilledIndicator
                      autoFilled={autoFilledFields.nome_mae}
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className=""
                      {...field}
                      placeholder={t(
                        "calculo.dadosPessoais.nomeMaePlaceholder"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numero_unico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("calculo.dadosPessoais.numeroUnico")} *
                    <FormItemAutoFilledIndicator
                      autoFilled={autoFilledFields.numero_unico}
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-white/20"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </NovoCalculoStepperStepCard>
      </form>
    </Form>
  );
};

const DadosPessoaisPageRouteConfig: RouteConfigProps = {
  hideMenu: true,
  configs: { step: "dados-pessoais", stepIndex: 0 },
};
