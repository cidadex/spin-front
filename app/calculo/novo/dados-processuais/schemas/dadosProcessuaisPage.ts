import { generateSeeuReportDuracaoSchema } from "@/schemas/common";
import z from "zod";

export const REGIME_ATUAL_OPTIONS = [
  "FECHADO",
  "SEMIABERTO",
  "ABERTO",
] as const;

const generateCondenacaoSchema = (t: (k: string) => string) =>
  z.object({
    _sourceIdx: z.number(),
    numero_condenacao: z.string().min(1, t("common.validation.required")),
    dispositivo: z.string().min(1, t("common.validation.required")),
    diploma: z.string().min(1, t("common.validation.required")),
    data_cometimento: z.date(t("common.validation.required")),
    data_sentenca: z.date().nullable(),
    pena: generateSeeuReportDuracaoSchema(t),
    regime_inicial: z.enum(REGIME_ATUAL_OPTIONS).nullable(),
    com_violencia_ou_grave_ameaca: z.boolean(t("common.validation.required")),
    reincidente_comum: z.boolean(),
    comando_organizacao_criminosa: z.boolean(),
    hediondo_linha_tempo: z.boolean().nullable(),
    cumulacao: z.string().nullable(),
    extinto: z.boolean(t("common.validation.required")),
  });

export const generateDadosProcessuaisPageSchema = (t: (k: string) => string) =>
  z.object({
    regime_atual: z.enum(REGIME_ATUAL_OPTIONS, {
      message: t("common.validation.required"),
    }),
    total_dias_remidos: z.number().min(0).nullable(),
    condenacoes: z.array(generateCondenacaoSchema(t)),
  });

export type DadosProcessuaisPageSchema = z.infer<
  ReturnType<typeof generateDadosProcessuaisPageSchema>
>;
