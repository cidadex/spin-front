import { IGenerateSchemaFunction } from "@/types/schemas/utils";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import z from "zod";

export const useGenerateSchema = <
  T extends z.ZodObject,
  G extends IGenerateSchemaFunction<T>,
>(
  generator: G
) => {
  const t = useTranslations();
  const schema = useMemo(() => generator(t), [generator, t]) as ReturnType<G>;
  return schema;
};
