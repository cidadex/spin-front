import { ApiClient } from "@/services/api/ApiClient";
import { PaginatedRequest } from "@/types/api/api";
import {
  ApenadosCreatePayload,
  ApenadosCreateResponse,
  ApenadosListMetadataResponse,
  ApenadosListResponse,
  ApenadosUpdatePayload,
  ApenadosUpdateVariaveisPayload,
  GetApenadoByUuidResponse,
} from "@/types/calculadora";

export class ApenadosRepository {
  private apiClient: ApiClient;
  public static readonly TEMP_APENADO_KEY = "temp_apenado";

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  create(payload: ApenadosCreatePayload) {
    return this.apiClient.post<ApenadosCreateResponse, ApenadosCreatePayload>(
      "/calculadora/apenados/",
      payload,
      {
        useAuthHeader: true,
      }
    );
  }

  updateApenado(apenadoUuid: string, payload: Partial<ApenadosUpdatePayload>) {
    return this.apiClient.patch<
      ApenadosCreateResponse,
      Partial<ApenadosCreatePayload>
    >(`/calculadora/apenados/${apenadoUuid}/`, payload, {
      useAuthHeader: true,
    });
  }

  updateApenadoVariaveis(
    apenadoUuid: string,
    payload: Partial<ApenadosUpdateVariaveisPayload>
  ) {
    return this.apiClient.post<
      ApenadosCreateResponse,
      Partial<ApenadosUpdateVariaveisPayload>
    >(`/calculadora/apenados/${apenadoUuid}/variaveis/`, payload, {
      useAuthHeader: true,
    });
  }

  list(params?: PaginatedRequest, signal?: AbortSignal) {
    return this.apiClient.get<ApenadosListResponse>("/calculadora/apenados/", {
      useAuthHeader: true,
      queryParams: params,
      signal,
    });
  }

  getByUuid(apenadoUuid: string, signal?: AbortSignal) {
    return this.apiClient.get<GetApenadoByUuidResponse>(
      `/calculadora/apenados/${apenadoUuid}/`,
      {
        useAuthHeader: true,
        signal,
      }
    );
  }

  listMetadata(params?: PaginatedRequest, signal?: AbortSignal) {
    return this.apiClient.get<ApenadosListMetadataResponse>(
      "/calculadora/apenados/metadata/",
      {
        useAuthHeader: true,
        queryParams: params,
        signal,
      }
    );
  }

  storeTempApenado(data: Partial<ApenadosCreateResponse["data"]>) {
    const dataString = JSON.stringify(data);
    localStorage.setItem(ApenadosRepository.TEMP_APENADO_KEY, dataString);
  }

  getTempApenado(): ApenadosCreateResponse["data"] | null {
    const dataString = localStorage.getItem(
      ApenadosRepository.TEMP_APENADO_KEY
    );
    if (!dataString) return null;
    return JSON.parse(dataString);
  }

  clearTempApenado() {
    localStorage.removeItem(ApenadosRepository.TEMP_APENADO_KEY);
  }
}
