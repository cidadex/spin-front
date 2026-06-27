import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import z from "zod";

export const generateSeeuReportDuracaoSchema = ((t) => {
  return z.object({
    anos: z.number().min(0, t("duracaoInput.anos")),
    meses: z.number().min(0, t("duracaoInput.meses")),
    dias: z.number().min(0, t("duracaoInput.dias")),
  });
}) satisfies IGenerateSchemaFunction<z.ZodObject>;
