import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { NovoCalculoContext } from "./context";
import {
  ApenadosCreateResponse,
  CalculadoraCalculateMetadata,
  CalculadoraCalculateResponseBase,
  CalculadoraVariavelPendiente,
  CalculadoraVariavelRespondida,
} from "@/types/calculadora";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalculationVariavelEscopoEnum } from "@/types/enums";
import { parseDispositivo } from "@/lib/utils";

export const NovoCalculoContextProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { push } = useRouter();
  const [variaveisRespondidas, setVariaveisRespondidas] = useState<
    CalculadoraVariavelRespondida[]
  >([]);

  const [variaveisPendentes, setVariaveisPendentes] = useState<
    CalculadoraVariavelPendiente[]
  >([]);

  const [apenadoData, setApenadoData] = useState<
    ApenadosCreateResponse["data"] | null
  >(null);

  const [upperboundCrimes, setUpperboundCrimes] = useState<
    CalculadoraCalculateResponseBase["upperbound"]["crimes"]
  >([]);

  const [metadata, setMetadata] = useState<CalculadoraCalculateMetadata>({});

  const updateTempMetadata = useCallback(() => {
    const calculadoraService = CalculadoraService.getInstance();
    const tempMetadata = calculadoraService.getTempCalculationMetadata();
    setMetadata(tempMetadata);
  }, []);

  const updateUpperboundCrimes = useCallback(() => {
    const calculadoraService = CalculadoraService.getInstance();
    calculadoraService.getTempCalculationResult().then((response) => {
      if (response) {
        setUpperboundCrimes(response.upperbound.crimes);
      }
    });
  }, []);

  const updateApenadoData = useCallback(() => {
    const calculadoraService = CalculadoraService.getInstance();
    calculadoraService.getTempApenado().then((tempApenadoData) => {
      setApenadoData(tempApenadoData);
    });
  }, []);

  const updateVariaveisResponidas = useCallback(async () => {
    const calculadoraService = CalculadoraService.getInstance();

    calculadoraService.getTempCalculationResult().then((response) => {
      if (response) {
        setVariaveisRespondidas(response.variaveis_respondidas);
      }
    });
  }, []);

  const updateVariaveisPendentes = useCallback(async () => {
    const calculadoraService = CalculadoraService.getInstance();
    const tempPendingVariables =
      calculadoraService.getTempCalculationPendingVariables();

    tempPendingVariables.then((variables) => {
      setVariaveisPendentes(variables || []);
    });
  }, []);

  const updateVariaveis = useCallback(async () => {
    await updateVariaveisResponidas();
    await updateVariaveisPendentes();
    updateApenadoData();
    updateUpperboundCrimes();
    updateTempMetadata();
  }, [
    updateApenadoData,
    updateUpperboundCrimes,
    updateVariaveisPendentes,
    updateVariaveisResponidas,
    updateTempMetadata,
  ]);

  useEffect(() => {
    updateVariaveisResponidas();
  }, [updateVariaveisResponidas]);

  useEffect(() => {
    updateVariaveisPendentes();
  }, [updateVariaveisPendentes]);

  useEffect(() => {
    updateApenadoData();
  }, [updateApenadoData]);

  useEffect(() => {
    updateUpperboundCrimes();
  }, [updateUpperboundCrimes]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateTempMetadata();
  }, [updateTempMetadata]);

  const getParsedDispositivo = useCallback(
    (crimeUuid: string | undefined) => {
      if (!apenadoData || !crimeUuid)
        return {
          codigo: "",
          descricao: "",
        };
      const crimeData = apenadoData.crimes.find(
        (crime) => crime.uuid === crimeUuid
      );

      if (!crimeData) return { codigo: "", descricao: "" };

      const dispositivo = crimeData.dispositivo;
      return parseDispositivo(dispositivo);
    },
    [apenadoData]
  );

  const goBack = useCallback(() => {
    const calculadoraService = CalculadoraService.getInstance();

    const variablesHistory =
      calculadoraService.getCalculationVariablesHistory();

    const ref_id = searchParams.get("ref_id") || undefined;
    const escopo = searchParams.get("escopo") || undefined;
    const identificador = searchParams.get("identificador") || undefined;

    const currentVariableIndex = variablesHistory.findIndex((entry) => {
      return (
        (entry.escopo === CalculationVariavelEscopoEnum.Apenado ||
          entry.ref_id === ref_id) &&
        entry.variavelIdentificador === identificador &&
        entry.escopo === escopo
      );
    });

    const pageItsQuestionarioDinamico = pathname.includes(
      "/calculo/novo/questionario-dinamico"
    );

    let lastVariableIndex = currentVariableIndex - 1;

    if (lastVariableIndex < 0) {
      lastVariableIndex = variablesHistory.length - 1;
    }

    if (variablesHistory.length === 0) {
      return;
    }

    if (lastVariableIndex === currentVariableIndex) {
      return;
    }

    const lastVariable = variablesHistory[lastVariableIndex];

    if (pageItsQuestionarioDinamico) {
      const queryParams = new URLSearchParams();
      queryParams.set("ref_id", lastVariable.ref_id || "");
      queryParams.set("escopo", lastVariable.escopo);
      queryParams.set("identificador", lastVariable.variavelIdentificador);
      push(`/calculo/novo/questionario-dinamico?${queryParams.toString()}`);
      return;
    }
  }, [pathname, push, searchParams]);

  return (
    <NovoCalculoContext
      value={{
        variaveisRespondidas,
        updateVariaveisResponidas,
        variaveisPendentes,
        updateVariaveisPendentes,
        updateVariaveis,
        apenadoData,
        getParsedDispositivo,
        upperboundCrimes,
        goBack,
        metadata,
        updateTempMetadata,
      }}
    >
      {children}
    </NovoCalculoContext>
  );
};
