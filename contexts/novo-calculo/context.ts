import { createContext } from "react";
import {
  ApenadosCreateResponse,
  CalculadoraCalculateMetadata,
  CalculadoraCalculateResponseBase,
  CalculadoraVariavelPendiente,
  CalculadoraVariavelRespondida,
} from "@/types/calculadora";

export interface INovoCalculoContext {
  variaveisRespondidas: CalculadoraVariavelRespondida[];
  variaveisPendentes: CalculadoraVariavelPendiente[];
  apenadoData: ApenadosCreateResponse["data"] | null;
  upperboundCrimes: CalculadoraCalculateResponseBase["upperbound"]["crimes"];
  metadata: CalculadoraCalculateMetadata;
  updateVariaveisResponidas: () => Promise<void>;
  updateVariaveisPendentes: () => Promise<void>;
  updateVariaveis: () => Promise<void>;
  updateTempMetadata: () => void;
  getParsedDispositivo: (crimeUuid: string | undefined) => {
    codigo: string;
    descricao: string;
  };
  goBack: () => void;
}

export const NovoCalculoContext = createContext<INovoCalculoContext>({
  variaveisRespondidas: [],
  variaveisPendentes: [],
  apenadoData: null,
  upperboundCrimes: [],
  metadata: {},
  updateVariaveisResponidas: () => new Promise(() => {}),
  updateVariaveisPendentes: () => new Promise(() => {}),
  updateVariaveis: () => new Promise(() => {}),
  updateTempMetadata: () => {},
  getParsedDispositivo: () => ({ codigo: "", descricao: "" }),
  goBack: () => {},
});
