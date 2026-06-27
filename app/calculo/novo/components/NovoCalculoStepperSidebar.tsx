"use client";
import { routeConfig } from "@/lib/route-config";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { NovoCalculoStepperSidebarDadosPessoaisSection } from "./NovoCalculoStepperSidebarDadosPessoaisSection";
import { NovoCalculoStepperEmptyStateIndicator } from "./NovoCalculoStepperEmptyStateIndicator";
import { NovoCalculoStepperQuestionarioDinamicoSection } from "./NovoCalculoStepperQuestionarioDinamicoSection";
import { NovoCalculoStepperSidebarMetadadosSection } from "./NovoCalculoStepperSidebarMetadadosSection";

export const NovoCalculoStepperSidebar = () => {
  const path = usePathname();
  const pageConfig = routeConfig[path]?.configs;

  const [currentApenadoData, setCurrentApenadoData] = useState({
    name: "",
    cpf: "",
  });

  const shouldShowQuestionarioDinamicoSection =
    pageConfig?.step === "questionario-dinamico" ||
    pageConfig?.step === "relatorio";

  const shouldShowMetadadosSection =
    pageConfig?.step === "questionario-dinamico";

  useEffect(() => {
    const getData = async () => {
      const calculadoraService = CalculadoraService.getInstance();
      const tempSeeuResponse = await calculadoraService.getTempSeeuResponse();
      if (tempSeeuResponse) {
        setCurrentApenadoData({
          name: tempSeeuResponse.identificacao.nome,
          cpf: tempSeeuResponse.identificacao.cpf,
        });
        return;
      }

      const tempApenadoData = await calculadoraService.getTempApenado();
      if (tempApenadoData) {
        setCurrentApenadoData({
          name: tempApenadoData.nome,
          cpf: tempApenadoData.cpf,
        });
      }
    };

    getData();
  }, [path]);

  return (
    <>
      <header className="px-6 py-4 flex flex-col gap-2 bg-white/5 border-b border-white/10">
        <span className="flex gap-2 font-semibold text-[13px] text-foreground items-center leading-none">
          <span className="text-xl leading-none text-[#ECD1A6]">
            <i className="material-symbols-outlined material-symbols-outlined-sized leading-none">
              person
            </i>
          </span>
          {currentApenadoData.name}
        </span>
        <span className="text-xs text-muted-foreground leading-none">
          CPF: {currentApenadoData.cpf}
        </span>
      </header>
      {pageConfig?.step === "dados-pessoais" ? (
        <NovoCalculoStepperEmptyStateIndicator />
      ) : (
        <NovoCalculoStepperSidebarDadosPessoaisSection />
      )}
      {shouldShowMetadadosSection && (
        <NovoCalculoStepperSidebarMetadadosSection />
      )}
      {shouldShowQuestionarioDinamicoSection && (
        <NovoCalculoStepperQuestionarioDinamicoSection />
      )}
    </>
  );
};
