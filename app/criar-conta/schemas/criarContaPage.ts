import { generateCepSchema } from "@/schemas/common";
import { generateEmailSchema } from "@/schemas/common/email";
import { generatePasswordSchema } from "@/schemas/common/password";
import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import z from "zod";

export const generateCreateAccountPageSchema = ((t) => {
  return z.object({
    name: z.string().min(1, t("common.validation.required")),
    areaAtuacao: z.uuidv4({ error: t("common.validation.required") }),
    age: z.number().int().min(0, t("common.validation.invalidAge")),
    cep: generateCepSchema(t),
    estado: z
      .string()
      .min(2, t("common.validation.required"))
      .max(2, t("common.validation.required")),
    rua: z.string().min(1, t("common.validation.required")),
    bairro: z.string().min(1, t("common.validation.required")),
    complemento: z.string().optional(),
    anosExperiencia: z
      .number()
      .int()
      .min(0, t("common.validation.invalidYears")),
    email: generateEmailSchema(t),
    password: generatePasswordSchema(t).min(1, t("common.validation.required")),
    loginType: z.enum(["individual", "company"]),
  });
}) satisfies IGenerateSchemaFunction<z.ZodObject>;

export type CreateAccountPageSchema = z.infer<
  ReturnType<typeof generateCreateAccountPageSchema>
>;
