import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import z from "zod";

export const generatePasswordSchema = ((t) => {
  return z.string({
    error: () => {
      return { message: t("common.validation.required") };
    },
  });
}) satisfies IGenerateSchemaFunction;
