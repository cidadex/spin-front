import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import z from "zod";

export const generateCepSchema = ((t) => {
  return z.string().regex(/^\d{5}-?\d{3}$/, t("common.validation.invalidCep"));
}) satisfies IGenerateSchemaFunction<z.ZodString>;
