/** Extrai dados do SEEU em raw_data.PROCESSOS CRIMINAIS para um crime do cadastro. */

export type SeeuCrimeContext = {
  processo: Record<string, unknown> | null;
  desmembramento: Record<string, unknown> | null;
};

function normalizeProcessoNumero(s: string): string {
  return s != null ? s.replace(/\D/g, "") : "";
}

export function findSeeuCrimeContext(
  rawData: Record<string, unknown> | undefined,
  numeroCondenacao: string,
  dispositivo: string
): SeeuCrimeContext {
  if (!rawData) return { processo: null, desmembramento: null };
  const processos = rawData["PROCESSOS CRIMINAIS"];
  if (!Array.isArray(processos))
    return { processo: null, desmembramento: null };

  const targetNum = normalizeProcessoNumero(numeroCondenacao);

  for (const proc of processos) {
    if (!proc || typeof proc !== "object") continue;
    const p = proc as Record<string, unknown>;
    const num = p["Número"];
    if (typeof num !== "string") continue;
    if (normalizeProcessoNumero(num) !== targetNum) continue;

    const des = p["DESMEMBRAMENTO(S)"];
    if (!Array.isArray(des) || des.length === 0) {
      return { processo: p, desmembramento: null };
    }

    for (const d of des) {
      if (!d || typeof d !== "object") continue;
      const dm = d as Record<string, unknown>;
      const art = dm["Artigo da Lei"];
      if (typeof art === "string" && art.trim() === dispositivo.trim()) {
        return { processo: p, desmembramento: dm };
      }
    }

    if (des.length === 1 && des[0] && typeof des[0] === "object") {
      return {
        processo: p,
        desmembramento: des[0] as Record<string, unknown>,
      };
    }

    return { processo: p, desmembramento: null };
  }

  return { processo: null, desmembramento: null };
}

export function seeuString(
  row: Record<string, unknown> | null,
  keys: string[]
): string | null {
  if (!row) return null;
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string") {
      const t = v.trim();
      if (t && t.toLowerCase() !== "não informado") return t;
    }
  }
  return null;
}

export function seeuBool(
  row: Record<string, unknown> | null,
  keys: string[]
): boolean {
  if (!row) return false;
  for (const k of keys) {
    if (row[k] === true) return true;
  }
  return false;
}
