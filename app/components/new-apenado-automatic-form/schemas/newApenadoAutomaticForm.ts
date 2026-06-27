import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import z from "zod";

export const generateNewApenadoAutomaticFormSeeuReportSchema = ((t) => {
  return z.object({
    decretoUuid: z
      .string()
      .min(1, t("newApenadoAutomaticForm.errors.decretoRequired")),
    arquivos: z
      .array(z.file())
      .min(2, t("newApenadoAutomaticForm.errors.bothFilesRequired"))
      .max(2, t("newApenadoAutomaticForm.errors.exactlyTwoFiles"))
      .refine(
        (files) => files.every((f) => f.type === "application/pdf"),
        t("newApenadoAutomaticForm.errors.onlyPdfFilesAllowed")
      ),
  });
}) satisfies IGenerateSchemaFunction;
