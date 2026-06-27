import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import z from "zod";

export const generateDateSchema = ((t) => {
  return z.date({
    error: () => {
      return { message: t("common.validation.required") };
    },
  });
}) satisfies IGenerateSchemaFunction<z.ZodDate>;
