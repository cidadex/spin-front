"use client";
import { Button } from "@/components/ui/button";
import { Activity } from "@/components/ui/activity";
import { Separator } from "@/components/ui/separator";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { NovoCalculoStepperSidebarSubItem } from "./NovoCalculoStepperSidebarSubItem";
import { useNovoCalculo } from "@/hooks/useNovoCalculo";
import { yearsMonthsDaysToHumanReadable } from "@/lib/utils";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const NovoCalculoStepperSidebarMetadadosSection = () => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const [refreshing, setRefreshing] = useState(false);
  const { metadata, updateVariaveis } = useNovoCalculo();

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center pl-3 mb-2">
          <span className="text-xs font-medium text-ellipsis overflow-hidden">
            {t("calculo.novoCalculo.metadataSectionTitle")}
          </span>
          <Button
            size="icon"
            variant="outline"
            className="cursor-pointer"
            onClick={() => setOpen((openState) => !openState)}
          >
            {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </div>
        <Activity mode={open ? "visible" : "hidden"}>
          <div className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            {typeof metadata.dias_cumpridos_manual !== "undefined" && (
              <NovoCalculoStepperSidebarSubItem
                label={t("calculo.dadosProcessuais.diasCumpridosManuais")}
                value={""}
                tooltip={t(
                  "calculo.dadosProcessuais.diasCumpridosManuaisDescription"
                )}
              >
                <div className="flex gap-2 items-baseline">
                  <div className="flex flex-col w-80">
                    <InputGroup>
                      <InputGroupInput
                        type="number"
                        placeholder={t(
                          "calculo.dadosProcessuais.diasCumpridosManuais"
                        )}
                        value={metadata.dias_cumpridos_manual || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value.replace(/\D/g, "");
                          const numericValueAsNumber = parseInt(
                            numericValue,
                            10
                          );
                          const calculadoraService =
                            CalculadoraService.getInstance();
                          if (!isNaN(numericValueAsNumber)) {
                            calculadoraService.updateTempCalculationMetadataItem(
                              "dias_cumpridos_manual",
                              numericValueAsNumber
                            );
                          } else if (value === "") {
                            calculadoraService.updateTempCalculationMetadataItem(
                              "dias_cumpridos_manual",
                              0
                            );
                          }
                          updateVariaveis();
                        }}
                      />
                    </InputGroup>
                  </div>
                </div>
              </NovoCalculoStepperSidebarSubItem>
            )}
            {typeof metadata.distribuir_cumprido !== "undefined" && (
              <NovoCalculoStepperSidebarSubItem
                label={t("calculo.dadosProcessuais.distribuirCumpridoNasPenas")}
                value=""
                tooltip={t(
                  "calculo.dadosProcessuais.distribuirCumpridoNasPenasDescription"
                )}
              >
                <div className="flex items-center gap-2 py-2">
                  <Switch
                    id="cumprimento_pena"
                    checked={metadata.distribuir_cumprido === true}
                    onCheckedChange={(checked) => {
                      const calculadoraService =
                        CalculadoraService.getInstance();
                      calculadoraService.updateTempCalculationMetadataItem(
                        "distribuir_cumprido",
                        checked
                      );
                      updateVariaveis();
                    }}
                    className="cursor-pointer"
                  />
                  <div className="flex flex-col ">
                    <Label
                      htmlFor="cumprimento_pena"
                      className="cursor-pointer text-xs"
                    >
                      {t(
                        "calculo.dadosProcessuais.distribuirCumpridoNasPenasSwitchLabel"
                      )}
                    </Label>
                  </div>
                </div>
              </NovoCalculoStepperSidebarSubItem>
            )}
            {typeof metadata.penas_para_cumprido !== "undefined" && (
              <NovoCalculoStepperSidebarSubItem
                label={t("calculo.dadosProcessuais.distribuirCumpridoNasPenas")}
                value={""}
              >
                <div className="flex flex-col gap-1">
                  <DragDropProvider
                    onDragEnd={async (event) => {
                      const { operation, canceled } = event;
                      if (canceled) return;
                      const { source, target } = operation;
                      if (
                        !source ||
                        !target ||
                        !isSortable(source) ||
                        !isSortable(target) ||
                        metadata.penas_para_cumprido === undefined
                      )
                        return;

                      const sourceIndex = source.initialIndex;
                      const targetIndex = target.index;

                      const prevOrder = metadata.penas_para_cumprido;

                      const newOrder = [...prevOrder];
                      const [movedItem] = newOrder.splice(sourceIndex, 1);
                      newOrder.splice(targetIndex, 0, movedItem);

                      const calculadoraService =
                        CalculadoraService.getInstance();
                      calculadoraService.updateTempCalculationMetadataItem(
                        "penas_para_cumprido",
                        newOrder
                      );

                      await updateVariaveis();
                    }}
                  >
                    {metadata.penas_para_cumprido.map((crime, index) => (
                      <CrimeItem crime={crime} index={index} key={crime} />
                    ))}
                  </DragDropProvider>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setRefreshing(true);
                      try {
                        const calculadoraService =
                          CalculadoraService.getInstance();
                        await calculadoraService.refreshCalculation();
                        await updateVariaveis();
                      } catch (error) {
                        console.error("Error refreshing calculation:", error);
                        toast.error(
                          t("calculo.novoCalculo.refreshErrorMessage")
                        );
                      } finally {
                        setRefreshing(false);
                      }
                    }}
                    className="cursor-pointer"
                    disabled={refreshing}
                  >
                    <Activity mode={refreshing ? "visible" : "hidden"}>
                      <i className="material-symbols-outlined text-inherit animate-spin">
                        refresh
                      </i>
                    </Activity>
                    {t("calculo.novoCalculo.refreshButtonLabel")}
                  </Button>
                </div>
              </NovoCalculoStepperSidebarSubItem>
            )}
          </div>
        </Activity>
      </div>
      <Separator />
    </>
  );
};

const CrimeItem = ({ crime, index }: { crime: string; index: number }) => {
  const { ref, isDragging, handleRef } = useSortable({
    id: crime,
    index,
  });
  const t = useTranslations();
  const { apenadoData, getParsedDispositivo } = useNovoCalculo();

  const dadosDoCrime = useMemo(() => {
    if (!apenadoData) return null;
    return apenadoData.crimes.find((c) => c.uuid === crime);
  }, [crime, apenadoData]);

  const dispositivo = useMemo(() => {
    return getParsedDispositivo(crime);
  }, [getParsedDispositivo, crime]);
  return (
    <div
      className="flex py-1 pr-2 border rounded-sm items-center gap-1"
      key={crime}
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <i
        className="material-symbols-outlined text-gray-400 cursor-move"
        ref={handleRef}
      >
        drag_indicator
      </i>
      <div className="flex flex-col">
        <div className="text-xs text-gray-700">
          {dispositivo.descricao} ({dispositivo.codigo})
        </div>
        <small className="text-xs text-gray-800">
          {yearsMonthsDaysToHumanReadable({
            date: {
              years: dadosDoCrime?.pena_anos || 0,
              months: dadosDoCrime?.pena_meses || 0,
              days: dadosDoCrime?.pena_dias || 0,
            },
            t,
          })}
        </small>
      </div>
    </div>
  );
};
