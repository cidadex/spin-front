import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import z from "zod";

export const generateEmailSchema = ((t) => {
  return z.email(t("common.validation.email.invalid"));
}) satisfies IGenerateSchemaFunction<z.ZodEmail>;
