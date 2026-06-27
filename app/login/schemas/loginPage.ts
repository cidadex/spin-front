import { generateEmailSchema } from "@/schemas/common/email";
import { generatePasswordSchema } from "@/schemas/common/password";
import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import z from "zod";

export const generateLoginPageSchema = ((t) => {
  return z.object({
    email: generateEmailSchema(t),
    password: generatePasswordSchema(t).min(1, t("common.validation.required")),
    loginType: z.enum(["individual", "company"]),
    rememberMe: z.boolean(),
  });
}) satisfies IGenerateSchemaFunction<z.ZodObject>;

export type LoginPageSchema = z.infer<
  ReturnType<typeof generateLoginPageSchema>
>;

export const generateLoginWithCodePageSchema = ((t) => {
  return z.object({
    email: generateEmailSchema(t).optional(),
    code: z.string().length(5, t("common.validation.required")),
  });
}) satisfies IGenerateSchemaFunction<z.ZodObject>;

export type LoginWithCodePageSchema = z.infer<
  ReturnType<typeof generateLoginWithCodePageSchema>
>;
