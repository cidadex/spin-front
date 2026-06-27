import { ApiClient } from "@/services/api/ApiClient";
import { ApiBaseResponse } from "@/types/api/api";
import {
  ImpeditivosAvaliarPayload,
  ImpeditivosAvaliarResponse,
} from "@/types/calculadora/impeditivos";

export class ImpeditivosRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  avaliar(payload: ImpeditivosAvaliarPayload) {
    return this.apiClient.post<
      ApiBaseResponse<ImpeditivosAvaliarResponse>,
      ImpeditivosAvaliarPayload
    >("/calculadora/impeditivos/avaliar/", payload, {
      useAuthHeader: true,
    });
  }
}
