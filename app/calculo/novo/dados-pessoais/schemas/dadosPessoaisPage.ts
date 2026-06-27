import { generateDateSchema } from "@/schemas/common/date";
import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import z from "zod";

export const generateDadosPessoaisPageSchema = ((t) => {
  return z.object({
    nome: z.string().min(1, t("common.validation.required")),
    cpf: z.string().min(1),
    data_nascimento: generateDateSchema(t),
    rg: z.string().optional(),
    nome_mae: z.string().optional(),
    numero_unico: z.string().min(1, t("common.validation.required")),
  });
}) satisfies IGenerateSchemaFunction<z.ZodObject>;
