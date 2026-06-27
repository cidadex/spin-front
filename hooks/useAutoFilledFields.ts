import { useCallback, useState } from "react";
import z, { ZodObject } from "zod";

export function useAutoFilledFields<
  T extends ZodObject,
  FT = Record<keyof z.infer<T>, boolean>,
>(initialValue: FT) {
  const [fields, setFields] = useState<FT>(initialValue);

  const updateAutoFilledFields = useCallback((newValues: Partial<FT>) => {
    setFields((prevFields) => ({
      ...prevFields,
      ...newValues,
    }));
  }, []);

  return { fields, updateAutoFilledFields };
}
