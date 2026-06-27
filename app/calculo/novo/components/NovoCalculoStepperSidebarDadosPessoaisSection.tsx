"use client";
import { Button } from "@/components/ui/button";
import { Activity } from "@/components/ui/activity";
import { Separator } from "@/components/ui/separator";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NovoCalculoStepperSidebarSubItem } from "./NovoCalculoStepperSidebarSubItem";

export const NovoCalculoStepperSidebarDadosPessoaisSection = () => {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const t = useTranslations();

  const [currentApenadoData, setCurrentApenadoData] = useState({
    name: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    nomeMae: "",
    numeroUnico: "",
  });

  useEffect(() => {
    const getData = async () => {
      const calculadoraService = CalculadoraService.getInstance();
      const response = await calculadoraService.getTempSeeuResponse();
      if (response) {
        setCurrentApenadoData({
          name: response.identificacao.nome,
          cpf: response.identificacao.cpf,
          rg: response.identificacao.rg,
          dataNascimento: response.identificacao.data_nascimento,
          nomeMae: response.identificacao.nome_mae,
          numeroUnico: response.identificacao.numero_unico,
        });
        return;
      }
      const apenadoData = await calculadoraService.getTempApenado();
      if (apenadoData) {
        setCurrentApenadoData({
          name: apenadoData.nome,
          cpf: apenadoData.cpf,
          rg: apenadoData.raw_data.rg as string,
          dataNascimento: apenadoData.data_nascimento,
          nomeMae: apenadoData.raw_data.nome_mae as string,
          numeroUnico: apenadoData.numero_unico,
        });
      }
    };

    getData();
  }, [path]);

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center pl-3 mb-2">
          <span className="text-xs font-medium">
            {t("calculo.novoCalculo.dadosCadastrais")}
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
            <NovoCalculoStepperSidebarSubItem
              label={t("calculo.dadosPessoais.nome")}
              value={currentApenadoData.name}
            />
            <NovoCalculoStepperSidebarSubItem
              label={t("calculo.dadosPessoais.cpf")}
              value={currentApenadoData.cpf}
            />
            <NovoCalculoStepperSidebarSubItem
              label={t("calculo.dadosPessoais.rg")}
              value={currentApenadoData.rg}
            />
            <NovoCalculoStepperSidebarSubItem
              label={t("calculo.dadosPessoais.dataNascimento")}
              value={currentApenadoData.dataNascimento}
            />
            <NovoCalculoStepperSidebarSubItem
              label={t("calculo.dadosPessoais.nomeMae")}
              value={currentApenadoData.nomeMae}
            />
            <NovoCalculoStepperSidebarSubItem
              label={t("calculo.dadosPessoais.numeroUnico")}
              value={currentApenadoData.numeroUnico}
            />
          </div>
        </Activity>
      </div>
      <Separator />
    </>
  );
};
