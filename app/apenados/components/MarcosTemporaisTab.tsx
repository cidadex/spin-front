import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { seeuDateConverter } from "@/lib/utils";
import {
  ApenadoDetalhe,
  CalculadoraGetCalculationMarcosTemporaisDetalhe,
  CalculadoraGetCalculationResponseBase,
} from "@/types/calculadora";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

const getMarcoColor = (
  marco: CalculadoraGetCalculationMarcosTemporaisDetalhe
) => {
  switch (marco.tipo) {
    case "INTERRUPÇÃO":
      return "#10B981";
    case "PRISÃO/INÍCIO DE CUMPRIMENTO":
      return "#C81E1E";
    default:
      return "#1F2A37";
  }
};

export const MarcosTemporaisTab = ({
  calculation,
}: {
  apenado: ApenadoDetalhe;
  calculation: CalculadoraGetCalculationResponseBase | null;
}) => {
  const t = useTranslations();
  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  }, []);

  const safeParseDate = useCallback(
    (dateString: string | null) => {
      try {
        if (!dateString) {
          throw new Error("Invalid date string");
        }
        const date = seeuDateConverter.toDate(dateString);
        if (!date) {
          throw new Error("Invalid date");
        }
        return dateFormatter.format(date);
      } catch {
        return "-";
      }
    },
    [dateFormatter]
  );

  return (
    <div>
      <div className="flex items-center justify-center gap-4 py-6 border-b mb-4 bg-gray-50 px-6">
        <div className="flex items-baseline justify-between gap-2 bg-green-50 border border-green-400 rounded-lg p-4">
          <span className="text-gray-900 text-sm leading-none font-bold">
            {t("apenadosPage.marcosTemporaisTab.totalEmCumprimento")}
          </span>
          <span className="flex items-baseline justify-between gap-1 leading-none text-gray-700 text-xs font-normal">
            <strong className="text-green-700 font-bold text-xl">
              {calculation?.detalhes_marcos_temporais.total_em_cumprimento}
            </strong>
            {t("apenadosPage.marcosTemporaisTab.dias")}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 bg-yellow-50 border border-yellow-400 rounded-lg p-4">
          <span className="text-gray-900 text-sm leading-none font-bold">
            {t("apenadosPage.marcosTemporaisTab.totalEmLiberdade")}
          </span>
          <span className="flex items-baseline justify-between gap-1 leading-none text-gray-700 text-xs font-normal">
            <strong className="text-yellow-700 font-bold text-xl">
              {calculation?.detalhes_marcos_temporais.total_em_liberdade}
            </strong>
            {t("apenadosPage.marcosTemporaisTab.dias")}
          </span>
        </div>
      </div>
      <section className="px-6 w-full">
        <h2 className="text-gray-900 text-base font-bold leading-none mb-8">
          {t("apenadosPage.marcosTemporaisTab.linhaDeTempo")}
        </h2>
      </section>
      <div className="pt-4 px-6">
        <div className="bg-gray-50 border border-gray-200 flex items-center rounded-lg justify-center py-6 gap-8">
          <div className="flex gap-2 items-center justify-center leading-none text-xs text-gray-700 font-medium">
            <div className="w-4 h-4 relative bg-linear-to-b from-emerald-500 to-emerald-600 rounded"></div>
            {t("apenadosPage.marcosTemporaisTab.emCumprimento")}
          </div>
          <div className="flex gap-2 items-center justify-center leading-none text-xs text-gray-700 font-medium">
            <div className="w-4 h-4 relative bg-linear-to-b from-amber-500 to-amber-600 rounded"></div>
            {t("apenadosPage.marcosTemporaisTab.emLiberdade")}
          </div>
          <div className="flex gap-2 items-center justify-center leading-none text-xs text-gray-700 font-medium">
            <div className="w-4 h-4 relative rounded-full bg-red-500"></div>
            {t("apenadosPage.marcosTemporaisTab.inicioPrisao")}
          </div>
          <div className="flex gap-2 items-center justify-center leading-none text-xs text-gray-700 font-medium">
            <div className="w-4 h-4 relative rounded-full bg-emerald-500"></div>
            {t("apenadosPage.marcosTemporaisTab.interrupcaoLiberdade")}
          </div>
        </div>
      </div>
      <section className="px-6">
        <div className="bg-gray-50 border border-gray-300 rounded-lg my-4 p-4 pb-20 flex flex-col gap-4">
          <p className="text-center text-gray-500 text-xs font-medium">
            {t("apenadosPage.marcosTemporaisTab.passeMouse")}
          </p>
          <div className="flex mt-10 items-center">
            {calculation?.detalhes_marcos_temporais.marcos.map((marco, i) => {
              return (
                <div
                  key={i}
                  className={`first:rounded-l-full last:rounded-r-full h-2 min-w-8 bg-linear-to-b ${marco.cumprindo_pena ? "from-emerald-500 to-emerald-600" : "from-amber-500 to-amber-600"} flex items-center justify-center relative`}
                  style={{
                    flex: marco.porcentagem,
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className="z-index-2 h-5 w-5 border-4 border-white hover:border-black rounded-full shadow"
                        style={{
                          backgroundColor: getMarcoColor(marco),
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white max-w-[220px] p-3 [&_svg]:bg-transparent [&_svg]:fill-transparent border-gray-400 border">
                      <div className="flex gap-2 items-baseline">
                        <div
                          className="w-2 h-2 min-w-2 min-h-2 rounded-full"
                          style={{ backgroundColor: getMarcoColor(marco) }}
                        />
                        <div className="flex flex-col gap-2">
                          <span
                            className="text-xs font-bold leading-none"
                            style={{
                              color: getMarcoColor(marco),
                            }}
                          >
                            {marco.tipo}{" "}
                            <span className="font-medium">
                              {t("apenadosPage.marcosTemporaisTab.evento", {
                                number: i + 1,
                              })}
                            </span>
                          </span>
                          <span className="text-base font-semibold leading-none text-gray-800">
                            {safeParseDate(marco.data)}
                          </span>
                          <span className="text-gray-500 text-sm font-normal mt-2">
                            {marco.motivo}
                          </span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex-1 bg-transparent" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Separator className="my-4" />
      <section className="px-6 w-full pb-4">
        {calculation?.detalhes_marcos_temporais.marcos.map((marco, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg mb-2 bg-gray-50 border-gray-200 grid grid-cols-[2fr_1fr_1fr_1fr] items-stretch gap-4"
          >
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-2 text-gray-900 font-bold leading-none text-sm">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getMarcoColor(marco) }}
                />
                <span className="flex items-baseline flex-wrap gap-x-1 gap-y-0">
                  {marco.tipo}
                  <span className="font-normal">
                    {" "}
                    {t("apenadosPage.marcosTemporaisTab.evento", {
                      number: i + 1,
                    })}
                  </span>
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 leading-none">
                {marco.motivo}
              </span>
            </div>
            <div className="border-l pl-4 flex items-center gap-1">
              <strong
                style={{
                  color: getMarcoColor(marco),
                }}
                className="tabular-nums text-lg font-bold"
              >
                {marco.dias}
              </strong>{" "}
              {t("apenadosPage.marcosTemporaisTab.dias")}
            </div>
            <div className="border-l pl-4 flex items-center text-gray-800 text-xs font-normal">
              {t("apenadosPage.marcosTemporaisTab.percentualDaPena", {
                percentage: marco.porcentagem,
              })}
            </div>
            <div className="border-l pl-4 flex items-center text-gray-800 text-xs font-normal">
              {safeParseDate(marco.data)}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
