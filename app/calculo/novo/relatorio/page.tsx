"use client";
import { RelatorioCalculo } from "@/app/components/relatorio-calculo";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import {
  CalculadoraCalculateResponseBase,
  CalculadoraRelatorioDoCalculo,
} from "@/types/calculadora";
import { AuthStatusEnum } from "@/types/enums";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      <RelatorioPage />
    </ProtectedRoute>
  );
}

type DivergenciaHediondidade = NonNullable<
  CalculadoraCalculateResponseBase["impeditivos_check"]
>["data"]["divergencias_hediondidade"][number];

const DivergenciaHediondidadeAlert = ({
  divergencias,
}: {
  divergencias: DivergenciaHediondidade[];
}) => {
  if (!divergencias || divergencias.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-yellow-500/40 bg-yellow-900/20 p-4">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-yellow-400 shrink-0 mt-0.5">
          warning
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-yellow-300 mb-2">
            Divergência de Hediondidade Detectada
          </h3>
          <p className="text-xs text-yellow-200/80 mb-3">
            O sistema identificou inconsistência entre a classificação interna e
            os dados da sentença. Verifique antes de concluir.
          </p>
          <ul className="space-y-2">
            {divergencias.map((d, i) => (
              <li
                key={i}
                className="rounded border border-yellow-500/20 bg-yellow-900/30 p-3"
              >
                <p className="text-xs font-medium text-yellow-100 mb-1">
                  Condenação nº {d.condenacao_numero} — {d.crime_dispositivo}
                  {d.crime_diploma ? ` (${d.crime_diploma})` : ""}
                </p>
                {d.cumulacao_com && (
                  <p className="text-xs text-yellow-200/70 mb-1">
                    c/c {d.cumulacao_com}
                  </p>
                )}
                <p className="text-xs text-yellow-200/80">{d.mensagem}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const RelatorioPage = () => {
  const t = useTranslations("calculo.relatorioPage");
  const router = useRouter();
  const [relatorio, setRelatorio] =
    useState<CalculadoraRelatorioDoCalculo | null>(null);
  const [calculationUuid, setCalculationUuid] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [divergencias, setDivergencias] = useState<
    DivergenciaHediondidade[]
  >([]);

  useEffect(() => {
    const calculadoraService = CalculadoraService.getInstance();
    void calculadoraService.getTempCalculationResult().then((response) => {
      if (response?.relatorio) {
        setRelatorio(response.relatorio);
      }
      const divs =
        response?.impeditivos_check?.data?.divergencias_hediondidade ?? [];
      setDivergencias(divs);
    });
    void calculadoraService.getTempApenado().then((apenado) => {
      const uuid = apenado?.calculations?.[0]?.uuid ?? null;
      setCalculationUuid(uuid);
    });
  }, []);

  const handleCompleteCalculation = () => {
    if (!calculationUuid || completing) {
      return;
    }
    setCompleting(true);
    const calculadoraService = CalculadoraService.getInstance();
    void calculadoraService
      .completeCalculation(calculationUuid)
      .then((response) => {
        if (response.success) {
          calculadoraService.clearTempCalculationData();
          toast.success(response.message?.trim() || t("completeSuccess"));
          router.push("/calculos");
        } else {
          toast.error(t("completeError"));
          setCompleting(false);
        }
      })
      .catch(() => {
        toast.error(t("completeError"));
        setCompleting(false);
      });
  };

  return (
    <div className="w-full min-h-full max-h-full overflow-y-auto py-2">
      <div className="max-w-3xl bg-[#1c2a39] border border-white/10 rounded-lg shadow p-6 w-full mx-auto">
        <DivergenciaHediondidadeAlert divergencias={divergencias} />
        {relatorio && <RelatorioCalculo relatorio={relatorio} />}
        {relatorio && calculationUuid ? (
          <div className="mt-8 flex justify-center border-t pt-6">
            <Button
              type="button"
              size="lg"
              className="cursor-pointer min-w-[240px] bg-[#ECD1A6] text-[#1C2A39] hover:bg-[#dfc090] inline-flex items-center justify-center gap-2 border-0 font-semibold"
              disabled={completing}
              onClick={handleCompleteCalculation}
            >
              {completing ? (
                <span className="material-symbols-outlined animate-spin leading-none shrink-0">
                  progress_activity
                </span>
              ) : null}
              <span>{t("completeButton")}</span>
            </Button>
          </div>
        ) : null}
        {relatorio && !calculationUuid ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("missingCalculationError")}
          </p>
        ) : null}
      </div>
    </div>
  );
};

const RelatorioPageRouteConfig = {
  hideMenu: true,
  configs: {
    step: "relatorio",
    stepIndex: 2,
    hideSidebars: true,
  },
};
