import { ApiClient } from "@/services/api/ApiClient";
import { SeeuReportsRepository } from "./SeeuReportsRepository";
import { ImpeditivosRepository } from "./ImpeditivosRepository";
import { ApenadosRepository } from "./ApenadosRepository";
import {
  CalculadoraCalculatePayload,
  CalculadoraCalculateResponse,
  CalculadoraCalculationsGroupedListPayload,
  CalculadoraCalculationsGroupedListResponse,
  CalculadoraCalculationsListPayload,
  CalculadoraCalculationsListResponse,
  CalculadoraCalculationsSummaryResponse,
  CalculadoraCancelCalculationResponse,
  CalculadoraGetCalculationResponse,
  DecretosListResponse,
  GetPetitionDataResponse,
} from "@/types/calculadora";
import { CalculationVariavelEscopoEnum } from "@/types/enums";
import { PaginatedRequest } from "@/types/api/api";

export interface ICalculadoraHistoryEntry {
  variavelIdentificador: string;
  variavelValor: unknown;
  timestamp: number;
  escopo: CalculationVariavelEscopoEnum;
  ref_id?: string;
}

export class CalculadoraRepository {
  private apiClient: ApiClient;
  public static readonly TEMP_CALCULATION_RESULT_KEY =
    "temp_calculation_result";
  public static readonly TEMP_CALCULATION_VARIABLES_HISTORY =
    "temp_calculation_variables_history";
  public static readonly TEMP_CALCULATION_METADATA_KEY =
    "temp_calculation_metadata";

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  public reports = new SeeuReportsRepository();
  public impeditivos = new ImpeditivosRepository();
  public apenados = new ApenadosRepository();

  listDecretos(
    params?: PaginatedRequest<{ search?: string }>,
    signal?: AbortSignal
  ) {
    const response = this.apiClient.get<DecretosListResponse>(
      "/calculadora/decretos/",
      {
        useAuthHeader: true,
        queryParams: params,
        signal,
      }
    );
    return response;
  }

  cancelCalculation(uuid: string) {
    return this.apiClient.post<
      CalculadoraCancelCalculationResponse,
      Record<string, never>
    >(`/calculadora/calculations/${uuid}/cancel/`, {}, { useAuthHeader: true });
  }

  calculate(payload: CalculadoraCalculatePayload) {
    return this.apiClient.post<
      CalculadoraCalculateResponse,
      CalculadoraCalculatePayload
    >("/calculadora/calculate/", payload, {
      useAuthHeader: true,
    });
  }

  storeTempCalculationResult(result: CalculadoraCalculateResponse) {
    localStorage.setItem(
      CalculadoraRepository.TEMP_CALCULATION_RESULT_KEY,
      JSON.stringify(result)
    );
  }

  getTempCalculationResult(): CalculadoraCalculateResponse | null {
    const result = localStorage.getItem(
      CalculadoraRepository.TEMP_CALCULATION_RESULT_KEY
    );
    return result ? JSON.parse(result) : null;
  }

  addTempCalculationVariableToHistory(variable: ICalculadoraHistoryEntry) {
    if (!variable) {
      return;
    }
    const history = this.getTempCalculationVariablesHistory();

    const existingIndex = history.findIndex(
      (entry) =>
        entry.variavelIdentificador === variable.variavelIdentificador &&
        entry.escopo === variable.escopo &&
        entry.ref_id === variable.ref_id
    );

    if (existingIndex !== -1) {
      delete history[existingIndex];
    }
    history.push(variable);
    localStorage.setItem(
      CalculadoraRepository.TEMP_CALCULATION_VARIABLES_HISTORY,
      JSON.stringify(history.filter(Boolean))
    );
  }

  getTempCalculationVariablesHistory(): ICalculadoraHistoryEntry[] {
    const history = localStorage.getItem(
      CalculadoraRepository.TEMP_CALCULATION_VARIABLES_HISTORY
    );
    try {
      return history ? JSON.parse(history).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  clearTempCalculationResult() {
    localStorage.removeItem(CalculadoraRepository.TEMP_CALCULATION_RESULT_KEY);
  }

  getTempCalculationMetadata(): CalculadoraCalculatePayload["metadata"] {
    const metadata = localStorage.getItem(
      CalculadoraRepository.TEMP_CALCULATION_METADATA_KEY
    );
    try {
      return metadata ? JSON.parse(metadata) : {};
    } catch {
      return {};
    }
  }

  storeTempCalculationMetadata(
    metadata: CalculadoraCalculatePayload["metadata"]
  ) {
    localStorage.setItem(
      CalculadoraRepository.TEMP_CALCULATION_METADATA_KEY,
      JSON.stringify(metadata)
    );
  }

  listCalculations(
    payload: CalculadoraCalculationsListPayload,
    signal?: AbortSignal
  ) {
    return this.apiClient.get<CalculadoraCalculationsListResponse>(
      "/calculadora/calculations/",
      {
        useAuthHeader: true,
        queryParams: payload,
        signal,
      }
    );
  }

  getCalculation(uuid: string, signal?: AbortSignal) {
    return this.apiClient.get<CalculadoraGetCalculationResponse>(
      `/calculadora/calculations/${uuid}/`,
      {
        useAuthHeader: true,
        signal,
      }
    );
  }

  getCalculationsSummary(signal?: AbortSignal) {
    return this.apiClient.get<CalculadoraCalculationsSummaryResponse>(
      "/calculadora/calculations/summary/",
      {
        useAuthHeader: true,
        signal,
      }
    );
  }

  listCalculationsGrouped(
    payload: CalculadoraCalculationsGroupedListPayload,
    signal?: AbortSignal
  ) {
    return this.apiClient.get<CalculadoraCalculationsGroupedListResponse>(
      "/calculadora/calculations/grouped/",
      {
        useAuthHeader: true,
        queryParams: payload,
        signal,
      }
    );
  }

  getPeticaoData(uuid: string, signal?: AbortSignal) {
    return this.apiClient.get<GetPetitionDataResponse>(
      `/calculadora/peticao/${uuid}/data/`,
      {
        useAuthHeader: true,
        signal,
      }
    );
  }

  getPeticaoDownload(uuid: string, signal?: AbortSignal) {
    return this.apiClient.get<Blob>(`/calculadora/peticao/${uuid}/download/`, {
      useAuthHeader: true,
      signal,
      responseType: "blob",
    });
  }

  completeCalculation(uuid: string) {
    return this.apiClient.post<
      CalculadoraCancelCalculationResponse,
      Record<string, never>
    >(
      `/calculadora/calculations/${uuid}/complete/`,
      {},
      { useAuthHeader: true }
    );
  }

  clearTempCalculationVariablesHistory() {
    localStorage.removeItem(
      CalculadoraRepository.TEMP_CALCULATION_VARIABLES_HISTORY
    );
  }

  clearTempCalculationMetadata() {
    localStorage.removeItem(
      CalculadoraRepository.TEMP_CALCULATION_METADATA_KEY
    );
  }
}
